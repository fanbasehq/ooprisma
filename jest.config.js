/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      isolatedModules: true, // this is safe because `npm run be` does it too
      diagnostics: false
    }
  }
}
