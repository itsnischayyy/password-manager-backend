/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFilesAfterEnv: ['./src/tests/setup.ts'], // Optional: if you have a setup file
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};