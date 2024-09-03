import { Command, CommandRunner } from 'nest-commander';
import { execSync } from 'child_process';

@Command({
  name: 'push',
  description: 'Push committed changes to the remote repository',
})
export class PushCommand extends CommandRunner {
  async run(): Promise<void> {
    try {
      if (!this.isGitRepository()) {
        console.error(
          '❌ Not a Git repository. Please initialize a Git repository first.',
        );
        return;
      }

      const currentBranch = this.getCurrentBranchName();
      if (!this.isUpstreamConfigured(currentBranch)) {
        console.log(
          `⚠️  The current branch "${currentBranch}" has no upstream branch.`,
        );
        console.log(
          `Setting upstream and pushing branch "${currentBranch}" to origin...`,
        );
        this.executeCommand(`git push --set-upstream origin ${currentBranch}`);
      } else {
        console.log('Pushing changes to the remote repository...');
        this.executeCommand('git push');
      }

      console.log('✅ Changes pushed successfully.');
    } catch (error) {
      console.error('❌ Failed to push changes:', error.message);
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

  private getCurrentBranchName(): string {
    try {
      return this.executeCommand('git branch --show-current', true);
    } catch (error) {
      throw new Error('❌ Failed to get current branch name');
    }
  }

  private isUpstreamConfigured(branchName: string): boolean {
    try {
      const result = this.executeCommand(
        `git rev-parse --abbrev-ref --symbolic-full-name ${branchName}@{u}`,
        true,
      );
      return result.length > 0;
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
