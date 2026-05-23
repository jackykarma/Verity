import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseJpegBuffer } from '../JpegParser.ts'
import { auditJpegCatalog } from '../jpegCatalogAudit.ts'

const ASSETS_DIR = resolve(
  import.meta.dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg',
)

/**
 * @vitest-environment node
 */
describe('jpeg catalog audit', () => {
  it('parses Canon EXIF sample with expected catalog ids', async () => {
    const buf = readFileSync(resolve(ASSETS_DIR, 'S-JPEG-01_Canon_40D_EXIF.jpg'))
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
    const result = await parseJpegBuffer(ab)
    const ids = result.tree?.nodes.map((n) => n.parCatalogId) ?? []
    expect(ids).toContain('PAR-JPEG-004')
    expect(ids).toContain('PAR-JPEG-005')
    expect(ids).toContain('PAR-JPEG-001')
  })

  it('reports P1 coverage from test assets', async () => {
    const result = await auditJpegCatalog(ASSETS_DIR)
    expect(result.fileCount).toBeGreaterThan(0)
    expect(result.covered.length).toBeGreaterThanOrEqual(5)
    expect(result.pct).toBeGreaterThanOrEqual(30)
  })
})
