import type { Config } from 'jest'

/** @dev reference https://jestjs.io/docs/configuration */
export default async (): Promise<Config> => {
  return {
    preset: 'ts-jest',
    clearMocks: true,
    coverageProvider: 'v8',
    moduleFileExtensions: ['js', 'ts', 'json', 'node'],
    rootDir: './src',
    testMatch: [
      '**/__tests__/**/*.[jt]s?(x)',
      '**/?(*.)+(spec|test).[tj]s?(x)'
    ],
    transform: {
      '^.+\\.(ts)$': 'ts-jest'
    }
  }
}
