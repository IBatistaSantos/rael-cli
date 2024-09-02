import { Command, CommandRunner, Option } from 'nest-commander';
import { PrismaService } from '../../../../lib/prisma.service';
import { compare } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { saveToken } from '../save-token';

@Command({
  name: 'auth:credential',
  description: 'Login with username and password',
})
export class AuthCredentialCommand extends CommandRunner {
  private email: string;
  private password: string;

  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {
    super();
  }

  @Option({
    flags: '-e, --email <email>',
    description: 'Email',
    required: true,
  })
  setEmail(email: string) {
    this.email = email;
  }

  @Option({
    flags: '-p, --password <password>',
    description: 'Password',
    required: true,
  })
  setPassword(password: string) {
    this.password = password;
  }
  async run(): Promise<void> {
    if (!this.email || !this.password) {
      console.error('Email and password are required');
      return;
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        email: this.email,
      },
    });

    if (!user) {
      console.error('Invalid email or password');
      return;
    }

    const isMatch = compare(this.password, user.password);

    if (!isMatch) {
      console.error('Invalid email or password');
      return;
    }

    const token = this.jwtService.sign({ userId: user.id });

    saveToken(token);

    console.info('Successfully logged in');
  }
}
