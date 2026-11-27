---
title: 'Configuration file: structure.config.ts'
sidebar_label: 'Configuration'
sidebar_position: 3
description: 'Where structure.config.ts lives and how it is found, its top-level keys structure, structureRoot, ignorePatterns and rules, and what is always ignored.'
keywords:
  [structure.config.ts, folder structure config, ignorePatterns, structureRoot, typescript config]
---

Create a `structure.config.ts` (or `.js`, `.mjs`, `.cjs`) at your project root that default-exports a config. It is discovered from the current working directory up to the nearest folder with a `package.json` — there is no way to point at a different path. `.ts` configs are loaded directly, no build step needed: they are transpiled with your project's `typescript` package (types are stripped, not checked). `.mts` and `.cts` are not supported.

```ts
import type { IStructureConfig } from '@ladamczyk/structurelint';

const config = {
  structureRoot: 'src',
  ignorePatterns: ['*.d.ts', '*.stories.tsx'],
  structure: [
    { name: 'index.ts', required: true },
    { name: 'components', children: [{ name: '{PascalCase}.tsx' }] },
  ],
} satisfies IStructureConfig;

export default config;
```

`satisfies IStructureConfig` type-checks the config in your editor without widening it.

## Top-level keys

| Key              | Type                             | Default | Description                                                                         |
| ---------------- | -------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `structure`      | `TStructureNode[]`               | —       | Required. The allowed children of the root folder                                   |
| `structureRoot`  | `string`                         | `'.'`   | Folder to validate, relative to the cwd. `--path` overrides it                      |
| `ignorePatterns` | `string[]`                       | `[]`    | Globs for entries to skip at any level                                              |
| `rules`          | `Record<string, IStructureRule>` | `{}`    | Reusable named rules, referenced via `{ ruleId }`                                   |
| `stats`          | `boolean`                        | —       | Consent for [usage statistics](./usage-statistics.md); written by the CLI on asking |

How `structure`, `rules` and the rules inside them work is covered in [Rules](./rules.md).

## Ignoring entries

Ignored entries are skipped entirely: they are never reported, and an ignored folder is not walked into. `node_modules` and `.git` are always ignored, on top of your `ignorePatterns`.

A pattern is tested against both the entry's own name and its path relative to the cwd, so `*.d.ts` matches at any depth while `src/legacy/**` matches one subtree.

| Glob | Matches                                    |
| ---- | ------------------------------------------ |
| `*`  | any run of characters within one segment   |
| `**` | any run of characters, across segments too |
| `?`  | a single character                         |

Everything else in a pattern is literal.
