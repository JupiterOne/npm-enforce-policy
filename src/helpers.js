'use strict';

const sh = require('child_process').execSync;
let tokenList;

function fetchNPMTokens() {
  if (!tokenList) {
    tokenList = sh('npm token list --json').toString();
  }
  return JSON.parse(tokenList);
}

const defaultPolicy = {
  maxAgeInDays: 30,
  allowPublishTokens: false,
  allowAutomationTokens: false
};

function parsePolicyFromArgv(argv) {
  const policy = Object.assign({}, defaultPolicy);

  let numArg;
  while (argv[2]) {
    switch (argv[2]) {
      case '--max-age':
        numArg = Number(argv[3]);
        if (argv[3] && numArg) {
          policy.maxAgeInDays = numArg;
          argv.shift();
        }
        break;
      case '--allow-publish-tokens':
        policy.allowPublishTokens = true;
        break;
      case '--allow-automation-tokens':
        policy.allowAutomationTokens = true;
        break;
    }
    argv.shift();
  }
  return policy;
}

module.exports = { fetchNPMTokens, parsePolicyFromArgv };
