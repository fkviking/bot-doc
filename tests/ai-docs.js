const assert = require('assert')
const fs = require('fs')
const path = require('path')
const {
  BASE,
  SITE_ORIGIN,
  LOCALES,
  entries,
  sections,
  localePrefix,
  sitePath,
  absoluteUrl
} = require('../scripts/generate-ai-docs')
const { themeConfig } = require('../src/.vuepress/config')

const RAW_PUBLISHED_BASE = themeConfig.rawPublishedBase
const REPOSITORY_URL = themeConfig.repositoryUrl

const REPO_ROOT = path.join(__dirname, '..')
const OUTPUT_ROOT = path.join(REPO_ROOT, 'src', '.vuepress', 'dist')

function exists (relativePath) {
  return fs.existsSync(path.join(OUTPUT_ROOT, relativePath))
}

function withoutFences (markdown) {
  let fence = null
  return markdown.split('\n').filter(line => {
    const match = line.match(/^\s*(`{3,}|~{3,})/)
    if (match) {
      const marker = match[1][0]
      if (fence === marker) fence = null
      else if (!fence) fence = marker
      return false
    }
    return !fence
  }).join('\n')
}

function linkDestinations (markdown) {
  const prose = withoutFences(markdown)
  return Array.from(prose.matchAll(/\]\(([^\s)]+)\)/g), match => match[1])
}

function localOutputPath (destination, containingFile) {
  let parsed
  try {
    parsed = new URL(destination, `${SITE_ORIGIN}${BASE}`)
  } catch (_) {
    return null
  }

  if (parsed.origin !== SITE_ORIGIN) return null
  if (!parsed.pathname.startsWith(BASE)) return null

  const relativeToOutput = decodeURIComponent(parsed.pathname.slice(BASE.length))
  if (destination.startsWith('/') || /^[a-z]+:/i.test(destination)) return relativeToOutput

  return path.relative(
    OUTPUT_ROOT,
    path.resolve(path.dirname(path.join(OUTPUT_ROOT, containingFile)), destination.split('#')[0])
  )
}

function assertLocalLinksExist (relativeFile) {
  const content = fs.readFileSync(path.join(OUTPUT_ROOT, relativeFile), 'utf8')
  linkDestinations(content).forEach(destination => {
    const outputPath = localOutputPath(destination, relativeFile)
    if (!outputPath || !/\.(?:md|html|png|jpe?g|gif|svg|webp)$/i.test(outputPath)) return
    assert(exists(outputPath), `${relativeFile} contains a dead local link: ${destination}`)
  })
}

/** Asserts every built HTML page has a Markdown twin next to it. */
function assertEveryPageHasTwin (locale) {
  const prefix = localePrefix(locale)
  const docsDir = path.join(OUTPUT_ROOT, prefix, 'docs')

  fs.readdirSync(docsDir)
    .filter(name => name.endsWith('.html'))
    .forEach(name => {
      const twin = `${prefix}docs/${path.basename(name, '.html')}.md`
      assert(exists(twin), `${prefix}docs/${name} points at a Markdown twin that was not generated: ${twin}`)
    })
}

/** Asserts llms-full.txt carries the full text of every published page. */
function assertFullDocumentIsComplete (locale, pages) {
  const prefix = localePrefix(locale)
  const fullPath = `${prefix}llms-full.txt`
  assert(exists(fullPath), `Missing ${fullPath}`)

  const full = fs.readFileSync(path.join(OUTPUT_ROOT, fullPath), 'utf8')

  assert(!/AUTO-GENERATED/i.test(full), `${fullPath} shows a build banner to the reader`)

  pages.forEach(page => {
    const twin = fs.readFileSync(path.join(OUTPUT_ROOT, `${prefix}docs/${page.slug}.md`), 'utf8')

    assert(full.includes(twin.trim()), `${fullPath} does not carry the full text of ${page.slug}`)
  })
}

/** Asserts every section link in sitemap.md points at an anchor the page really renders. */
function assertSectionAnchorsExist (locale, pages) {
  const prefix = localePrefix(locale)

  pages.forEach(page => {
    const pageSections = sections(page.sourcePath)
    if (!pageSections.length) return

    const html = fs.readFileSync(path.join(OUTPUT_ROOT, `${prefix}docs/${page.slug}.html`), 'utf8')

    pageSections.forEach(section => {
      assert(
        html.includes(`id="${section.anchor}"`),
        `${prefix}docs/${page.slug}.html has no anchor ${section.anchor} for section "${section.title}"`
      )
    })
  })
}

/**
 * Anchors are the addresses the documentation links itself by, and llms.txt and
 * sitemap.md publish them. Checked against the sources, so headings that never
 * reach a section list are covered too.
 */
function assertAnchorsAreAddressable (locale) {
  const directory = path.join(REPO_ROOT, 'assets', locale)

  fs.readdirSync(directory).filter(name => name.endsWith('.md')).forEach(name => {
    const source = fs.readFileSync(path.join(directory, name), 'utf8')
    const seen = new Set()

    Array.from(source.matchAll(/<Anchor\b[^>]*?:ids="\[([\s\S]*?)\]"[^>]*?\/>/g)).forEach(declaration => {
      Array.from(declaration[1].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g), found => found[2]).forEach(id => {
        const where = `assets/${locale}/${name}`

        assert(id.trim(), `${where} declares an empty anchor`)
        assert(
          !/\s/.test(id),
          `${where} declares the anchor "${id}" with a space in it — ` +
          'it reaches the browser percent-encoded. Use an underscore.'
        )
        assert(
          !seen.has(id),
          `${where} declares the anchor "${id}" twice — a link to it stops at the ` +
          'first one and the second heading becomes unreachable. Give it its own name.'
        )

        seen.add(id)
      })
    })
  })
}

function testGeneratedPages () {
  LOCALES.forEach(locale => {
    assertAnchorsAreAddressable(locale)
    assertEveryPageHasTwin(locale)
    assertFullDocumentIsComplete(locale, entries(locale))
    assertSectionAnchorsExist(locale, entries(locale))

    entries(locale).forEach(page => {
      const prefix = locale === 'en' ? 'en/' : ''
      const markdownPath = `${prefix}docs/${page.slug}.md`
      const htmlPath = `${prefix}docs/${page.slug}.html`
      assert(exists(markdownPath), `Missing Markdown twin: ${markdownPath}`)
      assert(exists(htmlPath), `Missing HTML page: ${htmlPath}`)

      const markdown = fs.readFileSync(path.join(OUTPUT_ROOT, markdownPath), 'utf8')
      assert(!markdown.includes('@images/'), `${markdownPath} contains @images alias`)
      assert(!/AUTO-GENERATED/i.test(markdown), `${markdownPath} shows a build banner to the reader`)
      assert(!markdown.includes('<Anchor'), `${markdownPath} contains a Vue Anchor component`)
      assertLocalLinksExist(markdownPath)
    })

    const prefix = locale === 'en' ? 'en/' : ''
    ;['llms.txt', 'sitemap.md'].forEach(file => {
      const relativeFile = `${prefix}${file}`
      assert(exists(relativeFile), `Missing ${relativeFile}`)
      assertLocalLinksExist(relativeFile)
    })

    const llmsPath = `${prefix}llms.txt`
    const llms = fs.readFileSync(path.join(OUTPUT_ROOT, llmsPath), 'utf8')
    const sitemapPath = `${prefix}sitemap.md`
    const sitemap = fs.readFileSync(path.join(OUTPUT_ROOT, sitemapPath), 'utf8')
    const otherPrefix = locale === 'en' ? '' : 'en/'

    assert(/^# .+/m.test(llms), `${llmsPath} must open with an H1 title`)
    assert(/^> .+/m.test(llms), `${llmsPath} must carry a blockquote summary under the title`)
    assert(/^## Optional$/m.test(llms), `${llmsPath} must end with an Optional section`)
    assert(llms.includes(absoluteUrl(sitePath(locale, 'sitemap.md'))), `${llmsPath} must link the sitemap`)
    assert(llms.includes(absoluteUrl(`${BASE}${otherPrefix}llms.txt`)), `${llmsPath} must link the other locale`)

    assert(sitemap.includes(absoluteUrl(sitePath(locale, 'llms.txt'))), `${sitemapPath} must link llms.txt`)
    assert(sitemap.includes(absoluteUrl(`${BASE}sitemap.xml`)), `${sitemapPath} must link sitemap.xml`)

    entries(locale).forEach(page => {
      assert(
        llms.includes(`](${absoluteUrl(sitePath(locale, `docs/${page.slug}.md`))}): ${page.summary}`),
        `${llmsPath} must list ${page.slug} with the summary from its frontmatter`
      )
      assert(
        sitemap.includes(absoluteUrl(sitePath(locale, `docs/${page.slug}.html`))) &&
        sitemap.includes(absoluteUrl(sitePath(locale, `docs/${page.slug}.md`))),
        `${sitemapPath} must list both formats of ${page.slug}`
      )
      assert(
        page.summary !== page.title && page.summary.length > page.title.length,
        `${page.slug} needs a summary that says more than its title`
      )
      assert(
        !/\.\.\.$|…$/.test(page.summary.trim()),
        `${page.slug} has a truncated summary — write it out in assets/${locale}/${page.slug}.md`
      )
      assert(/[.!?]$/.test(page.summary.trim()), `${page.slug} summary must be a finished sentence`)
    })
  })
}

function testHtmlDiscovery () {
  ;['ru', 'en'].forEach(locale => {
    const prefix = locale === 'en' ? 'en/' : ''
    ;['creating-connection', 'order-error', 'api'].forEach(slug => {
      const htmlPath = `${prefix}docs/${slug}.html`
      const html = fs.readFileSync(path.join(OUTPUT_ROOT, htmlPath), 'utf8')
      const markdownHref = sitePath(locale, `docs/${slug}.md`)
      const llmsHref = sitePath(locale, 'llms.txt')

      assert(/rel="alternate"/.test(html) && /type="text\/markdown"/.test(html), `${htmlPath} lacks Markdown alternate metadata`)
      assert(html.includes(`href="${markdownHref}"`), `${htmlPath} has the wrong Markdown alternate URL`)
      assert(/rel="describedby"/.test(html), `${htmlPath} lacks llms discovery metadata`)
      assert(html.includes(`href="${llmsHref}"`), `${htmlPath} has the wrong llms URL`)
      assert(html.includes('class="site-footer"'), `${htmlPath} lacks the site footer`)
      assert(html.includes(`href="${sitePath(locale, 'llms.txt')}"`), `${htmlPath} footer must link the canonical llms.txt`)
      assert(html.includes(`href="${RAW_PUBLISHED_BASE}/${prefix}sitemap.md"`), `${htmlPath} footer has the wrong raw sitemap URL`)
      assert(html.includes('class="copy-page"'), `${htmlPath} lacks the copy page button`)
      assert(html.includes('class="github-link"'), `${htmlPath} lacks the GitHub repository icon`)
      assert(html.includes(`href="${REPOSITORY_URL}"`), `${htmlPath} has the wrong GitHub repository URL`)
    })
  })
}

/** Without .nojekyll GitHub Pages runs Jekyll over the twins and fails on their code samples. */
function testJekyllIsDisabled () {
  assert(exists('.nojekyll'), 'Missing .nojekyll: GitHub Pages would try to render the Markdown twins')
}

function testXmlSitemap () {
  assert(exists('sitemap.xml'), 'Missing sitemap.xml')
  const xml = fs.readFileSync(path.join(OUTPUT_ROOT, 'sitemap.xml'), 'utf8')
  ;['ru', 'en'].forEach(locale => {
    entries(locale).forEach(page => {
      const url = `${SITE_ORIGIN}${sitePath(locale, `docs/${page.slug}.html`)}`
      assert(xml.includes(url), `sitemap.xml is missing ${url}`)
    })
  })
}

function testHomeFooterLinks () {
  ;['ru', 'en'].forEach(locale => {
    const prefix = locale === 'en' ? 'en/' : ''
    const homePath = `${prefix}index.html`
    const html = fs.readFileSync(path.join(OUTPUT_ROOT, homePath), 'utf8')

    assert(html.includes('class="site-footer"'), `${homePath} lacks the home footer`)
    assert(html.includes('class="machine-readable-links'), `${homePath} lacks the compact AI footer group`)
    assert(html.includes(`href="${sitePath(locale, 'llms.txt')}"`), `${homePath} footer must link the canonical llms.txt`)
    assert(html.includes(`href="${RAW_PUBLISHED_BASE}/${prefix}sitemap.md"`), `${homePath} footer has the wrong raw sitemap URL`)
    assert(!html.includes('Машиночитаемая документация') && !html.includes('Machine-readable documentation'), `${homePath} must not show an explanatory AI label`)
  })
}

testGeneratedPages()
testHtmlDiscovery()
testJekyllIsDisabled()
testXmlSitemap()
testHomeFooterLinks()
console.log('AI documentation checks passed')
