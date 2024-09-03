import { Command, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';

@Command({
  name: 'pull',
  description: 'Pull the latest changes from the remote repository',
})
export class PullCommand extends CommandRunner {
  async run(): Promise<void> {
    try {
      if (!this.isGitRepository()) {
        console.error(
          '❌ Not a Git repository. Please initialize a Git repository first.',
        );
        return;
      }

      console.log('Pulling the latest changes from the remote repository...');
      this.executeCommand('git pull');

      console.log('✅ Changes pulled successfully.');
    } catch (error) {
      console.error('❌ Failed to pull changes:', error.message);
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

  private executeCommand(command: string, returnOutput = false): string {
    try {
      const output = execSync(command, {
        stdio: returnOutput ? 'pipe' : 'inherit',
      });

      return output ? output.toString().trim() : '';
    } catch (error) {
      throw new Error(`Command failed: ${command}\n${error.message}`);
    }
  }
}
