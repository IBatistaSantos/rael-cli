/* eslint-disable @typescript-eslint/no-var-requires */
import { Repository } from '@prisma/client';
import { CommandRunner, Command } from 'nest-commander';
import { PrismaService } from 'src/lib/prisma.service';
import { getToken } from '../../commands/auth/login/get-token';

const chalk = require('chalk');

@Command({
  name: 'repos:list',
  description: 'List all repositories',
})
export class ListReposCommand extends CommandRunner {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async run() {
    const token = getToken();

    if (!token) {
      console.log(chalk.red('You must be logged in to list repositories.'));
      return;
    }

    const repoList = await this.prismaService.repository.findMany({
      where: { status: 'ACTIVE' },
    });

    if (!repoList.length) {
      console.log(chalk.yellow('No repositories found.'));
      return;
    }

    this.buildHeader();
    console.log('-'.repeat(70));

    for (const repo of repoList) {
      this.buildTable(repo);
    }
  }

  private truncate(str: string, maxLength: number): string {
    return str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;
  }

  private buildHeader() {
    console.log(chalk.green('Repositories:'));
    console.log(
      `${chalk.bold('Name'.padEnd(20))} | ${chalk.bold('Description'.padEnd(30))} | ${chalk.bold('Private'.padEnd(10))} | ${chalk.bold('Owner ID')}`,
    );
  }

  private buildTable(repo: Repository) {
    console.log(
      `${repo.name.padEnd(20)} | ${this.truncate(repo.description || 'No description', 30).padEnd(30)} | ${repo.isPrivate ? chalk.red('Yes'.padEnd(10)) : chalk.green('No'.padEnd(10))} | ${repo.ownerId}`,
    );
  }
}
