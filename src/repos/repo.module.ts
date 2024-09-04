import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CommitCommand } from './commands/commit.command';
import { CreateReposCommand } from './commands/create-repos.command';
import { DeleteReposCommand } from './commands/delete-repos.command';
import { ListReposCommand } from './commands/list-repos.command';
import { LogCommand } from './commands/logs.command';
import { PullCommand } from './commands/pull.command';
import { PushCommand } from './commands/push.command';

import { GithubProvider } from '../providers/github/GithubProvider';
import { OpenAIService } from '../lib/openai.service';
import { PrismaService } from '../lib/prisma.service';

@Module({
  controllers: [],
  exports: [],
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    CommitCommand,
    CreateReposCommand,
    DeleteReposCommand,
    ListReposCommand,
    LogCommand,
    PullCommand,
    PushCommand,
    PrismaService,
    {
      provide: 'RepositoryProvider',
      useClass: GithubProvider,
    },
    {
      provide: 'OpenAIService',
      useClass: OpenAIService,
    },
  ],
})
export class RepoModule {}
