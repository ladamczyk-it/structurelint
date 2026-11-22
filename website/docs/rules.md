---
title: Rules
sidebar_position: 4
description: File and folder rules, name templates, and reusable and recursive rules.
---

`structure` lists what may appear directly inside the root folder; each folder rule's `children` lists what may appear inside the folders it matches. Every entry on disk must match a rule at its level, or it is reported as [unexpected](./violations.md).

A node in `structure` or `children` is either an inline rule or a `{ ruleId }` reference to a named rule from `rules`.

## Rule fields

| Field                  | Type               | Description                                                                       |
| ---------------------- | ------------------ | --------------------------------------------------------------------------------- |
| `name`                 | `string`           | Required. A literal name or a [template](#name-templates) the entry must match    |
| `children`             | `TStructureNode[]` | Makes it a folder rule, listing what the folder may contain                       |
| `required`             | `boolean`          | At least one matching entry must exist in the parent folder                       |
| `folderRecursionLimit` | `number`           | How deep a self-referential rule keeps validating ([recursion](#recursive-rules)) |

## Files and folders

A rule is a **folder rule** when it has `children`, otherwise it is a **file rule**. Folder rules only match folders and file rules only match files, so `{ name: 'utils' }` does not allow a `utils/` folder. To allow an empty folder, give it `children: []` — a folder rule's `children` is the complete list of what it may hold.

When several rules at one level match an entry, the first one listed wins: put specific rules before broad ones.

## Name templates

| Token in `name`          | Matches                            |
| ------------------------ | ---------------------------------- |
| `{PascalCase}`           | `Button`, `ButtonGroup`            |
| `{camelCase}`            | `useStore`, `fetch`                |
| `{kebab-case}`           | `my-feature`                       |
| `{snake_case}`           | `my_module`                        |
| `{SCREAMING_SNAKE_CASE}` | `MAX_VALUE`                        |
| `{anyCase}`              | any single segment                 |
| `(ts\|tsx)`              | one of the listed alternatives     |
| `*`                      | any run of characters in a segment |

Everything else is literal, and a template must match the whole name. Tokens combine freely, e.g. `{PascalCase}.spec.(ts|tsx)` or `use{PascalCase}.ts`. An unknown token such as `{Title Case}` is a usage error, and the message lists the valid ones.

## Reusable rules

Define a rule once under `rules` and reference it with `{ ruleId: 'name' }` wherever it applies. References are resolved while the tree is walked, so a referenced rule behaves exactly like the same rule written inline. A `ruleId` that is not defined under `rules` is a usage error.

```ts
const config = {
  rules: {
    test_file: { name: '{camelCase}.test.ts' },
  },
  structure: [
    { name: '{camelCase}.ts' },
    { ruleId: 'test_file' },
    { name: 'helpers', children: [{ name: '{camelCase}.ts' }, { ruleId: 'test_file' }] },
  ],
} satisfies IStructureConfig;
```

## Recursive rules

A rule's `children` can reference itself, or a rule that references it back, to describe nested structures of any depth (e.g. `components/Button/nested/Icon`, where `nested` reuses the same PascalCase component rules as the root `components`).

```ts
import type { IStructureConfig } from '@ladamczyk/structurelint';

const config = {
  structureRoot: 'src',
  ignorePatterns: ['*.d.ts', '*.stories.tsx'],
  rules: {
    // A single PascalCase component folder, recursive via `nested/`.
    component_folder: {
      name: '{PascalCase}',
      folderRecursionLimit: 5,
      children: [
        { name: 'index.ts' },
        { name: '{PascalCase}.(ts|tsx)' },
        { name: '{PascalCase}.spec.(ts|tsx)' },
        { ruleId: 'nested_folder' },
      ],
    },
    // `nested/` reuses the same component rules — this is the recursion.
    nested_folder: {
      name: 'nested',
      children: [{ ruleId: 'component_folder' }],
    },
  },
  structure: [
    {
      name: 'components',
      children: [{ ruleId: 'component_folder' }],
    },
  ],
} satisfies IStructureConfig;

export default config;
```

With the config above, `components/Button/nested/Icon/Icon.tsx` is valid, while `components/Button/nested/icon` (lowercase) is reported as an unexpected folder.

`folderRecursionLimit` caps how many times a referenced rule is entered along one branch. Past the limit the folder still counts as matched, but its contents are no longer validated. It only applies to rules used through `{ ruleId }`.
