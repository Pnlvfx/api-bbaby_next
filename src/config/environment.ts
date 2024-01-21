import type { Config } from './config';

declare global {
  namespace NodeJS {
    type ProcessEnv = Config;
  }
}

export {};
