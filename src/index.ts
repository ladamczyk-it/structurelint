export { DEFAULT_CONFIG_FILES, loadConfig } from './config.ts';
export { format } from './format.ts';
export { DEFAULT_PATH, lint } from './lint.ts';
export { globToRegex, isIgnored, templateToRegex } from './helpers/matcher.ts';
export { DEFAULT_IGNORE, validate } from './helpers/validate.ts';

export type {
  ILintOptions,
  ILintResult,
  IRuleRef,
  IStructureConfig,
  IStructureRule,
  IViolation,
  TStructureNode,
} from './types.ts';
