import { Module } from '@nestjs/common';
import { AuthCredentialCommand } from './commands/auth/login/command/auth-credential.command';
import { PrismaService } from './lib/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleAuthCommand } from './commands/auth/login/command/auth-google.command';
import { GoogleAuthCallback } from './commands/auth/login/services/GoogleAuthCallback';
import { CreateReposCommand } from './commands/repos/create-repos.command';
import { GithubProvider } from './providers/github/GithubProvider';
import { ListReposCommand } from './commands/repos/list-repos.command';
import { DeleteReposCommand } from './commands/repos/delete-repos.command';
import { OpenAIService } from './lib/openai.service';
import { CommitCommand } from './commands/repos/commit.command';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [
    AuthCredentialCommand,
    GoogleAuthCommand,
    CreateReposCommand,
    ListReposCommand,
    DeleteReposCommand,
    CommitCommand,
    PrismaService,
    OpenAIService,
    GoogleAuthCallback,
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
export class AppModule {}
