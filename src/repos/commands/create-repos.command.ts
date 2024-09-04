import { JwtService } from '@nestjs/jwt';
import { Command, CommandRunner, Option } from 'nest-commander';
import { PrismaService } from '../../lib/prisma.service';
import { getToken } from '../../auth/get-token';
import { RepositoryProvider } from '../../providers/RepositoryProvider';
import { Inject, Logger } from '@nestjs/common';
import { OpenAIService } from 'src/lib/openai.service';

@Command({
  name: 'repos:create',
  description: 'Create a new repository',
})
export class CreateReposCommand extends CommandRunner {
  private readonly logger = new Logger(CreateReposCommand.name);
  private name: string;
  private description: string;
  private isPrivate: boolean = false;
  private includeReadme: boolean = false;
  private includeGitignore: boolean = false;
  private generateDescription: boolean = false;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    @Inject('RepositoryProvider')
    private readonly repositoryProvider: RepositoryProvider,
    @Inject('OpenAIService')
    private readonly openAI: OpenAIService,
  ) {
    super();
  }

  @Option({
    flags: '-n, --name <name>',
    description: 'Repository name',
    required: true,
  })
  setName(name: string) {
    this.name = name;
  }

  @Option({
    flags: '-d, --description <description>',
    description: 'Repository description',
  })
  setDescription(description: string) {
    this.description = description;
  }

  @Option({
    flags: '-p, --private',
    description: 'Set repository as private',
    defaultValue: false,
  })
  setPrivate() {
    this.isPrivate = true;
  }

  @Option({
    flags: '--readme',
    description: 'Include a README.md file',
    defaultValue: false,
  })
  setIncludeReadme() {
    this.includeReadme = true;
  }

  @Option({
    flags: '--gitignore',
    description: 'Include a .gitignore file',
    defaultValue: false,
  })
  setIncludeGitignore() {
    this.includeGitignore = true;
  }

  @Option({
    flags: '--generate-description',
    description: 'Generate a description for the repository',
    defaultValue: false,
  })
  setGenerateDescription() {
    this.generateDescription = true;
  }

  async run(): Promise<void> {
    try {
      const token = this.validateToken();
      const userId = this.extractUserIdFromToken(token);
      const user = await this.findUserInDatabase(userId);

      const userProvider = await this.repositoryProvider.getUser<{
        id: string;
      }>(user.userName);

      if (!userProvider) {
        this.logger.error('User not found on the provider');
        console.error(
          'User not found on the provider, please contact support.',
        );
        return;
      }

      await this.checkIfRepositoryExists(this.name);

      if (this.generateDescription && !this.description) {
        this.description = await this.generateRepoDescription(this.name);
      }

      const reposProvider = await this.createRepositoryInProvider(user.id);
      await this.saveRepositoryInDatabase(reposProvider.id, user.id);
      console.log('Repository created in the provider');

      if (this.includeReadme) {
        console.log('Creating README.md file...');
        await this.createFileInRepository(
          reposProvider.id,
          'README.md',
          '# ' + this.name,
        );
      }

      if (this.includeGitignore) {
        console.log('Creating .gitignore file...');
        const gitignoreContent = 'node_modules/\n.env\n';
        await this.createFileInRepository(
          reposProvider.id,
          '.gitignore',
          gitignoreContent,
        );
      }

      console.log(`Repository ${this.name} created successfully! 🎉`);
      console.log(`URL for cloning: ${reposProvider.clone_url}`);
    } catch (error) {
      console.error(error.message);
    }
  }

  private validateToken(): string {
    const token = getToken();
    if (!token) {
      throw new Error('You need to be logged in to create a repository');
    }
    return token;
  }

  private extractUserIdFromToken(token: string): string {
    const { userId } = this.jwtService.verify<{ userId: string }>(token);
    if (!userId) {
      throw new Error('Invalid token: User ID not found');
    }
    return userId;
  }

  private async findUserInDatabase(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  private async createFileInRepository(
    repoId: string,
    path: string,
    content: string,
  ) {
    await this.repositoryProvider.createFile<{
      content: string;
    }>({
      repoId,
      path,
      content,
    });
    console.log(`File ${path} created in repository ${repoId}`);
  }

  private async checkIfRepositoryExists(repoName: string): Promise<void> {
    const repository = await this.prismaService.repository.findFirst({
      where: { name: repoName, status: 'ACTIVE' },
    });
    if (repository) {
      throw new Error(`Repository with the name "${repoName}" already exists`);
    }
  }

  private async createRepositoryInProvider(ownerId: string) {
    return this.repositoryProvider.createRepos<{
      id: string;
      clone_url: string;
    }>({
      name: this.name,
      description: this.description,
      isPrivate: this.isPrivate,
      ownerId,
    });
  }

  private async saveRepositoryInDatabase(providerId: string, ownerId: string) {
    await this.prismaService.repository.create({
      data: {
        name: this.name,
        description: this.description,
        isPrivate: this.isPrivate,
        providerId: String(providerId),
        ownerId,
      },
    });
  }

  private async generateRepoDescription(repoName: string): Promise<string> {
    try {
      const prompt = `Generate a brief and descriptive summary for a repository named "${repoName}".`;
      const description = await this.openAI.createPrompt({
        prompt,
      });

      console.log(`Generated description: ${description}`);

      return description;
    } catch (error) {
      this.logger.error(
        'Failed to generate description using OpenAI',
        error.stack,
      );
      return 'No description provided';
    }
  }
}
