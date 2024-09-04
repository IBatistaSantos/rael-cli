import { Command, CommandRunner, Option } from 'nest-commander';
import { execSync } from 'child_process';

@Command({
  name: 'branch',
  description: 'Create a new branch in the repository',
})
export class BranchCommand extends CommandRunner {
  @Option({
    flags: '-n, --name <name>',
    description: 'Branch name',
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

      if (this.branchExistsLocally(branchName)) {
        console.error(`❌ Branch "${branchName}" already exists locally.`);
        return;
      }

      if (this.branchExistsRemotely(branchName)) {
        console.error(
          `❌ Branch "${branchName}" already exists on the remote repository.`,
        );
        return;
      }

      console.log(`Creating new branch "${branchName}"...`);
      this.executeCommand(`git checkout -b ${branchName}`);

      console.log(`✅ Branch "${branchName}" created successfully.`);
    } catch (error) {
      console.error('❌ Failed to create branch:', error.message);
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
