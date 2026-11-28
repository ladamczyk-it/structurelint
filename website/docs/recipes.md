---
title: 'Folder structure recipes: React, Next.js App Router, monorepo'
sidebar_label: 'Recipes'
sidebar_position: 4.5
description: 'Copy-paste structure.config.ts layouts for React component folders, the Next.js App Router and npm workspace monorepos, each with the violations it reports.'
keywords:
  [
    react folder structure,
    next.js app router folder structure,
    monorepo folder structure,
    component folder convention,
    structure.config.ts example,
  ]
---

Each recipe is a complete `structure.config.ts`, verified against `@ladamczyk/structurelint` v1.1.6, followed by what it reports for a typical mistake. Start from the closest one and trim it to your project. Fields and templates are explained in [Rules](./rules.md).

## React component folders

One folder per component, named in PascalCase, holding an `index.ts` barrel and the component, plus optional tests and CSS modules.

```ts
import type { IStructureConfig } from '@ladamczyk/structurelint';

export default {
  structureRoot: 'src/components',
  rules: {
    component: {
      name: '{PascalCase}',
      children: [
        { name: 'index.ts', required: true },
        { name: '{PascalCase}.tsx', required: true },
        { name: '{PascalCase}.test.tsx' },
        { name: '{PascalCase}.module.css' },
      ],
    },
  },
  structure: [{ ruleId: 'component' }],
} satisfies IStructureConfig;
```

For `src/components/Card/` holding `Card.tsx` and `helpers.ts` but no `index.ts`:

```text
✖ Unexpected file "helpers.ts" in "src/components/Card".
  expected: index.ts, {PascalCase}.tsx, {PascalCase}.test.tsx, {PascalCase}.module.css
✖ Missing required file matching "index.ts" in "src/components/Card".
  expected: index.ts
```

`{PascalCase}.tsx` matches any PascalCase name: it does not check that the file is named after its folder.

## Next.js App Router

Route segments in kebab-case, dynamic segments such as `[slug]`, `[...path]` and `[[...slug]]`, route groups such as `(marketing)`, and only Next.js route files inside them.

```ts
import type { IStructureConfig, TStructureNode } from '@ladamczyk/structurelint';

const routeChildren: TStructureNode[] = [
  { ruleId: 'route_file' },
  { ruleId: 'segment' },
  { ruleId: 'dynamic_segment' },
  { ruleId: 'route_group' },
];

export default {
  structureRoot: 'app',
  rules: {
    route_file: { name: '(page|layout|loading|error|not-found|template).tsx' },
    route_handler: { name: 'route.ts' },
    segment: {
      name: '{kebab-case}',
      folderRecursionLimit: 10,
      children: [...routeChildren, { ruleId: 'route_handler' }],
    },
    // `[` and `]` are literal, so this matches [slug], [...path] and [[...slug]].
    dynamic_segment: {
      name: '[*]',
      folderRecursionLimit: 10,
      children: [...routeChildren, { ruleId: 'route_handler' }],
    },
    // `(` opens a list of alternatives, so a route group is matched by its closing `)`.
    route_group: { name: '*)', folderRecursionLimit: 10, children: routeChildren },
  },
  structure: [
    { name: 'layout.tsx', required: true },
    { name: '(globals.css|favicon.ico)' },
    ...routeChildren,
  ],
} satisfies IStructureConfig;
```

For an `app/Settings/` folder and an `app/blog/utils.ts` helper, `--json` reports:

```json
{
  "passed": false,
  "root": "app",
  "violations": [
    {
      "path": "app/Settings",
      "type": "unexpected",
      "message": "Unexpected folder \"Settings\" in \"app\".",
      "expected": ["{kebab-case}", "[*]", "*)"]
    },
    {
      "path": "app/blog/utils.ts",
      "type": "unexpected",
      "message": "Unexpected file \"utils.ts\" in \"app/blog\".",
      "expected": ["(page|layout|loading|error|not-found|template).tsx", "route.ts"]
    }
  ]
}
```

Helpers belong outside `app/` (for example in `src/lib/`), which is exactly what this layout enforces.

## Monorepo packages

Every workspace package in `packages/` is kebab-case and has a `package.json`, a `README.md` and a `src/index.ts`. Build output is ignored.

```ts
import type { IStructureConfig } from '@ladamczyk/structurelint';

export default {
  structureRoot: 'packages',
  ignorePatterns: ['dist', '*.tsbuildinfo'],
  structure: [
    {
      name: '{kebab-case}',
      children: [
        { name: 'package.json', required: true },
        { name: 'README.md', required: true },
        { name: 'tsconfig.json' },
        { name: 'CHANGELOG.md' },
        {
          name: 'src',
          required: true,
          children: [
            { name: 'index.ts', required: true },
            { name: '{camelCase}.ts' },
            { name: '{camelCase}.test.ts' },
          ],
        },
      ],
    },
  ],
} satisfies IStructureConfig;
```

For a `packages/cli` without a README and a `Button.tsx` in a package's `src/`:

```text
✖ Missing required file matching "README.md" in "packages/cli".
  expected: README.md
✖ Unexpected file "Button.tsx" in "packages/ui-kit/src".
  expected: index.ts, {camelCase}.ts, {camelCase}.test.ts
```

## Use a recipe as a gate

Add the check to CI or tell your AI coding agent to run it after every change. [AI agents and CI](./ai-agents-and-ci.md) has a workflow example and an `AGENTS.md` snippet.
