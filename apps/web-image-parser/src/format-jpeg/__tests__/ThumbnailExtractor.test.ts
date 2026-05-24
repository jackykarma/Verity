import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildThumbnailReadableFields,
  extractThumbnailInfo,
  findExifTiffStart,
} from '../ThumbnailExtractor.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const canonSample = join(
  __dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg/S-JPEG-01_Canon_40D_EXIF.jpg',
)

/**
 * @vitest-environment node
 */
describe('ThumbnailExtractor', () => {
  it('finds EXIF TIFF header in Canon sample', () => {
    const buf = new Uint8Array(readFileSync(canonSample))
    expect(findExifTiffStart(buf)).toBe(30)
  })

  it('extracts IFD1 thumbnail with correct file offset and JPEG bytes', async () => {
    const buffer = readFileSync(canonSample).buffer
    const info = await extractThumbnailInfo(buffer)

    expect(info).not.toBeNull()
    expect(info!.tiffOffset).toBe(1090)
    expect(info!.fileOffset).toBe(1120)
    expect(info!.length).toBe(1378)
    expect(info!.compression).toBe(6)
    expect(info!.compressionLabel).toBe('JPEG (old-style)')
    expect(info!.jpegBytes?.byteLength).toBe(1378)

    const bytes = new Uint8Array(info!.jpegBytes!)
    expect(bytes[0]).toBe(0xff)
    expect(bytes[1]).toBe(0xd8)
  })

  it('builds ExifTool-aligned thumbnail readable fields', async () => {
    const info = await extractThumbnailInfo(readFileSync(canonSample).buffer)
    const fields = buildThumbnailReadableFields(info!)
    const map = Object.fromEntries(fields.map((f) => [f.key, f.value]))

    expect(map.Compression).toBe('JPEG (old-style)')
    expect(map['JPEGInterchangeFormat (ThumbnailOffset)']).toContain('1090')
    expect(map['JPEGInterchangeFormat (ThumbnailOffset)']).toContain('0x460 (1120)')
    expect(map['JPEGInterchangeFormatLength (ThumbnailLength)']).toBe('1378 字节')
    expect(map.ThumbnailImage).toContain('1378')
  })
})
