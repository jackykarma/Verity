import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseJpegBuffer } from '../../format-jpeg/JpegParser.ts'
import { parseHeicBuffer } from '../../format-heic/HeicParser.ts'
import { toPresentRequest } from '../../format-jpeg/JpegTreeAdapter.ts'
import { toHeicPresentRequest } from '../../format-heic/HeicTreeAdapter.ts'
import { ContentPresenter } from '../ContentPresenter.ts'
import { SessionStore } from '../../shared/SessionStore.ts'
import { summarizeDurations } from '../../shared/perfUtils.ts'

const JPEG_SAMPLE = resolve(
  import.meta.dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg/S-JPEG-01_Canon_40D_EXIF.jpg',
)
const HEIC_SAMPLE = resolve(
  import.meta.dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/heic/S-HEIC-01_autumn.heic',
)

const PRESENT_BUDGET_MS = 500
const RUNS = 8

/**
 * @vitest-environment node
 */
describe('present performance (T232/T233/T333)', () => {
  it('JPEG readable present P95 ≤ 500ms (不含解码)', async () => {
    const buf = readFileSync(JPEG_SAMPLE)
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
    const parsed = await parseJpegBuffer(ab)
    const exifNode = parsed.tree?.nodes.find((n) => n.parCatalogId === 'PAR-JPEG-005')
    expect(exifNode).toBeTruthy()

    const store = SessionStore.getInstance()
    store.disposeAll()
    const session = await store.createSession(new File([ab], 'test.jpg', { type: 'image/jpeg' }), 'jpeg')
    const presenter = new ContentPresenter()
    const durations: number[] = []

    for (let i = 0; i < RUNS; i++) {
      const started = performance.now()
      const req = await toPresentRequest(exifNode!, session.sessionId, session.buffer)
      const result = await presenter.present(req)
      durations.push(performance.now() - started)
      expect(result.status).toBe('success')
    }

    const { p95 } = summarizeDurations(durations)
    expect(p95).toBeLessThan(PRESENT_BUDGET_MS)
  })

  it('HEIC readable present P95 ≤ 500ms (不含解码)', async () => {
    const buf = readFileSync(HEIC_SAMPLE)
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
    const parsed = parseHeicBuffer(ab)
    const ipmaNode = parsed.tree?.nodes.find((n) => n.parCatalogId === 'PAR-HEIC-009')
    expect(ipmaNode).toBeTruthy()

    const store = SessionStore.getInstance()
    store.disposeAll()
    const session = await store.createSession(new File([ab], 'test.heic', { type: 'image/heic' }), 'heic')
    const presenter = new ContentPresenter()
    const durations: number[] = []

    for (let i = 0; i < RUNS; i++) {
      const started = performance.now()
      const req = await toHeicPresentRequest(ipmaNode!, session.sessionId, session.buffer)
      const result = await presenter.present(req)
      durations.push(performance.now() - started)
      expect(result.status).toBe('success')
    }

    const { p95 } = summarizeDurations(durations)
    expect(p95).toBeLessThan(PRESENT_BUDGET_MS)
  })

  it('rapid switch keeps last selection result (SC-009 / T233)', async () => {
    const buf = readFileSync(JPEG_SAMPLE)
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
    const parsed = await parseJpegBuffer(ab)
    const nodes = parsed.tree!.nodes.filter((n) => n.parCatalogId === 'PAR-JPEG-005' || n.parCatalogId === 'PAR-JPEG-004')
    expect(nodes.length).toBeGreaterThan(1)

    const store = SessionStore.getInstance()
    store.disposeAll()
    const session = await store.createSession(new File([ab], 'test.jpg', { type: 'image/jpeg' }), 'jpeg')
    const presenter = new ContentPresenter()

    const first = nodes[0]!
    const last = nodes[nodes.length - 1]!

    void presenter.present(await toPresentRequest(first, session.sessionId, session.buffer))
    void presenter.present(await toPresentRequest(nodes[1] ?? first, session.sessionId, session.buffer))
    const finalResult = await presenter.present(
      await toPresentRequest(last, session.sessionId, session.buffer),
    )

    expect(finalResult.status).toBe('success')
    if (finalResult.viewModel.kind === 'readable') {
      expect(finalResult.viewModel.payload.title.length).toBeGreaterThan(0)
    }
  })
})
