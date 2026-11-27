---
title: 'qoq integration'
sidebar_label: 'qoq integration'
sidebar_position: 8
description: 'Turn the structure check on inside qoq --check: the structurelint block in qoq.config.js, how it differs from a standalone run, and how /qoq fix reports it.'
keywords: [qoq, qoq-cli, ai quality gate, project structure check, claude code skill]
---

[qoq](https://qoq.adamczyk.ovh/) is a quality suite for JavaScript and TypeScript projects (ESLint, Prettier, Knip, JSCPD and more behind one CLI) and a Claude Code skill that turns those checks into a guarded delivery loop. This is one of qoq's optional checks: `@ladamczyk/qoq-cli` calls the [JavaScript API](./javascript-api.md) in-process, and violations fail `qoq --check`.

## Turn it on

It is off by default. Add a `structurelint` block to `qoq.config.js`, or turn it on in qoq's config wizard. The block holds the same keys as `structure.config.ts`:

```js
// qoq.config.js
export default {
  structurelint: {
    structureRoot: 'src',
    structure: [
      { name: 'index.ts', required: true },
      { name: 'components', children: [{ name: '{PascalCase}.tsx' }] },
    ],
  },
};
```

- Violations make `qoq --check` exit `1` and suggest `/qoq fix`.
- A block without `structure`, or a config the walk can't apply, exits `2`.
- `--skip-structurelint` skips it for one run.

## How it differs from a standalone run

- **qoq's config wins.** qoq passes the `structurelint` block to `lint()`, so a `structure.config.*` in the project is not read.
- **Always the whole tree.** The check validates the configured root even when qoq checks only staged or changed files.

## Reports and /qoq fix

`qoq --check --json` writes `structurelint-report.json`, the same object as `structurelint --json`. qoq's skill groups the violations by type and marks them **not auto-fixable**: files are moved, renamed or created by hand, guided by `expected`.
