#!/usr/bin/env node

import { EExitCode } from '@ladamczyk/qoq-utils';
import cac from 'cac';
import c from 'picocolors';

import { format } from './format.ts';
import { lint } from './lint.ts';
import { resolveConsent, sendStats } from './stats.ts';

import type { ILintOptions } from './types.ts';

const cli = cac('structurelint');

cli
  .command('', 'Validate project file/folder structure against your structure config')
  .option('-p, --path <path>', 'Root folder to validate (overrides structureRoot from config)')
  .option('--json', 'Output machine-readable JSON')
  // The CLI is the one caller that can ask, so it is the one that answers.
  // Unanswered collapses to `false` only here, at the call: consent is still
  // absent from the config file, so the next interactive run asks again.
  .action(async (options: Omit<ILintOptions, 'stats'>) => {
    try {
      // `--json` suppresses the prompt so it can't land in the JSON on stdout.
      // Sent from here rather than through `lint()`, and awaited: `process.exit`
      // below would kill the fire-and-forget request a library call can afford.
      if ((await resolveConsent(!options.json)) ?? false) {
        await sendStats();
      }

      const result = await lint({ ...options, stats: false });

      process.stdout.write(format(result, options.json ?? false));
      process.exit(result.passed ? EExitCode.OK : EExitCode.ERROR);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (options.json) {
        process.stdout.write(`${JSON.stringify({ passed: false, error: message }, null, 2)}\n`);
      } else {
        const line = c.red(`✖ ${message}`);

        process.stderr.write(`${line}\n`);
      }

      process.exit(EExitCode.EXCEPTION);
    }
  });

cli.help();

cli.parse();
