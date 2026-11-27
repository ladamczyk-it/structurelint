---
title: 'Folder structure gate for AI agents and CI'
sidebar_label: 'AI agents and CI'
sidebar_position: 7
description: 'Keep AI coding agents and CI merges inside your project layout: exit codes, --json violations with expected names, no prompts, and an AGENTS.md snippet.'
keywords:
  [
    ai coding agent project structure,
    agents.md,
    folder structure ci,
    architecture lint,
    structure gate,
    claude code,
  ]
---

A structure gate for CI pipelines and AI coding agents such as Claude Code, Codex or Cursor. Agents put new files wherever the task is easiest; a structure check makes the layout a rule they hit immediately, with the allowed names in the error, instead of a review comment later.

## The contract

- **Exit codes.** `0` when the structure is valid, `1` when there are [violations](./violations.md), `2` on a usage error: no config found, a root folder that does not exist, or an invalid config.
- **JSON output.** `--json` prints `{ passed, root, violations }` to stdout; each violation is `{ path, type, message, expected }`. The shape is documented and kept stable within a major version; it carries no schema version field. A usage error is `{ passed: false, error }`, still with exit code `2`.
- **Actionable for agents.** `expected` lists the names that would have been allowed at that spot, so an agent can rename or move the file without guessing.
- **Never interactive.** Runs with `--json`, with `CI=true`, or without a terminal on stdin and stdout are never prompted.

```json
{
  "passed": false,
  "root": "src",
  "violations": [
    {
      "path": "src/components/button.tsx",
      "type": "unexpected",
      "message": "Unexpected file \"button.tsx\" in \"src/components\".",
      "expected": ["{PascalCase}.tsx"]
    }
  ]
}
```

## CI example

```bash
npx @ladamczyk/structurelint
npx @ladamczyk/structurelint --json > structurelint-report.json
```

It reads the file system directly (not git), skipping `node_modules`, `.git` and your `ignorePatterns`, and it doesn't depend on ESLint, so it can run in parallel with your other checks.

## AGENTS.md snippet

Paste this into your `AGENTS.md` or `CLAUDE.md`:

```markdown
## Project structure

- The allowed file and folder layout is defined in `structure.config.ts`. Read it before creating files or folders.
- Run `npx @ladamczyk/structurelint --json` after adding, moving or renaming files.
- For an `unexpected` violation, rename or move the entry to one of the names in `expected`; don't change `structure.config.ts` to make it pass unless asked.
- For a `missing` violation, create the required file or folder named in `expected`.
- Exit code 1 means violations, exit code 2 means the config or root folder is wrong.
```

## From JavaScript

[`lint()`](./javascript-api.md) returns the same object `--json` prints, so tools running in Node can call it in-process.

## Inside qoq

[qoq](https://qoq.adamczyk.ovh/) can run this check as part of `qoq --check`, where violations fail the run. See [qoq integration](./qoq.md).
