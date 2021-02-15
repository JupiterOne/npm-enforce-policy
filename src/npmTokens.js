'use strict';

const sh = require('child_process').execSync;
let tokenList;

function fetchNPMTokens() {
  if (!tokenList) {
    tokenList = sh('npm token list --json').toString();
  }
  return JSON.parse(tokenList);
}

module.exports = fetchNPMTokens;
