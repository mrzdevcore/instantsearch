#!/usr/bin/env node
/* eslint-disable no-process-exit, no-console, import/no-commonjs */
const fs = require('fs');
const path = require('path');

// This file does not use any dependencies, so that it can be ran before installing

// It checks whether the versions of packages that should be versioned synchronously
// are actually in sync. We need this as long as Lerna doesn't have a mixed mode.
// see: https://github.com/lerna/lerna/issues/1159

let hasError = false;

{
  const PACKAGE_GROUPS = {
    react: [
      'react-instantsearch',
      'react-instantsearch-core',
      'react-instantsearch-dom',
      'react-instantsearch-dom-maps',
      'react-instantsearch-native',
    ],
    'react-hooks': [
      'react-instantsearch-hooks',
      'react-instantsearch-hooks-web',
      'react-instantsearch-hooks-server',
      'react-instantsearch-hooks-router-nextjs',
    ],
  };

  const results = Object.entries(PACKAGE_GROUPS).map(([group, packages]) => {
    const versions = packages.map((name) => [
      name,
      require(`../../packages/${name}/package.json`).version,
    ]);
    const firstVersion = versions[0][1];
    const isValid = versions.every(([, version]) => version === firstVersion);

    return [group, { isValid, versions: Object.fromEntries(versions) }];
  });

  if (results.some(([, { isValid }]) => !isValid)) {
    console.error('Version mismatch detected!');
    console.error(Object.fromEntries(results));
    hasError = true;
  } else {
    console.log('Versions are in sync per flavor');
  }
}

{
  const versions = [
    {
      name: 'react-instantsearch-hooks',
      versionFile: 'src/version.ts',
    },
    {
      name: 'instantsearch.js',
      versionFile: 'src/lib/version.ts',
    },
    {
      name: 'react-instantsearch-core',
      versionFile: 'src/core/version.js',
    },
  ];

  const results = versions.map(({ name, versionFile }) => {
    const version = require(`../../packages/${name}/package.json`).version;
    const versionFileContent = fs
      .readFileSync(
        path.join(__dirname, `../../packages/${name}/${versionFile}`)
      )
      .toString();

    return {
      name,
      version,
      versionFileContent,
      isValid: `export default '${version}';\n` === versionFileContent,
    };
  });

  if (results.some(({ isValid }) => !isValid)) {
    console.error('Version mismatch detected!');
    console.error(results.filter(({ isValid }) => !isValid));
    hasError = true;
  } else {
    console.log('Version files are in sync.');
  }
}

if (hasError) {
  process.exit(1);
}
