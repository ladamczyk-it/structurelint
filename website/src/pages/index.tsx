import type { ReactNode } from 'react';

import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import githubStyles from '@internal/docusaurus-theme/github-button.module.css';
import styles from '@internal/docusaurus-theme/hero.module.css';
import Layout from '@theme/Layout';

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

const Home = (): ReactNode => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout>
      <main>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
            <p className={styles.heroTagline}>{siteConfig.tagline}</p>
            <pre className={styles.heroInstall}>
              <code>npm install --save-dev @ladamczyk/structurelint</code>
            </pre>
            <div className={styles.heroActions}>
              <Link className="button button--primary button--lg" to="/docs">
                Read the docs
              </Link>
              <a
                className={githubStyles.githubButton}
                href="https://github.com/ladamczyk-it/structurelint"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className={githubStyles.githubButtonIcon} aria-hidden="true" />
                GitHub
              </a>
            </div>
          </div>
        </header>
        <ul className={styles.features}>
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
