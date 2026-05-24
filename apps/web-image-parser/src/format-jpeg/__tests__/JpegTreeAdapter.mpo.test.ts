import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseJpegBuffer } from '../JpegParser.ts'
import { toPresentRequest } from '../JpegTreeAdapter.ts'

/**
 * @vitest-environment node
 */
describe('JpegTreeAdapter MPO frame preview', () => {
  it('builds contentRef for MPImage 2 when allNodes resolves MPF segment', async () => {
    const filePath = join(
      __dirname,
      '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg/IMG20260508185614.jpg',
    )
    const buffer = readFileSync(filePath).buffer
    const { tree } = await parseJpegBuffer(buffer)
    expect(tree).not.toBeNull()
    const frame2 = tree!.nodes.find(
      (n) => n.parCatalogId === 'PAR-JPEG-MPO-FRAME' && n.id.endsWith('-frame-1'),
    )
    expect(frame2).toBeDefined()

    const req = await toPresentRequest(frame2!, 'session-test', buffer, tree!.nodes)
    expect(req.contentRef?.kind).toBe('blobUrl')
    if (req.contentRef?.kind === 'blobUrl') {
      expect(req.contentRef.mimeType).toBe('image/jpeg')
      expect(req.contentRef.url).toMatch(/^blob:/)
    }
    expect(req.readablePayload?.fields.some((f) => f.key === 'MPImageStart')).toBe(true)
  })

  it('finds MPF segment via parent chain without using frame byte range', async () => {
    const filePath = join(
      __dirname,
      '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg/IMG20260508185614.jpg',
    )
    const buffer = readFileSync(filePath).buffer
    const { tree } = await parseJpegBuffer(buffer)
    expect(tree).not.toBeNull()
    const frame2 = tree!.nodes.find(
      (n) => n.parCatalogId === 'PAR-JPEG-MPO-FRAME' && n.id.endsWith('-frame-1'),
    )
    expect(frame2).toBeDefined()

    const req = await toPresentRequest(frame2!, 'session-test', buffer, tree!.nodes)
    const startField = req.readablePayload?.fields.find((f) => f.key === 'MPImageStart')
    expect(startField?.value).toContain('7340082')
  })
})
