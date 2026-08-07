/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': ['babel-jest', { configFile: './babel.config.cjs' }]
  },
  moduleFileExtensions: ['js', 'json'],
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'js/**/*.js',
    'server.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 10000,
  transformIgnorePatterns: [
    'node_modules/(?!(firebase-admin|@firebase|@google-cloud|gaxios|google-auth-library|google-gax)/)'
  ],
  // Prevent console methods from being spied on by default
  // to avoid "TypeError: console.error is not a function"
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Silence console during tests unless explicitly asserted
  // This prevents Jest from trying to mock console.error/warn globally
  // which can cause issues with our custom logger implementation
  // Uncomment the line below if you want to silence all console output in tests:
  // silent: true,
  setupFiles: ['<rootDir>/jest.setup.js'],
};
