module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'get-versions.js'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  coverageDirectory: 'coverage',
  testMatch: [
    '**/*.test.js'
  ],
  clearMocks: true,
  restoreMocks: true,
};