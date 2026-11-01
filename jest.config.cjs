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
  // Plancher anti-régression (à relever progressivement). La couverture est
  // encore faible car les gros modules UI (diagnostics, compost, rotation…)
  // ne sont pas testés : on empêche la baisse plutôt que de bloquer la CI.
  coverageThreshold: {
    global: {
      statements: 14,
      branches: 10,
      functions: 10,
      lines: 15,
    },
  },
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
