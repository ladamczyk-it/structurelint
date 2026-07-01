import { readFileSync } from 'fs';
import { builtinModules } from 'module';
import typescript from '@rollup/plugin-typescript';

const pkg = JSON.parse(readFileSync('./package.json'));

const sourceDir = './src';
const outputDir = './lib';
const input = {
  index: `${sourceDir}/index.ts`,
};
const plugins = [
  typescript({
    exclude: ['**/*.test.{js,ts}', '**/cli.ts'],
  }),
];

const external = [...builtinModules, ...Object.keys(pkg.dependencies)];

export default {
  input,
  plugins,
  external,
  output: [
    {
      dir: outputDir,
      format: 'esm',
      entryFileNames: '[name].mjs',
    },
    {
      dir: outputDir,
      format: 'cjs',
      entryFileNames: '[name].cjs',
    },
  ],
};
