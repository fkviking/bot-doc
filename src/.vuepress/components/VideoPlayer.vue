<template>
  <div ref="player" class="doc-video-player" :class="{ 'is-fullscreen': isFullscreen }">
    <div class="video-picture">
      <video ref="video" :src="src" :poster="effectivePoster || undefined" :controls="!enhanced"
        preload="none" playsinline :aria-label="title" :tabindex="enhanced ? 0 : undefined"
        @click="enhanced && togglePlayback()" @keydown="onVideoKeydown"
        @play="syncPlayback" @pause="syncPlayback" @ended="syncPlayback"
        @playing="onPlaying" @error="onError"
        @loadedmetadata="syncProgress" @durationchange="syncProgress" @timeupdate="syncProgress"
        @volumechange="syncVolume" @webkitbeginfullscreen="isFullscreen = true"
        @webkitendfullscreen="isFullscreen = false">
        <a :href="src">{{ labels.open }}</a>
      </video>
      <button v-if="enhanced && paused" class="center-play" type="button"
        :aria-label="labels.play" @click="togglePlayback">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path :d="playPath" /></svg>
      </button>
      <div v-if="error || notice" class="video-status" role="status" aria-live="polite">
        <span>{{ error || notice }}</span>
        <a v-if="error" :href="src">{{ labels.open }}</a>
      </div>
    </div>
    <div v-if="!hasStarted || paused" class="video-branding"
      :class="{ 'video-preview': hasStarted, 'video-intro': !hasStarted }" data-video-preview>
      <img :src="logo" alt="Viking" class="video-logo">
      <span class="video-title">{{ title }}</span>
    </div>
    <div v-show="enhanced && hasStarted" class="video-controls" :aria-label="labels.controls">
      <input class="video-seek" type="range" min="0" max="100" step="0.1"
        :value="progress" :disabled="!canSeek" :aria-label="labels.seek"
        :aria-valuetext="currentTimeText + ' / ' + durationText"
        :style="{ '--progress': progress + '%' }" @input="seek">
      <div class="control-row">
        <button class="icon-button" type="button" :aria-label="paused ? labels.play : labels.pause" @click="togglePlayback">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path v-if="paused" :d="playPath" class="play-glyph" />
            <path v-else d="M8 5v14M16 5v14" />
          </svg>
        </button>
        <div ref="volumeWrap" class="volume-wrap">
          <button ref="volumeButton" class="icon-button" type="button" :aria-label="labels.volume"
            :aria-expanded="volumeOpen ? 'true' : 'false'" @click="toggleVolume">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M11 4 6 8H3v8h3l5 4Z" />
              <path v-if="volumePercent" d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" />
              <path v-else d="m16 9 6 6M22 9l-6 6" />
            </svg>
          </button>
          <div v-show="volumeOpen" class="volume-panel">
            <label>
              <span class="volume-heading"><span>{{ labels.volume }}</span><span>{{ volumePercent }}%</span></span>
              <input ref="volumeInput" type="range" min="0" max="1" step="0.01"
                :value="muted ? 0 : volume" :aria-label="labels.volume" @input="changeVolume">
            </label>
          </div>
        </div>
        <span class="video-time" aria-hidden="true">{{ currentTimeText }} <span>/ {{ durationText }}</span></span>
        <button class="icon-button fullscreen-button" type="button"
          :aria-label="isFullscreen ? labels.exitFullscreen : labels.fullscreen" @click="toggleFullscreen">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path v-if="isFullscreen" d="M3 8h5V3M16 3v5h5M21 16h-5v5M8 21v-5H3" />
            <path v-else d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    src: { type: String, required: true },
    poster: { type: String, default: '' },
    title: { type: String, default: '' }
  },
  data () {
    return {
      enhanced: false,
      paused: true,
      hasStarted: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      muted: false,
      volumeOpen: false,
      error: '',
      notice: '',
      isFullscreen: false,
      // Both play buttons use a triangle whose bounding box is centered at 12,12.
      playPath: 'M6 4 18 12 6 20Z'
    }
  },
  computed: {
    effectivePoster () {
      if (this.poster) return this.poster
      const previews = this.$themeConfig && this.$themeConfig.videoPreviews
      return (previews && previews[this.src]) || ''
    },
    labels () {
      const english = (this.$lang || '').startsWith('en') || (this.$route && this.$route.path.startsWith('/en/'))
      return english ? {
        play: 'Play video', pause: 'Pause', volume: 'Volume', seek: 'Seek video',
        fullscreen: 'Fullscreen', exitFullscreen: 'Exit fullscreen', controls: 'Video controls',
        failed: 'Could not play the video. Try again or open the file.',
        fullscreenFailed: 'Fullscreen is unavailable in this browser.', open: 'Open video file'
      } : {
        play: 'Воспроизвести видео', pause: 'Пауза', volume: 'Громкость', seek: 'Позиция видео',
        fullscreen: 'Полный экран', exitFullscreen: 'Выйти из полноэкранного режима', controls: 'Управление видео',
        failed: 'Не удалось воспроизвести видео. Попробуйте снова или откройте файл.',
        fullscreenFailed: 'Полноэкранный режим недоступен в этом браузере.', open: 'Открыть видеофайл'
      }
    },
    logo () {
      const asset = (this.$themeConfig && this.$themeConfig.logo) || '/images/vkg_logo_en.svg'
      return this.$withBase ? this.$withBase(asset) : asset
    },
    canSeek () { return Number.isFinite(this.duration) && this.duration > 0 },
    progress () { return this.canSeek ? Math.min(100, Math.max(0, this.currentTime / this.duration * 100)) : 0 },
    currentTimeText () { return this.formatTime(this.currentTime) },
    durationText () { return this.formatTime(this.duration) },
    volumePercent () { return Math.round((this.muted ? 0 : this.volume) * 100) }
  },
  methods: {
    formatTime (seconds) {
      const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0
      return Math.floor(value / 60) + ':' + String(value % 60).padStart(2, '0')
    },
    syncPlayback () {
      const video = this.$refs.video
      if (!video) return
      this.paused = video.paused || video.ended
      this.syncProgress()
    },
    syncProgress () {
      const video = this.$refs.video
      if (!video) return
      this.duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0
      this.currentTime = Number.isFinite(video.currentTime) ? Math.max(0, video.currentTime) : 0
    },
    onPlaying () {
      this.hasStarted = true
      this.error = ''
      this.notice = ''
      this.syncPlayback()
    },
    onError () { this.error = this.labels.failed; this.syncPlayback() },
    async togglePlayback () {
      const video = this.$refs.video
      if (!video) return
      if (!video.paused && !video.ended) { video.pause(); return }
      const source = this.src
      const retry = Boolean(this.error)
      this.error = ''
      try {
        if (retry && video.error) video.load()
        await video.play()
      } catch (error) {
        if (this._isDestroyed || this._isBeingDestroyed || this.src !== source) return
        this.error = this.labels.failed
        this.syncPlayback()
      }
    },
    seek (event) {
      if (!this.canSeek || !this.$refs.video) return
      const fraction = Number(event.target.value)
      if (!Number.isFinite(fraction)) return
      try {
        this.$refs.video.currentTime = this.duration * Math.min(100, Math.max(0, fraction)) / 100
        this.syncProgress()
      } catch (error) { this.onError() }
    },
    syncVolume () {
      const video = this.$refs.video
      if (!video) return
      this.volume = Number.isFinite(video.volume) ? Math.min(1, Math.max(0, video.volume)) : 1
      this.muted = video.muted
    },
    changeVolume (event) {
      const video = this.$refs.video
      const amount = Number(event.target.value)
      if (!video || !Number.isFinite(amount)) return
      video.volume = Math.min(1, Math.max(0, amount))
      video.muted = video.volume === 0
      this.syncVolume()
    },
    toggleVolume () {
      this.volumeOpen = !this.volumeOpen
      if (this.volumeOpen) this.$nextTick(() => { if (this.$refs.volumeInput) this.$refs.volumeInput.focus() })
    },
    closeVolume (restoreFocus = false) {
      this.volumeOpen = false
      if (restoreFocus && this.$refs.volumeButton) this.$refs.volumeButton.focus()
    },
    onDocumentClick (event) {
      if (this.volumeOpen && this.$refs.volumeWrap && !this.$refs.volumeWrap.contains(event.target)) this.closeVolume()
    },
    onDocumentKeydown (event) {
      if (event.key === 'Escape' && this.volumeOpen) { event.preventDefault(); this.closeVolume(true) }
    },
    onVideoKeydown (event) {
      if (!this.enhanced) return
      if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); this.togglePlayback() }
      else if ((event.key === 'ArrowLeft' || event.key === 'ArrowRight') && this.canSeek) {
        event.preventDefault()
        const seconds = this.currentTime + (event.key === 'ArrowLeft' ? -5 : 5)
        this.seek({ target: { value: seconds / this.duration * 100 } })
      }
    },
    syncFullscreen () {
      this.isFullscreen = (document.fullscreenElement || document.webkitFullscreenElement) === this.$refs.player
    },
    async toggleFullscreen () {
      const player = this.$refs.player
      const video = this.$refs.video
      if (!player || !video) return
      this.closeVolume()
      this.notice = ''
      try {
        const active = document.fullscreenElement || document.webkitFullscreenElement
        if (active === player) {
          const exit = document.exitFullscreen || document.webkitExitFullscreen
          if (exit) await exit.call(document)
        } else if (video.webkitDisplayingFullscreen && video.webkitExitFullscreen) video.webkitExitFullscreen()
        else {
          const request = player.requestFullscreen || player.webkitRequestFullscreen
          if (request) await request.call(player)
          else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen()
          else throw new Error('Fullscreen unavailable')
        }
      } catch (error) { this.notice = this.labels.fullscreenFailed }
    },
    resetSource () {
      if (this.$refs.video) this.$refs.video.pause()
      this.paused = true
      this.hasStarted = false
      this.currentTime = 0
      this.duration = 0
      this.error = ''
      this.notice = ''
      this.closeVolume()
      this.$nextTick(() => { if (!this._isDestroyed && !this._isBeingDestroyed && this.$refs.video) this.$refs.video.load() })
    }
  },
  watch: { src () { this.resetSource() } },
  mounted () {
    this.enhanced = true
    this.syncPlayback()
    this.syncVolume()
    document.addEventListener('click', this.onDocumentClick)
    document.addEventListener('keydown', this.onDocumentKeydown)
    document.addEventListener('fullscreenchange', this.syncFullscreen)
    document.addEventListener('webkitfullscreenchange', this.syncFullscreen)
  },
  beforeDestroy () {
    if (typeof document !== 'undefined') {
      document.removeEventListener('click', this.onDocumentClick)
      document.removeEventListener('keydown', this.onDocumentKeydown)
      document.removeEventListener('fullscreenchange', this.syncFullscreen)
      document.removeEventListener('webkitfullscreenchange', this.syncFullscreen)
    }
    const video = this.$refs.video
    if (video) { video.pause(); video.removeAttribute('src'); video.load() }
  }
}
</script>

<style scoped>
.doc-video-player { --video-accent: #d01c55; box-sizing: border-box; position: relative; margin: 1.5rem 0; border: 1px solid #e4e4e4; border-radius: 8px; overflow: hidden; background: #fff; color: #2c3e50; isolation: isolate; }
.doc-video-player * { box-sizing: border-box; }
.video-picture { position: relative; aspect-ratio: 16 / 9; background: #111; }
.video-picture video { display: block; width: 100%; height: 100%; object-fit: contain; }
.video-branding { display: flex; align-items: center; gap: 12px; background: #fff; color: #2c3e50; }
.video-preview { position: absolute; top: 14px; left: 14px; right: 14px; width: fit-content; max-width: calc(100% - 28px); padding: 9px 12px; border-radius: 4px; pointer-events: none; }
.video-intro { padding: 12px 16px; border-top: 1px solid #eaecef; flex-shrink: 0; }
.video-logo { display: block; flex: 0 0 80px; width: 80px; height: auto; margin: 0; }
.video-title { min-width: 0; font-size: 14px; line-height: 1.4; font-weight: 600; overflow-wrap: anywhere; }
.doc-video-player button, .doc-video-player input { font: inherit; -webkit-tap-highlight-color: transparent; }
.doc-video-player button { cursor: pointer; }
.doc-video-player button:focus-visible, .doc-video-player input:focus-visible, .video-picture video:focus-visible, .video-status a:focus-visible { outline: 3px solid var(--video-accent); outline-offset: -3px; }
.doc-video-player svg { display: block; width: 21px; height: 21px; margin: 0; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.center-play { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 64px; height: 64px; border: 0; border-radius: 50%; display: grid; place-items: center; padding: 0; background: var(--video-accent); color: #fff; }
.center-play svg { width: 27px; height: 27px; fill: currentColor; stroke: none; }
.center-play:hover { background: #b81849; }
.doc-video-player .center-play:focus-visible { outline: 3px solid #fff; outline-offset: -5px; }
.play-glyph { fill: currentColor; stroke: none; }
.video-status { position: absolute; left: 14px; right: 14px; bottom: 14px; width: fit-content; max-width: calc(100% - 28px); padding: 9px 12px; border-radius: 4px; background: rgba(20, 24, 28, .92); color: #fff; font-size: 13px; line-height: 1.5; }
.video-status a { display: block; color: #fff; text-decoration: underline; text-underline-offset: 3px; border: 0; }
.video-controls { position: relative; padding: 0 12px 8px; background: #fff; border-top: 1px solid #eaecef; }
.video-seek { display: block; width: 100%; height: 20px; margin: -10px 0 2px; cursor: pointer; background: transparent; appearance: none; -webkit-appearance: none; }
.video-seek::-webkit-slider-runnable-track { height: 3px; border-radius: 4px; background: linear-gradient(to right, var(--video-accent) 0 var(--progress), #d9dfe4 var(--progress) 100%); }
.video-seek::-moz-range-track { height: 3px; border-radius: 4px; background: linear-gradient(to right, var(--video-accent) 0 var(--progress), #d9dfe4 var(--progress) 100%); }
.video-seek::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; height: 11px; width: 11px; margin-top: -4px; border-radius: 50%; background: var(--video-accent); border: 0; }
.video-seek::-moz-range-thumb { height: 11px; width: 11px; border-radius: 50%; background: var(--video-accent); border: 0; }
.video-seek:disabled { cursor: default; opacity: .5; }
.control-row { display: flex; align-items: center; min-height: 44px; gap: 2px; }
.icon-button { display: grid; place-items: center; flex: 0 0 44px; width: 44px; height: 44px; border: 0; padding: 0; background: transparent; color: inherit; border-radius: 4px; }
.icon-button:hover { background: #f3f4f5; }
.video-time { font-size: 12px; line-height: 1.5; font-variant-numeric: tabular-nums; margin-left: 6px; white-space: nowrap; }
.video-time span { color: #52616e; }
.fullscreen-button { margin-left: auto; }
.volume-wrap { position: relative; flex: 0 0 44px; }
.volume-panel { position: absolute; left: 0; bottom: 52px; z-index: 3; width: 176px; background: #fff; color: #2c3e50; padding: 12px 14px; border: 1px solid #d9dfe4; border-radius: 6px; }
.volume-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; font-size: 12px; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
.volume-panel input { display: block; width: 100%; height: 24px; margin: 0; accent-color: var(--video-accent); cursor: pointer; }
.doc-video-player:fullscreen, .doc-video-player.is-fullscreen { width: 100%; height: 100%; margin: 0; border: 0; border-radius: 0; display: flex; flex-direction: column; background: #111; }
.doc-video-player:fullscreen .video-picture, .doc-video-player.is-fullscreen .video-picture { aspect-ratio: auto; flex: 1; min-height: 0; width: 100%; }
.doc-video-player:fullscreen .video-controls, .doc-video-player.is-fullscreen .video-controls { flex-shrink: 0; }
.doc-video-player::-webkit-full-screen { width: 100%; height: 100%; margin: 0; border: 0; display: flex; flex-direction: column; }
@media (max-width: 480px) {
  .video-branding { gap: 9px; }
  .video-preview { top: 10px; left: 10px; right: 10px; max-width: calc(100% - 20px); padding: 7px 9px; }
  .video-intro { padding: 10px 12px; }
  .video-logo { flex-basis: 64px; width: 64px; }
  .video-title { font-size: 13px; }
  .video-controls { padding: 0 8px 4px; }
  .center-play { width: 56px; height: 56px; }
  .center-play svg { width: 24px; height: 24px; }
  .video-time { font-size: 11px; margin-left: 3px; }
  .video-status { left: 10px; right: 10px; bottom: 10px; max-width: calc(100% - 20px); font-size: 12px; }
}
</style>
