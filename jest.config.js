module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  verbose: true,
  // Only show test results summary
  silent: true,
  // Show test results in a more compact format
  reporters: [
    'default',
    ['jest-summary-reporter', {
      failuresOnly: false,
      showPaths: false
    }]
  ]
}; 