import { runCommand, createSpinner, logger } from './utils';
import { askAI } from './openai';

export interface ReviewOptions {
  targetBranch?: string;
  json?: boolean;
}

/**
 * Gets the diff content from git.
 */
export async function getGitDiff(targetBranch: string = 'main'): Promise<string> {
  // Check if we are inside a git repo
  try {
    await runCommand('git rev-parse --is-inside-work-tree');
  } catch {
    throw new Error('Not a git repository (or any of the parent directories)');
  }

  // Get current diff against target branch
  try {
    // Try to compare with remote/local target branch
    logger.muted(`Comparing changes with branch: ${targetBranch}`);
    return await runCommand(`git diff ${targetBranch}...HEAD`);
  } catch (error: any) {
    // If that fails, try comparing with local branch directly
    try {
      return await runCommand(`git diff ${targetBranch}`);
    } catch {
      throw new Error(`Could not compare with target branch "${targetBranch}". Ensure it exists.`);
    }
  }
}

/**
 * Runs the AI Pull Request / Code Diff Review.
 */
export async function runCodeReview(options: ReviewOptions): Promise<string> {
  const target = options.targetBranch || 'main';
  const spinner = createSpinner('Extracting git diff...');
  spinner.start();

  let diff = '';
  try {
    diff = await getGitDiff(target);
    if (!diff) {
      spinner.succeed('No changes found compared to target branch.');
      return 'No diff found to review.';
    }
    spinner.text = 'Analyzing diff with AI...';
  } catch (error: any) {
    spinner.fail('Failed to retrieve git diff');
    throw error;
  }

  // Handle oversized diffs to prevent API errors
  if (diff.length > 50000) {
    logger.warn('Diff is extremely large. Truncating diff to fit context window limit.');
    diff = diff.slice(0, 50000) + '\n\n... [DIFF TRUNCATED BY GIT-SENTINEL FOR SIZE] ...';
  }

  const systemPrompt = `You are Git-Sentinel, a senior open-source software maintainer and security auditor.
Analyze the provided git diff and generate a thorough, constructive code review.
Provide your response in clean Markdown. Include the following sections:
1. **Change Summary**: A brief, high-level summary of what this diff introduces.
2. **Review Score**: Rate the code quality and readiness (1 to 10 scale).
3. **Key Findings & Suggestions**: Detail specific improvements for performance, readability, modularity, or bugs.
4. **Line/File Specific Feedback**: Pinpoint specific code lines if problems are found. Include code snippets for corrections.
Be professional, encouraging, and critical when security or performance bugs are present.`;

  const userPrompt = `Target branch for comparison: ${target}
Here is the git diff:
\`\`\`diff
${diff}
\`\`\``;

  try {
    const aiResponse = await askAI(systemPrompt, userPrompt, false);
    spinner.succeed('AI analysis complete.');
    return aiResponse;
  } catch (error: any) {
    spinner.fail('AI review failed.');
    throw error;
  }
}
