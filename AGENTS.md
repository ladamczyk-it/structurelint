# @ladamczyk/structurelint — Agent Context

Standalone validator for a JS/TS project's file/folder structure. It checks the existing tree against rules you define — no scaffolding, no generation — and is framework-agnostic. Built to run in parallel with other tooling (it was lifted out of an ESLint structure rule). Ships both a CLI (default) and a JavaScript API.

## Command

```bash
structurelint [options]
```

| Option              | Default         | Description                                     |
| ------------------- | --------------- | ----------------------------------------------- |
| `-p, --path <path>` | `structureRoot` | Root folder to validate (overrides config root) |
| `--json`            | —               | Emit machine-readable JSON instead of text      |

Exit codes: `0` valid, `1` violations found, `2` usage error (e.g. missing config or root). Use `--json` for machine/AI consumption.

## Config file

Default-exports an object from `structure.config.{ts,js,mjs,cjs}` at the project root (auto-discovered — there is no way to point at a different path). TS configs are loaded directly — no build step needed.

```ts
import type { IStructureConfig } from '@ladamczyk/structurelint';

const config = {
  structureRoot: 'src', // default '.'
  ignorePatterns: ['*.d.ts'], // glob-ish, supports * ** ?
  rules: {
    // reusable named rules, referenced via { ruleId }
    component_folder: {
      name: '{PascalCase}',
      folderRecursionLimit: 5,
      children: [
        { name: 'index.ts' },
        { name: '{PascalCase}.(ts|tsx)' },
        { ruleId: 'nested_folder' }, // recursion
      ],
    },
    nested_folder: { name: 'nested', children: [{ ruleId: 'component_folder' }] },
  },
  structure: [{ name: 'components', children: [{ ruleId: 'component_folder' }] }],
} satisfies IStructureConfig;

export default config;
```

### Rule shape

- A rule with `children` is a **folder rule**; without `children` it is a **file rule**. Empty folder → `children: []`.
- `name` is a literal (`index.ts`) or a template. Tokens: `{PascalCase}`, `{camelCase}`, `{kebab-case}`, `{snake_case}`, `{SCREAMING_SNAKE_CASE}`, `{anyCase}`; `(a|b)` alternatives; `*` in-segment wildcard.
- `{ ruleId: 'name' }` references a rule from `rules` — including itself, which is how nested/recursive structures are described. `folderRecursionLimit` caps recursion depth along a branch.
- `required: true` on an (inline) rule makes at least one matching entry mandatory in its parent folder.

## Programmatic API

```js
import { lint, format } from '@ladamczyk/structurelint';

const result = await lint({ path: 'src' });

result.passed; // boolean — no violations
result.root; // validated root folder
result.violations; // Array<{ path, type: 'unexpected' | 'missing', message, expected }>

process.stdout.write(format(result)); // text; format(result, true) for JSON
```

`lint(options)` accepts the same options as the CLI (`path`). Additional named exports: `validate`, `loadConfig`, `templateToRegex`, `globToRegex`, `isIgnored`, `DEFAULT_PATH`, `DEFAULT_IGNORE`, `DEFAULT_CONFIG_FILES`, and the TypeScript types (`IStructureConfig`, `IStructureRule`, `IRuleRef`, `TStructureNode`, `IViolation`, `ILintOptions`, `ILintResult`).

## Violation shape

Each violation is `{ path, type, message, expected }`:

- `type: 'unexpected'` — a file/folder matched no rule at its level; `expected` lists the allowed name patterns there.
- `type: 'missing'` — a `required` rule had no matching entry; `expected` is that rule's name.
