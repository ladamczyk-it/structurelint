import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  vi.unstubAllGlobals();
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

    await expect(lint({ stats: false })).resolves.toEqual({
      root: DEFAULT_PATH,
      passed: true,
      violations: [],
    });
  });

  it('passes when the tree matches the config rooted at structureRoot', async () => {
    mkdirSync(join(root, 'app'), { recursive: true });
    writeFileSync(join(root, 'app', 'index.ts'), '');
    writeConfig("export default { structureRoot: 'app', structure: [{ name: 'index.ts' }] };\n");

    await expect(lint({ stats: false })).resolves.toEqual({
      root: 'app',
      passed: true,
      violations: [],
    });
  });

  it('reports violations without throwing when the tree does not match', async () => {
    mkdirSync(join(root, 'app'), { recursive: true });
    writeFileSync(join(root, 'app', 'unexpected.ts'), '');
    writeConfig("export default { structureRoot: 'app', structure: [{ name: 'index.ts' }] };\n");

    const result = await lint({ stats: false });

    expect(result.passed).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0]?.path).toBe('app/unexpected.ts');
  });

  it('lets options.path override structureRoot from the config', async () => {
    mkdirSync(join(root, 'app'), { recursive: true });
    mkdirSync(join(root, 'other'), { recursive: true });
    writeFileSync(join(root, 'other', 'index.ts'), '');
    writeConfig("export default { structureRoot: 'app', structure: [{ name: 'index.ts' }] };\n");

    await expect(lint({ path: 'other', stats: false })).resolves.toEqual({
      root: 'other',
      passed: true,
      violations: [],
    });
  });

  it('throws when the resolved root does not exist', async () => {
    writeConfig('export default { structure: [] };\n');

    await expect(lint({ path: 'missing', stats: false })).rejects.toThrow(
      /Structure root "missing" does not exist or is not a folder\./
    );
  });

  it('throws when the resolved root is a file rather than a folder', async () => {
    writeFileSync(join(root, 'not-a-folder'), '');
    writeConfig('export default { structure: [] };\n');

    await expect(lint({ path: 'not-a-folder', stats: false })).rejects.toThrow(/is not a folder\./);
  });

  it('validates against a caller-held config without discovering one on disk', async () => {
    mkdirSync(join(root, 'app'));
    writeFileSync(join(root, 'app', 'index.ts'), '');

    await expect(
      lint({
        stats: false,
        config: { structureRoot: 'app', structure: [{ name: 'index.ts' }] },
      })
    ).resolves.toEqual({ root: 'app', passed: true, violations: [] });
  });

  it('propagates the loadConfig error when no config file exists', async () => {
    await expect(lint({ stats: false })).rejects.toThrow(/No structure config found/);
  });

  it.each([
    [false, 0],
    [true, 1],
  ])('counts the run under the plain structurelint name when stats is %s', async (stats, calls) => {
    const fetchMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('fetch', fetchMock);
    writeConfig('export default { structure: [] };\n');
    mkdirSync(join(root, 'app'));

    await lint({ path: 'app', stats });
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(calls));

    if (calls) {
      expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
        body: JSON.stringify({ tool: 'structurelint', options: [] }),
      });
    }
  });
});
