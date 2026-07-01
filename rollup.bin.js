import { readFileSync } from 'fs';
import { builtinModules } from 'module';
import nodeResolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const pkg = JSON.parse(readFileSync('./package.json'));

const sourceDir = './src';
const outputDir = './bin';
const input = {
  cli: `${sourceDir}/cli.ts`,
};
const plugins = [
  nodeResolve({
    preferBuiltins: true,
  }),
  json(),
  commonjs(),
  esbuild({
    target: 'node22',
  }),
  terser(),
];

const external = [...builtinModules, ...Object.keys(pkg.dependencies)];

export default {
  input,
  plugins,
  external,
  output: [
    {
      dir: outputDir,
      entryFileNames: '[name].js',
    },
  ],
};
