---
title: 'Structurelint vs ls-lint vs eslint-plugin-project-structure'
sidebar_label: 'Compared with others'
sidebar_position: 1.5
description: 'How Structurelint compares with ls-lint and eslint-plugin-project-structure for linting a project folder structure: what each checks, config, and when to pick which.'
keywords:
  [
    ls-lint alternative,
    eslint-plugin-project-structure alternative,
    folder structure linter,
    directory structure lint,
    file naming convention lint,
  ]
---

Three tools lint a JavaScript/TypeScript project's layout, and each answers a different question:

- **ls-lint**: _is every file and directory name in the right case?_
- **eslint-plugin-project-structure**: _is the structure, and what imports what, right, inside ESLint?_
- **Structurelint**: _may this file or folder exist here at all, and is everything required present?_

|                              | structurelint                                    | ls-lint                                  | eslint-plugin-project-structure                          |
| ---------------------------- | ------------------------------------------------ | ---------------------------------------- | -------------------------------------------------------- |
| What it validates            | which files and folders may exist at each level  | file and directory names                 | folder structure, imports between modules, file contents |
| Required files and folders   | yes, `required: true`                            | counts per directory with `exists:N`     | yes, when a related file exists                          |
| Reusable and recursive rules | yes, with a recursion limit                      | glob keys and parent-folder substitution | yes, with a depth limit                                  |
| Needs ESLint                 | no                                               | no                                       | yes                                                      |
| Config                       | `structure.config.ts` (or `.js`, `.mjs`, `.cjs`) | `.ls-lint.yml`                           | ESLint config                                            |

## Which one to pick

- **Only naming matters**, across many languages, as a fast single binary: **ls-lint**.
- **The structure check should live inside ESLint**, next to rules about imports between layers: **eslint-plugin-project-structure**.
- **The layout itself is the contract**: every entry must be allowed by a rule, some must exist, and the result should be a clean gate for CI and AI coding agents outside the ESLint run: **Structurelint**.

Structurelint was extracted from an ESLint structure rule so the check runs **in parallel** with the rest of your tooling. It never scaffolds or generates code; it only reads what is on disk.

## The same rule, two ways

"Components are PascalCase `.tsx` files, and `src/index.ts` must exist":

```ts
// structure.config.ts
import type { IStructureConfig } from '@ladamczyk/structurelint';

export default {
  structureRoot: 'src',
  structure: [
    { name: 'index.ts', required: true },
    { name: 'components', children: [{ name: '{PascalCase}.tsx' }] },
  ],
} satisfies IStructureConfig;
```

With Structurelint, a stray `src/components/helper_old.js` fails because **no rule allows it**, not only because of its case. ls-lint checks the names of the files that are there. See [Rules](./rules.md) for templates and recursion, and [Recipes](./recipes.md) for full layouts.
