import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_CONFIG_FILES, loadConfig } from './config.ts';

let root: string;
let originalCwd: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'structurelint-config-'));
  originalCwd = process.cwd();
  process.chdir(root);
});

afterEach(() => {
  process.chdir(originalCwd);
  rmSync(root, { recursive: true, force: true });
});

describe('loadConfig', () => {
  it('discovers and loads a structure.config.js in the current working directory', async () => {
    writeFileSync(
      join(root, 'structure.config.js'),
      "export default { structure: [{ name: 'src', children: [] }] };\n"
    );

    await expect(loadConfig()).resolves.toEqual({
      structure: [{ name: 'src', children: [] }],
    });
  });

  it('throws a descriptive error when no config file is found', async () => {
    await expect(loadConfig()).rejects.toThrow(
      new RegExp(`No structure config found. Create one of: ${DEFAULT_CONFIG_FILES.join(', ')}`)
    );
  });

  it('throws when the config does not export a "structure" array', async () => {
    writeFileSync(join(root, 'structure.config.js'), 'export default { structureRoot: "." };\n');

    await expect(loadConfig()).rejects.toThrow(/must export \(default\) an object/);
  });
});
