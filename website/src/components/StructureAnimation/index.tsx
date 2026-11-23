import type { CSSProperties, ReactNode } from 'react';

import frame from '@internal/docusaurus-theme/terminal-window.module.css';
import { TerminalWindow } from '@internal/docusaurus-theme/TerminalWindow';

import styles from './styles.module.css';

/** Scanned rows of the mock tree; `--i` staggers each row's entry and check. */
const ROWS = [
  { name: 'components/', rule: 'components', depth: 1 },
  { name: 'Button.tsx', rule: '{PascalCase}.tsx', depth: 2 },
  { name: 'Modal.tsx', rule: '{PascalCase}.tsx', depth: 2 },
  { name: 'helper_old.js', rule: 'no rule', depth: 2, stray: true },
  { name: 'hooks/', rule: 'hooks', depth: 1 },
  { name: 'useAuth.ts', rule: 'use{PascalCase}.ts', depth: 2 },
  { name: 'utils.ts', rule: '{camelCase}.ts', depth: 1 },
];

const LABEL =
  'Animation: structurelint scans a src folder against its rules, flags an unexpected file and a missing required file, then passes once both are fixed.';

export const StructureAnimation = (): ReactNode => (
  <TerminalWindow className={styles.wrapper} label={LABEL} title="structure.config.ts → src/">
    <div className={styles.tree}>
      <span className={styles.scan} />
      <div className={styles.root}>src/</div>
      {ROWS.map(({ name, rule, depth, stray }, i) => (
        <div
          key={name}
          className={stray ? `${styles.row} ${styles.stray}` : styles.row}
          style={{ '--i': i, '--depth': depth } as CSSProperties}
        >
          <span className={styles.name}>{name}</span>
          <span className={styles.rule}>{rule}</span>
          <span className={stray ? styles.markBad : styles.markOk}>
            {stray ? '✖ unexpected' : '✔'}
          </span>
        </div>
      ))}
      <div className={`${styles.row} ${styles.missing}`} style={{ '--depth': 1 } as CSSProperties}>
        <span className={styles.name}>index.ts</span>
        <span className={styles.rule}>required</span>
        <span className={styles.missMark}>
          <span className={styles.missBad}>✖ missing</span>
          <span className={styles.missOk}>✔</span>
        </span>
      </div>
    </div>
    <div className={frame.terminal}>
      <div className={frame.prompt}>$ npx structurelint</div>
      <div className={styles.output}>
        <div className={styles.fail}>
          <div>✖ Unexpected file &quot;helper_old.js&quot; in &quot;src/components&quot;.</div>
          <div>✖ Missing required file matching &quot;index.ts&quot; in &quot;src&quot;.</div>
          <div>2 structure violation(s) found.</div>
        </div>
        <div className={styles.pass}>✔ Structure is valid (src).</div>
      </div>
    </div>
  </TerminalWindow>
);
