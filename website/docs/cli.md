---
title: 'CLI options, exit codes and JSON output'
sidebar_label: 'Command line'
sidebar_position: 2
description: 'Every command-line option, what exit codes 0, 1 and 2 mean, the --json output for CI and AI agents, and how to run the structure check in scripts.'
keywords: [structurelint cli, folder structure lint, exit codes, json output, ci]
---

```bash
structurelint [options]
```

Run it from your project root: the [config](./configuration.md) is discovered in the current working directory, and every reported path is relative to it.

| Option              | Default         | Description                                         |
| ------------------- | --------------- | --------------------------------------------------- |
| `-p, --path <path>` | `structureRoot` | Root folder to validate (overrides `structureRoot`) |
| `--json`            | —               | Emit machine-readable JSON instead of text          |
| `-h, --help`        | —               | List all available options                          |

## Exit codes

| Code | Meaning                                                                                  |
| ---- | ---------------------------------------------------------------------------------------- |
| `0`  | The structure is valid                                                                   |
| `1`  | There are [violations](./violations.md)                                                  |
| `2`  | A usage error: no config found, the root folder does not exist, or the config is invalid |

An invalid config is one the walk cannot apply, such as a `{ ruleId }` that is not defined under `rules` or an unknown `{CaseToken}` in a rule name.

## JSON output

Use `--json` for machine or AI consumption. The output is the [lint result](./violations.md#json-output) on stdout, and a usage error is reported there too, still with exit code `2`:

```json
{
  "passed": false,
  "error": "Structure root \"lib\" does not exist or is not a folder."
}
```

`--json` also suppresses the one-time [usage statistics](./usage-statistics.md) prompt, so nothing interactive can land in the JSON.

## In scripts and CI

```json
{
  "scripts": {
    "lint:structure": "structurelint"
  }
}
```

Structure validation does not depend on ESLint, so it can run in parallel with the rest of your checks. With `CI=true` set, as most CI providers do, the CLI never prompts.
