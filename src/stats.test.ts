import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveConsent, sendStats, writeConsent } from './stats.ts';

let root: string;
let originalCwd: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'structurelint-stats-'));
  originalCwd = process.cwd();
  process.chdir(root);
});

afterEach(() => {
  process.chdir(originalCwd);
  rmSync(root, { recursive: true, force: true });
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const configPath = (): string => join(root, 'structure.config.js');

const writeStructureConfig = (contents: string): string => {
  writeFileSync(configPath(), contents);

  return configPath();
};

const interactive = (): void => {
  vi.stubEnv('CI', '');
  vi.stubGlobal('process', { ...process, stdin: { isTTY: true }, stdout: { isTTY: true } });
};

describe('resolveConsent', () => {
  it('returns the stored answer without asking', async () => {
    writeStructureConfig('export default { stats: true, structure: [] };\n');
    interactive();

    await expect(resolveConsent()).resolves.toBe(true);
  });

  it('returns a stored decline without asking again', async () => {
    writeStructureConfig('export default { stats: false, structure: [] };\n');
    interactive();

    await expect(resolveConsent()).resolves.toBe(false);
  });

  it('stays unanswered in CI, and writes nothing', async () => {
    const path = writeStructureConfig('export default { structure: [] };\n');
    vi.stubEnv('CI', 'true');

    await expect(resolveConsent()).resolves.toBeUndefined();
    expect(readFileSync(path, 'utf8')).not.toContain('stats');
  });

  it('stays unanswered without a TTY', async () => {
    writeStructureConfig('export default { structure: [] };\n');
    vi.stubEnv('CI', '');
    vi.stubGlobal('process', { ...process, stdin: { isTTY: false }, stdout: { isTTY: false } });

    await expect(resolveConsent()).resolves.toBeUndefined();
  });

  it('stays unanswered when asking is off, even with a TTY', async () => {
    writeStructureConfig('export default { structure: [] };\n');
    interactive();

    await expect(resolveConsent(false)).resolves.toBeUndefined();
  });

  it('stays unanswered when there is no config to record the answer in', async () => {
    interactive();

    await expect(resolveConsent()).resolves.toBeUndefined();
  });
});

describe('writeConsent', () => {
  it.each([
    ['export default { structure: [] };\n', 'export default { stats: true, structure: [] };\n'],
    ['module.exports = { structure: [] };\n', 'module.exports = { stats: true, structure: [] };\n'],
    [
      'const config = { structure: [] };\nexport default config;\n',
      'const config = { stats: true, structure: [] };\nexport default config;\n',
    ],
  ])('splices the consent into %j', (source, expected) => {
    const path = writeStructureConfig(source);

    writeConsent(path, true);

    expect(readFileSync(path, 'utf8')).toBe(expected);
  });

  it('warns instead of mangling a config it cannot patch', () => {
    const source = 'export { structure } from "./elsewhere.js";\n';
    const path = writeStructureConfig(source);
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);

    writeConsent(path, false);

    expect(readFileSync(path, 'utf8')).toBe(source);
    expect(stderr).toHaveBeenCalledWith(expect.stringContaining('stats: false'));
  });
});

describe('sendStats', () => {
  it('posts the tool name and an empty options array, and nothing else', async () => {
    const fetchMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('fetch', fetchMock);

    await sendStats();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://stats.adamczyk.ovh',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ tool: 'structurelint', options: [] }),
      })
    );
  });

  it('swallows a failing endpoint', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(sendStats()).resolves.toBeUndefined();
  });
});
