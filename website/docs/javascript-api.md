---
title: 'JavaScript API: lint(), validate() and format()'
sidebar_label: 'JavaScript API'
sidebar_position: 6
description: 'Run the structure check from Node: lint() options and result, validate() against an inline config, format() for text or JSON, and the matcher helpers.'
keywords: [structurelint api, folder structure node, lint api, typescript, validate]
---

The package also exports an ESM-only JavaScript API, with TypeScript declarations. `lint` runs the same validation as the CLI and returns structured results without printing or exiting:

```js
import { lint, format } from '@ladamczyk/structurelint';

const result = await lint({ path: 'src', stats: false });

result.passed; // boolean — no violations
result.root; // the validated root folder
result.violations; // Array<{ path, type: 'unexpected' | 'missing', message, expected }>

process.stdout.write(format(result)); // or format(result, true) for JSON
```

## `lint(options)`

Returns a `Promise<ILintResult>`. It rejects on the same usage errors the CLI exits with `2` for: no config found, a root folder that does not exist, or an invalid config. Violations are not errors — they come back in `result.violations`.

| Option   | Type               | Description                                                                      |
| -------- | ------------------ | -------------------------------------------------------------------------------- |
| `stats`  | `boolean`          | Required. Whether to count this run in [usage statistics](./usage-statistics.md) |
| `path`   | `string`           | Root folder to validate; overrides `structureRoot`                               |
| `config` | `IStructureConfig` | A config to use instead of discovering `structure.config.*`                      |

Pass **`config`** to validate against a config object you already hold, which skips discovery entirely — no `structure.config.*` is looked for, so `lint()` works in a project that has none. This is how QoQ drives it: the structure lives inline in `qoq.config.*` and is handed straight over.

```js
const result = await lint({ config: { structureRoot: 'src', structure }, stats: false });
```

## `format(result, json = false)`

Renders a result as the CLI prints it: the colorized text summary, or the [JSON output](./violations.md#json-output) when `json` is `true`. It returns the string and writes nothing.

## Other exports

| Export                               | Description                                                                            |
| ------------------------------------ | -------------------------------------------------------------------------------------- |
| `validate(absRoot, config, cwd?)`    | Synchronous walk of an existing absolute folder; returns `IViolation[]`                |
| `loadConfig()`                       | Discovers and loads `structure.config.*` from the cwd                                  |
| `templateToRegex(name)`              | Compiles a rule [name template](./rules.md#name-templates) to an anchored `RegExp`     |
| `globToRegex(glob)`                  | Compiles an [ignore glob](./configuration.md#ignoring-entries) to an anchored `RegExp` |
| `isIgnored(name, relPath, patterns)` | Whether an entry matches any of the ignore patterns                                    |
| `DEFAULT_PATH`                       | `'.'`, the root used when neither `path` nor `structureRoot` is set                    |
| `DEFAULT_IGNORE`                     | `['node_modules', '.git']`, always ignored                                             |
| `DEFAULT_CONFIG_FILES`               | The config file names discovery looks for                                              |

TypeScript types: `IStructureConfig`, `IStructureRule`, `IRuleRef`, `TStructureNode`, `IViolation`, `ILintOptions`, `ILintResult`.
