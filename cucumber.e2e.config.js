module.exports = {
  default: {
    require: [
      'tests/e2e/support/**/*.ts',
      'tests/e2e/steps/**/*.ts'
    ],
    requireModule: [
      'ts-node/register'
    ],
    format: [
      'progress',
      'json:cucumber-report.json'
    ],
    formatOptions: {
      snippetInterface: 'async-await'
    },
    timeout: 30000, // 30 seconds for each step
    publishQuiet: true
  }
};
