/**
 * Generates the machine-readable layer of the site: a Markdown twin of every
 * page, plus llms.txt, sitemap.md and sitemap.xml.
 */

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const markdown = require('markdown-it')({ html: true })
const markdownUtils = markdown.utils
const config = require('../src/.vuepress/config')
const { videoDestination } = require('../src/.vuepress/plugins/doc-videos')

const REPO_ROOT = path.join(__dirname, '..')
const BASE = config.base
const SITE_ORIGIN = 'https://fkviking.github.io'
const DEFAULT_OUTPUT = path.join(REPO_ROOT, 'src', '.vuepress', 'dist')

const LOCALES = ['ru', 'en']

// Markdown-it's tokens omit character positions. Record code ranges when the
// real inline rules consume them, including rules nested inside link labels.
const inlineRules = markdown.inline.ruler.getRules.bind(markdown.inline.ruler)
const positionedRules = new WeakMap()
markdown.inline.ruler.getRules = chain => inlineRules(chain).map(rule => {
  if (!positionedRules.has(rule)) positionedRules.set(rule, (state, silent) => {
    const start = state.pos
    const tokenCount = state.tokens.length
    const matched = rule(state, silent)
    if (matched && !silent) {
      for (const token of state.tokens.slice(tokenCount)) {
        if ((token.type === 'code_inline' || token.type === 'image') && !token.meta) {
          token.meta = { source: state.src, range: [start, state.pos] }
        }
      }
    }
    return matched
  })
  return positionedRules.get(rule)
})

function localePrefix (locale) {
  return locale === 'en' ? 'en/' : ''
}

/** Directory holding the pre-processed pages of a locale. */
function preprocessedDir (locale) {
  return locale === 'en'
    ? path.join(REPO_ROOT, 'src', 'en', 'docs')
    : path.join(REPO_ROOT, 'src', 'docs')
}

/** Slugs of a locale's pages, in sidebar order. */
function slugs (locale) {
  const prefix = locale === 'en' ? '/en/' : '/'
  const sidebar = config.themeConfig.locales[prefix].sidebar[`${prefix}docs/`]

  return sidebar[0].children
}

function missingSummary (locale, slug) {
  const asset = `assets/${locale}/${slug}.md`

  return [
    `${asset}: no "summary" field in the frontmatter.`,
    '',
    'Add one sentence describing the page — it is published in llms.txt and sitemap.md:',
    '',
    '    summary: One sentence about what this page covers.',
    ''
  ].join('\n')
}

function entry (locale, slug) {
  const sourcePath = path.join(preprocessedDir(locale), `${slug}.md`)

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`${sourcePath} is missing — run "yarn pre-process" before generating AI documentation`)
  }

  const { data } = matter(fs.readFileSync(sourcePath, 'utf8'))

  if (!data.summary || !String(data.summary).trim()) throw new Error(missingSummary(locale, slug))

  return {
    slug,
    title: String(data.title).trim(),
    summary: String(data.summary).trim(),
    sourcePath
  }
}

/** Pages published in llms.txt and sitemap.md: the sidebar pages, in sidebar order. */
function entries (locale) {
  return slugs(locale).map(slug => entry(locale, slug))
}

/** Pages that get a Markdown twin: every pre-processed page, sidebar order first. */
function twinEntries (locale) {
  const listed = slugs(locale)
  const built = fs.readdirSync(preprocessedDir(locale))
    .filter(name => name.endsWith('.md'))
    .map(name => path.basename(name, '.md'))
  const unlisted = built.filter(slug => !listed.includes(slug)).sort()

  return listed.concat(unlisted).map(slug => entry(locale, slug))
}

function outputArgument () {
  const index = process.argv.indexOf('--output')
  return index === -1 ? DEFAULT_OUTPUT : path.resolve(process.argv[index + 1])
}

function ensureDir (directory) {
  fs.mkdirSync(directory, { recursive: true })
}

function copyDirectory (source, destination) {
  ensureDir(destination)
  fs.readdirSync(source, { withFileTypes: true }).forEach(entry => {
    const sourcePath = path.join(source, entry.name)
    const destinationPath = path.join(destination, entry.name)

    if (entry.isDirectory()) copyDirectory(sourcePath, destinationPath)
    else fs.copyFileSync(sourcePath, destinationPath)
  })
}

function removeVueStyles (markdown) {
  return markdown.replace(/<style\b[^>]*>[\s\S]*?<\/style>\s*/gi, '')
}

/** Removes the auto-generated banner that pre-process writes into a page. */
function removeEditorBanner (markdown) {
  return markdown.replace(/^\[\/\/\]: # \([^\n]*\)\n/gm, '')
}

/** Removes the <Anchor> component from headings. */
function headingAnchors (markdown) {
  return markdown.replace(/^(#{1,6})\s+<Anchor\b[^>]*?\/>\s*/gm, '$1 ')
}

function standardAnchors (text) {
  return text.replace(/<Anchor\b[^>]*?:ids="\[([\s\S]*?)\]"[^>]*?\/>/g, (component, idsExpression) => {
    const ids = []
    const quotedValue = /(['"])((?:\\.|(?!\1).)*)\1/g
    let match

    while ((match = quotedValue.exec(idsExpression))) {
      ids.push(match[2].replace(/\\(['"\\])/g, '$1'))
    }

    return ids.map(id => `<a id="${escapeHtml(id)}"></a>`).join('')
  })
}

function escapeHtml (value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function transformDestination (destination, locale) {
  const video = videoDestination(destination, BASE)
  if (video) return video

  if (/^@videos\/[^/]+\.preview\.(?:jpe?g|webp|png)$/i.test(destination)) {
    return `${BASE}videos/${destination.slice('@videos/'.length)}`
  }

  if (destination.startsWith('@images/')) {
    return `${BASE}docs/00-img/${destination.slice('@images/'.length)}`
  }

  const hashIndex = destination.indexOf('#')
  const pathname = hashIndex === -1 ? destination : destination.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : destination.slice(hashIndex)

  if (!pathname || /^(?:[a-z]+:|\/\/)/i.test(pathname)) return destination

  let markdownPath = pathname.replace(/\.html$/i, '.md')

  if (/^\/(?:en\/)?docs\//.test(markdownPath)) {
    markdownPath = sitePath(locale, `docs/${path.posix.basename(markdownPath)}`)
  }

  return `${markdownPath}${hash}`
}

/** Static author-written players become portable links in the Markdown twins. */
function videoComponents (text, locale) {
  const tag = /<(?:VideoPlayer|video-player)\b((?:"[^"]*"|'[^']*'|[^'">])*?)(?:\/\s*>|>\s*<\/(?:VideoPlayer|video-player)\s*>)/g
  return text.replace(tag, (component, attributes) => {
    const values = new Map()
    const attrs = /([^\s=]+)(?:\s*=\s*(["'])([\s\S]*?)\2)?/g
    let attr
    while ((attr = attrs.exec(attributes))) {
      // Runtime expressions cannot be evaluated by the Markdown exporter.
      if (/^(?::|@|v-)/.test(attr[1])) return component
      values.set(attr[1], attr[3] === undefined ? null : markdownUtils.unescapeAll(attr[3]))
    }
    const attribute = name => values.get(name)
    const src = attribute('src')
    if (!src) return component
    const title = (attribute('title') || 'Video').replace(/\s+/g, ' ').replace(/[\\\[\]]/g, '\\$&')
    const destination = transformDestination(src, locale).replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29')
    return `[${title}](${destination})`
  })
}

function transformProse (text, locale) {
  let transformed = standardAnchors(videoComponents(text, locale))

  transformed = transformed.replace(/(\]\()([^\s)]+)(\))/g, (match, before, destination, after) => {
    return `${before}${transformDestination(destination, locale)}${after}`
  })

  transformed = transformed.replace(/((?:src|href)=["'])@images\//gi, `$1${BASE}docs/00-img/`)
  transformed = transformed.replace(/@images\//g, `${BASE}docs/00-img/`)

  return transformed
}

/** Map parser content back to the original source, retaining Markdown prefixes. */
function inlineSourcePositions (content, source, offset, cursor, table) {
  let searchable = ''
  const positions = []
  for (let index = 0; index < source.length; index++) {
    // The table rule removes the slash from escaped pipes before inline parsing.
    if (table && source[index] === '\\' && source[index + 1] === '|') continue
    searchable += source[index]
    positions.push(offset + index)
  }
  const mapped = []
  for (const line of content.split('\n')) {
    let found = searchable.indexOf(line, cursor)
    let prefix = 0
    if (found === -1 && !table) {
      // List indentation can partially expand a source tab into spaces.
      prefix = line.length - line.trimStart().length
      found = searchable.indexOf(line.slice(prefix), cursor)
    }
    if (found === -1) throw new Error('Cannot locate Markdown inline content in its source block')
    for (let index = 0; index < prefix; index++) mapped.push(positions[found])
    for (let index = prefix; index < line.length; index++) mapped.push(positions[found + index - prefix])
    cursor = found + line.length - prefix
    if (mapped.length < content.length) {
      const newline = searchable.indexOf('\n', cursor)
      mapped.push(positions[newline])
      cursor = newline + 1
    }
  }
  return { positions: mapped, cursor }
}

/** Preserve actual inline code without treating HTML attributes or table rows as code. */
function transformOutsideCode (text, locale) {
  const lineOffsets = [0]
  for (let index = 0; index < text.length; index++) {
    if (text[index] === '\n') lineOffsets.push(index + 1)
  }
  lineOffsets.push(text.length)
  const spans = []
  let row = null
  let cursor = 0
  for (const block of markdown.parse(text, {})) {
    if (block.type === 'tr_open') {
      row = block.map
      cursor = 0
    } else if (block.type === 'tr_close') {
      row = null
    }
    if (block.type !== 'inline') continue
    const map = block.map || row
    if (!map || !block.content) continue
    const offset = lineOffsets[map[0]]
    const source = text.slice(offset, lineOffsets[map[1]])
    const mapped = inlineSourcePositions(block.content, source, offset, block.map ? 0 : cursor, !block.map)
    cursor = mapped.cursor
    const visit = (tokens, content = block.content, contentOffset = 0) => {
      for (const token of tokens) {
        if (token.type === 'code_inline' && token.meta.source === content) {
          const [start, end] = token.meta.range
          spans.push([mapped.positions[contentOffset + start], mapped.positions[contentOffset + end - 1] + 1])
        }
        if (token.type === 'image' && token.meta.source === content) {
          // The image rule parses its label as a separate inline source, sliced
          // immediately after the consumed ![ opener. Rebase its descendants.
          visit(token.children, token.content, contentOffset + token.meta.range[0] + 2)
        } else if (token.children) {
          visit(token.children, content, contentOffset)
        }
      }
    }
    visit(block.children)
  }
  spans.sort((left, right) => left[0] - right[0])
  let output = ''
  let start = 0
  for (const [opening, closing] of spans) {
    output += transformProse(text.slice(start, opening), locale)
    output += text.slice(opening, closing)
    start = closing
  }
  return output + transformProse(text.slice(start), locale)
}

function transformOutsideFences (markdown, locale) {
  const output = []
  let prose = []
  let fence = null
  const flush = () => {
    if (prose.length) output.push(transformOutsideCode(prose.join('\n'), locale))
    prose = []
  }
  for (const line of markdown.split('\n')) {
    const match = line.match(/^\s*(`{3,}|~{3,})(.*)$/)
    if (fence) {
      output.push(line)
      if (match && match[1][0] === fence.marker && match[1].length >= fence.length && !match[2].trim()) fence = null
    } else if (match) {
      flush()
      fence = { marker: match[1][0], length: match[1].length }
      output.push(line)
    } else {
      prose.push(line)
    }
  }
  flush()
  return output.join('\n')
}

/** Page text with the Vue markup removed and links rewritten. */
function twinBody (sourcePath, locale) {
  const source = fs.readFileSync(sourcePath, 'utf8')
  const { content } = matter(source)
  const plain = headingAnchors(removeEditorBanner(removeVueStyles(content)))

  return transformOutsideFences(plain, locale).trim()
}

/** Builds the Markdown twin of a page: its pre-processed text without Vue markup. */
function generateMarkdownTwin (sourcePath, locale) {
  return `${twinBody(sourcePath, locale)}\n`
}

/** Builds llms-full.txt: every page of a locale in one file, in sidebar order. */
function llmsFullDocument (locale, pages) {
  const text = config.aiDocs[locale]
  const header = [
    `# ${text.llmsTitle}`,
    '',
    `> ${text.summary}`,
    ''
  ].join('\n')

  return `${header}\n${pages.map(page => twinBody(page.sourcePath, locale)).join('\n\n')}\n`
}

/** Lines of a document that are not inside a code fence. */
function linesOutsideFences (markdown) {
  let fence = null

  return markdown.split('\n').filter(line => {
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/)

    if (!fenceMatch) return !fence

    const marker = fenceMatch[1][0]
    if (fence === marker) fence = null
    else if (!fence) fence = marker

    return false
  })
}

/** The Anchor ids declared in a fragment of markup, in source order. */
function declaredAnchor (markup) {
  const anchor = markup.match(/<Anchor\b[^>]*?:ids="\[([\s\S]*?)\]"[^>]*?\/>/)
  if (!anchor) return []

  return Array.from(anchor[1].matchAll(/(['"])((?:\\.|(?!\1).)*)\1/g), found => found[2])
}

/** Section title with the Anchor, the inline tags and the link markup taken out. */
function sectionTitle (markup) {
  return markup
    .replace(/<Anchor\b[^>]*?\/>/g, '')
    .replace(/<\/?(?:i|b|em|strong|code)>/gi, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim()
}

/** Anchored headings of the topmost level below the title. */
function headingSections (lines) {
  const headings = []

  lines.forEach(line => {
    const match = line.match(/^(#{2,6})\s+(.*)$/)
    if (!match) return

    const ids = declaredAnchor(match[2])
    const title = sectionTitle(match[2])

    if (!ids.length || !title) return

    headings.push({ level: match[1].length, anchor: ids[ids.length - 1], title })
  })

  if (!headings.length) return []

  const topLevel = Math.min(...headings.map(heading => heading.level))

  return headings.filter(heading => heading.level === topLevel)
}

/**
 * Questions of a page written as collapsible entries. The FAQ has no headings
 * below its title — every question lives in a <summary>, anchor and all.
 */
function collapsibleSections (lines) {
  const questions = []

  lines.forEach(line => {
    const summary = line.match(/<summary>([\s\S]*?)<\/summary>/)
    if (!summary) return

    const ids = declaredAnchor(summary[1])
    const title = sectionTitle(summary[1])

    if (!ids.length || !title) return

    questions.push({ anchor: ids[ids.length - 1], title })
  })

  return questions
}

/**
 * Sections of a page: its headings of the topmost level below the title, or —
 * for a page built out of collapsible entries — the questions those entries ask.
 * Each carries the anchor the site renders for it.
 */
function sections (sourcePath) {
  const { content } = matter(fs.readFileSync(sourcePath, 'utf8'))
  const lines = linesOutsideFences(content)
  const headings = headingSections(lines)

  return headings.length ? headings : collapsibleSections(lines)
}

function otherLocale (locale) {
  return locale === 'en' ? 'ru' : 'en'
}

function sitePath (locale, relativePath) {
  return `${BASE}${localePrefix(locale)}${relativePath}`
}

function absoluteUrl (siteRelativePath) {
  return new URL(siteRelativePath, SITE_ORIGIN).href
}

function markdownUrl (locale, slug) {
  return absoluteUrl(sitePath(locale, `docs/${slug}.md`))
}

function htmlUrl (locale, slug) {
  return absoluteUrl(sitePath(locale, `docs/${slug}.html`))
}

/** Builds llms.txt in the llmstxt.org shape: title, blurb, link sections, optional tail. */
function llmsDocument (locale, pages) {
  const text = config.aiDocs[locale]
  const lines = [
    `# ${text.llmsTitle}`,
    '',
    `> ${text.summary}`,
    '',
    text.formats,
    '',
    text.fullNote.replace('{url}', absoluteUrl(sitePath(locale, 'llms-full.txt'))),
    '',
    `## ${text.pagesTitle}`,
    ''
  ]

  pages.forEach(page => {
    lines.push(`- [${page.title}](${markdownUrl(locale, page.slug)}): ${page.summary}`)
  })
  lines.push('')

  lines.push(`## ${text.notesTitle}`, '')
  text.notes.forEach(note => lines.push(`- ${note}`))
  lines.push('')

  lines.push(
    `## ${text.optionalTitle}`,
    '',
    `- [${text.sitemapLabel}](${absoluteUrl(sitePath(locale, 'sitemap.md'))}): ${text.sitemapSummary}`,
    `- [${text.otherLocaleLabel}](${absoluteUrl(sitePath(otherLocale(locale), 'llms.txt'))}): ${text.otherLocaleSummary}`,
    ''
  )

  return lines.join('\n')
}

/** Builds sitemap.md: entry points, URL patterns and every page in both formats. */
function sitemapMarkdown (locale, pages) {
  const text = config.aiDocs[locale]
  const other = otherLocale(locale)
  const siteUrl = absoluteUrl(sitePath(locale, ''))

  const lines = [
    `# ${text.sitemapTitle}`,
    '',
    text.sitemapIntro,
    '',
    `## ${text.entryPointsTitle}`,
    '',
    `- [${siteUrl}](${siteUrl}) — ${text.entryPoints.site}`,
    `- [llms.txt](${absoluteUrl(sitePath(locale, 'llms.txt'))}) — ${text.entryPoints.llms}`,
    `- [llms-full.txt](${absoluteUrl(sitePath(locale, 'llms-full.txt'))}) — ${text.entryPoints.llmsFull}`,
    `- [sitemap.md](${absoluteUrl(sitePath(locale, 'sitemap.md'))}) — ${text.entryPoints.sitemapMd}`,
    `- [sitemap.xml](${absoluteUrl(`${BASE}sitemap.xml`)}) — ${text.entryPoints.sitemapXml}`,
    '',
    `## ${text.urlPatternsTitle}`,
    '',
    `- ${text.urlPatterns.html}: \`${absoluteUrl(sitePath(locale, 'docs/'))}<${text.pagePlaceholder}>.html\``,
    `- ${text.urlPatterns.markdown}: \`${absoluteUrl(sitePath(locale, 'docs/'))}<${text.pagePlaceholder}>.md\``,
    `- ${locale === 'en' ? text.urlPatterns.russianHtml : text.urlPatterns.englishHtml}: \`${absoluteUrl(sitePath(other, 'docs/'))}<${text.pagePlaceholder}>.html\``,
    `- ${locale === 'en' ? text.urlPatterns.russianMarkdown : text.urlPatterns.englishMarkdown}: \`${absoluteUrl(sitePath(other, 'docs/'))}<${text.pagePlaceholder}>.md\``,
    '',
    `## ${text.pagesTitle}`,
    ''
  ]

  pages.forEach(page => {
    lines.push(`- [${page.title}](${htmlUrl(locale, page.slug)}) ([Markdown](${markdownUrl(locale, page.slug)})) — ${page.summary}`)

    sections(page.sourcePath).forEach(section => {
      lines.push(`  - [${section.title}](${htmlUrl(locale, page.slug)}#${encodeURIComponent(section.anchor)})`)
    })
  })
  lines.push('')

  return lines.join('\n')
}

function xmlEscape (value) {
  return String(value).replace(/[<>&'"]/g, character => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[character]))
}

function sitemapXml (metadata) {
  const urls = [
    absoluteUrl(BASE),
    absoluteUrl(`${BASE}en/`),
    ...metadata.ru.map(page => absoluteUrl(sitePath('ru', `docs/${page.slug}.html`))),
    ...metadata.en.map(page => absoluteUrl(sitePath('en', `docs/${page.slug}.html`)))
  ]

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(url => `  <url><loc>${xmlEscape(url)}</loc></url>`),
    '</urlset>',
    ''
  ].join('\n')
}

function generate (outputRoot) {
  ensureDir(outputRoot)
  const metadata = { ru: entries('ru'), en: entries('en') }

  LOCALES.forEach(locale => {
    const localeRoot = path.join(outputRoot, locale === 'en' ? 'en' : '')
    const docsRoot = path.join(localeRoot, 'docs')
    ensureDir(docsRoot)

    twinEntries(locale).forEach(page => {
      const outputPath = path.join(docsRoot, `${page.slug}.md`)
      fs.writeFileSync(outputPath, generateMarkdownTwin(page.sourcePath, locale), 'utf8')
    })

    fs.writeFileSync(path.join(localeRoot, 'llms.txt'), llmsDocument(locale, metadata[locale]), 'utf8')
    fs.writeFileSync(path.join(localeRoot, 'llms-full.txt'), llmsFullDocument(locale, metadata[locale]), 'utf8')
    fs.writeFileSync(path.join(localeRoot, 'sitemap.md'), sitemapMarkdown(locale, metadata[locale]), 'utf8')
  })

  // GitHub Pages runs Jekyll over the published branch, and Jekyll parses .md
  // files as Liquid templates, which breaks on braces in code samples.
  fs.writeFileSync(path.join(outputRoot, '.nojekyll'), '', 'utf8')

  const imageDestination = path.join(outputRoot, 'docs', '00-img')
  fs.rmSync(imageDestination, { recursive: true, force: true })
  copyDirectory(path.join(REPO_ROOT, 'assets', '00-img'), imageDestination)
  fs.writeFileSync(path.join(outputRoot, 'sitemap.xml'), sitemapXml(metadata), 'utf8')

  return metadata
}

if (require.main === module) {
  const outputRoot = outputArgument()
  generate(outputRoot)
  console.log(`Generated AI documentation in ${outputRoot}`)
}

module.exports = {
  BASE,
  SITE_ORIGIN,
  LOCALES,
  entries,
  twinEntries,
  sections,
  localePrefix,
  sitePath,
  absoluteUrl,
  generate,
  generateMarkdownTwin,
  transformDestination,
  transformOutsideFences
}
