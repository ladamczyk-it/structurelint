import type { ReactNode } from 'react';

import { HomePage } from '@internal/docusaurus-theme/HomePage';

import { StructureAnimation } from '../components/StructureAnimation';

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

const Home = (): ReactNode => (
  <HomePage
    features={FEATURES}
    install="npm install --save-dev @ladamczyk/structurelint"
    opener={OPENER}
  >
    <StructureAnimation />
  </HomePage>
);

export default Home;
