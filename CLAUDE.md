# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build          # compile src/ → bin/ + lib/ (rimraf + rollup + chmod)
npm run dev            # build then run the CLI directly
npm test               # run the vitest suite
npm run qoq:check      # lint + format check (ESLint, Prettier, knip, jscpd)
npm run qoq:fix        # auto-fix lint and formatting issues
```

## Architecture

This package ships **two entry points**, each built by its own Rollup config (the build runs Rollup only — no standalone `tsc`). All `dependencies` stay external (not bundled); only `devDependencies` tooling is used at build time:

- `src/cli.ts` → `bin/cli.js` — the **CLI** (`package.json` `bin`, shebang). Built by `rollup.bin.js` (esbuild + terser into one self-contained bundle). Parses options with `cac`, calls `lint()`, prints via `format()`, and sets the exit code (`EExitCode` from `@ladamczyk/qoq-utils`): `0` pass, `1` violations, `2` usage error.
- `src/index.ts` → `lib/index.mjs` + `lib/index.cjs` + `lib/src/*.d.ts` — the **JavaScript API** (`package.json` `main`/`module`/`types`/`exports`). Built by `rollup.config.js` via `@rollup/plugin-typescript` (dual CJS/ESM output plus declarations). Exposes `lint()`, `validate()`, `format()`, `loadConfig()`, matcher helpers and the types.

**Core flow (`src/lint.ts`):** `lint(options): Promise<ILintResult>` loads the config, resolves the root folder and runs the validator — no printing, no `process.exit`.

1. `loadConfig` (`src/config.ts`) discovers `structure.config.{ts,js,mjs,cjs}` in the cwd through **`cosmiconfig`** (`searchStrategy: 'project'`, custom `searchPlaces`), returning the default export. There is no `--config` override — the config always lives at the project root. This mirrors `qoq/packages/cli`'s config loading. `.ts` configs work without a separate build step because cosmiconfig's built-in `.ts` loader transpiles them via the `typescript` package at load time (type-stripping only, no type-checking) — consuming projects are expected to already have `typescript` installed. `.mts`/`.cts` are intentionally not supported (cosmiconfig has no built-in loader for them).
2. `validate` (`src/helpers/validate.ts`) walks the root with `readdirSync`, matching each entry against the allowed rules at that level. Unmatched entries become `unexpected` violations; `required` rules with no match become `missing` violations. Folder rules recurse into their `children`; `{ ruleId }` references are resolved **lazily** during traversal (not expanded up front), which is what makes self-referential/recursive rules possible. `folderRecursionLimit` caps how deep a self-referential rule keeps validating along a branch.
3. `templateToRegex` / `globToRegex` (`src/helpers/matcher.ts`) compile rule-name templates (`{PascalCase}`, `(ts|tsx)`, `*`) and ignore globs (`*`, `**`, `?`) into anchored regexes.

**Output (`src/format.ts`):** `format(result, json = false)` renders either a colorized text summary or `--json` output. Pure string in, string out; the CLI does the writing/exiting.

## Key conventions

- ESM-only (`"type": "module"`); import TypeScript files with `.ts` extensions (`allowImportingTsExtensions`)
- `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` are enabled — handle array/object access accordingly
- A rule is a **folder rule** iff it has `children`; otherwise it is a **file rule**. To allow an empty folder, give it `children: []`.
- `resolveCwdPath` from `@ladamczyk/qoq-utils` concatenates without a separator, so paths are passed with a leading `/` (see `src/lint.ts`)
- `structure.config.ts` at the repo root dogfoods the tool against this package's own `src/` layout
- `AGENTS.md` is the consumer-facing context file for agents using this tool; `CLAUDE.md` (this file) is for development
