import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseJpegBuffer } from '../../format-jpeg/JpegParser.ts'
import { parseHeicBuffer } from '../../format-heic/HeicParser.ts'
import { summarizeDurations } from '../perfUtils.ts'

const JPEG_SAMPLE = resolve(
  import.meta.dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/jpeg/S-JPEG-01_Canon_40D_EXIF.jpg',
)
const HEIC_SAMPLE = resolve(
  import.meta.dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/heic/S-HEIC-01_autumn.heic',
)

const PARSE_BUDGET_MS = 10_000
const RUNS = 5

/**
 * @vitest-environment node
 */
describe('parse performance (T126)', () => {
  it('S-JPEG-01 parse P95 ≤ 10s', async () => {
    const buf = readFileSync(JPEG_SAMPLE)
    const durations: number[] = []

    for (let i = 0; i < RUNS; i++) {
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
      const started = performance.now()
      const result = await parseJpegBuffer(ab)
      durations.push(performance.now() - started)
      expect(result.tree?.nodes.length).toBeGreaterThan(3)
    }

    const { p95 } = summarizeDurations(durations)
    expect(p95).toBeLessThan(PARSE_BUDGET_MS)
  })

  it('S-HEIC-01 parse P95 ≤ 10s', () => {
    const buf = readFileSync(HEIC_SAMPLE)
    const durations: number[] = []

    for (let i = 0; i < RUNS; i++) {
      const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer
      const started = performance.now()
      const result = parseHeicBuffer(ab)
      durations.push(performance.now() - started)
      expect(result.tree?.nodes.length).toBeGreaterThan(5)
    }

    const { p95 } = summarizeDurations(durations)
    expect(p95).toBeLessThan(PARSE_BUDGET_MS)
  })
})
