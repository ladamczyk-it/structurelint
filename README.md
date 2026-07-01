# @ladamczyk/structurelint

Browse our docs [https://adamczyk.ovh/docs/structurelint](https://adamczyk.ovh/docs/structurelint).

## Rationale

A standalone linter that validates an existing project's file/folder structure against rules you define — no scaffolding, no code generation. It only inspects what is already on disk and reports anything that does not match.

It was extracted from an ESLint structure rule so structure validation can run **in parallel** with the rest of your tooling instead of being sequenced inside the ESLint pipeline. It is not tied to React (or any framework): the rules describe whatever layout your JS/TS project uses.

Rules are **recursive** — a rule can reference itself or other named rules to describe nested structures (e.g. `components/Button/nested/Icon`, where `nested` reuses the same PascalCase component rules as the root `components`).

## Install

```bash
npm install --save-dev @ladamczyk/structurelint
```

or run it directly:

```bash
npx @ladamczyk/structurelint
```

## Usage

Create a `structure.config.ts` (or `.js`/`.mjs`) at your project root that default-exports a config, then run `structurelint`:

```bash
structurelint              # validate, pretty output
structurelint --json       # machine-readable output (for CI / AI consumption)
structurelint -h           # list all options
```

It exits with code `0` when the structure is valid and `1` when there are violations (`2` on a usage error such as a missing config).

| Option              | Default         | Description                                         |
| ------------------- | --------------- | --------------------------------------------------- |
| `-p, --path <path>` | `structureRoot` | Root folder to validate (overrides `structureRoot`) |
| `--json`            | —               | Emit machine-readable JSON instead of text          |

## Config

The config default-exports an object: an optional `structureRoot` (defaults to `.`), an optional `ignorePatterns` list, the `structure` array (allowed children of the root), and an optional `rules` map of reusable named rules referenced via `{ ruleId }`.

A rule is a folder rule when it has `children`, otherwise it is a file rule. The `name` is a literal or a template:

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

## JavaScript API

The package also exports an ESM/CJS API. `lint` runs the same validation and returns structured results without printing or exiting:

```js
import { lint, format } from '@ladamczyk/structurelint';

const result = await lint({ path: 'src' });

result.passed; // boolean — no violations
result.root; // the validated root folder
result.violations; // Array<{ path, type: 'unexpected' | 'missing', message, expected }>

process.stdout.write(format(result)); // or format(result, true) for JSON
```

Additional named exports: `validate`, `loadConfig`, `templateToRegex`, `globToRegex`, `isIgnored`, `DEFAULT_PATH`, `DEFAULT_IGNORE`, `DEFAULT_CONFIG_FILES`, and the TypeScript types (`IStructureConfig`, `IStructureRule`, `IRuleRef`, `TStructureNode`, `IViolation`, `ILintOptions`, `ILintResult`).
