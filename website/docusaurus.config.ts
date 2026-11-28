import { createConfig } from '@internal/docusaurus-theme/config';

import packageJson from '../package.json' with { type: 'json' };

export default createConfig({
  tool: 'structurelint',
  title: 'Structurelint',
  tagline: packageJson.description,
  version: packageJson.version,
  logo: 'img/structurelint.svg',
});
