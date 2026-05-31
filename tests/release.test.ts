import { generateReleaseNotes } from '../src/release';
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

describe('Release Notes Generator Module', () => {
  const mockRunCommand = utils.runCommand as jest.Mock;
  const mockAskAI = openai.askAI as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should notify user if no commits are found in the range', async () => {
    mockRunCommand.mockResolvedValueOnce('v1.0.0'); // git describe tag
    mockRunCommand.mockResolvedValueOnce(''); // git log empty

    const result = await generateReleaseNotes({ versionName: 'v1.1.0' });
    expect(result).toContain('No commits found in this range.');
    expect(mockAskAI).not.toHaveBeenCalled();
  });

  it('should call askAI with git commits to build release notes', async () => {
    mockRunCommand.mockResolvedValueOnce('v1.0.0'); // git describe tag
    mockRunCommand.mockResolvedValueOnce('abc1234 - Erdem: feat: add security scanner\ndef5678 - Erdem: fix: fix parser typo');
    mockAskAI.mockResolvedValueOnce('# Release notes v1.1.0\nFeatures: security scanner. Fixes: parser.');

    const result = await generateReleaseNotes({ versionName: 'v1.1.0' });
    expect(result).toContain('Release notes v1.1.0');
    expect(mockAskAI).toHaveBeenCalledTimes(1);
    
    const userPrompt = mockAskAI.mock.calls[0][1];
    expect(userPrompt).toContain('abc1234');
    expect(userPrompt).toContain('def5678');
  });
});
