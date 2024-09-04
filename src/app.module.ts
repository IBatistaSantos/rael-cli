import { Module } from '@nestjs/common';
import { AuthCredentialCommand } from './commands/auth/login/command/auth-credential.command';
import { PrismaService } from './lib/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleAuthCommand } from './commands/auth/login/command/auth-google.command';
import { GoogleAuthCallback } from './commands/auth/login/services/GoogleAuthCallback';

import { OpenAIService } from './lib/openai.service';

import { BranchModule } from './branches/branch.module';
import { RepoModule } from './repos/repo.module';
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
    BranchModule,
    RepoModule,
  ],
  controllers: [],
  providers: [
    AuthCredentialCommand,
    GoogleAuthCommand,
    PrismaService,
    OpenAIService,
    GoogleAuthCallback,
  ],
})
export class AppModule {}
