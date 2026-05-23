/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseBmffBoxes } from '../BmffReader.ts'
import { parseHeicBuffer } from '../HeicParser.ts'

const HEIC_SAMPLE = resolve(
  import.meta.dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/heic/S-HEIC-01_autumn.heic',
)

describe('BmffReader', () => {
  it('parses S-HEIC-01 top-level and meta boxes', () => {
    const buf = readFileSync(HEIC_SAMPLE)
    const { boxes, truncated } = parseBmffBoxes(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    )
    expect(truncated).toBe(false)
    const types = boxes.map((b) => b.type)
    expect(types).toContain('ftyp')
    expect(types).toContain('meta')
    expect(types).toContain('mdat')
    expect(types).toContain('hdlr')
    expect(types).toContain('pitm')
    expect(types).toContain('iinf')
    expect(types.some((t) => t === 'infe')).toBe(true)
  })

  it('returns partial when file is truncated', () => {
    const buf = readFileSync(HEIC_SAMPLE)
    const truncated = buf.subarray(0, buf.length - 200)
    const ab = truncated.buffer.slice(truncated.byteOffset, truncated.byteOffset + truncated.byteLength)
    const result = parseHeicBuffer(ab)
    expect(result.status).toBe('partial')
    expect(result.tree).not.toBeNull()
    expect(result.tree!.nodes.length).toBeGreaterThan(0)
  })

  it('builds full HEIC tree with iref thumbnail link', () => {
    const buf = readFileSync(HEIC_SAMPLE)
    const result = parseHeicBuffer(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
    expect(result.status).toBe('success')
    expect(result.tree?.nodes.length).toBeGreaterThan(5)
    expect(result.tree?.nodes.some((n) => n.parCatalogId === 'PAR-HEIC-004')).toBe(true)
    expect(result.tree?.nodes.some((n) => n.parCatalogId === 'PAR-HEIC-C01')).toBe(true)
    expect(result.tree?.nodes.some((n) => n.label.startsWith('★'))).toBe(true)
    expect(result.tree?.nodes.some((n) => n.parCatalogId === 'PAR-HEIC-009')).toBe(true)
    expect(result.tree?.nodes.some((n) => n.label.includes('ipma'))).toBe(true)
  })
})
