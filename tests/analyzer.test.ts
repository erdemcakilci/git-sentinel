import { runCodeReview } from '../src/analyzer';
import * as utils from '../src/utils';
import * as openai from '../src/openai';

jest.mock('../src/utils', () => {
  const actual = jest.requireActual('../src/utils');
  return {
    ...actual,
    runCommand: jest.fn(),
    createSpinner: jest.fn().mockReturnValue({
      start: jest.fn().mockReturnThis(),
      succeed: jest.fn().mockReturnThis(),
      fail: jest.fn().mockReturnThis(),
      warn: jest.fn().mockReturnThis(),
      text: '',
    }),
  };
});
jest.mock('../src/openai');

describe('Code Review Module', () => {
  const mockRunCommand = utils.runCommand as jest.Mock;
  const mockAskAI = openai.askAI as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a warning message if no diff is found', async () => {
    mockRunCommand.mockResolvedValueOnce(''); // inside work tree check
    mockRunCommand.mockResolvedValueOnce(''); // git diff output empty

    const result = await runCodeReview({ targetBranch: 'main' });
    expect(result).toBe('No diff found to review.');
    expect(mockAskAI).not.toHaveBeenCalled();
  });

  it('should request an AI review if changes exist in diff', async () => {
    mockRunCommand.mockResolvedValueOnce(''); // inside work tree check
    mockRunCommand.mockResolvedValueOnce('+const x = 5;\n-const x = 4;'); // git diff
    mockAskAI.mockResolvedValueOnce('## Code Review Feedback\nEverything looks good!');

    const result = await runCodeReview({ targetBranch: 'main' });
    expect(result).toContain('Code Review Feedback');
    expect(mockAskAI).toHaveBeenCalledTimes(1);
  });

  it('should truncate extremely large diffs', async () => {
    mockRunCommand.mockResolvedValueOnce('');
    const hugeDiff = 'a'.repeat(60000);
    mockRunCommand.mockResolvedValueOnce(hugeDiff);
    mockAskAI.mockResolvedValueOnce('Diff reviewed.');

    await runCodeReview({ targetBranch: 'main' });
    
    // Check that askAI was called with truncated diff
    const userPromptSent = mockAskAI.mock.calls[0][1];
    expect(userPromptSent.length).toBeLessThan(hugeDiff.length);
    expect(userPromptSent).toContain('[DIFF TRUNCATED BY GIT-SENTINEL FOR SIZE]');
  });
});
