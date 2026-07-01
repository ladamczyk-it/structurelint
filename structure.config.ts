import type { IStructureConfig } from './src/index.ts';

/**
 * Dogfooding config: validates this package's own `src/` layout.
 * Run it with `node ./bin/cli.js` (or `structurelint`) from the repo root.
 */
const config = {
  structureRoot: 'src',
  structure: [
    // Flat camelCase modules at the root of `src`: index.ts, cli.ts, lint.ts,
    // format.ts, config.ts, types.ts, plus their co-located *.test.ts files.
    { name: '{camelCase}.ts' },
    { name: '{camelCase}.test.ts' },
    {
      name: 'helpers',
      children: [{ name: '{camelCase}.ts' }, { name: '{camelCase}.test.ts' }],
    },
  ],
} satisfies IStructureConfig;

export default config;
