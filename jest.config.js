export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: [],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: ['**/test/**/*.test.js'],
  testTimeout: 10000,
  verbose: true,
  setupFilesAfterEnv: ['./test/setup.js']
}; 