## `npm-enforce-token-policy`

This project is a superset of [@jupiterone/npm-enforce-age](https://github.com/JupiterOne/npm-enforce-age/).

This is a tool meant to help enforce good security hygiene around NPM tokens by reminding users when it is time to revoke tokens that are out-of-spec with corporate policy. If called with no arguments, it will list the NPM tokens for the currently-logged-in NPM user, and audit them according to the following default policy:

| Setting               | Value |
| --------------------- | ----- |
| maxAgeInDays          | 30    |
| allowPublishTokens    | false |
| allowAutomationTokens | false |

To use these defaults, simply do:

`npx @jupiterone/npm-enforce-token-policy`

The script will exit cleanly with exit code 0 upon success, or emit warning messages and exit with code 1 if one or more of your issued tokens is older than the `maxAgeInDays` limit, or has write permissions of publish or automation type. This makes it convenient to put this script in a `package.json` lifecycle hook, (say, `prepublish`), or some other local build script. A few examples:

```json
 "scripts": {
    "prepublish": "npx @jupiterone/npm-enforce-token-policy",
 }
```

or:

```shell
#!/bin/bash
set -e
npx @jupiterone/npm-enforce-token-policy
...rest of build script...
```

or perhaps:

```shell
npx @jupiterone/npm-enforce-token-policy || exit 1
...rest of script...
```

For use inside a local NodeJS script, you might do:

```javascript
const { enforceMaxNPMTokenAge, enforceNPMTokenPermissions } = require('@jupiterone/npm-enforce-token-policy');

const policy = {
  maxAgeInDays: 15,
  allowPublishTokens: false,
  allowAutomationTokens: true
};

if (!enforceMaxNPMTokenAge(policy) || !enforceNPMTokenPermissions(policy)) {
  return;
}
...rest of script...
```

The `npx` form (as well as the `bin/npm-enforce-token-policy` script) support the following command-line arguments:

* `--max-age <days>`, e.g. `--max-age 30` to override the default age policy. Set to `-1` to disable age checking.
* `--allow-publish-tokens` will override the default and allow non-automation tokens with write permissions.
* `--allow-automation-tokens` will override the default and allow automation tokens with write permissions.

Examples:

`npx @jupiterone/npm-enforce-token-policy --max-age 90 --allow-automation-tokens` will prompt to revoke any tokens that are older than 90 days, as well as any tokens that are of type automation.

`npx @jupiterone/npm-enforce-token-policy --max-age -1 --allow-publish-tokens` will allow all tokens, regardless of age, EXCEPT automation tokens.