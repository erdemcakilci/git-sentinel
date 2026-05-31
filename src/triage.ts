import { createSpinner } from './utils';
import { askAI } from './openai';

export interface IssueInput {
  title: string;
  body: string;
}

export interface TriageResult {
  category: 'BUG' | 'FEATURE_REQUEST' | 'DOCUMENTATION' | 'QUESTION' | 'SECURITY' | 'CHORE';
  labels: string[];
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number; // 0 to 100
  summary: string;
  suggestedAction: string;
}

/**
 * Triages a new GitHub issue using OpenAI.
 */
export async function triageIssue(issue: IssueInput): Promise<TriageResult> {
  const spinner = createSpinner('Analyzing issue title and content...');
  spinner.start();

  const systemPrompt = `You are Git-Sentinel's Issue Triage Intelligence. Your job is to classify incoming user issues and suggest labels, priority levels, and immediate action plans.
You must return your output strictly in JSON format matching this schema:
{
  "category": "BUG" | "FEATURE_REQUEST" | "DOCUMENTATION" | "QUESTION" | "SECURITY" | "CHORE",
  "labels": ["label1", "label2"],
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "confidence": 85,
  "summary": "One sentence summary of the issue",
  "suggestedAction": "Suggested message or direct instructions to give to the user/developer."
}

Use the following priority guidelines:
- CRITICAL: App crashes, database corruption, security leaks, major regression breaking core functionality.
- HIGH: Serious bug with no easy workaround, major feature requests affecting multiple users.
- MEDIUM: Minor bug with a simple workaround, normal feature requests.
- LOW: Typos, small styling issues, simple questions.`;

  const userPrompt = `Issue Title: ${issue.title}
Issue Description:
${issue.body}`;

  try {
    const aiResponse = await askAI(systemPrompt, userPrompt, true);
    const parsed: TriageResult = JSON.parse(aiResponse);
    spinner.succeed(`Triage complete. Category: ${parsed.category} | Priority: ${parsed.priority}`);
    return parsed;
  } catch (error: any) {
    spinner.fail('Failed to triage issue.');
    throw new Error(`AI Issue Triage failed: ${error.message}`);
  }
}
