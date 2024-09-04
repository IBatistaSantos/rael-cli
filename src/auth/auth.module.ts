import { Module } from '@nestjs/common';
import { AuthCredentialCommand } from './command/auth-credential.command';
import { GoogleAuthCommand } from './command/auth-google.command';
import { GoogleAuthCallback } from './services/GoogleAuthCallback';
import { PrismaService } from 'src/lib/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
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
  controllers: [],
  providers: [
    AuthCredentialCommand,
    GoogleAuthCommand,
    GoogleAuthCallback,
    PrismaService,
  ],
  exports: [],
})
export class AuthModule {}
