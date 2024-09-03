import { Command, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';

@Command({
  name: 'log',
  description: 'Display the commit history in a clear and formatted way',
})
export class LogCommand extends CommandRunner {
  async run(): Promise<void> {
    try {
      if (!this.isGitRepository()) {
        console.error(
          '❌ Not a Git repository. Please initialize a Git repository first.',
        );
        return;
      }

      console.log('Fetching commit history...\n');
      const logOutput = this.executeCommand(
        'git log --pretty=format:"%h - %an, %ar : %s"',
        true,
      );

      if (!logOutput) {
        console.log('No commits found in the repository.');
        return;
      }

      this.formatAndDisplayLog(logOutput);
    } catch (error) {
      console.error('❌ Failed to retrieve commit history:', error.message);
    }
  }

  private isGitRepository(): boolean {
    try {
      this.executeCommand('git rev-parse --is-inside-work-tree', true);
      return true;
    } catch (error) {
      return false;
    }
  }

  private executeCommand(
    command: string,
    returnOutput = false,
  ): string | undefined {
    try {
      const output = execSync(command, {
        stdio: returnOutput ? 'pipe' : 'inherit',
      });

      return output ? output.toString().trim() : undefined;
    } catch (error) {
      return undefined;
    }
  }

  private formatAndDisplayLog(logOutput: string): void {
    const logs = logOutput.split('\n');

    if (logs.length === 0) {
      console.log('No commits found in the repository.');
      return;
    }

    logs.forEach((log) => {
      const [hash, rest] = log.split(' - ');
      if (!hash || !rest) {
        return;
      }
      const [authorAndDate, message] = rest.split(' : ');

      console.log(`\n🔸 Commit: ${hash}`);
      console.log(`   Author: ${authorAndDate.split(',')[0]}`);
      console.log(`   Date: ${authorAndDate.split(',')[1].trim()}`);
      console.log(`   Message: ${message}\n`);
    });
  }
}
