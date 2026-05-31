import * as fs from 'fs';
import * as path from 'path';
import { runCommand, createSpinner, logger } from './utils';
import { askAI } from './openai';

export interface SecurityIssue {
  file: string;
  line: number;
  type: 'SECRET' | 'VULNERABILITY';
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  snippet: string;
}

// Regex list for common secrets
const SECRET_PATTERNS = [
  { name: 'OpenAI API Key', regex: /sk-[a-zA-Z0-9]{32,}/g, severity: 'CRITICAL' },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g, severity: 'HIGH' },
  { name: 'AWS Secret Access Key', regex: /[^A-Za-z0-9/+=][A-Za-z0-9/+=]{40}[^A-Za-z0-9/+=]/g, severity: 'HIGH' },
  { name: 'Generic API Key / Secret', regex: /(?:key|secret|password|token|auth|passwd|credential)[a-z0-9_]*\s*[:=]\s*['"`][a-zA-Z0-9_\-+=/]{16,}['"`]/gi, severity: 'MEDIUM' },
  { name: 'Private Key', regex: /-----BEGIN [A-Z ]+ PRIVATE KEY-----/g, severity: 'CRITICAL' },
  { name: 'Slack Webhook', regex: /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9_]+\/B[A-Z0-9_]+\/[A-Za-z0-9_]+/g, severity: 'HIGH' },
  { name: 'Database Connection String', regex: /(mongodb(?:\+srv)?|postgres|postgresql|mysql|sqlite):\/\/[a-zA-Z0-9_]+:[a-zA-Z0-9_%]+@[a-zA-Z0-9.-]+/gi, severity: 'CRITICAL' }
];

// Simple regex list for common security vulnerabilities
const VULN_PATTERNS = [
  { name: 'Dangerous Eval', regex: /\beval\s*\(/g, description: 'Avoid using eval() as it can lead to arbitrary code execution.', severity: 'HIGH' },
  { name: 'Insecure Regular Expression', regex: /new\s+RegExp\s*\(\s*(req\.query|req\.body|req\.params)/g, description: 'User input inside regular expression can lead to ReDoS attacks.', severity: 'MEDIUM' },
  { name: 'Insecure HTTP Request', regex: /http:\/\/[a-zA-Z0-9.-]+/g, description: 'Using http:// instead of https:// transmits data in cleartext.', severity: 'MEDIUM' },
  { name: 'Disabled TLS/SSL validation', regex: /rejectUnauthorized\s*:\s*false/g, description: 'Disabling SSL validation makes the application vulnerable to Man-in-the-Middle (MitM) attacks.', severity: 'HIGH' }
];

/**
 * Lists all files in the git repository (respecting gitignore automatically)
 */
async function getRepoFiles(): Promise<string[]> {
  try {
    const stdout = await runCommand('git ls-files');
    return stdout.split('\n').filter(f => f.trim() !== '');
  } catch (error) {
    // Fallback: search directory recursively excluding node_modules/dist
    return getFilesRecursively(process.cwd());
  }
}

function getFilesRecursively(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git' && file !== 'coverage') {
        getFilesRecursively(filePath, fileList);
      }
    } else {
      fileList.push(path.relative(process.cwd(), filePath));
    }
  }
  return fileList;
}

/**
 * Perform a fast regex security audit on files
 */
export function scanFilesLocally(files: string[]): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const stat = fs.statSync(file);
    if (stat.isDirectory()) continue;
    if (stat.size > 2 * 1024 * 1024) continue; // Skip files larger than 2MB

    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((lineContent, index) => {
      const lineNum = index + 1;

      // Scan Secrets
      for (const pattern of SECRET_PATTERNS) {
        // Reset regex index
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(lineContent)) {
          issues.push({
            file,
            line: lineNum,
            type: 'SECRET',
            description: `Potential hardcoded secret matching pattern: "${pattern.name}"`,
            severity: pattern.severity as any,
            snippet: lineContent.trim()
          });
        }
      }

      // Scan Vulnerabilities
      for (const pattern of VULN_PATTERNS) {
        pattern.regex.lastIndex = 0;
        if (pattern.regex.test(lineContent)) {
          issues.push({
            file,
            line: lineNum,
            type: 'VULNERABILITY',
            description: pattern.description,
            severity: pattern.severity as any,
            snippet: lineContent.trim()
          });
        }
      }
    });
  }

  return issues;
}

/**
 * Performs a comprehensive security audit using local regex filters followed by optional AI audit
 */
export async function runSecurityAudit(aiVerify: boolean = false): Promise<SecurityIssue[]> {
  const spinner = createSpinner('Scanning files for secrets and vulnerabilities...');
  spinner.start();

  try {
    const files = await getRepoFiles();
    // Only inspect code/config files, ignore binary/assets
    const textFiles = files.filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.ts', '.js', '.json', '.yml', '.yaml', '.py', '.go', '.rs', '.java', '.cs', '.sh', '.env', '.md'].includes(ext);
    });

    const localIssues = scanFilesLocally(textFiles);

    if (localIssues.length === 0) {
      spinner.succeed('No vulnerabilities or hardcoded secrets found via local analysis.');
      return [];
    }

    if (!aiVerify) {
      spinner.succeed(`Scan complete. Found ${localIssues.length} potential issues.`);
      return localIssues;
    }

    // Use AI to verify findings and reduce false positives
    spinner.text = 'Using AI to filter and verify security issues...';
    
    const systemPrompt = `You are an AI Security Auditor. You will be given a list of potential security issues found in a codebase via regex scanning.
Your task is to analyze each issue, separate true security threats from false positives, and return a clean JSON object containing only the verified threats.
Filter out fake API keys used in tests/examples, public keys, non-sensitive strings, or safe HTTP URLs that don't transmit secrets.
Return a JSON object in this format:
{
  "issues": [
    {
      "file": "path/to/file",
      "line": 12,
      "type": "SECRET" or "VULNERABILITY",
      "description": "Explanation of the verified issue and why it is a risk",
      "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
      "snippet": "code snippet"
    }
  ]
}`;

    const userPrompt = `Here is the list of scanned issues: ${JSON.stringify(localIssues, null, 2)}`;
    const aiResponse = await askAI(systemPrompt, userPrompt, true);
    
    try {
      const result = JSON.parse(aiResponse);
      const verifiedIssues: SecurityIssue[] = result.issues || [];
      spinner.succeed(`AI-assisted audit complete. Verified ${verifiedIssues.length} actual issues.`);
      return verifiedIssues;
    } catch {
      // Fallback to local issues if AI response parsing fails
      spinner.warn('AI security verification parsing failed. Falling back to local regex audit results.');
      return localIssues;
    }
  } catch (error: any) {
    spinner.fail('Security audit failed.');
    throw error;
  }
}
