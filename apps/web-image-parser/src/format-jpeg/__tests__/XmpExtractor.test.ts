import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { extractXmpFromApp1, locateXmpXml, parseXmpFields } from '../XmpExtractor.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const assetsRoot = join(__dirname, '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg')

/**
 * @vitest-environment jsdom
 */
describe('XmpExtractor', () => {
  it('locates and parses XMP from Nikon sample APP1', () => {
    const file = readFileSync(join(assetsRoot, 'S-JPEG-12_Nikon_MakerNote.jpg'))
    const data = new Uint8Array(file)
    let app1Slice: ArrayBuffer | null = null

    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] === 0xff && data[i + 1] === 0xe1) {
        const len = (data[i + 2]! << 8) | data[i + 3]!
        const payload = file.slice(i + 4, i + 4 + len - 2)
        if (payload.includes('http://ns.adobe.com/xap/1.0/')) {
          app1Slice = payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength)
          break
        }
      }
    }

    expect(app1Slice).not.toBeNull()
    const xml = locateXmpXml(new Uint8Array(app1Slice!))
    expect(xml).toContain('<?xpacket')
    expect(xml).toContain('x:xmpmeta')

    const fields = parseXmpFields(xml!)
    expect(fields.length).toBeGreaterThan(0)

    const readable = extractXmpFromApp1(app1Slice!)
    expect(readable.title).toBe('XMP 元数据')
    expect(readable.textBody).toContain('<?xpacket')
    expect(readable.fields.length).toBeGreaterThan(0)
  })
})
