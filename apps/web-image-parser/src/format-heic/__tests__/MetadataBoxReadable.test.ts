/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseHeicBuffer } from '../HeicParser.ts'
import { parseBmffBoxes } from '../BmffReader.ts'
import { parseIloc } from '../IlocParser.ts'
import { buildMetadataBoxReadable } from '../MetadataBoxReadable.ts'
import { toHeicPresentRequest } from '../HeicTreeAdapter.ts'
import { HEIC_GRID_SAMPLE } from './testAssets.ts'

function loadSample(): ArrayBuffer {
  const buf = readFileSync(HEIC_GRID_SAMPLE)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

describe('MetadataBoxReadable', () => {
  const buffer = loadSample()
  const parsed = parseHeicBuffer(buffer)
  const { boxes } = parseBmffBoxes(buffer)
  const itemLocations = parseIloc(buffer, boxes)
  const nodes = parsed.tree!.nodes

  it('parses ftyp brands', () => {
    const ftyp = nodes.find((n) => n.parCatalogId === 'PAR-HEIC-001')!
    const readable = buildMetadataBoxReadable(ftyp, buffer, boxes, itemLocations)!
    expect(readable.title).toContain('ftyp')
    expect(readable.fields.some((f) => f.key === 'major_brand' && f.value.includes('heic'))).toBe(true)
    expect(readable.hexPreview).toContain('0x')
  })

  it('parses pitm primary item', () => {
    const pitm = nodes.find((n) => n.parCatalogId === 'PAR-HEIC-004')!
    const readable = buildMetadataBoxReadable(pitm, buffer, boxes, itemLocations)!
    expect(readable.fields.some((f) => f.key === 'primary_item_id' && f.value === '10048')).toBe(true)
  })

  it('parses iloc item locations', () => {
    const iloc = nodes.find((n) => n.parCatalogId === 'PAR-HEIC-006')!
    const readable = buildMetadataBoxReadable(iloc, buffer, boxes, itemLocations)!
    expect(readable.fields.some((f) => f.key.startsWith('item '))).toBe(true)
    expect(readable.fields.some((f) => f.key === 'item_count (parsed)')).toBe(true)
  })

  it('parses iinf item list', () => {
    const iinf = nodes.find((n) => n.parCatalogId === 'PAR-HEIC-005')!
    const readable = buildMetadataBoxReadable(iinf, buffer, boxes, itemLocations)!
    const entryCount = readable.fields.find((f) => f.key === 'entry_count')!.value
    expect(entryCount).toContain('50')
    expect(entryCount).toContain('2 字节')
    expect(readable.fields.some((f) => f.key.startsWith('infe #'))).toBe(true)
  })

  it('parses ispe dimensions', () => {
    const ispeNodes = nodes.filter((n) => n.parCatalogId === 'PAR-HEIC-106')
    const readable = buildMetadataBoxReadable(ispeNodes[1] ?? ispeNodes[0]!, buffer, boxes, itemLocations)!
    expect(readable.fields.some((f) => f.key === 'image_width × image_height')).toBe(true)
    expect(readable.fields.some((f) => f.value.includes('4096') || f.value.includes('512'))).toBe(true)
  })

  it('parses iref grid reference', () => {
    const irefNode = nodes.find((n) => n.label === 'iref')!
    const readable = buildMetadataBoxReadable(irefNode, buffer, boxes, itemLocations)!
    expect(readable.fields.some((f) => f.key.includes('dimg'))).toBe(true)
  })

  it('toHeicPresentRequest returns readable for hdlr', async () => {
    const hdlr = nodes.find((n) => n.parCatalogId === 'PAR-HEIC-003')!
    const req = await toHeicPresentRequest(hdlr, 'sess', buffer)
    expect(req.payloadKind).toBe('metadata')
    expect(req.readablePayload?.fields.some((f) => f.key === 'handler_type')).toBe(true)
    expect(req.readablePayload?.hexPreview).toBeDefined()
  })

  it('toHeicPresentRequest includes Exif IFD fields and payload hex', async () => {
    const exifNode = nodes.find((n) => n.parCatalogId === 'PAR-HEIC-201')!
    const req = await toHeicPresentRequest(exifNode, 'sess', buffer)
    expect(req.readablePayload?.fields.length).toBeGreaterThan(0)
    expect(req.readablePayload?.hexPreview).toMatch(/0x[0-9a-f]+/)
  })
})
