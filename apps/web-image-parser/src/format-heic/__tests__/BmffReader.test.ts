/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseBmffBoxes } from '../BmffReader.ts'
import { parseHeicBuffer } from '../HeicParser.ts'
import { HEIC_GRID_SAMPLE } from './testAssets.ts'

function loadSample(): ArrayBuffer {
  const buf = readFileSync(HEIC_GRID_SAMPLE)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

describe('BmffReader', () => {
  it('parses OPPO grid HEIC top-level and meta boxes', () => {
    const { boxes, truncated, vendorTailBytes } = parseBmffBoxes(loadSample())
    expect(truncated).toBe(false)
    expect(vendorTailBytes).toBeGreaterThan(1_000_000)
    const topLevel = boxes.filter((b) => b.parentOffset === null).map((b) => b.type)
    expect(topLevel).toEqual(['ftyp', 'meta', 'free', 'mdat', 'QTI ', 'tail'])
    expect(boxes.some((b) => b.type === 'QTI ' && b.catalogId === 'PAR-HEIC-013')).toBe(true)
    expect(boxes.some((b) => b.type === 'hdlr')).toBe(true)
    expect(boxes.some((b) => b.type === 'pitm')).toBe(true)
    expect(boxes.some((b) => b.type === 'iinf')).toBe(true)
    expect(boxes.some((b) => b.type === 'infe')).toBe(true)
  })

  it('returns partial when file is truncated early', () => {
    const buf = readFileSync(HEIC_GRID_SAMPLE)
    // 截断 meta 内部，避免仅去掉尾部时被厂商续区逻辑误判为完整
    const truncated = buf.subarray(0, 500)
    const ab = truncated.buffer.slice(truncated.byteOffset, truncated.byteOffset + truncated.byteLength)
    const result = parseHeicBuffer(ab)
    expect(result.status).toBe('partial')
    expect(result.tree).not.toBeNull()
    expect(result.tree!.nodes.length).toBeGreaterThan(0)
  })

  it('builds HEIC tree with grid item and ipma', () => {
    const result = parseHeicBuffer(loadSample())
    expect(result.status).toBe('success')
    expect(result.tree?.nodes.length).toBeGreaterThan(5)
    expect(result.tree?.nodes.some((n) => n.parCatalogId === 'PAR-HEIC-004')).toBe(true)
    expect(result.tree?.nodes.some((n) => n.parCatalogId === 'PAR-HEIC-103')).toBe(true)
    expect(result.tree?.nodes.some((n) => n.parCatalogId === 'PAR-HEIC-009')).toBe(true)
    expect(result.tree?.nodes.some((n) => n.label.includes('ipma'))).toBe(true)
    expect(result.tree?.nodes.some((n) => n.parCatalogId === 'PAR-HEIC-C03')).toBe(true)
  })
})
