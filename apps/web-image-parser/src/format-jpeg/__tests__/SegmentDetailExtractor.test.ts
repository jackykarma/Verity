import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildSegmentDetailReadable } from '../SegmentDetailExtractor.ts'
import type { SegmentNodeDto } from '../../shared/types/parseMessages.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const assetsRoot = join(__dirname, '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg')

function node(partial: Partial<SegmentNodeDto> & Pick<SegmentNodeDto, 'parCatalogId' | 'label'>): SegmentNodeDto {
  return {
    id: 'test',
    parentId: 'root',
    offset: 0,
    length: 0,
    loadType: 'metadata',
    warning: false,
    ...partial,
  }
}

/**
 * @vitest-environment node
 */
describe('SegmentDetailExtractor', () => {
  it('parses ICC profile summary from Olympus sample', () => {
    const file = readFileSync(join(assetsRoot, 'S-JPEG-01_Canon_40D_EXIF.jpg'))
    let iccOffset = 0
    let iccLength = 0
    const data = new Uint8Array(file)
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] === 0xff && data[i + 1] === 0xe2) {
        const len = (data[i + 2]! << 8) | data[i + 3]!
        const payload = file.slice(i + 4, i + 4 + len - 2)
        if (payload.includes('ICC_PROFILE')) {
          iccOffset = i
          iccLength = len + 2
          break
        }
      }
    }

    expect(iccLength).toBeGreaterThan(0)
    const readable = buildSegmentDetailReadable(
      node({ parCatalogId: 'PAR-JPEG-006', label: 'APP2 (ICC)', offset: iccOffset, length: iccLength }),
      file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
    )

    expect(readable.fields.some((f) => f.key === '色彩空间')).toBe(true)
    expect(readable.fields.some((f) => f.key === '设备类别')).toBe(true)
    expect(readable.fields.some((f) => f.key === '签名' && f.value.includes('acsp'))).toBe(true)
  })

  it('parses DQT and SOF structural fields', () => {
    const file = readFileSync(join(assetsRoot, 'S-JPEG-01_Canon_40D_EXIF.jpg'))
    const data = new Uint8Array(file)
    let dqt: SegmentNodeDto | null = null
    let sof: SegmentNodeDto | null = null

    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] === 0xff && data[i + 1] === 0xdb) {
        const len = (data[i + 2]! << 8) | data[i + 3]!
        dqt = node({ parCatalogId: 'PAR-JPEG-011', label: 'DQT', offset: i, length: len + 2 })
      }
      if (data[i] === 0xff && data[i + 1] === 0xc0) {
        const len = (data[i + 2]! << 8) | data[i + 3]!
        sof = node({ parCatalogId: 'PAR-JPEG-013', label: 'SOF0', offset: i, length: len + 2 })
      }
    }

    expect(dqt).not.toBeNull()
    expect(sof).not.toBeNull()

    const dqtReadable = buildSegmentDetailReadable(dqt!, file.buffer)
    const sofReadable = buildSegmentDetailReadable(sof!, file.buffer)

    expect(dqtReadable.fields.some((f) => f.key.startsWith('量化表'))).toBe(true)
    expect(dqtReadable.hexPreview).toBeDefined()
    expect(sofReadable.fields.some((f) => f.key === 'ImageWidth')).toBe(true)
    expect(sofReadable.fields.some((f) => f.key === 'ImageHeight')).toBe(true)
    expect(sofReadable.fields.some((f) => f.key === 'EncodingProcess')).toBe(true)
    expect(sofReadable.fields.some((f) => f.key === 'ExifTool Tag Name')).toBe(true)
  })
})
