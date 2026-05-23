/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { decodeMakerNote } from '../MakerNoteDecoder.ts'

const CANON_SAMPLE = resolve(
  import.meta.dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg/S-JPEG-11_Canon_MakerNote.jpg',
)

describe('MakerNoteDecoder', () => {
  it('decodes Canon MakerNote fields', async () => {
    const buf = readFileSync(CANON_SAMPLE)
    const result = await decodeMakerNote(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
    expect(result.vendor.toLowerCase()).toContain('canon')
    expect(result.fields.length).toBeGreaterThan(1)
    expect(result.fields.some((f) => f.key === 'CustomRendered' || f.key === 'ExposureMode')).toBe(true)
  })
})
