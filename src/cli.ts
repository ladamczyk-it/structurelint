#!/usr/bin/env node

import { EExitCode } from '@ladamczyk/qoq-utils';
import cac from 'cac';
import c from 'picocolors';

import { format } from './format.ts';
import { lint } from './lint.ts';

import type { ILintOptions } from './types.ts';

const cli = cac('structurelint');

cli
  .command('', 'Validate project file/folder structure against your structure config')
  .option('-p, --path <path>', 'Root folder to validate (overrides structureRoot from config)')
  .option('--json', 'Output machine-readable JSON')
  .action(async (options: ILintOptions) => {
    try {
      const result = await lint(options);

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
