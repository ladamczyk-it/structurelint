import { createConfig } from '@internal/docusaurus-theme/config';

import packageJson from '../package.json' with { type: 'json' };

const config = createConfig({
  tool: 'structurelint',
  title: 'Structurelint',
  tagline: packageJson.description,
  version: packageJson.version,
  logo: 'img/structurelint.svg',
});

export default {
  ...config,
  // Social preview: Docusaurus emits og:image and twitter:image on every page from this.
  themeConfig: { ...config.themeConfig, image: 'img/og.png' },
};
