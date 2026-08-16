import { statSync } from 'fs';

import { resolveCwdPath } from '@ladamczyk/qoq-utils';

import { loadConfig } from './config.ts';
import { validate } from './helpers/validate.ts';
import { sendStats } from './stats.ts';

import type { ILintOptions, ILintResult } from './types.ts';

/** Root folder validated when neither `--path` nor `structureRoot` is set. */
export const DEFAULT_PATH = '.';

/**
 * Validates the target folder against the structure config — the one passed in
 * `options.config`, or the discovered `structure.config.*` when there is none.
 * Returns structured results without printing or exiting; throws only on usage
 * errors (missing config or a non-existent root folder).
 */
export const lint = async (options: ILintOptions): Promise<ILintResult> => {
  // Nothing is prompted from here — a library call has no TTY to ask on, so the
  // caller's `stats` is taken as the whole of the consent decision. Counted under
  // the same `structurelint` name as the CLI: the run is the same run.
  if (options.stats) {
    void sendStats();
  }

  const config = options.config ?? (await loadConfig());
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
