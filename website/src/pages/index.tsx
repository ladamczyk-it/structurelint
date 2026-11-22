import type { ReactNode } from 'react';

import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import githubStyles from '@internal/docusaurus-theme/github-button.module.css';
import styles from '@internal/docusaurus-theme/hero.module.css';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';

import { StructureAnimation } from '../components/StructureAnimation';

import pageStyles from './index.module.css';

const FEATURES = [
  {
    title: 'Recursive rules',
    description: 'A rule can reference itself or other named rules to describe nested structures.',
  },
  {
    title: 'Runs in parallel',
    description:
      'Extracted from an ESLint rule so structure checks run beside your other tooling, not inside the ESLint pipeline.',
  },
  {
    title: 'Framework-agnostic',
    description:
      'Rules describe any JS/TS layout and inspect only what is on disk, with no scaffolding or codegen.',
  },
];

const OPENER =
  'Your folder structure is architecture, so stop leaving it to code review. Describe it once as rules, and Structurelint flags every stray file and every missing one, locally, in CI and in whatever your agents write.';

const Home = (): ReactNode => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout>
      <main>
        <header className={`${styles.hero} ${pageStyles.hero}`}>
          <div className={styles.heroContent}>
            <div className={pageStyles.heroTop}>
              <div className={pageStyles.heroText}>
                <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
                <p className={styles.heroTagline}>{OPENER}</p>
              </div>
              <div className={styles.heroActions}>
                <Link className={githubStyles.githubButton} to="/docs">
                  Get Started
                </Link>
              </div>
            </div>
            <div className={`${styles.heroInstall} ${pageStyles.install}`}>
              <CodeBlock language="bash">npm install --save-dev @ladamczyk/structurelint</CodeBlock>
            </div>
          </div>
        </header>
        <StructureAnimation />
        <ul className={`${styles.features} ${pageStyles.features}`}>
          {FEATURES.map(({ title, description }) => (
            <li key={title} className={styles.feature}>
              <h2 className={styles.featureTitle}>{title}</h2>
              <p className={styles.featureDescription}>{description}</p>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  );
};

export default Home;
