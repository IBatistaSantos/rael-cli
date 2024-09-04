import { Command, CommandRunner, Option } from 'nest-commander';
import { execSync } from 'child_process';

@Command({
  name: 'branch:delete',
  description: 'Delete a branch both locally and remotely, if it exists',
})
export class DeleteBranchCommand extends CommandRunner {
  @Option({
    flags: '-n, --name <name>',
    description: 'Branch name to delete',
    required: true,
  })
  parseBranchName(val: string): string {
    return val.trim();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const branchName = options.name;

    try {
      if (!this.isGitRepository()) {
        console.error(
          '❌ Not a Git repository. Please initialize a Git repository first.',
        );
        return;
      }

      const currentBranch = this.getCurrentBranchName();
      if (currentBranch === branchName) {
        console.error(
          `❌ Cannot delete the branch "${branchName}" because it is the current branch.`,
        );
        return;
      }

      if (this.branchExistsLocally(branchName)) {
        this.deleteLocalBranch(branchName);
      } else {
        console.log(`⚠️  Branch "${branchName}" does not exist locally.`);
      }

      if (this.branchExistsRemotely(branchName)) {
        this.deleteRemoteBranch(branchName);
      } else {
        console.log(
          `⚠️  Branch "${branchName}" does not exist on the remote repository.`,
        );
      }
    } catch (error) {
      console.error('❌ Failed to delete branch:', error.message);
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

  private branchExistsLocally(branchName: string): boolean {
    try {
      const branches = this.executeCommand('git branch --list', true);
      return branches
        .split('\n')
        .some((branch) => branch.trim() === branchName);
    } catch (error) {
      console.error(
        '❌ Failed to check if branch exists locally:',
        error.message,
      );
      return false;
    }
  }

  private branchExistsRemotely(branchName: string): boolean {
    try {
      const remoteBranches = this.executeCommand(
        `git ls-remote --heads origin ${branchName}`,
        true,
      );
      return remoteBranches.trim().length > 0;
    } catch (error) {
      console.error(
        '❌ Failed to check if branch exists remotely:',
        error.message,
      );
      return false;
    }
  }

  private deleteLocalBranch(branchName: string): void {
    try {
      console.log(`Deleting local branch "${branchName}"...`);
      this.executeCommand(`git branch -d ${branchName}`);
      console.log(`✅ Local branch "${branchName}" deleted successfully.`);
    } catch (error) {
      if (error.message.includes('not fully merged')) {
        console.log(
          `⚠️  Branch "${branchName}" is not fully merged. Forcing deletion...`,
        );
        this.executeCommand(`git branch -D ${branchName}`);
        console.log(
          `✅ Local branch "${branchName}" forcibly deleted successfully.`,
        );
      } else {
        throw error;
      }
    }
  }

  private deleteRemoteBranch(branchName: string): void {
    try {
      console.log(`Deleting remote branch "${branchName}"...`);
      this.executeCommand(`git push origin --delete ${branchName}`);
      console.log(`✅ Remote branch "${branchName}" deleted successfully.`);
    } catch (error) {
      console.error(
        `❌ Failed to delete remote branch "${branchName}":`,
        error.message,
      );
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
