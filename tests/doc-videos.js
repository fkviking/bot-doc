const assert = require('assert')
const fs = require('fs')
const path = require('path')
const MarkdownIt = require('markdown-it')
const docVideos = require('../src/.vuepress/plugins/doc-videos')
const { BASE, transformDestination, transformOutsideFences } = require('../scripts/generate-ai-docs')
const { videoDestination } = docVideos
const { VIDEO_FILE, previewFile, publicDirectory } = require('../scripts/video-assets')

const root = path.join(__dirname, '..')
const output = path.join(root, 'src', '.vuepress', 'dist')
const md = new MarkdownIt().use(docVideos, { base: BASE })
const link = '[Quote](../00-video/quote.mp4)'
const aliasLink = '[Quote](@videos/quote.mp4)'
const quotePreview = previewFile('quote.mp4')
const quotePosterAlias = `@videos/${quotePreview}`

assert(md.render(aliasLink).includes(`<VideoPlayer src="@videos/quote.mp4" poster="${quotePosterAlias}" title="Quote"`), 'A standalone @videos link must compile through the same asset alias workflow as covers')
assert(!md.render('[Quote](@videos/../quote.mp4)').includes('<VideoPlayer'), 'Video alias links must stay within the video asset directory')
assert(!md.render(`See ${aliasLink}.`).includes('<VideoPlayer'))
assert(!md.render('```md\n' + aliasLink + '\n```').includes('<VideoPlayer'))
assert(md.render(`- Example\n\n    ${aliasLink}`).includes('<VideoPlayer'))

// Only whole paragraphs become players; prose, images and code retain Markdown behaviour.
assert(md.render(link).includes(`<VideoPlayer src="/bot-doc/videos/quote.mp4" poster="${quotePosterAlias}" title="Quote"`), 'A standalone video link must select the reusable player with its image alias and title')
assert(!md.render(link).includes('<figcaption>'), 'Players must not show a caption below the video')
assert(!md.render(`See ${link}.`).includes('<VideoPlayer'))
assert(!md.render('![Quote](../00-video/quote.mp4)').includes('<VideoPlayer'))
assert(!md.render('```md\n' + link + '\n```').includes('<VideoPlayer'))
assert(!md.render('[Quote](../00-video/../../quote.mp4)').includes('<VideoPlayer'))
assert(!md.render('[Quote](https://example.com/quote.mp4)').includes('<VideoPlayer'))
assert(md.render('[A " & B](../00-video/quote.mp4)').includes('title="A &quot; &amp; B"'))
assert.strictEqual((md.render(`${link}\n\n${link}`).match(/<VideoPlayer /g) || []).length, 2)
assert(md.render(`- Example\n\n    ${link}`).includes('<VideoPlayer'))
for (const locale of ['ru', 'en']) {
  assert.strictEqual(transformDestination('../00-video/quote.mp4', locale), `${BASE}videos/quote.mp4`)
  assert.strictEqual(transformDestination('@videos/quote.mp4', locale), `${BASE}videos/quote.mp4`, 'Published Markdown must resolve the video alias to its stable public URL')
  assert.strictEqual(transformOutsideFences(aliasLink, locale), '[Quote](/bot-doc/videos/quote.mp4)')
  for (const extension of ['mp4', 'webm', 'ogv']) {
    assert(md.render(`[New video](@videos/new-video.${extension})`).includes(`<VideoPlayer src="@videos/new-video.${extension}"`), `${extension}: supported containers must render players`)
    assert.strictEqual(transformDestination(`@videos/new-video.${extension}`, locale), `${BASE}videos/new-video.${extension}`)
  }
  assert.strictEqual(transformDestination('@videos/new-video.preview.webp', locale), `${BASE}videos/new-video.preview.webp`)
  assert.strictEqual(transformOutsideFences('![Cover](@videos/new-video.preview.webp)', locale), `![Cover](${BASE}videos/new-video.preview.webp)`)
  const aliasExamples = 'Example: `' + aliasLink + '`\n\n```md\n' + aliasLink + '\n```'
  assert.strictEqual(transformOutsideFences(aliasExamples, locale), aliasExamples, 'Video aliases in code examples must retain their authoring syntax')
}

// Exercise the installed VuePress Markdown -> vue-loader pipeline and the Vue pipeline.
// Resolve and load the real MP4 assets: JavaScript gets URLs, emitted files keep their bytes.
const siteConfig = require('../src/.vuepress/config')
const webpack = new (require('webpack-chain'))()
webpack.module.rule('images').test(/\.(png|jpe?g|gif)(\?.*)?$/).use('url-loader').loader(require.resolve('url-loader'))
webpack.module.rule('media').test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/).use('url-loader').loader(require.resolve('url-loader'))
for (const rule of ['vue', 'markdown']) webpack.module.rule(rule).use('vue-loader').options({})
if (siteConfig.chainWebpack) siteConfig.chainWebpack(webpack)
const rules = webpack.toConfig().module.rules
const aliases = siteConfig.configureWebpack.resolve.alias
assert(aliases['@videos'], 'The video source directory must have a Webpack alias')
const resolveAsset = require('enhanced-resolve').create.sync({ alias: aliases })
const videoUrls = new Map()
for (const file of fs.readdirSync(publicDirectory).filter(file => VIDEO_FILE.test(file) || /\.preview\.(jpe?g|webp|png)$/i.test(file))) {
  const request = `@videos/${file}`
  const resourcePath = resolveAsset(path.join(root, 'src', 'docs'), request)
  assert.strictEqual(resourcePath, path.join(publicDirectory, file), `${request}: alias must resolve the prepared published file`)
  const matching = rules.filter(rule => rule.test && rule.test.test(resourcePath) &&
    (!rule.include || rule.include.some(directory => resourcePath.startsWith(directory + path.sep))) &&
    (!rule.exclude || !rule.exclude.some(exclude => typeof exclude === 'function' ? exclude(resourcePath) : exclude.test(resourcePath))))
  assert.strictEqual(matching.length, 1, `${request}: one dedicated loader must handle video assets without the default inline media loader`)
  const use = matching[0].use
  assert.strictEqual(use.length, 1, `${request}: Video assets must only use the file loader`)
  const data = fs.readFileSync(resourcePath)
  const emitted = []
  const assetCode = require(use[0].loader).call({
    resourcePath, rootContext: root, query: use[0].options,
    emitFile: (filename, bytes) => emitted.push({ filename, bytes })
  }, data)
  assert.deepStrictEqual(emitted.map(file => file.filename), [`videos/${file}`], `${request}: emitted filename must stay stable`)
  assert(emitted[0].bytes.equals(data), `${request}: emitted media must retain its original binary bytes`)
  assert(assetCode.length < 150 && !assetCode.includes('base64'), `${request}: generated JavaScript must contain only a short URL export`)
  const assetModule = { exports: null }
  new Function('module', assetCode)(assetModule)
  assert.strictEqual(assetModule.exports, `/bot-doc/videos/${file}`)
  videoUrls.set(request, assetModule.exports)
}
const explicit = `<VideoPlayer src="@videos/quote.mp4" poster="${quotePosterAlias}" title="Quote" />`
const custom = '<VideoPlayer src="@videos/quote.mp4" poster="@images/uf_form.png" title="Quote" />'
const withoutPoster = '<VideoPlayer src="@videos/quote.mp4" title="Quote" />'
const vuepressMarkdown = require('@vuepress/markdown')()
siteConfig.markdown.extendMarkdown(vuepressMarkdown)
const markdownTemplate = source => compiler.parseComponent(require('@vuepress/markdown-loader').call({
  target: 'node', query: { sourceDir: path.join(root, 'src'), markdown: vuepressMarkdown },
  resourcePath: path.join(root, 'src', 'docs', 'video-test.md'), resourceQuery: '',
  emitWarning: warning => { throw warning }
}, source)).template.content
const compiler = require('vue-template-compiler')
const { compileTemplate } = require('@vue/component-compiler-utils')
const assetUrl = `${BASE}videos/${quotePreview}`
const customUrl = `${BASE}assets/img/uf_form.test.png`
assert.strictEqual(siteConfig.themeConfig.videoPreviews[`${BASE}videos/quote.mp4`], assetUrl, 'The player fallback must use the selected prepared preview')
for (const [rule, template, expectedPoster] of [
  ['vue', explicit, assetUrl], ['markdown', markdownTemplate(explicit), assetUrl], ['markdown', markdownTemplate(aliasLink), assetUrl],
  ['vue', custom, customUrl], ['markdown', markdownTemplate(custom), customUrl],
  ['vue', withoutPoster, undefined], ['markdown', markdownTemplate(withoutPoster), undefined]
]) {
  const options = webpack.module.rule(rule).use('vue-loader').get('options')
  const compiled = compileTemplate({ source: template, filename: `video-test.${rule === 'vue' ? 'vue' : 'md'}`, compiler,
    transformAssetUrls: options.transformAssetUrls || true })
  assert.deepStrictEqual(compiled.errors, [], `${rule}: template must compile`)
  const render = new Function('require', `${compiled.code}; return render`)(request => {
    if (videoUrls.has(request)) return videoUrls.get(request)
    assert.strictEqual(request, '@images/uf_form.png', `${rule}: unexpected asset dependency`)
    return customUrl
  })
  const nodes = []
  render.call({ _self: {}, $parent: { slotKey: 'test' }, _v: text => text, $createElement: (tag, data) => { nodes.push({ tag, data }); return {} } })
  const props = nodes.find(node => node.tag === 'VideoPlayer').data.attrs
  assert.strictEqual(props.poster, expectedPoster, `${rule}: explicit posters must compile while a src-only component retains its default`)
  assert.strictEqual(props.src, '/bot-doc/videos/quote.mp4', `${rule}: the video alias must arrive at the player as its stable published URL`)
  assert.strictEqual(props.title, 'Quote')
}

for (const locale of ['ru', 'en']) {
  const table = '| A | B |\n| --- | --- |\n| Literal `tick | ![Form](@images/uf_form.png) |\n| Another `tick | end |'
  assert.strictEqual(transformOutsideFences(table, locale), table.replace('@images/uf_form.png', `${BASE}docs/00-img/uf_form.png`), 'Literal ticks in separate table cells or rows must not protect real images')
  const sameRow = '| A | B | C |\n| --- | --- | --- |\n| Literal `tick | ![Form](@images/uf_form.png) | Another `tick |'
  assert.strictEqual(transformOutsideFences(sameRow, locale), sameRow.replace('@images/uf_form.png', `${BASE}docs/00-img/uf_form.png`), 'Each table cell must have an independent inline context')
  const tableCode = '| Example | Image |\n| --- | --- |\n| `@images/example\\|name.png` | ![Form](@images/uf_form.png) |\n| `' + explicit + '` | end |'
  assert.strictEqual(transformOutsideFences(tableCode, locale), tableCode.replace('@images/uf_form.png', `${BASE}docs/00-img/uf_form.png`), 'Table code examples and escaped pipes must retain their original source')
  assert.strictEqual(transformOutsideFences(explicit, locale), '[Quote](/bot-doc/videos/quote.mp4)', 'Static component markup must export as an ordinary video link')
  const quotedTitle = explicit.replace('title="Quote"', 'title="Parameter `Quote`"')
  for (const [input, expected] of [
    [quotedTitle, '[Parameter `Quote`](/bot-doc/videos/quote.mp4)'],
    [`See ${quotedTitle} here.`, 'See [Parameter `Quote`](/bot-doc/videos/quote.mp4) here.']
  ]) {
    assert.strictEqual(transformOutsideFences(input, locale), expected, 'Backticks inside HTML attributes must not split static player markup')
  }
  assert.strictEqual(transformOutsideFences('<VideoPlayer\n  src="../00-video/quote.mp4"\n  poster="@videos/quote.preview.jpg"\n  title="A &amp; B" />', locale), '[A & B](/bot-doc/videos/quote.mp4)', 'Multiline static tags must export with decoded titles')
  assert.strictEqual(transformOutsideFences('<VideoPlayer src="/bot-doc/videos/quote.mp4" title="Quote @ home" />', locale), '[Quote @ home](/bot-doc/videos/quote.mp4)', 'Static title text must not be mistaken for dynamic attributes')
  const fenced = '````md\n' + explicit + '\n```\n' + explicit + '\n````'
  assert.strictEqual(transformOutsideFences(fenced, locale), fenced, 'A shorter fence must not expose examples to conversion')
  const inline = 'Example: `' + explicit + '`'
  assert.strictEqual(transformOutsideFences(inline, locale), inline, 'Inline-code examples must retain their component markup and alias')
  const imageAliasExample = '![Example `@images/example.png`](picture.png)'
  assert.strictEqual(transformOutsideFences(imageAliasExample, locale), imageAliasExample, 'Inline code in image labels must retain image aliases')
  const imagePlayerExample = '![Example `' + explicit + '`](picture.png)'
  assert.strictEqual(transformOutsideFences(imagePlayerExample, locale), imagePlayerExample, 'Inline code in image labels must retain player markup')
}

// Inline code is confined to its Markdown block; literal backticks cannot consume later prose.
for (const locale of ['ru', 'en']) {
  const paragraph = 'A stray `tick.\n\n![Form](@images/uf_form.png)\n\nA later `code`.'
  assert.strictEqual(transformOutsideFences(paragraph, locale), paragraph.replace('@images/uf_form.png', `${BASE}docs/00-img/uf_form.png`), 'Unmatched backticks must not protect prose across paragraph boundaries')
  const heading = 'A stray `tick.\n## Heading\n![Form](@images/uf_form.png)\n\nA later `code`.'
  assert.strictEqual(transformOutsideFences(heading, locale), heading.replace('@images/uf_form.png', `${BASE}docs/00-img/uf_form.png`), 'Headings also terminate the inline context')
  const escaped = 'A literal \\`tick and ' + explicit + ' followed by `code`.'
  assert.strictEqual(transformOutsideFences(escaped, locale), escaped.replace(explicit, '[Quote](/bot-doc/videos/quote.mp4)'), 'Escaped literal backticks must not begin code spans')
  const multiline = 'Example: `' + explicit + '\ncontinued`\n\n![Form](@images/uf_form.png)'
  assert.strictEqual(transformOutsideFences(multiline, locale), multiline.replace('@images/uf_form.png', `${BASE}docs/00-img/uf_form.png`), 'Real code spans may cross a soft line break within one paragraph')
  const indented = '- Example\n\n    `@images/example.png\n\tcontinued` and ![Form](@images/uf_form.png)'
  assert.strictEqual(transformOutsideFences(indented, locale), indented.replace('@images/uf_form.png', `${BASE}docs/00-img/uf_form.png`), 'Code crossing partially expanded list indentation must retain its source')
  const html = 'An <a href="@images/form.png" title="A `tick`">image</a> and <Anchor :ids="[\'example\']" />.'
  assert.strictEqual(transformOutsideFences(html, locale), 'An <a href="/bot-doc/docs/00-img/form.png" title="A `tick`">image</a> and <a id="example"></a>.', 'Normal HTML aliases and anchors must still transform when attributes contain ticks')
}

if (process.argv.includes('--unit')) {
  console.log('Documentation video integration unit checks passed')
  process.exit(0)
}

function filesBelow (directory, extension) {
  return fs.readdirSync(directory).flatMap(name => {
    const file = path.join(directory, name)
    return fs.statSync(file).isDirectory() ? filesBelow(file, extension) : file.endsWith(extension) ? [file] : []
  })
}

const html = filesBelow(output, '.html').map(file => fs.readFileSync(file, 'utf8')).join('\n')
const twins = filesBelow(output, '.md').map(file => fs.readFileSync(file, 'utf8')).join('\n')
const full = ['llms-full.txt', 'en/llms-full.txt'].map(file => fs.readFileSync(path.join(output, file), 'utf8')).join('\n')
const mediaSource = path.join(root, 'assets', '00-video')
const videos = fs.readdirSync(mediaSource).filter(file => VIDEO_FILE.test(file)).sort()
assert(videos.length > 0, 'Documentation must publish its source video assets')
for (const file of videos) {
  const data = fs.readFileSync(path.join(mediaSource, file))
  assert(data.length > 0 && data.length < 100000000, `${file}: video must be nonempty and smaller than 100 MB`)
  assert(fs.readFileSync(path.join(output, 'videos', file)).equals(data), `${file}: published video bytes differ`)
  const selected = previewFile(file, mediaSource)
  const published = fs.readFileSync(path.join(output, 'videos', selected))
  const provided = path.join(mediaSource, selected)
  if (fs.existsSync(provided)) {
    assert(published.equals(fs.readFileSync(provided)), `${file}: supplied preview bytes differ`)
  } else {
    assert(published.length > 4 && published[0] === 0xff && published[1] === 0xd8 && published[published.length - 2] === 0xff && published[published.length - 1] === 0xd9, `${file}: generated preview must be a complete JPEG`)
  }

  if (/\.mp4$/i.test(file)) {
    const boxes = []
    for (let offset = 0; offset < data.length;) {
      let size = data.readUInt32BE(offset)
      let header = 8
      if (size === 1) {
        size = Number(data.readBigUInt64BE(offset + 8))
        header = 16
      }
      if (size === 0) size = data.length - offset
      assert(size >= header && offset + size <= data.length, `${file}: invalid MP4 box`)
      boxes.push(data.toString('ascii', offset + 4, offset + 8))
      offset += size
    }
    assert(boxes.includes('moov') && boxes.includes('mdat'), `${file}: missing MP4 metadata or media`)
  }
}

const players = Array.from(html.matchAll(/<video\b[^>]*>/g), match => match[0])
const sourceMarkdown = new MarkdownIt()
for (const locale of ['ru', 'en']) {
  for (const sourceFile of filesBelow(path.join(root, 'assets', locale), '.md')) {
    const tokens = sourceMarkdown.parse(fs.readFileSync(sourceFile, 'utf8'), {})
    const links = tokens.filter((token, index) => token.type === 'inline' && tokens[index - 1].type === 'paragraph_open' && tokens[index + 1].type === 'paragraph_close' && token.children.length === 3 && token.children[0].type === 'link_open' && token.children[1].type === 'text' && token.children[2].type === 'link_close')
    for (const token of links) {
      const sitePath = videoDestination(token.children[0].attrGet('href') || '', BASE)
      if (!sitePath) continue
      const file = sitePath.slice(`${BASE}videos/`.length)
      assert(videos.includes(file), `${sourceFile}: referenced video is missing: ${file}`)
      const player = players.find(tag => tag.includes(`src="${sitePath}"`))
      assert(player, `${sourceFile}: standalone link must produce a player for ${file}`)
      assert(player.includes(`poster="${BASE}videos/${previewFile(file, publicDirectory)}"`), `${file}: player must use the selected co-located preview`)
      assert(/\bcontrols(?:="controls")?/.test(player), `${file}: server output must retain native controls without JavaScript`)
      assert(html.includes(`href="${sitePath}"`), `${file}: missing direct fallback link`)
      const title = token.children[1].content
      assert(twins.includes(`[${title}](${sitePath})`), `${file}: missing ordinary Markdown video link`)
      assert(full.includes(`[${title}](${sitePath})`), `${file}: missing full-document video link`)
    }
  }
}

console.log('Documentation video checks passed: discovered assets, reusable players, selected previews and Markdown links')
