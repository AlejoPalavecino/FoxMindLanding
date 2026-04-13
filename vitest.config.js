const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    include: ['netlify/functions/__tests__/**/*.test.js', 'assets/js/modules/__tests__/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 65,
        statements: 70
      }
    }
  }
});
