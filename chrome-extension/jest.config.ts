// jest.config.ts
import type {Config} from '@jest/types';
import {defaults} from 'jest-config'

// Sync object
const config: Config.InitialOptions = {
  verbose: true,
  testMatch: [...defaults.testMatch, "**/tests/**/*.[jt]s?(x)"]
};
export default config;