'use strict';

const childProcess = require('child_process');
childProcess.execSync = jest.fn();
const { fetchNPMTokens, parsePolicyFromArgv } = require('../src/helpers');

childProcess.execSync.mockReturnValue({
  toString: () => {
    return '[]';
  }
});

test('should parse NPM Token List as JSON', () => {
  const result = fetchNPMTokens();
  expect(result).toEqual([]);
  expect(fetchNPMTokens()).toEqual([]); // to cover memoized branch
});

test('should parse process argv into policy overrides', () => {
  expect(parsePolicyFromArgv([])).toEqual({
    maxAgeInDays: 30,
    allowPublishTokens: false,
    allowAutomationTokens: false
  });

  expect(parsePolicyFromArgv(['node', '.', '--max-age', '20'])).toEqual({
    maxAgeInDays: 20,
    allowPublishTokens: false,
    allowAutomationTokens: false
  });

  expect(parsePolicyFromArgv([
    'node', '.',
    '--allow-automation-tokens',
    '--max-age',
    '--allow-publish-tokens'])).toEqual({
    maxAgeInDays: 30,
    allowPublishTokens: true,
    allowAutomationTokens: true
  });
});
