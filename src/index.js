'use strict';

const { fetchNPMTokens, fetch2FASetting, fetchNPMUser } = require('./helpers');

function validateTokenMaxAge(policy) {
  const maxAgeInSeconds = 60 * 60 * 24 * policy.maxAgeInDays;
  const expiredTokens = [];

  if (policy.maxAgeInDays === -1) {
    return true; // skip
  }

  let tokens = [];
  try {
    // Prevent Yarn from overriding registry
    // See https://github.com/yarnpkg/yarn/issues/2935
    const original_config_registry = process.env['npm_config_registry'];
    delete process.env['npm_config_registry'];

    tokens = fetchNPMTokens();

    process.env['npm_config_registry'] = original_config_registry;
  } catch (err) {
    console.error(err);
    console.log('Please login with "npm login".');
    return false;
  }

  tokens.forEach(token => {
    const ageInSeconds = Math.floor((Date.now() - Date.parse(token.created)) / 1000);
    if (ageInSeconds > maxAgeInSeconds) {
      expiredTokens.push(token);
    }
  });

  let validated = true;
  expiredTokens.forEach(token => {
    const id = token.key.substr(0, 6);
    console.log('Your npm token with id ' + id + ' is too old! It was created on ' + token.created);
    console.log('Please take the following steps:');
    console.log('1. npm token create --read-only');
    console.log('2. Paste this new token into your ~/.npmrc');
    console.log('3. npm token revoke ' + id);
    console.log();
    validated = false;
  });
  return validated;
}

function validateTokenPermissions(policy) {
  const illegalTokens = [];

  let tokens = [];
  try {
    // Prevent Yarn from overriding registry
    // See https://github.com/yarnpkg/yarn/issues/2935
    const original_config_registry = process.env['npm_config_registry'];
    delete process.env['npm_config_registry'];

    tokens = fetchNPMTokens();

    process.env['npm_config_registry'] = original_config_registry;
  } catch (err) {
    console.error(err);
    console.log('Please login with "npm login".');
    return false;
  }

  tokens.forEach(token => {
    const publishToken = token.readonly === false && token.automation === false;
    const automationToken = token.automation === true;

    if (publishToken && !policy.allowPublishTokens) {
      token.type = 'publish';
      token.violation = 'Publishing tokens are not allowed by policy!';
      illegalTokens.push(token);
    }

    if (automationToken && !policy.allowAutomationTokens) {
      token.type = 'automation';
      token.violation = 'Automation tokens are not allowed by policy!';
      illegalTokens.push(token);
    }
  });

  let validated = true;
  illegalTokens.forEach(token => {
    const id = token.key.substr(0, 6);
    console.log('Your npm token with id ' + id + ' is of type: ' + token.type + '.');
    console.log(token.violation);
    console.log('It was created on ' + token.created);
    console.log('Please take the following steps:');
    console.log('1. npm token create --read-only');
    console.log('2. Paste this new token into your ~/.npmrc');
    console.log('3. npm token revoke ' + id);
    console.log();
    validated = false;
  });
  return validated;
}

function validateProfile2FASetting(policy) {
  let setting;
  // allow policy arg to override default policy
  const effectivePolicy = Object.assign({
    allow2FADisabled: false,
    allow2FAAuthOnly: true,
    allow2FAAuthAndWrites: true,
  }, policy);

  try {
    setting = fetch2FASetting();
  } catch (err) {
    console.error(err);
    console.log('Please login with "npm login".');
    return false;
  }

  const safeCoerceToBoolean = (input) => {
    // user must explicitly use the string 'true' to set allow flags
    // this is a no-op for boolean values
    return String(input).toLowerCase() === 'true';
  };

  let validated = true;
  switch (setting) {
    case 'disabled':
      validated = safeCoerceToBoolean(effectivePolicy.allow2FADisabled);
      break;
    case 'auth-only':
      validated = safeCoerceToBoolean(effectivePolicy.allow2FAAuthOnly);
      break;
    case 'auth-and-writes':
      validated = safeCoerceToBoolean(effectivePolicy.allow2FAAuthAndWrites);
      break;
    default:
      validated = false;
  }


  if (!validated) {
    console.log('Your npm profile setting of "' + setting + '" for two-factor auth does not comply with policy!');
    console.log('Please adjust your 2FA settings to meet this policy: ');
    console.log('allow2FADisabled: ' + effectivePolicy.allow2FADisabled);
    console.log('allow2FAAuthOnly: ' + effectivePolicy.allow2FAAuthOnly);
    console.log('allow2FAAuthAndWrites: ' + effectivePolicy.allow2FAAuthAndWrites);
  }
  return validated;
}

function validateBannedUserList(policy) {
  let validated = true;
  if (policy.bannedUserList) {
    const bannedUsers = String(policy.bannedUserList).split(',');
    const currentUser = fetchNPMUser();
    if (bannedUsers.includes(currentUser)) {
      console.log('Your NPM user "' + currentUser + '" is not allowed by policy!');
      console.log('Please login with an authorized NPM user account and try again.');
      validated = false;
    }
  }

  return validated;
}

module.exports = { validateTokenMaxAge, validateTokenPermissions, validateProfile2FASetting, validateBannedUserList };
