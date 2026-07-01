import { statSync } from 'fs';

import { resolveCwdPath } from '@ladamczyk/qoq-utils';

import { loadConfig } from './config.ts';
import { validate } from './helpers/validate.ts';

import type { ILintOptions, ILintResult } from './types.ts';

/** Root folder validated when neither `--path` nor `structureRoot` is set. */
export const DEFAULT_PATH = '.';

/**
 * Loads the structure config and validates the target folder against it.
 * Returns structured results without printing or exiting; throws only on
 * usage errors (missing config or a non-existent root folder).
 */
export const lint = async (options: ILintOptions = {}): Promise<ILintResult> => {
  const config = await loadConfig();
  const root = options.path ?? config.structureRoot ?? DEFAULT_PATH;
  const absoluteRoot = resolveCwdPath(`/${root}`);

  let isDirectory: boolean;
  try {
    isDirectory = statSync(absoluteRoot).isDirectory();
  } catch {
    isDirectory = false;
  }

  if (!isDirectory) {
    throw new Error(`Structure root "${root}" does not exist or is not a folder.`);
  }

  const violations = validate(absoluteRoot, config);

  return { root, passed: violations.length === 0, violations };
};
