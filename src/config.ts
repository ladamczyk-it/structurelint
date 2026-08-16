import { cosmiconfig } from 'cosmiconfig';

import type { IStructureConfig } from './types.ts';

const moduleName = 'structure';

/** Config file names looked up (in order) in the current working directory. */
export const DEFAULT_CONFIG_FILES = [
  'structure.config.ts',
  'structure.config.js',
  'structure.config.mjs',
  'structure.config.cjs',
];

// Module-level, not per call: cosmiconfig caches its searches, so the stats
// consent lookup (which needs the file path) and `loadConfig` share one read.
const explorer = cosmiconfig(moduleName, {
  searchStrategy: 'project',
  searchPlaces: DEFAULT_CONFIG_FILES,
});

/** Raw cosmiconfig hit — config plus the file path it came from. */
export const searchConfig = (): ReturnType<typeof explorer.search> => explorer.search();

const assertIsStructureConfig = (config: unknown, source: string): IStructureConfig => {
  if (!config || !Array.isArray((config as Partial<IStructureConfig>).structure)) {
    throw new Error(
      `Structure config "${source}" must export (default) an object with a "structure" array.`
    );
  }

  return config as IStructureConfig;
};

/**
 * Discovers and loads the `structure.config.*` file (TS or JS) in the
 * current working directory through `cosmiconfig` (which transpiles TS
 * configs on the fly via `typescript`), returning its default export. Throws
 * a descriptive error when no config is found or it does not export a
 * `structure` array.
 */
export const loadConfig = async (): Promise<IStructureConfig> => {
  const result = await searchConfig();
  if (!result) {
    throw new Error(
      `No structure config found. Create one of: ${DEFAULT_CONFIG_FILES.join(', ')} in ` +
        `${process.cwd()}.`
    );
  }

  return assertIsStructureConfig(result.config, result.filepath);
};
