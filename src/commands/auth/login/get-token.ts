import { existsSync, readFileSync } from 'fs';
import { getTokenPath } from './save-token';

export const getToken = () => {
  const tokenPath = getTokenPath();

  if (!existsSync(tokenPath)) {
    return null;
  }

  return readFileSync(tokenPath, 'utf-8');
};
