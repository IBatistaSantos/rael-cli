/* eslint-disable @typescript-eslint/no-var-requires */
import { Command, CommandRunner } from 'nest-commander';
import { Server } from 'http';
const express = require('express');
const open = require('open');

import { saveToken } from '../save-token';
import { GoogleAuthCallback } from '../services/GoogleAuthCallback';
import { GoogleConfig } from '../services/Google';

@Command({ name: 'auth:google', description: 'Login with Google' })
export class GoogleAuthCommand extends CommandRunner {
  private readonly serverPort = 8080;

  constructor(private readonly googleCallback: GoogleAuthCallback) {
    super();
  }

  async run(): Promise<void> {
    const googleConfig = new GoogleConfig();
    const authURL = googleConfig.getGoogleAuthUrl();

    console.log('Opening your browser for Google authentication...');
    await this.openBrowser(authURL);

    this.startCallbackServer();
  }

  private async openBrowser(authURL: string): Promise<void> {
    try {
      await open(authURL);
    } catch (error) {
      console.error('Failed to open browser. Please manually visit:', authURL);
    }
  }

  private startCallbackServer(): void {
    const app = express();

    app.get('/api/auth/google/callback', this.handleCallback.bind(this));

    const server = app.listen(this.serverPort, () => {
      console.log(`Waiting for Google OAuth callback ...`);
    });

    this.setupGracefulShutdown(server);
  }

  private async handleCallback(req, res): Promise<void> {
    const code = req.query.code as string;

    if (!code) {
      res.status(400).send('No code found in the request.');
      return;
    }

    try {
      const token = await this.googleCallback.execute(code);
      saveToken(token);
      res.send(
        '<html><body>Authentication successful! You can now return to the CLI.</body></html>',
      );
      console.log('Authentication successful! Token saved.');
    } catch (error) {
      console.error('Authentication failed:', error);
      res
        .status(500)
        .send(
          '<html><body>Authentication failed. Please try again.</body></html>',
        );
    } finally {
      this.closeServer();
    }
  }

  private setupGracefulShutdown(server: Server): void {
    this.server = server;

    process.on('SIGINT', () => {
      this.closeServer();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      this.closeServer();
      process.exit(0);
    });
  }

  private closeServer(): void {
    if (this.server) {
      this.server.close(() => {
        console.log('Server closed gracefully.');
      });
    }
  }

  private server: Server | undefined;
}
