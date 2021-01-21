process.env.TZ = 'UTC';

module.exports = {
  verbose: true,
  notify: true,
  preset: 'ts-jest',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '../src',
  testEnvironment: 'node',
  testMatch: ['**/*.intg-test.ts'],
  moduleNameMapper: {
    '^src/(.*)': '<rootDir>/$1',
  },
};
