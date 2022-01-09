// Sync object
const {defaults} = require('jest-config');

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  moduleDirectories: [...defaults.moduleDirectories, 'build'],
  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, '<rootDir>/tests/'],
  // testMatch: [...defaults.testMatch, '**/tests/**/*'],
  transform: {} // ESM support
};

module.exports = config;

