import type { ReactNode } from 'react';

import Layout from '@theme/Layout';

// Placeholder homepage: replace it in every Tool.
const Home = (): ReactNode => (
  <Layout>
    <main>
      <h1>Cli-template</h1>
      <a href="/docs">Read the docs</a>
    </main>
  </Layout>
);

export default Home;
