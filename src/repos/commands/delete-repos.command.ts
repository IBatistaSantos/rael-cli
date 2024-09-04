/* eslint-disable @typescript-eslint/no-var-requires */
import { Inject } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { PrismaService } from 'src/lib/prisma.service';
import { RepositoryProvider } from 'src/providers/RepositoryProvider';
import { getToken } from '../../commands/auth/login/get-token';
import { JwtService } from '@nestjs/jwt';
const chalk = require('chalk');

@Command({
  name: 'repos:delete',
  description: 'Delete a repository',
})
export class DeleteReposCommand extends CommandRunner {
  private reposName: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    @Inject('RepositoryProvider')
    private readonly repositoryProvider: RepositoryProvider,
  ) {
    super();
  }

  @Option({
    flags: '-n, --name <name>',
    description: 'Repository name',
    required: true,
  })
  setName(name: string) {
    this.reposName = name;
  }

  async run() {
    const token = getToken();

    if (!token) {
      console.log(chalk.red('You must be logged in to list repositories.'));
      return;
    }

    const { userId } = await this.jwtService.verify<{ userId: string }>(token);

    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      console.log(chalk.red('User not found.'));
      return;
    }

    const repo = await this.prismaService.repository.findFirst({
      where: {
        name: this.reposName,
      },
    });

    if (!repo) {
      console.log(`Repository ${this.reposName} not found`);
      return;
    }

    const isOwner = repo.ownerId === user.id;

    if (!isOwner) {
      console.log(`You are not the owner of the repository ${this.reposName}`);
      return;
    }

    await this.prismaService.repository.update({
      where: {
        id: repo.id,
      },
      data: {
        status: 'DELETED',
      },
    });

    await this.repositoryProvider.deleteRepos({
      id: repo.providerId,
    });

    console.log(chalk.yellow('Repository deleted successfully'));
  }
}
