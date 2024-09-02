import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export const saveToken = async (token: string) => {
  const tokenPath = getTokenPath();
  writeFileSync(tokenPath, token);
};

export const getConfigDir = (): string => {
  const homeDirectory = homedir();

  const platformPaths = {
    win32: join(homeDirectory, 'AppData', 'Local', 'rael-cli'),
    darwin: join(homeDirectory, 'Library', 'Application Support', 'rael-cli'),
    default: join(homeDirectory, '.config', 'rael-cli'),
  };

  return platformPaths[process.platform] || platformPaths.default;
};

export const getTokenPath = () => {
  const configDir = getConfigDir();

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  return join(configDir, 'auth-token');
};
