/** A reference to a reusable rule defined under `rules` in the config. */
export interface IRuleRef {
  ruleId: string;
}

/**
 * A single file/folder rule. The presence of `children` marks it as a folder
 * rule; without `children` it is a file rule. Both `name` and any nested
 * `children` may reference other rules recursively via {@link IRuleRef}.
 */
export interface IStructureRule {
  /**
   * Literal name or template the entry must match, e.g. `'index.ts'`,
   * `'{PascalCase}.(ts|tsx)'`, `'{kebab-case}'`. Supported case tokens:
   * `PascalCase`, `camelCase`, `kebab-case`, `snake_case`,
   * `SCREAMING_SNAKE_CASE`, `anyCase`. `(a|b)` denotes alternatives and `*`
   * matches any run of characters within a single segment.
   */
  name: string;
  /** Allowed children; its presence marks this rule as a folder rule. */
  children?: TStructureNode[];
  /**
   * Caps how deep a self-referential rule keeps validating. Once a rule
   * (by `ruleId`) has been entered more than this many times along the current
   * branch, its deeper contents are left untouched.
   */
  folderRecursionLimit?: number;
  /** When true, at least one entry matching this rule must exist in its parent. */
  required?: boolean;
}

/** A node in a structure: either an inline rule or a reference to a named one. */
export type TStructureNode = IStructureRule | IRuleRef;

/** The shape a `structure.config.*` file exports (as its default export). */
export interface IStructureConfig {
  /** Folder the structure is rooted at, relative to cwd. Defaults to `'.'`. */
  structureRoot?: string;
  /** Glob-ish names/paths to ignore at any level (`*` and `**` supported). */
  ignorePatterns?: string[];
  /** Allowed children of the root folder. */
  structure: TStructureNode[];
  /** Reusable named rules, referenced from `structure`/`children` via `{ ruleId }`. */
  rules?: Record<string, IStructureRule>;
  /**
   * Consent for anonymous usage stats (the tool name, and nothing else).
   * Undefined means "not asked yet" — the CLI asks once in a TTY and writes the
   * answer here; the API takes its consent as a `lint()` argument instead.
   */
  stats?: boolean;
}

/** A single structural problem found while validating. */
export interface IViolation {
  /** Posix path (relative to cwd) of the offending — or owning — entry. */
  path: string;
  /** `unexpected`: entry matched no rule. `missing`: a required rule had no match. */
  type: 'unexpected' | 'missing';
  /** Human-readable explanation. */
  message: string;
  /** The rule name patterns allowed/expected at that location. */
  expected: string[];
}

/** Options accepted by {@link lint} (and the CLI flags that mirror them). */
export interface ILintOptions {
  /** Root folder to validate; overrides `structureRoot` from the config. */
  path?: string;
  /** Presentation-only flag consumed by the CLI/`format`, ignored by `lint`. */
  json?: boolean;
  /**
   * Config to validate against, for embedders that hold their own (QoQ keeps the
   * structure inline in `qoq.config.*`). Skips discovery entirely — no
   * `structure.config.*` is looked for, so `lint()` works in a project that has
   * none. Omit it and the config is discovered from the cwd as usual.
   */
  config?: IStructureConfig;
  /**
   * Anonymous usage stats: `true` sends, `false` doesn't. Required and strictly
   * boolean — a library can't prompt, so the embedding caller is the only one who
   * can hold the user's consent, and it has to state it rather than let an
   * omission decide. "Never asked" is not a value here: it's a state of the
   * structure config, and it reaches this boundary as `false`. A send is one
   * constant body, `{ tool: 'structurelint', options: [] }`, and nothing else.
   */
  stats: boolean;
}

/** Structured result returned by {@link lint} (no printing, no exit). */
export interface ILintResult {
  /** The validated root folder (relative to cwd). */
  root: string;
  /** Whether the structure is valid (no violations). */
  passed: boolean;
  /** Every structural problem found. */
  violations: IViolation[];
}
