import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { validate } from './validate.ts';

import type { IStructureConfig } from '../types.ts';

/** A nested tree: string values are files, objects are folders. */
type TTree = { [name: string]: string | TTree };

const writeTree = (dir: string, tree: TTree): void => {
  Object.entries(tree).forEach(([name, value]) => {
    const target = join(dir, name);

    if (typeof value === 'string') {
      writeFileSync(target, value);

      return;
    }

    mkdirSync(target, { recursive: true });
    writeTree(target, value);
  });
};

let root: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'structurelint-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

// A recursive component structure: `components/Button/nested/Icon`, where
// `nested` reuses the same PascalCase component rules as the root components.
const componentConfig: IStructureConfig = {
  rules: {
    component_folder: {
      name: '{PascalCase}',
      folderRecursionLimit: 5,
      children: [
        { name: 'index.ts' },
        { name: '{PascalCase}.(ts|tsx)' },
        { name: '{PascalCase}.spec.(ts|tsx)' },
        { ruleId: 'nested_folder' },
      ],
    },
    nested_folder: {
      name: 'nested',
      children: [{ ruleId: 'component_folder' }],
    },
  },
  structure: [
    {
      name: 'components',
      children: [{ ruleId: 'component_folder' }],
    },
  ],
};

describe('validate', () => {
  it('passes for a valid recursive component tree', () => {
    writeTree(root, {
      components: {
        Button: {
          'index.ts': '',
          'Button.tsx': '',
          'Button.spec.tsx': '',
          nested: {
            Icon: { 'index.ts': '', 'Icon.tsx': '' },
          },
        },
      },
    });

    expect(validate(root, componentConfig, root)).toEqual([]);
  });

  it('flags a deeply nested component that breaks the casing rule', () => {
    writeTree(root, {
      components: {
        Button: {
          'index.ts': '',
          nested: {
            icon: { 'index.ts': '' },
          },
        },
      },
    });

    const violations = validate(root, componentConfig, root);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe('unexpected');
    expect(violations[0]?.path).toBe('components/Button/nested/icon');
  });

  it('flags an unexpected file inside a component', () => {
    writeTree(root, {
      components: { Button: { 'index.ts': '', 'styles.css': '' } },
    });

    const violations = validate(root, componentConfig, root);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.message).toContain('styles.css');
    expect(violations[0]?.expected).toContain('{PascalCase}.(ts|tsx)');
  });

  it('honours ignorePatterns', () => {
    writeTree(root, {
      components: { Button: { 'index.ts': '', 'Button.stories.tsx': '' } },
    });

    const violations = validate(
      root,
      { ...componentConfig, ignorePatterns: ['*.stories.tsx'] },
      root
    );

    expect(violations).toEqual([]);
  });

  it('reports a missing required entry', () => {
    writeTree(root, { components: { Button: { 'Button.tsx': '' } } });

    const config: IStructureConfig = {
      rules: {
        component_folder: {
          name: '{PascalCase}',
          children: [{ name: 'index.ts', required: true }, { name: '{PascalCase}.(ts|tsx)' }],
        },
      },
      structure: [{ name: 'components', children: [{ ruleId: 'component_folder' }] }],
    };

    const violations = validate(root, config, root);

    expect(violations).toHaveLength(1);
    expect(violations[0]?.type).toBe('missing');
    expect(violations[0]?.message).toContain('index.ts');
  });

  it('throws on an unknown ruleId reference', () => {
    writeTree(root, { components: { Button: {} } });

    const config: IStructureConfig = {
      structure: [{ name: 'components', children: [{ ruleId: 'does_not_exist' }] }],
    };

    expect(() => validate(root, config, root)).toThrow(/Unknown ruleId/);
  });
});
