// jest.config.js
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["tests/jest.setup.js"],
  clearMocks: true,
  coverageDirectory: "coverage",
  coverageReporters: ["json", "text", "lcov", "clover"],
  testMatch: ["**/tests/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  verbose: true,
};
