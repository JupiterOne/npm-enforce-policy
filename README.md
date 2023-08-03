## `npm-enforce-policy`

This project is a superset of [@jupiterone/npm-enforce-age](https://github.com/JupiterOne/npm-enforce-age/).

This is a tool meant to help enforce good security hygiene around NPM tokens by reminding users when it is time to revoke tokens that are out-of-spec with corporate policy. If called with no arguments, it will list the NPM tokens for the currently-logged-in NPM user, and audit them according to the following default policy:

| Setting               | Value |
| --------------------- | ----- |
| maxAgeInDays          | 30    |
| allowPublishTokens    | false |
| allowAutomationTokens | false |
| allow2FADisabled      | false |
| allow2FAAuthOnly      | true  |
| allow2FAAuthAndWrites | true  |
| bannedUserList        | ''    |

To use these defaults, simply do:

`npx @jupiterone/npm-enforce-policy`

The script will exit cleanly with exit code 0 upon success, or emit warning messages and exit with code 1 if one or more of your issued tokens is older than the `maxAgeInDays` limit, or has write permissions of publish or automation type. This makes it convenient to put this script in a `package.json` lifecycle hook, (say, `prepublish`), or some other local build script. A few examples:

```json
 "scripts": {
    "prepublish": "npx @jupiterone/npm-enforce-policy",
 }
```


or:

```shell
#!/bin/bash
set -e
npx @jupiterone/npm-enforce-policy
...rest of build script...
```

or perhaps:

```shell
npx @jupiterone/npm-enforce-policy || exit 1
...rest of script...
```

For use inside a local NodeJS script, you might do:

```javascript
const { validateTokenMaxAge, validateTokenPermissions, validateProfile2FASetting } = require('@jupiterone/npm-enforce-policy');

const policy = {
  maxAgeInDays: 15,
  allowPublishTokens: false,
  allowAutomationTokens: true
  allow2FADisabled: false,
  allow2FAAuthOnly: true,
  allow2FAAuthAndWrites: false,
};

if (!validateTokenMaxAge(policy) || !validateTokenPermissions(policy) || !validateProfile2FASetting(policy))) {
  return;
}
...rest of script...
```

The `npx` form (as well as the `bin/npm-enforce-policy` script) support the following command-line arguments:

* `--max-age <days>`, e.g. `--max-age 30` to override the default age policy. Set to `-1` to disable age checking. Default if unset: 30
* `--allow-publish-tokens <true/false>` will set the policy for allowing non-automation tokens with write permissions. Default if unset: false
* `--allow-automation-tokens <true/false>` will set the policy for allowing automation tokens with write permissions. Default if unset: false
* `--allow-2fa-disabled <true/false>` will set the policy for allowing 2FA to be disabled for the NPM profile. Default if unset: false
* `--allow-2fa-auth-only <true/false>` will set the policy for 2FA to allow the value 'auth-only'. Default if unset: true
* `--allow-2fa-auth-and-writes <true/false>` will set the policy for 2FA to allow the value 'auth-and-writes'. Default if unset: true
* `--banned-user-list <csv users>` will set the policy to ban specific NPM users. Default if unset: '' (allow all users)

Examples:

1. `npx @jupiterone/npm-enforce-policy` will prompt to revoke any tokens that are older than 30 days, and any tokens with publishing authority. Additionally, it will prompt the user to enable some flavor of 2FA if it is disabled in their profile.

2. `npx @jupiterone/npm-enforce-policy --max-age 90 --allow-automation-tokens true` will prompt to revoke any tokens that are older than 90 days, as well as any publishing tokens that are not of type automation. Additionally, it will prompt the user to enable some flavor of 2FA if it is disabled in their profile.

3. `npx @jupiterone/npm-enforce-policy --max-age -1 --allow-publish-tokens true --allow-2fa-auth-only false` will allow all tokens, regardless of age, EXCEPT automation tokens. Additionally, it will prompt the user if their 2FA profile setting is anything other than 'auth-and-writes'.

4. `npx @jupiterone/npm-enforce-policy --banned-user-list some-cicd-user` As 1. above, but also halt if the cicd user is being used outside of CI/CD.
