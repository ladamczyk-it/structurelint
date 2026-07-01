/** Regex bodies for each supported `{CaseToken}` in a rule name. */
const CASE_PATTERNS: Record<string, string> = {
  PascalCase: '[A-Z][a-zA-Z0-9]*',
  camelCase: '[a-z][a-zA-Z0-9]*',
  'kebab-case': '[a-z0-9]+(?:-[a-z0-9]+)*',
  snake_case: '[a-z0-9]+(?:_[a-z0-9]+)*',
  SCREAMING_SNAKE_CASE: '[A-Z0-9]+(?:_[A-Z0-9]+)*',
  anyCase: '[^/]+',
};

const escapeLiteral = (text: string): string => text.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

/**
 * Compiles a rule `name` template into an anchored {@link RegExp}.
 *
 * Supports `{CaseToken}` placeholders (see {@link CASE_PATTERNS}), `(a|b|c)`
 * alternatives and `*` (any run of characters within one path segment).
 */
export const templateToRegex = (name: string): RegExp => {
  let pattern = '';
  let index = 0;

  while (index < name.length) {
    const char = name[index]!;

    if (char === '{') {
      const end = name.indexOf('}', index);
      if (end === -1) {
        throw new Error(`Unterminated "{" in rule name "${name}".`);
      }

      const token = name.slice(index + 1, end);
      const casePattern = CASE_PATTERNS[token];
      if (!casePattern) {
        throw new Error(
          `Unknown case token "{${token}}" in rule name "${name}". ` +
            `Valid tokens: ${Object.keys(CASE_PATTERNS).join(', ')}.`
        );
      }

      pattern += casePattern;
      index = end + 1;
    } else if (char === '(') {
      const end = name.indexOf(')', index);
      if (end === -1) {
        throw new Error(`Unterminated "(" in rule name "${name}".`);
      }

      const group = name.slice(index + 1, end);
      pattern += `(?:${group.split('|').map(escapeLiteral).join('|')})`;
      index = end + 1;
    } else if (char === '*') {
      pattern += '[^/]*';
      index += 1;
    } else {
      pattern += escapeLiteral(char);
      index += 1;
    }
  }

  return new RegExp(`^${pattern}$`);
};

/**
 * Compiles an ignore glob into an anchored {@link RegExp}. Supports `*` (within
 * one segment), `**` (across segments) and `?` (a single character).
 */
export const globToRegex = (glob: string): RegExp => {
  let pattern = '';
  let index = 0;

  while (index < glob.length) {
    const char = glob[index]!;

    if (char === '*') {
      if (glob[index + 1] === '*') {
        pattern += '.*';
        index += 2;
        if (glob[index] === '/') {
          index += 1;
        }
      } else {
        pattern += '[^/]*';
        index += 1;
      }
    } else if (char === '?') {
      pattern += '[^/]';
      index += 1;
    } else {
      pattern += escapeLiteral(char);
      index += 1;
    }
  }

  return new RegExp(`^${pattern}$`);
};

/** Whether `name`/`relPath` matches any of the ignore `patterns`. */
export const isIgnored = (name: string, relPath: string, patterns: string[]): boolean =>
  patterns.some((pattern) => {
    const regex = globToRegex(pattern);

    return regex.test(name) || regex.test(relPath);
  });
