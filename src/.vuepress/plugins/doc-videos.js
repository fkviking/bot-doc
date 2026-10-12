const { VIDEO_FILE, previewFile } = require('../../../scripts/video-assets')

/** Render a standalone Markdown video link as the shared player. */
function videoDestination (destination, base) {
  const match = destination.match(/^(?:@videos\/|\.\.\/00-video\/)([^/]+)$/i)
  return match && VIDEO_FILE.test(match[1]) ? `${base}videos/${match[1]}` : null
}

function docVideos (md, { base }) {
  md.core.ruler.push('doc_videos', state => {
    for (let index = 0; index < state.tokens.length - 2; index++) {
      const [open, inline, close] = state.tokens.slice(index, index + 3)
      if (open.type !== 'paragraph_open' || inline.type !== 'inline' || close.type !== 'paragraph_close') continue

      const children = inline.children
      if (children.length !== 3 || children[0].type !== 'link_open' || children[1].type !== 'text' || children[2].type !== 'link_close') continue

      const href = children[0].attrGet('href') || ''
      const destination = videoDestination(href, base)
      if (!destination) continue

      const src = md.utils.escapeHtml(href.startsWith('@videos/') ? href : destination)
      const poster = md.utils.escapeHtml(`@videos/${previewFile(destination.split('/').pop())}`)
      const title = md.utils.escapeHtml(children[1].content)
      const player = new state.Token('html_block', '', 0)
      player.block = true
      player.map = open.map
      player.content = `<VideoPlayer src="${src}" poster="${poster}" title="${title}" />\n`
      state.tokens.splice(index, 3, player)
    }
  })
}

module.exports = docVideos
module.exports.videoDestination = videoDestination
