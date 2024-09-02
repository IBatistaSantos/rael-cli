import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../lib/prisma.service';
import { google } from 'googleapis';
import { GoogleConfig } from './Google';

@Injectable()
export class GoogleAuthCallback {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(code: string): Promise<string> {
    const googleConfig = new GoogleConfig();
    const oauth2Client = googleConfig.getOAuth2Client();

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });

    const { data } = await oauth2.userinfo.get();
    const userEmail = data.email;

    if (!userEmail) {
      throw new Error('Unable to retrieve user email from Google');
    }

    const user = await this.prismaService.user.findUnique({
      where: {
        email: userEmail,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.jwtService.sign({ userId: user.id });
  }
}
