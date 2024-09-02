export interface CreateReposParams {
  name: string;
  description: string;
  ownerId: string;
  isPrivate: boolean;
}
export interface CreateFileRepoParams {
  repoId: string;
  path: string;
  content: string;
}

export interface RepositoryProvider {
  getUser<T>(email: string): Promise<T>;
  createRepos<T>(params: CreateReposParams): Promise<T>;
  createFile<T>(params: CreateFileRepoParams): Promise<T>;
  deleteRepos(params: { id: string }): Promise<void>;
}
