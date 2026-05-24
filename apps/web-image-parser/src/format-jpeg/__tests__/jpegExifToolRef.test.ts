import { describe, expect, it } from 'vitest'
import {
  EXIFTOOL_JPEG_ROOT,
  listKnownAppPayloads,
  matchAppPayload,
  refForCatalogId,
  sofEncodingLabel,
} from '../jpegExifToolRef.ts'

/**
 * @vitest-environment node
 */
describe('jpegExifToolRef', () => {
  it('matches APP1 EXIF and APP2 MPF payloads', () => {
    const exif = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00])
    const mpf = new Uint8Array([0x4d, 0x50, 0x46, 0x00])

    expect(matchAppPayload(1, exif, 0)?.tagName).toBe('EXIF')
    expect(matchAppPayload(2, mpf, 0)?.tagName).toBe('MPF')
    expect(matchAppPayload(2, mpf, 0)?.subSpecUrl).toContain('MPF.html')
  })

  it('lists known APP0 payload types from ExifTool', () => {
    const names = listKnownAppPayloads(0)
    expect(names).toContain('JFIF')
    expect(names).toContain('AVI1')
  })

  it('maps SOF marker to EncodingProcess label', () => {
    expect(sofEncodingLabel(0xc0)).toContain('Baseline DCT')
    expect(sofEncodingLabel(0xc2)).toContain('Progressive')
  })

  it('maps catalog ids to ExifTool marker refs', () => {
    expect(refForCatalogId('PAR-JPEG-011')?.tagName).toBe('DefineQuantizationTable')
    expect(refForCatalogId('PAR-JPEG-028')?.subSpecUrl).toContain('MPF.html')
  })

  it('falls back to JPEG root for unknown APP payloads', () => {
    const unknown = new Uint8Array([0x00, 0x01, 0x02, 0x03])
    expect(matchAppPayload(4, unknown, 0)?.subSpecUrl).toBe(EXIFTOOL_JPEG_ROOT)
  })
})
