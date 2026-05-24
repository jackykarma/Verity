import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { assembleIccProfileFromJpeg, buildIccProfileReadableFields } from '../IccProfileParser.ts'
import { buildSegmentDetailReadable } from '../SegmentDetailExtractor.ts'
import type { SegmentNodeDto } from '../../shared/types/parseMessages.ts'

const samplePath = join(
  __dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg/IMG20260508185614.jpg',
)

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
describe('IccProfileParser', () => {
  it('parses ICC header and tags aligned with ExifTool on OPPO Display P3 sample', () => {
    const file = readFileSync(samplePath)
    const buffer = file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength)
    const { profile } = assembleIccProfileFromJpeg(buffer)
    expect(profile).not.toBeNull()
    expect(profile!.length).toBeGreaterThanOrEqual(128)

    const fields = buildIccProfileReadableFields(profile!)
    const map = Object.fromEntries(fields.map((f) => [f.key, f.value]))

    expect(map.ProfileCMMType).toBe('Apple Computer Inc.')
    expect(map.ProfileVersion).toBe('4.0.0')
    expect(map.ProfileClass).toBe('Display Device Profile')
    expect(map.ColorSpaceData).toBe('RGB')
    expect(map.ProfileConnectionSpace).toBe('XYZ')
    expect(map.ProfileDateTime).toBe('2018:06:24 13:22:32')
    expect(map.ProfileFileSignature).toBe('acsp')
    expect(map.PrimaryPlatform).toBe('Apple Computer Inc.')
    expect(map.CMMFlags).toBe('Not Embedded, Independent')
    expect(map.DeviceManufacturer).toBe('Unknown (OPPO)')
    expect(map.RenderingIntent).toBe('Perceptual')
    expect(map.ProfileCreator).toBe('Apple Computer Inc.')
    expect(map.ProfileID).toBe('0')
    expect(map['Profile Description']).toBe('Display P3')
    expect(map['Profile Copyright']).toBe('Copyright Apple Inc., 2017')
    expect(map['Media White Point']).toBe('0.95045 1 1.08905')
    expect(map['Red Matrix Column']).toBe('0.51512 0.2412 -0.00105')
    expect(map['Red Tone Reproduction Curve']).toContain('Binary data')
    expect(map['Chromatic Adaptation']).toContain('1.04788')
  })

  it('exposes ICC fields through SegmentDetailExtractor', () => {
    const file = readFileSync(samplePath)
    const data = new Uint8Array(file)
    let iccOffset = 0
    let iccLength = 0
    for (let i = 0; i < data.length - 1; i++) {
      if (data[i] === 0xff && data[i + 1] === 0xe2) {
        const len = (data[i + 2]! << 8) | data[i + 3]!
        const payload = file.subarray(i + 4, i + 4 + len - 2)
        if (payload.includes('ICC_PROFILE'.charCodeAt(0))) {
          const id = String.fromCharCode(...payload.slice(0, 12))
          if (id.startsWith('ICC_PROFILE')) {
            iccOffset = i
            iccLength = len + 2
            break
          }
        }
      }
    }

    expect(iccLength).toBeGreaterThan(0)
    const readable = buildSegmentDetailReadable(
      node({ parCatalogId: 'PAR-JPEG-006', label: 'APP2 (ICC_Profile)', offset: iccOffset, length: iccLength }),
      file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength),
    )

    expect(readable.fields.some((f) => f.key === 'ProfileClass' && f.value.includes('Display'))).toBe(true)
    expect(readable.fields.some((f) => f.key === 'Profile Description' && f.value === 'Display P3')).toBe(true)
    expect(readable.fields.some((f) => f.key === 'ExifTool Tag Name' && f.value === 'ICC_Profile')).toBe(true)
  })
})
