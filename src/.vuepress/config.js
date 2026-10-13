const path = require('path');
const aiDiscovery = require('./plugins/ai-discovery');
const docVideos = require('./plugins/doc-videos');
const { videoPreviews, publicDirectory } = require('../../scripts/video-assets');
const base = '/bot-doc/';

module.exports = {
  /**
   * Ref：https://v1.vuepress.vuejs.org/config/#title
   */
  title: 'Документация торговых роботов компании "Викинг"',
  base,
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
    videoPreviews: videoPreviews(base),
    logo: '/images/vkg_logo_en.svg',
    repositoryUrl: 'https://github.com/fkviking/bot-doc',
    rawPublishedBase: 'https://raw.githubusercontent.com/fkviking/bot-doc/gh-pages',
    locales: {
      '/': {
        lang: 'ru-RU',
        title: 'Документация торговых роботов компании "Викинг"',
        description: 'Руководство пользователя, описание алгоритма и API',
        footer: 'ФК Викинг | Copyright © 2010-2026',
        copyPage: {
          copy: 'Копировать страницу',
          copying: 'Копирую…',
          copied: 'Скопировано',
          failed: 'Не удалось',
          viewMarkdown: 'Посмотреть как Markdown',
          openIn: 'Открыть в',
          prompt: 'Прочитай {url} — я хочу задать вопросы по этой странице документации.'
        },
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
                'client_server_requirements',
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
        footer: 'FC Viking | Copyright © 2010-2026',
        copyPage: {
          copy: 'Copy page',
          copying: 'Copying…',
          copied: 'Copied',
          failed: 'Failed',
          viewMarkdown: 'View as Markdown',
          openIn: 'Open in',
          prompt: 'Read {url} — I want to ask questions about this documentation page.'
        },
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
  /**
   * Wording of llms.txt and sitemap.md, read by scripts/generate-ai-docs.js at build time.
   * Page titles and summaries come from the frontmatter in assets/ru and assets/en.
   */
  aiDocs: {
    ru: {
      summary: 'Документация торговых роботов ФК «Викинг»: настройка арбитражных роботов, параметры портфелей, торговые подключения, формулы на C++ и WebSocket API.',
      llmsTitle: 'Документация торговых роботов ФК «Викинг»',
      formats: 'Это индекс документации: начинайте с него и предпочитайте Markdown-версию страницы её HTML-версии. Каждая страница опубликована в двух видах: HTML по адресу `docs/<страница>.html` и Markdown по тому же пути с расширением `.md`. Ссылки ниже ведут на Markdown.',
      notesTitle: 'Примечания',
      notes: [
        'Ошибки выставления, снятия и изменения заявок — штатное поведение, а не признак поломки робота. Постфикс `LOCAL` означает, что заявку отклонил сам робот и на биржу она не уходила; ошибка без `LOCAL` — ответ биржи, робот лишь транслирует её текст.',
        'Параметры портфеля и параметры отдельных инструментов портфеля — разные наборы; в «Описании параметров» они разведены по разным разделам.',
        'Ссылайтесь на разделы по якорю (`params-description.html#p.sell`), а не по номеру: нумерация заголовков проставляется при сборке и сдвигается при изменении порядка разделов. Якоря вида `#p.sell` и `#faq.license` одинаковы в русской и английской версиях.',
        'Каждый вопрос из «Часто задаваемых вопросов» адресуется отдельно (`faq.html#faq.license`); полный список вопросов со ссылками — в sitemap.md.'
      ],
      optionalTitle: 'Optional',
      fullNote: 'Вся документация одним файлом: {url}',
      sitemapLabel: 'Карта документации',
      sitemapSummary: 'Полный список страниц с адресами HTML- и Markdown-версий.',
      otherLocaleLabel: 'Английская версия',
      otherLocaleSummary: 'Та же документация на английском языке.',
      sitemapTitle: 'Карта документации ФК «Викинг»',
      sitemapIntro: 'Полный указатель опубликованных страниц. Для краткой навигации начните с llms.txt.',
      entryPointsTitle: 'Точки входа',
      entryPoints: {
        site: 'Документация в браузере',
        llms: 'Краткая карта для агентов',
        llmsFull: 'Полный текст всех страниц подряд, в порядке разделов',
        sitemapMd: 'Этот файл — полный указатель страниц',
        sitemapXml: 'Карта сайта для поисковых роботов'
      },
      urlPatternsTitle: 'Адреса страниц',
      pagePlaceholder: 'страница',
      urlPatterns: {
        html: 'HTML-страница',
        markdown: 'Markdown-двойник',
        englishHtml: 'HTML-страница на английском',
        englishMarkdown: 'Markdown-двойник на английском',
        russianHtml: 'HTML-страница на русском',
        russianMarkdown: 'Markdown-двойник на русском'
      },
      pagesTitle: 'Страницы'
    },
    en: {
      summary: 'Documentation for the FC Viking trading robots: arbitrage robot setup, portfolio parameters, trading connections, C++ formulas, and the WebSocket API.',
      llmsTitle: 'FC Viking Trading Robots Documentation',
      formats: 'This file is the documentation index: start here, and prefer the Markdown version of a page over its HTML version. Every page is published in two forms: HTML at `docs/<page>.html` and Markdown at the same path with a `.md` extension. The links below point at the Markdown twins.',
      notesTitle: 'Notes',
      notes: [
        'Order submission, cancellation, and modification errors are normal behaviour, not a sign that the robot is broken. A `LOCAL` suffix means the robot rejected the order itself and never sent it to the exchange; an error without `LOCAL` is the exchange\'s own answer, which the robot only relays.',
        'Portfolio parameters and per-instrument parameters are separate sets; "Parameters Description" keeps them in separate sections.',
        'Link to a section by its anchor (`params-description.html#p.sell`), not by its number: heading numbers are generated at build time and shift whenever sections are reordered. Anchors such as `#p.sell` and `#faq.license` are the same in the Russian and English versions.',
        'Every question in the FAQ is addressable on its own (`faq.html#faq.license`); the full list of questions with links is in sitemap.md.'
      ],
      optionalTitle: 'Optional',
      fullNote: 'The whole documentation in one file: {url}',
      sitemapLabel: 'Documentation map',
      sitemapSummary: 'Full page list with both HTML and Markdown addresses.',
      otherLocaleLabel: 'Russian version',
      otherLocaleSummary: 'The same documentation in Russian.',
      sitemapTitle: 'FC Viking Documentation Map',
      sitemapIntro: 'Complete index of published pages. For a shorter navigation surface, start with llms.txt.',
      entryPointsTitle: 'Entry points',
      entryPoints: {
        site: 'Documentation in a browser',
        llms: 'Short navigation surface for agents',
        llmsFull: 'The complete text of every page, in section order',
        sitemapMd: 'This file — the full page index',
        sitemapXml: 'XML sitemap for crawlers'
      },
      urlPatternsTitle: 'URL patterns',
      pagePlaceholder: 'page',
      urlPatterns: {
        html: 'HTML page',
        markdown: 'Markdown twin',
        englishHtml: 'HTML page in English',
        englishMarkdown: 'Markdown twin in English',
        russianHtml: 'HTML page in Russian',
        russianMarkdown: 'Markdown twin in Russian'
      },
      pagesTitle: 'Pages'
    }
  },
  markdown: {
    extractHeaders: ['h2', 'h3', 'h4', 'h5', 'h6'],
    extendMarkdown: md => {
      md.use(require('markdown-it'))
        .use(require('markdown-it-attrs'))
        .use(require('markdown-it-katex'))
        .use(require('markdown-it-anchor'))
        .use(docVideos, { base })

      const MAX_INDEXED_FENCE_BYTES = 25000
      const renderFence = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const html = renderFence
          ? renderFence(tokens, idx, options, env, self)
          : self.renderToken(tokens, idx, options)

        return Buffer.byteLength(tokens[idx].content) > MAX_INDEXED_FENCE_BYTES
          ? `<div class="no-index">${html}</div>`
          : html
      }
    }
  },
  /**
   * Apply plugins，ref：https://v1.vuepress.vuejs.org/zh/plugin/
   */
  plugins: [
    '@vuepress/plugin-back-to-top',
    '@vuepress/plugin-medium-zoom',
    aiDiscovery,
  ],
  // VuePress 1 uses separate vue-loader pipelines for .vue and .md files.
  // Media aliases emit separate files with stable public videos/ URLs.
  chainWebpack: config => {
    const preparedAsset = resource => path.dirname(resource) === publicDirectory
    config.module.rule('media').exclude.add(preparedAsset)
    config.module.rule('images').exclude.add(preparedAsset)
    config.module.rule('doc-videos')
      .test(/\.(mp4|webm|ogv)(\?.*)?$/i)
      .include.add(publicDirectory).end()
      .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({ name: 'videos/[name].[ext]', publicPath: base })
    config.module.rule('doc-video-previews')
      .test(/\.preview\.(jpe?g|webp|png)(\?.*)?$/i)
      .include.add(publicDirectory).end()
      .use('file-loader')
      .loader(require.resolve('file-loader'))
      .options({ name: 'videos/[name].[ext]', publicPath: base })
    for (const rule of ['vue', 'markdown']) {
      config.module.rule(rule).use('vue-loader').tap(options => ({
        ...options,
        transformAssetUrls: {
          ...options.transformAssetUrls,
          VideoPlayer: ['src', 'poster'],
          'video-player': ['src', 'poster']
        }
      }))
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@images': path.resolve(__dirname, '..', 'docs', '00-img'),
        '@videos': publicDirectory,
      }
    }
  },

}
