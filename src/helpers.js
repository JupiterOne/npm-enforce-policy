'use strict';

const sh = require('child_process').execSync;
let tokenList;

function fetchNPMTokens() {
  if (!tokenList) {
    tokenList = sh('npm token list --json').toString();
  }
  return JSON.parse(tokenList);
}

function fetch2FASetting() {
  return sh('npm profile get "two-factor auth"').toString().trim();
}

function fetchNPMUser() {
  return sh('npm whoami').toString().trim();
}

const defaultPolicy = {
  maxAgeInDays: 30,
  allowPublishTokens: false,
  allowAutomationTokens: false,
  allow2FADisabled: false,
  allow2FAAuthOnly: true,
  allow2FAAuthAndWrites: true
};

function parsePolicyFromArgv(argv) {
  const policy = Object.assign({}, defaultPolicy);

  let nextArg;
  while (argv[2]) {
    switch (argv[2]) {
      case '--max-age':
        nextArg = Number(argv[3]);
        if (argv[3] && nextArg) {
          policy.maxAgeInDays = nextArg;
          argv.shift();
        }
        break;
      case '--allow-publish-tokens':
        if (argv[3]) {
          nextArg = String(argv[3]).toLowerCase() === 'true';
          policy.allowPublishTokens = nextArg;
          argv.shift();
        }
        break;
      case '--allow-automation-tokens':
        if (argv[3]) {
          nextArg = String(argv[3]).toLowerCase() === 'true';
          policy.allowAutomationTokens = nextArg;
          argv.shift();
        }
        break;
      case '--allow-2fa-disabled':
        if (argv[3]) {
          nextArg = String(argv[3]).toLowerCase() === 'true';
          policy.allow2FADisabled = nextArg;
          argv.shift();
        }
        break;
      case '--allow-2fa-auth-only':
        if (argv[3]) {
          nextArg = String(argv[3]).toLowerCase() === 'true';
          policy.allow2FAAuthOnly = nextArg;
          argv.shift();
        }
        break;
      case '--allow-2fa-auth-and-writes':
        if (argv[3]) {
          nextArg = String(argv[3]).toLowerCase() === 'true';
          policy.allow2FAAuthAndWrites = nextArg;
          argv.shift();
        }
        break;
      case '--banned-user-list':
        if (argv[3]) {
          nextArg = String(argv[3]);
          policy.bannedUserList = nextArg;
          argv.shift();
        }
    }
    argv.shift();
  }
  return policy;
}

module.exports = { fetchNPMTokens, parsePolicyFromArgv, fetch2FASetting, fetchNPMUser };
