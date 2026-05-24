import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { bufferToUint8Array, collectOrderedIfdTags } from '../TiffIfdWalker.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const assetsRoot = join(__dirname, '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg')

/**
 * @vitest-environment node
 */
describe('TiffIfdWalker', () => {
  it('collects IFD0 and ExifIFD tags in directory entry order', () => {
    const file = readFileSync(join(assetsRoot, 'S-JPEG-01_Canon_40D_EXIF.jpg'))
    const tags = collectOrderedIfdTags(bufferToUint8Array(file.buffer))

    const names = tags.map((t) => `${t.groupLabel} · ${t.tagName}`)
    expect(names.slice(0, 3)).toEqual(['IFD0 · Make', 'IFD0 · Model', 'IFD0 · Orientation'])

    const exifStart = names.indexOf('ExifIFD · ExposureTime')
    const isoIdx = names.indexOf('ExifIFD · ISO')
    const focalPlaneIdx = names.indexOf('ExifIFD · FocalPlaneXResolution')
    expect(exifStart).toBeGreaterThan(0)
    expect(isoIdx).toBeGreaterThan(exifStart)
    expect(focalPlaneIdx).toBeGreaterThan(isoIdx)
  })
})
