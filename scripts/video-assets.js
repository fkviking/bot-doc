const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const VIDEO_FILE = /^[a-z0-9][a-z0-9_-]*\.(mp4|webm|ogv)$/i
const PREVIEW_EXTENSIONS = ['jpg', 'jpeg', 'webp', 'png']
const sourceDirectory = path.join(__dirname, '..', 'assets', '00-video')
const publicDirectory = path.join(__dirname, '..', 'src', '.vuepress', 'public', 'videos')

function previewFile (video, directory = publicDirectory) {
  const stem = video.replace(/\.[^.]+$/, '')
  const files = fs.existsSync(directory) ? fs.readdirSync(directory) : []
  for (const extension of PREVIEW_EXTENSIONS) {
    const name = files.filter(file => file.toLowerCase() === `${stem}.preview.${extension}`.toLowerCase()).sort()[0]
    if (name && fs.statSync(path.join(directory, name)).isFile()) return name
  }
  return `${stem}.preview.jpg`
}

function runTool (binary, args, video) {
  const result = spawnSync(binary, args, { encoding: 'utf8', maxBuffer: 1024 * 1024 })
  if (result.error && result.error.code === 'ENOENT') {
    throw new Error(`${video}: automatic preview requires ${binary}; install FFmpeg (including ffprobe) or provide a .preview image`)
  }
  if (result.error || result.status !== 0) {
    throw new Error(`${video}: preview generation failed (${binary}): ${result.error ? result.error.message : result.stderr.trim()}`)
  }
  return result.stdout
}

function generatePreview (video, destination, { ffmpeg = 'ffmpeg', ffprobe = 'ffprobe' } = {}) {
  try {
    const metadata = JSON.parse(runTool(ffprobe, ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', video], video))
    const stream = metadata.streams.find(stream => stream.codec_type === 'video')
    const duration = Number(metadata.format.duration || (stream && stream.duration))
    if (!stream || !Number.isFinite(duration) || duration <= 0) throw new Error(`${video}: cannot generate a preview without a valid video stream and duration`)
    // Sample later frames and select a representative frame; cap preview width at 1280 px.
    const seek = Math.min(10, duration / 4)
    runTool(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-xerror', '-y', '-ss', String(seek), '-i', video,
      '-t', '3', '-frames:v', '1', '-vf', 'thumbnail=30,scale=min(1280\\,iw):-2', '-q:v', '2', destination], video)
    if (!fs.existsSync(destination) || fs.statSync(destination).size === 0) throw new Error(`${video}: FFmpeg did not produce a preview image`)
  } catch (error) {
    fs.rmSync(destination, { force: true })
    throw error
  }
}

function prepareVideoAssets (source = sourceDirectory, output = publicDirectory, tools) {
  fs.rmSync(output, { recursive: true, force: true })
  fs.mkdirSync(output, { recursive: true })
  const files = fs.readdirSync(source).filter(file => VIDEO_FILE.test(file)).sort()
  for (const file of files) {
    const video = path.join(source, file)
    const size = fs.statSync(video).size
    if (size === 0 || size >= 100000000) throw new Error(`${video}: video must be nonempty and smaller than 100 MB`)
    const preview = previewFile(file, source)
    const provided = path.join(source, preview)
    const published = path.join(output, preview)
    if (fs.existsSync(provided)) {
      if (fs.statSync(provided).size === 0) throw new Error(`${provided}: preview image must be nonempty`)
      fs.copyFileSync(provided, published)
    } else {
      generatePreview(video, published, tools)
    }
    fs.copyFileSync(video, path.join(output, file))
    // Keep all provided variants addressable by an explicit @videos poster.
    const stem = file.replace(/\.[^.]+$/, '')
    for (const image of fs.readdirSync(source).filter(name => PREVIEW_EXTENSIONS.some(extension => name.toLowerCase() === `${stem}.preview.${extension}`.toLowerCase()))) {
      if (fs.statSync(path.join(source, image)).size === 0) throw new Error(`${image}: preview image must be nonempty`)
      fs.copyFileSync(path.join(source, image), path.join(output, image))
    }
  }
  return files
}

function videoPreviews (base, directory = publicDirectory) {
  const previews = {}
  if (!fs.existsSync(directory)) return previews
  for (const file of fs.readdirSync(directory).filter(file => VIDEO_FILE.test(file)).sort()) {
    previews[`${base}videos/${file}`] = `${base}videos/${previewFile(file, directory)}`
  }
  return previews
}

module.exports = { VIDEO_FILE, PREVIEW_EXTENSIONS, previewFile, prepareVideoAssets, videoPreviews, publicDirectory }
