#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { runCodeReview } from './analyzer';
import { runSecurityAudit } from './security';
import { triageIssue } from './triage';
import { generateReleaseNotes } from './release';
import { logger } from './utils';

// Load package.json version
const packageJsonPath = path.join(__dirname, '../package.json');
let version = '1.0.0';
try {
  if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    version = pkg.version;
  }
} catch {
  // Fallback if package.json cannot be read from build folder
}

const program = new Command();

program
  .name('git-sentinel')
  .description('AI-Powered Git Repository Assistant, Code Reviewer, and Automator')
  .version(version);

// 1. Review Command
program
  .command('review')
  .description('Analyze git diff against a branch and generate an AI code review report')
  .option('-t, --target <branch>', 'target branch to compare the current branch against', 'main')
  .action(async (options) => {
    try {
      logger.heading('Git-Sentinel: Automated AI Code Review');
      const review = await runCodeReview({ targetBranch: options.target });
      console.log('\n' + review + '\n');
      logger.success('Review process complete!');
    } catch (error: any) {
      logger.error(error.message);
      process.exit(1);
    }
  });

// 2. Security Command
program
  .command('security')
  .description('Audit repository for hardcoded secrets and code vulnerabilities')
  .option('--ai', 'enable AI double-verification to filter out false positives', false)
  .action(async (options) => {
    try {
      logger.heading('Git-Sentinel: Security and Secret Leak Audit');
      const issues = await runSecurityAudit(options.ai);

      if (issues.length === 0) {
        logger.success('All clear! No security issues or leaks identified.');
        process.exit(0);
      }

      console.log(`\nFound ${issues.length} potential issues:\n`);
      issues.forEach((issue, index) => {
        const severityStr = `[${issue.severity}]`;
        const header = `${index + 1}. ${severityStr} in ${issue.file}:${issue.line}`;
        console.log(header);
        console.log(`   Type:        ${issue.type}`);
        console.log(`   Description: ${issue.description}`);
        console.log(`   Snippet:     "${issue.snippet}"\n`);
      });

      logger.warn('Please inspect the findings above and secure any hardcoded credentials immediately!');
      process.exit(1);
    } catch (error: any) {
      logger.error(error.message);
      process.exit(1);
    }
  });

// 3. Triage Command
program
  .command('triage')
  .description('Classify, label, prioritize, and suggest action items for an issue')
  .requiredOption('--title <title>', 'title of the issue')
  .requiredOption('--body <body>', 'body content of the issue')
  .action(async (options) => {
    try {
      logger.heading('Git-Sentinel: Issue Triager');
      const triage = await triageIssue({ title: options.title, body: options.body });

      console.log('\nTriage Analysis:\n');
      console.log(`- **Category**: ${triage.category}`);
      console.log(`- **Priority**: ${triage.priority}`);
      console.log(`- **Confidence**: ${triage.confidence}%`);
      console.log(`- **Suggested Labels**: ${triage.labels.join(', ')}`);
      console.log(`- **Summary**: ${triage.summary}`);
      console.log(`- **Suggested Next Step**: ${triage.suggestedAction}\n`);

      logger.success('Issue triaged successfully.');
    } catch (error: any) {
      logger.error(error.message);
      process.exit(1);
    }
  });

// 4. Release Command
program
  .command('release')
  .description('Generate structured release notes based on commit history')
  .requiredOption('-v, --version-name <version>', 'version string for this release (e.g. v1.2.0)')
  .option('-f, --from <tag/hash>', 'starting commit/tag (default: auto-detected last tag)')
  .option('-t, --to <tag/hash>', 'ending commit/tag', 'HEAD')
  .action(async (options) => {
    try {
      logger.heading('Git-Sentinel: Automated Release Notes Generator');
      const notes = await generateReleaseNotes({
        versionName: options.versionName,
        fromTag: options.from,
        toTag: options.to,
      });

      console.log('\n' + notes + '\n');
      logger.success('Release notes generated successfully!');
    } catch (error: any) {
      logger.error(error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);
