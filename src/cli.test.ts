import { EExitCode } from '@ladamczyk/qoq-utils';
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { ILintResult } from './types.ts';

const lintMock = vi.fn();
const formatMock = vi.fn();

vi.mock('./lint.ts', () => ({ lint: lintMock }));
vi.mock('./format.ts', () => ({ format: formatMock }));

const passingResult: ILintResult = { root: '.', passed: true, violations: [] };

// cac snapshots `process.argv` into a module-level variable the first time it
// loads, so reassigning `process.argv` afterwards has no effect on it once
// loaded. Mutate the existing array in place instead of replacing it.
const cliArgv = process.argv;
const originalArgv = [...cliArgv];

let exitSpy: MockInstance;
let stdoutSpy: MockInstance;
let stderrSpy: MockInstance;

beforeEach(() => {
  vi.resetModules();
  lintMock.mockReset();
  formatMock.mockReset();
  exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
});

afterEach(() => {
  cliArgv.length = 0;
  cliArgv.push(...originalArgv);
  vi.restoreAllMocks();
});

/** Sets argv, imports the CLI entrypoint fresh, and waits for it to exit. */
const runCli = async (args: string[] = []): Promise<void> => {
  cliArgv.length = 0;
  cliArgv.push('node', 'structurelint', ...args);
  await import('./cli.ts');
  await vi.waitFor(() => expect(exitSpy).toHaveBeenCalled());
};

describe('cli', () => {
  it('prints the formatted result and exits OK when the structure passes', async () => {
    lintMock.mockResolvedValue(passingResult);
    formatMock.mockReturnValue('OK\n');

    await runCli();

    expect(lintMock).toHaveBeenCalledWith(expect.not.objectContaining({ path: expect.anything() }));
    expect(formatMock).toHaveBeenCalledWith(passingResult, false);
    expect(stdoutSpy).toHaveBeenCalledWith('OK\n');
    expect(exitSpy).toHaveBeenCalledWith(EExitCode.OK);
  });

  it('exits ERROR when the structure has violations', async () => {
    const failingResult: ILintResult = {
      root: '.',
      passed: false,
      violations: [{ path: 'a.ts', type: 'unexpected', message: 'bad', expected: [] }],
    };

    lintMock.mockResolvedValue(failingResult);
    formatMock.mockReturnValue('FAIL\n');

    await runCli();

    expect(exitSpy).toHaveBeenCalledWith(EExitCode.ERROR);
  });

  it('forwards --path and --json to lint and format', async () => {
    lintMock.mockResolvedValue(passingResult);
    formatMock.mockReturnValue('{}\n');

    await runCli(['--path', 'src', '--json']);

    expect(lintMock).toHaveBeenCalledWith(expect.objectContaining({ path: 'src', json: true }));
    expect(formatMock).toHaveBeenCalledWith(passingResult, true);
  });

  it('prints a colorized error to stderr and exits EXCEPTION when lint throws', async () => {
    lintMock.mockRejectedValue(new Error('boom'));

    await runCli();

    expect(formatMock).not.toHaveBeenCalled();
    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('boom'));
    expect(exitSpy).toHaveBeenCalledWith(EExitCode.EXCEPTION);
  });

  it('prints a JSON error payload and exits EXCEPTION when --json is set and lint throws', async () => {
    lintMock.mockRejectedValue(new Error('boom'));

    await runCli(['--json']);

    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('"error": "boom"'));
    expect(exitSpy).toHaveBeenCalledWith(EExitCode.EXCEPTION);
  });

  it('stringifies non-Error rejections', async () => {
    lintMock.mockRejectedValue('plain string failure');

    await runCli();

    expect(stderrSpy).toHaveBeenCalledWith(expect.stringContaining('plain string failure'));
    expect(exitSpy).toHaveBeenCalledWith(EExitCode.EXCEPTION);
  });
});
