---
title: 'Violations: unexpected and missing files'
sidebar_label: 'Violations'
sidebar_position: 5
description: 'What a structure check reports: unexpected and missing files and folders, the expected names, and the same results as text or as JSON for CI and agents.'
keywords: [unexpected file, missing file, folder structure violations, json output, lint result]
---

A check reports two kinds of problem: an entry on disk that no rule allows (`unexpected`), and a `required` rule nothing on disk matches (`missing`).

Each violation is `{ path, type, message, expected }`:

| Field      | Description                                              |
| ---------- | -------------------------------------------------------- |
| `path`     | Posix path, relative to the cwd, of the offending entry  |
| `type`     | `'unexpected'` or `'missing'`                            |
| `message`  | A human-readable explanation                             |
| `expected` | The name patterns allowed, or required, at that location |

- `type: 'unexpected'` — a file or folder matched no rule at its level. `path` is the entry itself, and `expected` lists the name patterns of the rules of the same kind (file or folder) allowed there; it is empty when there are none.
- `type: 'missing'` — a `required` rule had no matching entry. `path` is the folder it is missing from, and `expected` is that rule's name.

## Text output

Take this config, where every component folder must hold an `index.ts`:

```ts
const config = {
  structureRoot: 'src',
  structure: [
    {
      name: 'components',
      children: [
        {
          name: '{PascalCase}',
          children: [{ name: 'index.ts', required: true }, { name: '{PascalCase}.tsx' }],
        },
      ],
    },
  ],
} satisfies IStructureConfig;
```

A `src/components/button/` folder and a `src/components/Card/` that holds only `Card.tsx` are reported as:

```text
✖ Unexpected folder "button" in "src/components".
  expected: {PascalCase}
✖ Missing required file matching "index.ts" in "src/components/Card".
  expected: index.ts

2 structure violation(s) found.
```

A valid structure prints `✔ Structure is valid (src).` and exits with `0`.

## JSON output

With `--json`, or `format(result, true)` from the [JavaScript API](./javascript-api.md), the same result is printed as:

```json
{
  "passed": false,
  "root": "src",
  "violations": [
    {
      "path": "src/components/button",
      "type": "unexpected",
      "message": "Unexpected folder \"button\" in \"src/components\".",
      "expected": ["{PascalCase}"]
    },
    {
      "path": "src/components/Card",
      "type": "missing",
      "message": "Missing required file matching \"index.ts\" in \"src/components/Card\".",
      "expected": ["index.ts"]
    }
  ]
}
```

Violations come in walk order, which follows the file system's listing order, so do not rely on it being sorted.
