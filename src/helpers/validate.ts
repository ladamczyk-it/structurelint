import { readdirSync } from 'fs';
import { join, relative, sep } from 'path';

import { isIgnored, templateToRegex } from './matcher.ts';

import type { IStructureConfig, IStructureRule, IViolation, TStructureNode } from '../types.ts';

/** Folders ignored at every level, on top of the config's `ignorePatterns`. */
export const DEFAULT_IGNORE = ['node_modules', '.git'];

interface IResolvedNode {
  rule: IStructureRule;
  ruleId: string | undefined;
}

/** Context held constant across one recursive walk of `validateDir`. */
interface IWalkContext {
  rules: Record<string, IStructureRule>;
  ignore: string[];
  violations: IViolation[];
  cwd: string;
}

const toPosix = (path: string): string => path.split(sep).join('/');

const resolveNode = (
  node: TStructureNode,
  rules: Record<string, IStructureRule>
): IResolvedNode => {
  if ('ruleId' in node) {
    const rule = rules[node.ruleId];
    if (!rule) {
      throw new Error(
        `Unknown ruleId "${node.ruleId}". Define it under "rules" in your structure config.`
      );
    }

    return { rule, ruleId: node.ruleId };
  }

  return { rule: node, ruleId: undefined };
};

const isFolderRule = (rule: IStructureRule): boolean => Array.isArray(rule.children);

const relativeFolder = (cwd: string, absDir: string): string =>
  toPosix(relative(cwd, absDir)) || '.';

const validateDir = (
  absDir: string,
  nodes: TStructureNode[],
  depth: Record<string, number>,
  ctx: IWalkContext
): void => {
  const { rules, ignore, violations, cwd } = ctx;
  const resolved = nodes.map((node) => resolveNode(node, rules));
  const entries = readdirSync(absDir, { withFileTypes: true });
  const matchedNodes = new Set<IResolvedNode>();

  entries.forEach((entry) => {
    const absEntry = join(absDir, entry.name);
    const relEntry = toPosix(relative(cwd, absEntry));

    if (isIgnored(entry.name, relEntry, ignore)) {
      return;
    }

    const isDir = entry.isDirectory();
    const candidates = resolved.filter((node) => isFolderRule(node.rule) === isDir);
    const match = candidates.find((node) => templateToRegex(node.rule.name).test(entry.name));

    if (!match) {
      violations.push({
        path: relEntry,
        type: 'unexpected',
        message: `Unexpected ${isDir ? 'folder' : 'file'} "${entry.name}" in "${relativeFolder(
          cwd,
          absDir
        )}".`,
        expected: candidates.map((node) => node.rule.name),
      });

      return;
    }

    matchedNodes.add(match);

    if (!isDir) {
      return;
    }

    const nextDepth = match.ruleId
      ? { ...depth, [match.ruleId]: (depth[match.ruleId] ?? 0) + 1 }
      : depth;
    const { folderRecursionLimit } = match.rule;

    if (
      match.ruleId !== undefined &&
      folderRecursionLimit !== undefined &&
      (nextDepth[match.ruleId] ?? 0) > folderRecursionLimit
    ) {
      return;
    }

    validateDir(absEntry, match.rule.children ?? [], nextDepth, ctx);
  });

  resolved.forEach((node) => {
    if (node.rule.required && !matchedNodes.has(node)) {
      violations.push({
        path: relativeFolder(cwd, absDir),
        type: 'missing',
        message: `Missing required ${
          isFolderRule(node.rule) ? 'folder' : 'file'
        } matching "${node.rule.name}" in "${relativeFolder(cwd, absDir)}".`,
        expected: [node.rule.name],
      });
    }
  });
};

/**
 * Walks `absRoot` and collects every structural {@link IViolation} against the
 * given {@link IStructureConfig}. Pure (no printing); the root must exist.
 */
export const validate = (
  absRoot: string,
  config: IStructureConfig,
  cwd: string = process.cwd()
): IViolation[] => {
  const violations: IViolation[] = [];
  const ignore = [...DEFAULT_IGNORE, ...(config.ignorePatterns ?? [])];
  const ctx: IWalkContext = { rules: config.rules ?? {}, ignore, violations, cwd };

  validateDir(absRoot, config.structure, {}, ctx);

  return violations;
};
