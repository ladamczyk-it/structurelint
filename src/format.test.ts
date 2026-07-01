import { describe, expect, it } from 'vitest';

import { format } from './format.ts';

import type { ILintResult } from './types.ts';

const passingResult: ILintResult = { root: '.', passed: true, violations: [] };

const failingResult: ILintResult = {
  root: 'src',
  passed: false,
  violations: [
    {
      path: 'src/button.ts',
      type: 'unexpected',
      message: 'Unexpected entry "src/button.ts".',
      expected: ['{PascalCase}.(ts|tsx)'],
    },
    {
      path: 'src/components',
      type: 'missing',
      message: 'Missing required entry "index.ts" in "src/components".',
      expected: [],
    },
  ],
};

describe('format', () => {
  it('renders a pass message for a passing result', () => {
    expect(format(passingResult)).toBe('\n✔ Structure is valid (.).\n');
  });

  it('renders one line per violation, with an expected line only when non-empty', () => {
    const output = format(failingResult);

    expect(output).toContain('✖ Unexpected entry "src/button.ts".');
    expect(output).toContain('expected: {PascalCase}.(ts|tsx)');
    expect(output).toContain('✖ Missing required entry "index.ts" in "src/components".');
    expect(output).toContain('2 structure violation(s) found.');
  });

  it('omits the expected line for violations with no expected patterns', () => {
    const output = format(failingResult);
    const missingLineIndex = output.indexOf('Missing required entry');
    const nextLine = output.slice(missingLineIndex, output.indexOf('\n', missingLineIndex) + 1);

    expect(nextLine).not.toContain('expected:');
  });

  it('emits machine-readable JSON when json is true, ignoring color formatting', () => {
    const output = format(failingResult, true);

    expect(JSON.parse(output)).toEqual({
      passed: false,
      root: 'src',
      violations: failingResult.violations,
    });
  });

  it('emits passing JSON with an empty violations array', () => {
    expect(JSON.parse(format(passingResult, true))).toEqual({
      passed: true,
      root: '.',
      violations: [],
    });
  });
});
