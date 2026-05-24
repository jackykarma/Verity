import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { decodeUserComment, extractExifFields, extractUserCommentField } from '../ExifExtractor.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const assetsRoot = join(__dirname, '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg')

/**
 * @vitest-environment node
 */
describe('ExifExtractor', () => {
  it('decodeUserComment handles ASCII charset prefix', () => {
    const bytes = new Uint8Array([
      ...'ASCII\0\0\0'.split('').map((c) => c.charCodeAt(0)),
      ...'Hello OPPO'.split('').map((c) => c.charCodeAt(0)),
    ])
    expect(decodeUserComment(bytes)).toBe('Hello OPPO')
  })

  it('decodeUserComment handles UNICODE charset prefix', () => {
    const header = new TextEncoder().encode('UNICODE\0')
    const body = new Uint8Array([0x00, 0x4e, 0x00, 0x69])
    const bytes = new Uint8Array(header.length + body.length)
    bytes.set(header, 0)
    bytes.set(body, header.length)
    expect(decodeUserComment(bytes)).toBe('Ni')
  })

  it('includes ImageDescription from IFD0 on long description sample', async () => {
    const file = readFileSync(join(assetsRoot, 'S-JPEG-15_long_description.jpg'))
    const fields = await extractExifFields(file.buffer, file.buffer)
    expect(fields.some((f) => f.key.includes('ImageDescription'))).toBe(true)
  })

  it('parses EXIF with IFD group prefixes', async () => {
    const file = readFileSync(join(assetsRoot, 'S-JPEG-01_Canon_40D_EXIF.jpg'))
    const fields = await extractExifFields(file.buffer, file.buffer)
    expect(fields.some((f) => f.key.startsWith('IFD0 ·'))).toBe(true)
    expect(fields.some((f) => f.key.startsWith('ExifIFD ·'))).toBe(true)
  })

  it('extracts UserComment from exifr userComment block', () => {
    const bytes = new Uint8Array([
      ...'ASCII\0\0\0'.split('').map((c) => c.charCodeAt(0)),
      ...'OPPO test comment'.split('').map((c) => c.charCodeAt(0)),
    ])
    const field = extractUserCommentField({ userComment: bytes })
    expect(field?.key).toBe('ExifIFD · UserComment')
    expect(field?.value).toBe('OPPO test comment')
  })

  it('lists EXIF fields in IFD directory byte order', async () => {
    const file = readFileSync(join(assetsRoot, 'S-JPEG-01_Canon_40D_EXIF.jpg'))
    const fields = await extractExifFields(file.buffer, file.buffer)
    const keys = fields.map((f) => f.key)

    const makeIdx = keys.indexOf('IFD0 · Make')
    const modelIdx = keys.indexOf('IFD0 · Model')
    const isoIdx = keys.indexOf('ExifIFD · ISO')
    const focalIdx = keys.indexOf('ExifIFD · FocalLength')
    const focalPlaneIdx = keys.indexOf('ExifIFD · FocalPlaneXResolution')

    expect(makeIdx).toBeGreaterThanOrEqual(0)
    expect(modelIdx).toBeGreaterThan(makeIdx)
    expect(isoIdx).toBeGreaterThan(modelIdx)
    expect(focalIdx).toBeGreaterThan(isoIdx)
    expect(focalPlaneIdx).toBeGreaterThan(focalIdx)
  })
})
