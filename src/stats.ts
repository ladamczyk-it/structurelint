import { readFileSync, writeFileSync } from 'fs';
import { createInterface } from 'readline/promises';

import c from 'picocolors';

import { searchConfig } from './config.ts';

import type { IStructureConfig } from './types.ts';

const STATS_URL = 'https://adamczyk.ovh/stats';
const STATS_TIMEOUT_MS = 2000;

const askConsent = async (filepath: string): Promise<boolean> => {
  process.stdout.write(
    [
      c.bold('\nStructurelint usage stats\n'),
      `Send a count of structurelint runs to ${STATS_URL}? Each run posts one thing:\n`,
      `  • the tool name — always the literal ${c.cyan('"structurelint"')}\n`,
      c.gray(
        'Never sent: your code, file names, paths, config contents, violations,\n' +
          'the flags you typed, project or package names, and nothing identifying\n' +
          'you or your machine.\n'
      ),
      c.gray(`Stored as \`stats: true|false\` in ${filepath} — edit it any time.\n\n`),
    ].join('')
  );

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  try {
    return (await rl.question('Send anonymous usage stats? [y/N] ')).trim().toLowerCase() === 'y';
  } finally {
    rl.close();
  }
};

// Splices the single key into the user's own config source; re-serializing the
// parsed config would drop their comments, imports and formatting. Two shapes are
// handled: a directly exported object literal, and the `const config = {…};
// export default config;` shape the docs use.
const patchSource = (source: string, stats: boolean): string | undefined => {
  const inline = /((?:module\.exports\s*=|export\s+default)\s*\{)/;

  if (inline.test(source)) {
    return source.replace(inline, `$1 stats: ${stats},`);
  }

  const identifier = /export\s+default\s+([A-Za-z_$][\w$]*)\s*;/.exec(source)?.[1];

  if (!identifier) {
    return undefined;
  }

  const declaration = new RegExp(`((?:const|let|var)\\s+${identifier}\\s*(?::[^=]+)?=\\s*\\{)`);

  return declaration.test(source) ? source.replace(declaration, `$1 stats: ${stats},`) : undefined;
};

export const writeConsent = (filepath: string, stats: boolean): void => {
  const patched = patchSource(readFileSync(filepath, 'utf8'), stats);

  if (patched === undefined) {
    process.stderr.write(
      c.yellow(`\nCouldn't update ${filepath} — add \`stats: ${stats}\` to it to stop asking.\n`)
    );

    return;
  }

  writeFileSync(filepath, patched);
};

/**
 * Three states, and they are not two: `true` allows, `false` denies, and
 * `undefined` means nobody has been asked yet. A run that can't ask — CI, a
 * pipe, `--json`, or a project with no config file to record the answer in —
 * stays undefined, so nothing is sent, nothing is written, and the next
 * interactive run still prompts. Answering `false` writes that denial into the
 * structure config, which is what stops the asking.
 */
export const resolveConsent = async (ask: boolean = true): Promise<boolean | undefined> => {
  const found = await searchConfig();

  if (!found) {
    return undefined;
  }

  const stored = (found.config as IStructureConfig).stats;

  if (typeof stored === 'boolean') {
    return stored;
  }

  if (!ask || process.env.CI === 'true' || !process.stdin.isTTY || !process.stdout.isTTY) {
    return undefined;
  }

  const stats = await askConsent(found.filepath);

  writeConsent(found.filepath, stats);

  return stats;
};

// Package-internal: `lint()` is the only caller, so consent is checked in exactly
// one place. A dead or slow endpoint must never surface as an error or hold a run
// up — hence the swallowed catch and the 2s cap.
//
// `options` is always empty and takes no argument: a run count is the whole
// question this answers, and the sink requires the key. Nothing about how the run
// was invoked goes out, so there is nothing to sanitize.
export const sendStats = async (): Promise<void> => {
  try {
    await fetch(STATS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tool: 'structurelint', options: [] }),
      signal: AbortSignal.timeout(STATS_TIMEOUT_MS),
    });
  } catch {
    // Stats are best-effort; a failed send is not the user's problem.
  }
};
