import { scanFilesLocally } from '../src/security';
import * as fs from 'fs';

jest.mock('fs');

describe('Security Audit Module', () => {
  const mockExistsSync = fs.existsSync as jest.Mock;
  const mockReadFileSync = fs.readFileSync as jest.Mock;
  const mockStatSync = fs.statSync as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockStatSync.mockReturnValue({
      isDirectory: () => false,
      size: 1024,
    });
  });

  it('should detect hardcoded OpenAI API keys', () => {
    mockExistsSync.mockReturnValue(true);
    // Use a variable name without words like key, token, secret, password to prevent generic match
    mockReadFileSync.mockReturnValue("const val = 'sk-abcdefghijklmnopqrstuvwxyz0123456789';");

    const issues = scanFilesLocally(['src/config.js']);
    expect(issues.length).toBe(1);
    expect(issues[0].type).toBe('SECRET');
    expect(issues[0].severity).toBe('CRITICAL');
    expect(issues[0].snippet).toContain('sk-abcdef');
  });

  it('should detect AWS Access Keys', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('export const aws = "AKIAIOSFODNN7EXAMPLE";');

    const issues = scanFilesLocally(['aws-creds.js']);
    expect(issues.length).toBe(1);
    expect(issues[0].severity).toBe('HIGH');
    expect(issues[0].snippet).toContain('AKIAIOSFODNN7EXAMPLE');
  });

  it('should detect dangerous eval usage', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('const data = eval(req.query.data);');

    const issues = scanFilesLocally(['server.js']);
    expect(issues.length).toBe(1);
    expect(issues[0].type).toBe('VULNERABILITY');
    expect(issues[0].severity).toBe('HIGH');
    expect(issues[0].description).toContain('eval()');
  });

  it('should pass cleanly if no patterns match', () => {
    mockExistsSync.mockReturnValue(true);
    mockReadFileSync.mockReturnValue('const port = process.env.PORT || 3000;');

    const issues = scanFilesLocally(['server.js']);
    expect(issues.length).toBe(0);
  });
});
