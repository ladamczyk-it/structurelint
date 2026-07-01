import c from 'picocolors';

import type { ILintResult } from './types.ts';

/**
 * Renders an {@link ILintResult} into a console-ready string. With `json`, emits
 * machine-readable output (for AI/tooling consumption); otherwise a colorized
 * pass message or the list of violations.
 */
export const format = (result: ILintResult, json = false): string => {
  if (json) {
    const { passed, root, violations } = result;

    return `${JSON.stringify({ passed, root, violations }, null, 2)}\n`;
  }

  if (result.passed) {
    return c.green(`\n✔ Structure is valid (${result.root}).\n`);
  }

  let output = '\n';

  result.violations.forEach((violation) => {
    output += c.red(`✖ ${violation.message}\n`);

    if (violation.expected.length > 0) {
      output += c.gray(`  expected: ${violation.expected.join(', ')}\n`);
    }
  });

  output += c.red(`\n${result.violations.length} structure violation(s) found.\n`);

  return output;
};
