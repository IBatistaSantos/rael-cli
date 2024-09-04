import { Command, CommandRunner, Option } from 'nest-commander';
import { execSync } from 'child_process';

@Command({
  name: 'commit',
  description: 'Stage all changes and commit with a message',
})
export class CommitCommand extends CommandRunner {
  @Option({
    flags: '-m, --message <message>',
    description: 'Commit message',
    required: true,
  })
  parseMessage(val: string): string {
    return val;
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const commitMessage = options.message.trim();

    if (!this.isValidCommitMessage(commitMessage)) {
      console.error(
        '❌ Invalid commit message format. Please follow the Conventional Commits standard.',
      );
      console.error(
        'Example: "feat(login): add remember me option" or "feat: add new feature"',
      );
      return;
    }

    try {
      if (!this.hasChangesToCommit()) {
        console.log('No changes detected to commit.');
        return;
      }

      console.log('Staging all changes...');
      this.executeCommand('git add .');

      console.log(`Committing changes with message: "${commitMessage}"...`);
      this.executeCommand(`git commit -m "${commitMessage}"`);

      console.log('✅ Changes committed successfully.');
    } catch (error) {
      console.error('❌ Failed to commit changes:', error.message);
    }
  }

  private isValidCommitMessage(message: string): boolean {
    const commitMessageRegex =
      /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(\(\w+\))?: .+$/;
    return commitMessageRegex.test(message);
  }

  private hasChangesToCommit(): boolean {
    try {
      const statusOutput = this.executeCommand('git status --porcelain', true);
      return statusOutput.length > 0;
    } catch (error) {
      console.error('❌ Failed to check git status:', error.message);
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
