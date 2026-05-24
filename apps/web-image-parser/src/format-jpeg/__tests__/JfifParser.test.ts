import { describe, expect, it } from 'vitest'
import { parseJfifPayload } from '../JfifParser.ts'

/**
 * @vitest-environment node
 */
describe('JfifParser', () => {
  it('parses all ExifTool JFIF header fields including zero thumbnails', () => {
    const payload = new Uint8Array([
      0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
    ])

    const fields = parseJfifPayload(payload, 0, payload.length)
    const map = Object.fromEntries(fields.map((f) => [f.key, f.value]))

    expect(map.Identifier).toBe('JFIF')
    expect(map.JFIFVersion).toBe('1.1')
    expect(map.ResolutionUnit).toBe('None')
    expect(map.XResolution).toBe('1')
    expect(map.YResolution).toBe('1')
    expect(map.ThumbnailWidth).toBe('0')
    expect(map.ThumbnailHeight).toBe('0')
    expect(map.ThumbnailTIFF).toBe('（无嵌入缩略图）')
  })

  it('parses embedded RGB thumbnail size', () => {
    const payload = new Uint8Array(14 + 3 * 2 * 2)
    payload.set([0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x02, 0x01, 0x00, 0x48, 0x00, 0x48, 0x02, 0x02], 0)
    payload.fill(0xab, 14)

    const fields = parseJfifPayload(payload, 0, payload.length)
    const map = Object.fromEntries(fields.map((f) => [f.key, f.value]))

    expect(map.ResolutionUnit).toBe('inches')
    expect(map.XResolution).toBe('72')
    expect(map.YResolution).toBe('72')
    expect(map.ThumbnailWidth).toBe('2')
    expect(map.ThumbnailHeight).toBe('2')
    expect(map.ThumbnailTIFF).toContain('12 字节')
  })

  it('parses JFXX extension header', () => {
    const payload = new Uint8Array([0x4a, 0x46, 0x58, 0x58, 0x00, 0x10, 0xff, 0xd8])

    const fields = parseJfifPayload(payload, 0, payload.length)
    const map = Object.fromEntries(fields.map((f) => [f.key, f.value]))

    expect(map.Identifier).toBe('JFXX')
    expect(map.ExtensionCode).toBe('ThumbnailImage (JPEG)')
    expect(map.ThumbnailImage).toBe('嵌入 JPEG 缩略图')
  })
})
