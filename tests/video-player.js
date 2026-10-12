const assert = require('assert')
const fs = require('fs')
const path = require('path')
const vm = require('vm')
const Vue = require('vue')
const compiler = require('vue-template-compiler')

const file = path.join(__dirname, '..', 'src', '.vuepress', 'components', 'VideoPlayer.vue')
const source = compiler.parseComponent(fs.readFileSync(file, 'utf8'))
const listeners = new Map()
const document = {
  fullscreenElement: null,
  addEventListener (name, handler) {
    if (!listeners.has(name)) listeners.set(name, new Set())
    listeners.get(name).add(handler)
  },
  removeEventListener (name, handler) {
    const handlers = listeners.get(name)
    if (handlers) {
      handlers.delete(handler)
      if (!handlers.size) listeners.delete(name)
    }
  }
}
const context = { module: { exports: {} }, document }
vm.runInNewContext(source.script.content.replace('export default', 'module.exports ='), context)
const compiled = compiler.compile(source.template.content)
assert.deepStrictEqual(compiled.errors, [], 'VideoPlayer template must compile')
const options = { ...context.module.exports, ...compiler.compileToFunctions(source.template.content) }

function player (src = '/bot-doc/videos/quote.mp4') {
  const instance = new Vue({ ...options, propsData: { src, poster: '/quote.jpg', title: 'Quote' } })
  instance.$refs.video = {
    paused: true, ended: false, currentTime: 0, duration: NaN, volume: 1, muted: false,
    pause () { this.paused = true },
    play () { return Promise.resolve() },
    load () { this.loaded = true },
    removeAttribute (name) { this.removedAttribute = name }
  }
  return instance
}

function find (node, predicate) {
  if (predicate(node)) return node
  for (const child of node.children || []) {
    const found = find(child, predicate)
    if (found) return found
  }
}

function emitMedia (instance, event) {
  if (event === 'play' || event === 'playing') instance.$refs.video.paused = false
  if (event === 'pause' || event === 'ended') instance.$refs.video.paused = true
  const video = find(instance._render(), node => node.tag === 'video')
  assert(video, 'The player must expose a real media element')
  const handler = video.data.on[event]
  if (handler) handler({ target: instance.$refs.video })
}

function previewShown (instance) {
  return Boolean(find(instance._render(), node => node.data && node.data.attrs && node.data.attrs['data-video-preview'] !== undefined))
}

function descriptionLocation (instance) {
  const description = find(instance._render(), node => node.data && node.data.attrs && node.data.attrs['data-video-preview'] !== undefined)
  if (!description) return null
  const classes = description.data.class || {}
  return classes['video-intro'] ? 'bottom' : 'top'
}

const automaticPoster = new Vue({ ...options, propsData: { src: '/bot-doc/videos/quote.mp4', title: 'Quote' } })
automaticPoster.$themeConfig = { videoPreviews: { '/bot-doc/videos/quote.mp4': '/bot-doc/videos/quote.preview.jpg' } }
assert.strictEqual(find(automaticPoster._render(), node => node.tag === 'video').data.attrs.poster,
  '/bot-doc/videos/quote.preview.jpg', 'A src-only component must show the prepared preview for its exact video URL')
automaticPoster.poster = '/custom.png'
assert.strictEqual(find(automaticPoster._render(), node => node.tag === 'video').data.attrs.poster, '/custom.png', 'An explicit poster must override the default')
automaticPoster.poster = ''
automaticPoster.src = 'https://example.com/quote.mp4'
assert.strictEqual(find(automaticPoster._render(), node => node.tag === 'video').data.attrs.poster, undefined, 'An external video must not receive a same-name local preview')
automaticPoster.src = '/bot-doc/videos/unknown.mp4'
assert.strictEqual(find(automaticPoster._render(), node => node.tag === 'video').data.attrs.poster, undefined, 'An unknown video must not receive a local preview')

const preview = player()
assert(find(preview._render(), node => node.tag === 'video').data.attrs.controls, 'Native controls work before enhancement')
assert.strictEqual(find(preview._render(), node => node.tag === 'video').data.attrs.preload, 'none', 'Initial rendering must defer the media download')
assert(previewShown(preview), 'The title preview is visible before playback')
assert.strictEqual(descriptionLocation(preview), 'bottom', 'The initial logo and title belong in the lower light panel')
emitMedia(preview, 'waiting')
assert(!find(preview._render(), node => node.data && node.data.staticClass === 'video-status'), 'Buffering must not show a loading popup')
emitMedia(preview, 'playing')
assert(!previewShown(preview), 'The title preview must disappear after successful playback begins')
emitMedia(preview, 'pause')
assert(previewShown(preview), 'Pausing must restore the logo and title preview')
assert.strictEqual(descriptionLocation(preview), 'top', 'Pausing after playback puts the logo and title over the picture')
emitMedia(preview, 'playing')
assert(!previewShown(preview), 'Resumed playback must hide the preview again')
emitMedia(preview, 'ended')
assert(previewShown(preview), 'Ended playback restores the preview')
assert.strictEqual(descriptionLocation(preview), 'top', 'The ended video keeps its logo and title over the picture')

const progress = player()
progress.enhanced = true
const seek = () => find(progress._render(), node => node.tag === 'input' && node.data.attrs['aria-label'] === progress.labels.seek)
assert(seek().data.attrs.disabled, 'Seeking is disabled before finite metadata exists')
emitMedia(progress, 'loadedmetadata')
assert.strictEqual(progress.progress, 0, 'Unknown duration must render zero progress')
assert.strictEqual(progress.durationText, '0:00', 'Unknown duration must render a finite time')
progress.$refs.video.duration = 80
progress.$refs.video.currentTime = 20
emitMedia(progress, 'loadedmetadata')
assert.strictEqual(progress.progress, 25, 'Twenty seconds of an eighty-second video is 25%')
seek().data.on.input({ target: { value: '75' } })
assert.strictEqual(progress.$refs.video.currentTime, 60, 'The seek control must change the media position')
progress.$refs.video.duration = Infinity
emitMedia(progress, 'durationchange')
seek().data.on.input({ target: { value: '50' } })
assert.strictEqual(progress.$refs.video.currentTime, 60, 'Invalid duration must not change the media position')
assert.strictEqual(progress.progress, 0, 'Infinite duration must not leak NaN into progress')

const volume = player()
volume.enhanced = true
const volumeInput = find(volume._render(), node => node.tag === 'input' && node.data.attrs['aria-label'] === volume.labels.volume)
volumeInput.data.on.input({ target: { value: '0' } })
assert.strictEqual(volume.$refs.video.volume, 0, 'The volume range changes media volume')
assert.strictEqual(volume.$refs.video.muted, true, 'A zero volume setting mutes the media')
emitMedia(volume, 'volumechange')
assert.strictEqual(volume.volumePercent, 0, 'The UI follows actual media volume')

const reset = player()
emitMedia(reset, 'playing')
options.watch.src.call(reset)
assert(previewShown(reset), 'A different video starts with its own preview')
assert.strictEqual(descriptionLocation(reset), 'bottom', 'Changing sources restores the initial description in the lower panel')
assert.strictEqual(reset.currentTime, 0, 'A different source must reset elapsed time')

const cleanup = player()
options.mounted.call(cleanup)
assert(listeners.size > 0, 'Mounted players listen for document fullscreen and dismissal events')
cleanup.$refs.video.paused = false
options.beforeDestroy.call(cleanup)
assert.strictEqual(listeners.size, 0, 'Destroying the player removes its document listeners')
assert.strictEqual(cleanup.$refs.video.paused, true, 'Leaving the page stops playback')
assert.strictEqual(cleanup.$refs.video.removedAttribute, 'src', 'Leaving the page releases the media source')
assert.strictEqual(cleanup.$refs.video.loaded, true, 'Leaving the page releases the media resource')

const first = player()
const second = player('/bot-doc/videos/k.mp4')
options.mounted.call(first)
options.mounted.call(second)
options.beforeDestroy.call(first)
second.volumeOpen = true
second.$refs.volumeWrap = { contains: () => false }
for (const listener of listeners.get('click')) listener({ target: {} })
assert.strictEqual(second.volumeOpen, false, 'Removing one player must leave another player\'s dismissal working')
options.beforeDestroy.call(second)
assert.strictEqual(listeners.size, 0, 'Each instance cleans up its own listeners')

async function checks () {
  const renderer = require('vue-server-renderer').createRenderer()
  async function controlsVisible (instance) {
    const rendered = await renderer.renderToString(instance)
    const panel = rendered.match(/<div\b[^>]*class="video-controls"[^>]*>/)
    assert(panel, 'The lower control panel stays in the rendered DOM')
    return !/style="[^"]*display:\s*none/.test(panel[0])
  }

  const initial = player()
  initial.enhanced = true
  assert.strictEqual(await controlsVisible(initial), false, 'The lower panel must be hidden before first playback')
  emitMedia(initial, 'play')
  assert.strictEqual(await controlsVisible(initial), false, 'An initial play request must wait for successful playback before exposing the panel')
  emitMedia(initial, 'playing')
  assert.strictEqual(await controlsVisible(initial), true, 'Successful playback reveals the lower panel')
  emitMedia(initial, 'pause')
  assert.strictEqual(await controlsVisible(initial), true, 'The lower panel remains visible when paused after playback')
  emitMedia(initial, 'ended')
  assert.strictEqual(await controlsVisible(initial), true, 'The lower panel remains visible after the video ends')
  options.watch.src.call(initial)
  assert.strictEqual(await controlsVisible(initial), false, 'Changing the video source returns the panel to its initial hidden state')

  const html = await renderer.renderToString(player())
  assert(/<video[^>]*controls="controls"/.test(html), 'Server rendering preserves native playback controls')
  assert.strictEqual(await controlsVisible(player()), false, 'Server rendering retains the inactive custom panel hidden in the DOM')

  const failed = player()
  failed.enhanced = true
  failed.$refs.video.play = () => Promise.reject(new Error('decode failed'))
  await failed.togglePlayback()
  assert(previewShown(failed), 'Rejected playback must keep the initial preview')
  assert.strictEqual(descriptionLocation(failed), 'bottom', 'Rejected initial playback keeps the description in the lower panel')
  assert(failed.error, 'Rejected playback must explain the failure')
  assert.strictEqual(await controlsVisible(failed), false, 'Failed first playback keeps the lower panel hidden')
  const fallback = find(failed._render(), node => node.tag === 'a' && node.data.attrs.href === failed.src)
  assert(fallback, 'Failed playback gives a direct link to the media')
  failed.$refs.video.play = () => Promise.resolve()
  const retry = find(failed._render(), node => node.tag === 'button' && node.data.staticClass === 'center-play')
  assert(retry, 'Failed first playback leaves the central Play button available for retry')
  await retry.data.on.click({})
  emitMedia(failed, 'playing')
  assert.strictEqual(failed.error, '', 'Successful recovery removes the playback error')
  assert(!previewShown(failed), 'Successful recovery hides the preview')

  const switched = player()
  let rejectPrevious
  switched.$refs.video.play = () => new Promise((resolve, reject) => { rejectPrevious = reject })
  const previousPlayback = switched.togglePlayback()
  switched.src = '/bot-doc/videos/k.mp4'
  options.watch.src.call(switched)
  rejectPrevious(new Error('Previous source was unloaded'))
  await previousPlayback
  assert.strictEqual(switched.error, '', 'A rejected play request for the old source must not spoil the new preview')

  const fullscreen = player()
  fullscreen.$refs.player = { requestFullscreen () { document.fullscreenElement = this; return Promise.resolve() } }
  await fullscreen.toggleFullscreen()
  fullscreen.syncFullscreen()
  assert.strictEqual(fullscreen.isFullscreen, true, 'Fullscreen follows the actual container state')
  document.exitFullscreen = () => { document.fullscreenElement = null; return Promise.resolve() }
  await fullscreen.toggleFullscreen()
  fullscreen.syncFullscreen()
  assert.strictEqual(fullscreen.isFullscreen, false, 'Exiting fullscreen restores the normal state')

  const unsupported = player()
  unsupported.enhanced = true
  unsupported.$refs.player = {}
  await unsupported.toggleFullscreen()
  assert.strictEqual(unsupported.error, '', 'Unavailable fullscreen must not turn usable playback into a media error')
  assert(unsupported.notice, 'Unavailable fullscreen gives a local notice')

  console.log('VideoPlayer behavior checks passed: preview, panel visibility, seeking, volume, recovery, fullscreen and cleanup')
}

checks().catch(error => { console.error(error); process.exitCode = 1 })
