// @ts-check
// remark-code-import is ESM; the CJS interop wrapper puts the plugin on .default.
const codeImport = require('remark-code-import').default;

const ORG = 'aman-dhakar-191';
const REPO = 'AgentforceAgentGuide';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Agentforce Agent Guide',
  tagline: 'Building Agentforce agents with AgentScript, Apex, and the CLI',
  favicon: 'img/favicon.svg',

  url: `https://${ORG}.github.io`,
  baseUrl: `/${REPO}/`,
  organizationName: ORG,
  projectName: REPO,

  onBrokenLinks: 'throw',
  markdown: { hooks: { onBrokenMarkdownLinks: 'warn' } },

  i18n: { defaultLocale: 'en', locales: ['en'] },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: `https://github.com/${ORG}/${REPO}/edit/main/`,
          // Pull code samples straight out of examples/ at build time.
          remarkPlugins: [codeImport],
          // Last-modified comes from git history, so a stale page looks stale.
          // Requires fetch-depth: 0 in the deploy workflow.
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Agentforce Agent Guide',
        items: [
          { type: 'docSidebar', sidebarId: 'guide', position: 'left', label: 'Guide' },
          {
            href: `https://github.com/${ORG}/${REPO}/blob/main/CHANGELOG.md`,
            label: 'Changelog',
            position: 'right',
          },
          {
            href: `https://github.com/${ORG}/${REPO}`,
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Agentforce Agent Guide. Built ${new Date().getFullYear()}.`,
      },
      prism: {
        // Apex, AgentScript and the metadata formats are not in the default
        // Prism bundle. Without this, Apex blocks render unhighlighted.
        additionalLanguages: ['apex', 'java', 'json', 'markup', 'bash'],
      },
    }),
};

module.exports = config;
