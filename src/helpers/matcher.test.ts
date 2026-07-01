import { describe, expect, it } from 'vitest';

import { globToRegex, isIgnored, templateToRegex } from './matcher.ts';

describe('templateToRegex', () => {
  it('matches PascalCase folder names', () => {
    const regex = templateToRegex('{PascalCase}');

    expect(regex.test('Button')).toBe(true);
    expect(regex.test('ButtonGroup')).toBe(true);
    expect(regex.test('button')).toBe(false);
    expect(regex.test('button-group')).toBe(false);
  });

  it('matches camelCase names', () => {
    const regex = templateToRegex('{camelCase}');

    expect(regex.test('useUserStore')).toBe(true);
    expect(regex.test('fetch')).toBe(true);
    expect(regex.test('Fetch')).toBe(false);
  });

  it('matches kebab-case and snake_case names', () => {
    expect(templateToRegex('{kebab-case}').test('my-skill')).toBe(true);
    expect(templateToRegex('{kebab-case}').test('mySkill')).toBe(false);
    expect(templateToRegex('{snake_case}').test('my_module')).toBe(true);
    expect(templateToRegex('{SCREAMING_SNAKE_CASE}').test('MAX_VALUE')).toBe(true);
  });

  it('honours extension alternatives and escapes the dot', () => {
    const regex = templateToRegex('{PascalCase}.(ts|tsx)');

    expect(regex.test('Button.tsx')).toBe(true);
    expect(regex.test('Button.ts')).toBe(true);
    expect(regex.test('Button.css')).toBe(false);
    expect(regex.test('ButtonXtsx')).toBe(false);
  });

  it('treats * as an in-segment wildcard', () => {
    const regex = templateToRegex('*.spec.ts');

    expect(regex.test('button.spec.ts')).toBe(true);
    expect(regex.test('button.ts')).toBe(false);
  });

  it('throws on unknown case tokens', () => {
    expect(() => templateToRegex('{TitleCase}')).toThrow(/Unknown case token/);
  });
});

describe('globToRegex', () => {
  it('matches single-segment * and cross-segment **', () => {
    expect(globToRegex('*.d.ts').test('types.d.ts')).toBe(true);
    expect(globToRegex('*.d.ts').test('nested/types.d.ts')).toBe(false);
    expect(globToRegex('**/dist').test('a/b/dist')).toBe(true);
  });
});

describe('isIgnored', () => {
  it('matches against the basename or the relative path', () => {
    expect(isIgnored('node_modules', 'src/node_modules', ['node_modules'])).toBe(true);
    expect(isIgnored('types.d.ts', 'src/types.d.ts', ['*.d.ts'])).toBe(true);
    expect(isIgnored('Button.tsx', 'src/Button.tsx', ['*.d.ts'])).toBe(false);
  });
});
