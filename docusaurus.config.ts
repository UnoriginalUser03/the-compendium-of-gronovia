import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'The Compendium of Gronovia',
  tagline: 'A living compendium of knowledge about the Homebrew Dungeon & Dragons world of Gronovia',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://unoriginaluser03.github.io/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/the-compendium-of-gronovia/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'unoriginaluser03', // Usually your GitHub org/user name.
  projectName: 'the-compendium-of-gronovia', // Usually your repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  scripts: [
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js'
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          path: 'compendium',
          routeBasePath: 'compendium',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          path: 'sessions',
          routeBasePath: 'sessions',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'The Compendium of Gronovia',
      logo: {
        alt: 'Compendium Logo',
        src: 'img/logo.svg',
        srcDark: 'img/logo_dark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'locationsSidebar',
          position: 'left',
          label: 'Locations',
        },
        { to: '/sessions', label: 'Sessions', position: 'left' },
        { to: '/handouts', label: 'Handouts', position: 'left' },
        // {
        //   href: 'https://github.com/facebook/docusaurus',
        //   label: 'GitHub',
        //   position: 'right',
        // },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Compendium',
          items: [
            {
              label: 'Locations',
              to: '/compendium/locations',
            },
          ],
        },
        {
          title: 'Campaign',
          items: [
            {
              label: 'Sessions',
              to: '/sessions',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {
              label: 'D&D Beyond',
              href: 'https://www.dndbeyond.com/',
            },
            {
              label: '5e Tools',
              href: 'https://5e.tools/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} The Compendium of Gronovia, Jimmy Fisher. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
