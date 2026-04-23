const path = require('path');

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'Документация торговых роботов компании "Викинг"',
  base: '/bot-doc/',
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#description
   */
  description: "Руководство пользователя, описание алгоритма и API",

  /**
   * Extra tags to be injected to the page HTML `<head>`
   *
   * ref：https://v1.vuepress.vuejs.org/config/#head
   */
  head: [
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
    ['link', { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css' }],
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/github-markdown-css/2.2.1/github-markdown.css' }],
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  locales: {
    '/': {
      lang: 'ru-RU',
      title: 'Документация торговых роботов компании "Викинг"',
      description: 'Руководство пользователя, описание алгоритма и API'
    },
    '/en/': {
      lang: 'en-US',
      title: 'Documentation for Viking\'s trading robots',
      description: 'User guide, algorithm description and API'
    }
  },
  themeConfig: {
    logo: '/images/vkg_logo_en.svg',
    locales: {
      '/': {
        lang: 'ru-RU',
        title: 'Документация торговых роботов компании "Викинг"',
        description: 'Руководство пользователя, описание алгоритма и API',
        selectText: '🇷🇺 RU',
        label: '🇷🇺 RU',
        ariaLabel: 'Languages',
        searchPlaceholder: 'Поиск...',
        algolia: {
          apiKey: '94ee5ea090e8169a1c1fa8c35b0189ed',
          indexName: 'test_viking2',
          appId: 'TMJSXT1U3B',
          searchParameters: {
            hitsPerPage: 10
          }
        },
        sidebar: {
          '/docs/': [
            {
              collapsable: false,
              children: [
                'change-history',
                'introduction',
                'interface',
                'getting-started',
                'stable-work',
                'creating-connection',
                'params-description',
                'algorithm-comments',
                'order-error',
                'c-api',
                'api',
                'comparison',
                'faq'
              ]
            }
          ],
        },
        nav: [
          {
            text: 'Документация',
            link: '/docs/introduction'
          }
        ],
        repo: '',
        editLinks: false,
        docsDir: 'docs',
        editLinkText: '',
        lastUpdated: false,
      },
      '/en/': {
        lang: 'en-US',
        title: 'Documentation for Viking\'s trading robots',
        description: 'User guide, algorithm description and API',
        selectText: '🇺🇸 EN',
        label: '🇺🇸 EN',
        ariaLabel: 'Languages',
        searchPlaceholder: 'Search...',
        algolia: {
          apiKey: '94ee5ea090e8169a1c1fa8c35b0189ed',
          indexName: 'test_viking2',
          appId: 'TMJSXT1U3B',
          searchParameters: {
            hitsPerPage: 10
          }
        },
        sidebar: {
          '/en/docs/': [
            {
              collapsable: false,
              children: [
                'change-history',
                'introduction',
                'interface',
                'getting-started',
                'stable-work',
                'creating-connection',
                'params-description',
                'algorithm-comments',
                'order-error',
                'c-api',
                'api',
                'comparison',
                'faq'
              ]
            }
          ],
        },
        nav: [
          {
            text: 'Documentation',
            link: '/en/docs/introduction'
          }
        ],
        logo: '/images/vkg_logo_en.svg',
        repo: '',
        editLinks: false,
        docsDir: 'en/docs',
        editLinkText: '',
        lastUpdated: false,
      }
    },
  },
  markdown: {
    extractHeaders: ['h2', 'h3', 'h4', 'h5', 'h6'],
    extendMarkdown: md => {
      md.use(require('markdown-it'))
        .use(require('markdown-it-attrs'))
        .use(require('markdown-it-katex'))
        .use(require('markdown-it-anchor'))
    }
  },
  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
  ],
  configureWebpack: {
    resolve: {
      alias: {
        '@images': path.resolve(__dirname, '..', 'docs', '00-img'),
      }
    }
  },

}
