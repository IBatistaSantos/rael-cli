import { Injectable } from '@nestjs/common';
import {
  CreateFileRepoParams,
  CreateReposParams,
  RepositoryProvider,
} from '../RepositoryProvider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubProvider implements RepositoryProvider {
  private readonly BASE_URL = 'https://api.github.com';
  private readonly token = null;
  private readonly orgName = null;

  constructor(private readonly config: ConfigService) {
    this.token = this.config.get('GITHUB_TOKEN');
    this.orgName = this.config.get('GITHUB_ORG_NAME');
  }

  async getUser<T>(userName: string): Promise<T> {
    const response = await fetch(
      `${this.BASE_URL}/orgs/${this.orgName}/members`,
      {
        headers: {
          'User-Agent': 'rael-cli',
          Authorization: `Bearer ${this.token}`,
        },
      },
    );

    const members = await response.json();

    for (const member of members) {
      if (member.login === userName) {
        return {
          id: member.id,
          userName: member.login,
        } as T;
      }
    }
  }

  async createRepos<T>(params: CreateReposParams): Promise<T> {
    const body = {
      name: params.name,
      description: params.description,
      private: params.isPrivate,
    };

    const response = await fetch(
      `${this.BASE_URL}/orgs/${this.orgName}/repos`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'rael-cli',
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Error creating repository');
    }

    return data;
  }

  async getRepository(repoId: number): Promise<any> {
    const response = await fetch(`${this.BASE_URL}/repositories/${repoId}`, {
      headers: {
        'User-Agent': 'rael-cli',
        Authorization: `Bearer ${this.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error('Error getting repository');
    }

    return data;
  }

  async createFile<T>(params: CreateFileRepoParams): Promise<T> {
    const body = {
      message: 'Create file',
      content: Buffer.from(params.content).toString('base64'),
    };

    const repo = await this.getRepository(Number(params.repoId));

    const response = await fetch(
      `${this.BASE_URL}/repos/${this.orgName}/${repo.name}/contents/${params.path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'rael-cli',
        },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Error creating file: ${response.status} ${response.statusText}. ${errorText}`,
      );
    }

    return data;
  }

  async deleteRepos(params: { id: string }): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/repositories/${params.id}`, {
      method: 'DELETE',
      headers: {
        'User-Agent': 'rael-cli',
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Error deleting repository');
    }
  }
}
