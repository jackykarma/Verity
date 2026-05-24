/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseBmffBoxes } from '../BmffReader.ts'
import { parseInfeBox, parseIinfHeader } from '../InfeParser.ts'
import { buildMetadataBoxReadable } from '../MetadataBoxReadable.ts'
import { parseHeicBuffer } from '../HeicParser.ts'
import { parseIloc } from '../IlocParser.ts'
import { HEIC_GRID_SAMPLE } from './testAssets.ts'

function loadSample(): ArrayBuffer {
  const buf = readFileSync(HEIC_GRID_SAMPLE)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

describe('InfeParser / iinf', () => {
  const buffer = loadSample()
  const data = new Uint8Array(buffer)
  const { boxes } = parseBmffBoxes(buffer)
  const parsed = parseHeicBuffer(buffer)
  const itemLocations = parseIloc(buffer, boxes)
  const iinf = boxes.find((b) => b.type === 'iinf')!

  it('parses iinf header entry_count from binary (v0 → 2 bytes)', () => {
    const header = parseIinfHeader(data, iinf.offset, iinf.size)!
    expect(header.version).toBe(0)
    expect(header.entryCountWidth).toBe(2)
    expect(header.entryCount).toBe(50)
  })

  it('parses infe v2 fields per ISO 23008-12', () => {
    const exif = boxes.find((b) => b.type === 'infe' && b.itemType === 'Exif')!
    const entry = parseInfeBox(data, exif.offset, exif.size)!
    expect(entry.version).toBe(2)
    expect(entry.flags).toBe(0)
    expect(entry.itemId).toBe(10049)
    expect(entry.itemProtectionIndex).toBe(0)
    expect(entry.itemType).toBe('Exif')
    expect(entry.itemName).toBe('')
  })

  it('buildMetadataBoxReadable shows iinf entry_count from header', () => {
    const node = parsed.tree!.nodes.find((n) => n.parCatalogId === 'PAR-HEIC-005')!
    const readable = buildMetadataBoxReadable(node, buffer, boxes, itemLocations)!
    expect(readable.fields.some((f) => f.key === 'entry_count' && f.value.includes('50'))).toBe(true)
    expect(readable.fields.some((f) => f.key === 'entry_count' && f.value.includes('2 字节'))).toBe(true)
  })

  it('buildMetadataBoxReadable shows full infe v2 field order', () => {
    const node = parsed.tree!.nodes.find((n) => n.label.includes('Exif'))!
    const readable = buildMetadataBoxReadable(node, buffer, boxes, itemLocations)!
    const keys = readable.fields.map((f) => f.key)
    expect(keys.indexOf('item_ID')).toBeLessThan(keys.indexOf('item_protection_index'))
    expect(keys.indexOf('item_protection_index')).toBeLessThan(keys.indexOf('item_type'))
    expect(keys.indexOf('item_type')).toBeLessThan(keys.indexOf('item_name'))
    expect(readable.fields.find((f) => f.key === 'item_name')?.value).toBe('（空）')
  })
})
