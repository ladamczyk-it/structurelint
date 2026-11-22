import type { ReactNode } from 'react';

import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
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
        <h1>{siteConfig.title}</h1>
        <p>{siteConfig.tagline}</p>
        <pre>
          <code>npm install --save-dev @ladamczyk/structurelint</code>
        </pre>
        <ul>
          {FEATURES.map(({ title, description }) => (
            <li key={title}>
              <strong>{title}</strong>: {description}
            </li>
          ))}
        </ul>
        <Link to="/docs">Read the docs</Link>{' '}
        <a
          href="https://github.com/ladamczyk-it/structurelint"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </main>
    </Layout>
  );
};

export default Home;
