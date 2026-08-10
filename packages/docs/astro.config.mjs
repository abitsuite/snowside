// packages/docs/astro.config.mjs
// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.snowside.network',
  integrations: [
    starlight({
      title: 'Snowside Docs',
      description: 'Technical documentation for the eCash sidechain on Avalanche',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/abitsuite/snowside' },
        { icon: "x.com", label: "X", href: 'https://x.com/SnowsideNetwork' },
      ],
      sidebar: [
        {
          label: 'Overview',
          items: [
            { label: 'Introduction', slug: 'index' },
          ],
        },
        {
          label: 'Architecture',
          items: [
            { label: 'Overview', slug: 'architecture/overview' },
            { label: 'Blind Merged Mining', slug: 'architecture/bmm' },
            { label: 'Avalanche Consensus', slug: 'architecture/consensus' },
            { label: 'BTC Gas Model', slug: 'architecture/gas-model' },
            { label: 'ICM Bridge', slug: 'architecture/icm-bridge' },
            { label: 'Security Model', slug: 'architecture/security-model' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Running a Validator', slug: 'guides/running-a-validator' },
            { label: 'Connect a Web3 Wallet', slug: 'guides/connect-wallet' },
            { label: 'Deploying Contracts', slug: 'guides/deploying-contracts' },
            { label: 'Bridging USDC', slug: 'guides/bridging-usdc' },
          ],
        },
        {
          label: 'Reference',
          items: [
            { label: 'Glossary', slug: 'reference/glossary' },
            { label: 'Configuration', slug: 'reference/configuration' },
          ],
        },
      ],
      head: [
        {
          tag: 'script',
          attrs: {
            async: true,
            defer: true,
            src: 'https://scripts.simpleanalyticscdn.com/latest.js',
          },
        },
        {
          tag: 'noscript',
          content:
            '<img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerpolicy="no-referrer-when-downgrade" />',
        },
      ],
    }),
  ],
});
