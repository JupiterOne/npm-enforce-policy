'use strict';

const childProcess = require('child_process');
childProcess.execSync = jest.fn();
const { fetchNPMTokens, parsePolicyFromArgv, fetch2FASetting } = require('../src/helpers');

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

const defaultPolicy = {
  maxAgeInDays: 30,
  allowPublishTokens: false,
  allowAutomationTokens: false,
  allow2FADisabled: false,
  allow2FAAuthOnly: true,
  allow2FAAuthAndWrites: true
};

test('should parse process argv into policy overrides', () => {
  expect(parsePolicyFromArgv([])).toEqual(defaultPolicy);

  expect(parsePolicyFromArgv(['node', '.', '--max-age', '20'])).toEqual({
    ...defaultPolicy,
    maxAgeInDays: 20
  });

  expect(parsePolicyFromArgv([
    'node', '.',
    '--allow-automation-tokens',
    'true',
    '--max-age',
    '--allow-publish-tokens',
    'true'])).toEqual({
    ...defaultPolicy,
    allowPublishTokens: true,
    allowAutomationTokens: true
  });

  expect(parsePolicyFromArgv([
    'node', '.',
    '--allow-automation-tokens',
    'true',
    '--max-age',
    '--allow-publish-tokens',
    'true'])).toEqual({
    ...defaultPolicy,
    allowPublishTokens: true,
    allowAutomationTokens: true,
  });

  expect(parsePolicyFromArgv([
    'node', '.',
    '--allow-2fa-disabled',
    'true'
  ])).toEqual({
    ...defaultPolicy,
    allow2FADisabled: true
  });

  expect(parsePolicyFromArgv([
    'node', '.',
    '--allow-2fa-auth-only',
    'true',
    '--allow-2fa-auth-and-writes',
    'true',
    '--allow-2fa-auth-only',
    'false'
  ])).toEqual({
    ...defaultPolicy,
    allow2FAAuthAndWrites: true,
    allow2FAAuthOnly: false
  });

  expect(parsePolicyFromArgv([
    'node', '.',
    '--max-age',
    '--allow-publish-tokens',
    '--allow-automation-tokens',
    '--allow-2fa-disabled',
    '--allow-2fa-auth-only',
    '--allow-2fa-auth-and-writes',
  ])).toEqual(defaultPolicy);

  expect(parsePolicyFromArgv([
    'node', '.',
    '--allow-publish-tokens',
    'true'
  ])).toEqual({
    ...defaultPolicy,
    allowPublishTokens: true
  });
});

test('should fetch 2FA setting from online profile', () => {
  childProcess.execSync.mockReturnValueOnce('disabled');
  expect(fetch2FASetting()).toEqual('disabled');
});
