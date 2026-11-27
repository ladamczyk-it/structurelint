import { getNoRestrictedImportsPaths } from '@ladamczyk/qoq-eslint-v9-js';

import { websiteEslint } from './qoq.website.js';

const rules = {
  'no-restricted-imports': [
    1,
    {
      paths: getNoRestrictedImportsPaths(),
    },
  ],
};

export default {
  stats: true,
  learning: true,
  prettier: {
    sources: ['.'],
  },
  knip: {
    workspaces: {
      '.': { entry: ['./src/index.{js,ts}', './src/cli.{js,ts}'], project: './src/**/*.{js,ts}' },
      // Knip's Docusaurus plugin rewrites the Theme's scoped name to a package that does not exist
      website: { ignoreDependencies: ['@internal/docusaurus-theme-docusaurus-theme'] },
    },
    ignore: [
      '**/rolldown.config.js',
      '**/vitest.config.js',
      'eslint.config.js',
      'qoq.config.js',
      'structure.config.ts',
      'qoq.website.js',
    ],
    ignoreDependencies: [
      // build specific
      'rolldown',
      'dotenv',
      // package specific
      '@commitlint/cli',
    ],
  },
  eslint: [
    {
      template: 'qoq-eslint-v9-ts',
      files: ['src/**/*.ts'],
      rules,
    },
    ...websiteEslint,
  ],
};
