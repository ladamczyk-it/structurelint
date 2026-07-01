import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_PATH, lint } from './lint.ts';

let root: string;
let originalCwd: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'structurelint-lint-'));
  originalCwd = process.cwd();
  process.chdir(root);
});

afterEach(() => {
  process.chdir(originalCwd);
  rmSync(root, { recursive: true, force: true });
});

const writeConfig = (contents: string): void => {
  writeFileSync(join(root, 'structure.config.js'), contents);
};

describe('lint', () => {
  it('falls back to DEFAULT_PATH when neither --path nor structureRoot is set', async () => {
    writeFileSync(join(root, 'index.ts'), '');
    writeConfig(
      "export default { ignorePatterns: ['structure.config.js'], " +
        "structure: [{ name: 'index.ts' }] };\n"
    );

    await expect(lint()).resolves.toEqual({ root: DEFAULT_PATH, passed: true, violations: [] });
  });

  it('passes when the tree matches the config rooted at structureRoot', async () => {
    mkdirSync(join(root, 'app'), { recursive: true });
    writeFileSync(join(root, 'app', 'index.ts'), '');
    writeConfig("export default { structureRoot: 'app', structure: [{ name: 'index.ts' }] };\n");

    await expect(lint()).resolves.toEqual({ root: 'app', passed: true, violations: [] });
  });

  it('reports violations without throwing when the tree does not match', async () => {
    mkdirSync(join(root, 'app'), { recursive: true });
    writeFileSync(join(root, 'app', 'unexpected.ts'), '');
    writeConfig("export default { structureRoot: 'app', structure: [{ name: 'index.ts' }] };\n");

    const result = await lint();

    expect(result.passed).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]?.path).toBe('app/unexpected.ts');
  });

  it('lets options.path override structureRoot from the config', async () => {
    mkdirSync(join(root, 'app'), { recursive: true });
    mkdirSync(join(root, 'other'), { recursive: true });
    writeFileSync(join(root, 'other', 'index.ts'), '');
    writeConfig("export default { structureRoot: 'app', structure: [{ name: 'index.ts' }] };\n");

    await expect(lint({ path: 'other' })).resolves.toEqual({
      root: 'other',
      passed: true,
      violations: [],
    });
  });

  it('throws when the resolved root does not exist', async () => {
    writeConfig('export default { structure: [] };\n');

    await expect(lint({ path: 'missing' })).rejects.toThrow(
      /Structure root "missing" does not exist or is not a folder\./
    );
  });

  it('throws when the resolved root is a file rather than a folder', async () => {
    writeFileSync(join(root, 'not-a-folder'), '');
    writeConfig('export default { structure: [] };\n');

    await expect(lint({ path: 'not-a-folder' })).rejects.toThrow(/is not a folder\./);
  });

  it('propagates the loadConfig error when no config file exists', async () => {
    await expect(lint()).rejects.toThrow(/No structure config found/);
  });
});
