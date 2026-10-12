const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')
const { prepareVideoAssets, previewFile, videoPreviews } = require('../scripts/video-assets')

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-video-assets-'))
const source = path.join(temporary, 'source')
const output = path.join(temporary, 'public')
fs.mkdirSync(source)
const cover = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a+9sAAAAASUVORK5CYII=', 'base64')

function command (binary, args, options = {}) {
  const result = spawnSync(binary, args, options)
  assert.strictEqual(result.status, 0, `${binary}: ${result.error || result.stderr}`)
  return result.stdout
}

try {
  // Provided covers bypass tools completely and keep every explicit variant addressable.
  fs.writeFileSync(path.join(source, 'manual.webm'), 'manual-video-fixture')
  fs.writeFileSync(path.join(source, 'manual.preview.png'), cover)
  fs.writeFileSync(path.join(source, 'manual.preview.webp'), cover)
  fs.writeFileSync(path.join(source, 'manual.preview.jpeg'), cover)
  fs.writeFileSync(path.join(source, 'manual.preview.jpg'), cover)
  assert.deepStrictEqual(prepareVideoAssets(source, output, { ffmpeg: 'missing-ffmpeg', ffprobe: 'missing-ffprobe' }), ['manual.webm'])
  for (const extension of ['jpg', 'jpeg', 'webp', 'png']) {
    assert(fs.readFileSync(path.join(output, `manual.preview.${extension}`)).equals(cover), 'A provided cover must retain its exact bytes')
  }
  assert.strictEqual(fs.readFileSync(path.join(output, 'manual.webm'), 'utf8'), 'manual-video-fixture', 'Video bytes must remain unchanged')
  assert.strictEqual(previewFile('manual.webm', output), 'manual.preview.jpg', 'JPG wins when multiple preview formats are present')
  fs.unlinkSync(path.join(output, 'manual.preview.jpg'))
  assert.strictEqual(previewFile('manual.webm', output), 'manual.preview.jpeg', 'JPEG is the next preferred preview format')
  fs.unlinkSync(path.join(output, 'manual.preview.jpeg'))
  assert.strictEqual(previewFile('manual.webm', output), 'manual.preview.webp', 'WebP precedes PNG')
  fs.unlinkSync(path.join(output, 'manual.preview.webp'))
  assert.strictEqual(previewFile('manual.webm', output), 'manual.preview.png')
  assert.deepStrictEqual(videoPreviews('/bot-doc/', output), { '/bot-doc/videos/manual.webm': '/bot-doc/videos/manual.preview.png' }, 'Default posters map exact published video URLs')

  fs.rmSync(source, { recursive: true })
  fs.mkdirSync(source)
  const fixture = path.join(source, 'later-frame.mp4')
  command('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=red:s=64x32:r=20:d=0.2',
    '-f', 'lavfi', '-i', 'color=blue:s=64x32:r=20:d=0.6', '-filter_complex', '[0:v][1:v]concat=n=2:v=1:a=0[v]',
    '-map', '[v]', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', fixture])
  const bytes = fs.readFileSync(fixture)
  prepareVideoAssets(source, output)
  const generated = path.join(output, 'later-frame.preview.jpg')
  assert(fs.statSync(generated).size > 0, 'A missing cover must produce a JPEG preview')
  assert(!fs.existsSync(path.join(source, 'later-frame.preview.jpg')), 'Automatic previews belong only in generated public assets')
  assert(fs.readFileSync(path.join(output, 'later-frame.mp4')).equals(bytes), 'Preview extraction must not alter the video')
  const pixel = command('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', generated, '-vf', 'scale=1:1', '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'])
  assert(pixel[2] > pixel[0] + 100, 'A short clip must use its later blue frames rather than its initial red frame')
  assert.deepStrictEqual(videoPreviews('/bot-doc/', output), { '/bot-doc/videos/later-frame.mp4': '/bot-doc/videos/later-frame.preview.jpg' })

  assert.throws(() => prepareVideoAssets(source, output, { ffprobe: 'missing-ffprobe' }), /automatic preview requires missing-ffprobe/, 'A missing probe must explain how to provide a manual cover')
  assert.throws(() => prepareVideoAssets(source, output, { ffmpeg: 'missing-ffmpeg' }), /automatic preview requires missing-ffmpeg/, 'A missing extractor must fail clearly')
  assert(!fs.existsSync(generated), 'Failed extraction must not leave a partial preview')
  fs.writeFileSync(fixture, 'invalid-media')
  assert.throws(() => prepareVideoAssets(source, output), /preview generation failed/, 'Invalid video input must stop preview generation')
  assert(!fs.existsSync(generated), 'Invalid media must not leave a corrupt preview')
  fs.writeFileSync(fixture, '')
  assert.throws(() => prepareVideoAssets(source, output), /nonempty and smaller than 100 MB/, 'Empty videos must fail before publication')
  fs.truncateSync(fixture, 100000000)
  assert.throws(() => prepareVideoAssets(source, output), /smaller than 100 MB/, 'The size limit must reject a 100 MB file')
} finally {
  fs.rmSync(temporary, { recursive: true, force: true })
}

console.log('Video asset checks passed: manual covers, deterministic selection, automatic later frames and clear failures')
