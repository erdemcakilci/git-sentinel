import { runCommand, createSpinner, logger } from './utils';
import { askAI } from './openai';

export interface ReleaseOptions {
  fromTag?: string;
  toTag?: string;
  versionName: string;
}

/**
 * Gets commit logs between two points (tags or hashes).
 */
export async function getCommitLogs(from?: string, to: string = 'HEAD'): Promise<string> {
  let range = '';
  if (from) {
    range = `${from}..${to}`;
  } else {
    // If no previous tag is specified, try to find the latest git tag
    try {
      const latestTag = await runCommand('git describe --tags --abbrev=0');
      range = `${latestTag}..${to}`;
      logger.muted(`Found latest tag: ${latestTag}. Fetching commits since then.`);
    } catch {
      // If no tag exists, fetch last 50 commits
      logger.warn('No git tags found. Generating release notes for the last 50 commits.');
      range = '-n 50';
    }
  }

  try {
    return await runCommand(`git log ${range} --oneline --pretty=format:"%h - %an: %s (%ad)" --date=short`);
  } catch (error: any) {
    throw new Error(`Failed to fetch commit logs: ${error.message}`);
  }
}

/**
 * Generates release notes based on commit history using OpenAI.
 */
export async function generateReleaseNotes(options: ReleaseOptions): Promise<string> {
  const spinner = createSpinner('Fetching git commit logs...');
  spinner.start();

  let commits = '';
  try {
    commits = await getCommitLogs(options.fromTag, options.toTag);
    if (!commits) {
      spinner.warn('No commits found in the specified range.');
      return `### Release ${options.versionName}\nNo commits found in this range.`;
    }
    spinner.text = 'Synthesizing release notes with AI...';
  } catch (error: any) {
    spinner.fail('Failed to fetch commit history.');
    throw error;
  }

  const systemPrompt = `You are Git-Sentinel's Release Synthesizer. Analyze the list of commits and write detailed, professional release notes.
Format the output in clean Markdown. Include the following sections:
1. **Title**: Release header containing the version name.
2. **Overview**: A short summary of what this release focuses on (e.g., bug fixes, new features, stability).
3. **What's Changed**: Group changes into categories based on Conventional Commits, such as:
   - 🚀 Features
   - 🐛 Bug Fixes
   - ⚡ Performance Improvements
   - 📝 Documentation
   - 🔧 Maintenance & Chores
4. **⚠️ Breaking Changes**: List any breaking changes clearly. If none, do not display this section.
5. **Contributors**: A list of contributors who authored the commits in this release.
Keep the tone professional and exciting for users.`;

  const userPrompt = `Version Name: ${options.versionName}
Commits:
${commits}`;

  try {
    const notes = await askAI(systemPrompt, userPrompt, false);
    spinner.succeed('Release notes generated successfully.');
    return notes;
  } catch (error: any) {
    spinner.fail('Release notes generation failed.');
    throw error;
  }
}
