import type { ReactNode } from 'react';

import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import { HomePage } from '@internal/docusaurus-theme/HomePage';

import { StructureAnimation } from '../components/StructureAnimation';

const TITLE = 'Structurelint: lint your project file and folder structure';

const DESCRIPTION =
  'Describe your project layout once as rules and flag every stray and missing file, locally, in CI and in code AI agents write. A CLI and a JavaScript API.';

const FEATURES = [
  {
    title: 'Recursive rules',
    description:
      'Name templates such as {PascalCase}, required entries, and rules that reference themselves or other named rules to describe nested structures.',
  },
  {
    title: 'Built for CI and AI agents',
    description:
      'Exit code 1 on any violation, --json with the names that were expected, and an optional blocking check inside qoq.',
  },
  {
    title: 'Outside ESLint',
    description:
      'Extracted from an ESLint rule so it runs in parallel with the rest of your tooling, on any JS/TS layout, with no scaffolding or codegen.',
  },
];

const OPENER =
  'Your folder structure is architecture, so stop leaving it to code review. Describe it once as rules, and Structurelint flags every stray file and every missing one, locally, in CI and in whatever your agents write.';

const Home = (): ReactNode => (
  <HomePage
    features={FEATURES}
    install="npm install --save-dev @ladamczyk/structurelint"
    opener={OPENER}
  >
    <Head>
      <title>{TITLE}</title>
      <meta content={DESCRIPTION} name="description" />
      <meta content={TITLE} property="og:title" />
      <meta content={DESCRIPTION} property="og:description" />
    </Head>
    <StructureAnimation />
    <section className="container margin-vert--lg">
      <h2>Standalone, or one check inside qoq</h2>
      <p>
        Run <code>npx structurelint</code> on its own, call <code>lint()</code> from Node, or turn
        it on as a blocking check in <Link to="https://qoq.adamczyk.ovh/">qoq</Link>, the
        JavaScript/TypeScript quality suite that runs ESLint, Prettier, Knip and more behind one
        command. Published on npm as{' '}
        <Link to="https://www.npmjs.com/package/@ladamczyk/structurelint">
          @ladamczyk/structurelint
        </Link>
        .
      </p>
      <p>
        Start from a <Link to="/docs/recipes">ready-made layout</Link> (React components, Next.js
        App Router, a monorepo), or see how it{' '}
        <Link to="/docs/comparison">compares with ls-lint and eslint-plugin-project-structure</Link>
        .
      </p>
    </section>
  </HomePage>
);

export default Home;
