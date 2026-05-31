import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';
import ora from 'ora';

const execAsync = promisify(exec);

/**
 * Executes a shell command and returns the trimmed stdout.
 */
export async function runCommand(cmd: string, cwd: string = process.cwd()): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd });
    if (stderr && !stdout) {
      // In some systems, warnings are output to stderr, but command still succeeds
      return stderr.trim();
    }
    return stdout.trim();
  } catch (error: any) {
    throw new Error(`Command failed: ${cmd}\nError: ${error.message}`);
  }
}

/**
 * Color-coded logging utilities.
 */
export const logger = {
  info: (msg: string) => console.log(`${chalk.blue('ℹ')} ${msg}`),
  success: (msg: string) => console.log(`${chalk.green('✔')} ${msg}`),
  warn: (msg: string) => console.log(`${chalk.yellow('⚠')} ${msg}`),
  error: (msg: string) => console.log(`${chalk.red('✖')} ${msg}`),
  heading: (msg: string) => console.log(`\n${chalk.bold.magenta(msg)}\n`),
  subheading: (msg: string) => console.log(`\n${chalk.bold.cyan(msg)}`),
  muted: (msg: string) => console.log(chalk.gray(msg)),
};

/**
 * Creates and starts a beautiful CLI spinner using ora.
 */
export function createSpinner(text: string) {
  return ora({
    text,
    color: 'magenta',
    spinner: 'dots',
  });
}
