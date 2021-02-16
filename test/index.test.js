'use strict';
const { validateTokenMaxAge, validateTokenPermissions } = require('../src');

jest.mock('../src/helpers');
const { fetchNPMTokens } = require('../src/helpers');

function daysAgo(days) {
  return new Date(new Date().setDate(new Date().getDate() - days));
}

const npmTokenList = [
  {
    token: 'a31c95',
    key: '3e15afb937445a8eeeb6878370b649a9f5dcab7a',
    cidr_whitelist: null,
    readonly: false,
    automation: false,
    created: daysAgo(8),
    updated: daysAgo(8)
  },
  {
    token: 'b12d45',
    key: 'ac2d02a937445a8eeeb6878370b649a9f320aef1',
    cidr_whitelist: null,
    readonly: false,
    automation: false,
    created: daysAgo(30),
    updated: daysAgo(30)
  },
  {
    token: 'c23e56',
    key: '100deadbeef45a8eeeb6878370b649a9f98a7ea2',
    cidr_whitelist: null,
    readonly: false,
    automation: false,
    created: daysAgo(31),
    updated: daysAgo(31)
  }
];

fetchNPMTokens.mockReturnValue(npmTokenList);

test('validateTokenMaxAge should return true if max age is -1', () => {
  expect(validateTokenMaxAge({ maxAgeInDays: -1 })).toBe(true);
});

test('validateTokenMaxAge should return true if no tokens violate max age policy', () => {
  expect(validateTokenMaxAge({ maxAgeInDays: 31 })).toBe(true);
});

test('validateTokenMaxAge should return false if any tokens violate max age policy', () => {
  expect(validateTokenMaxAge({ maxAgeInDays: 30 })).toBe(false);
});

test('validateTokenMaxAge should return false if npm cannot retrieve token list', () => {
  fetchNPMTokens.mockImplementationOnce(() => {
    throw new Error('simulated failure');
  });
  expect(validateTokenMaxAge({ maxAgeInDays: 31 })).toBe(false);
});

test('validateTokenPermissions should return true if no tokens violate automation policy', () => {
  expect(validateTokenPermissions({
    allowPublishTokens: true,
    allowAutomationTokens: false
  })).toBe(true);
});

test('validateTokenPermissions should return false if npm cannot retrieve token list', () => {
  fetchNPMTokens.mockImplementationOnce(() => {
    throw new Error('simulated failure');
  });
  expect(validateTokenPermissions({
    allowAutomationTokens: false,
    allowPublishTokens: false
  })).toBe(false);
});

test('validateTokenPermissions should return false if any tokens violate publish policy', () => {
  expect(validateTokenPermissions({
    allowPublishTokens: false,
    allowAutomationTokens: false
  })).toBe(false);
});

test('validateTokenPermissions should return true if no tokens violate publish policy', () => {
  const validTokens = npmTokenList.map(t => {
    t.readonly = true;
    t.automation = false;
    return t;
  });
  fetchNPMTokens.mockReturnValueOnce(validTokens);
  expect(validateTokenPermissions({
    allowPublishTokens: false,
    allowAutomationTokens: false
  })).toBe(true);
});

test('validateTokenPermissions should return false if any tokens violate automation policy', () => {
  const tokenListWithAutomation = Object.assign([], npmTokenList);
  tokenListWithAutomation[0].automation = true;
  fetchNPMTokens.mockReturnValueOnce(tokenListWithAutomation);
  expect(validateTokenPermissions({
    allowPublishTokens: true,
    allowAutomationTokens: false
  })).toBe(false);
});

test('validateTokenPermissions should return true if no tokens violate automation policy', () => {
  const validTokens = npmTokenList.map(t => {
    t.readonly = false; // publish token
    t.automation = false;
    return t;
  });
  fetchNPMTokens.mockReturnValueOnce(validTokens);
  expect(validateTokenPermissions({
    allowPublishTokens: true,
    allowAutomationTokens: false
  })).toBe(true);
});

