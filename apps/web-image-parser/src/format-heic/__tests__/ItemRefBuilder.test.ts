import { describe, expect, it } from 'vitest'
import { parseIloc } from '../IlocParser.ts'
import { parseIrefReferences } from '../ItemRefBuilder.ts'
import { parseBmffBoxes } from '../BmffReader.ts'
import { readFileSync } from 'node:fs'
import { HEIC_GRID_SAMPLE } from './testAssets.ts'

/**
 * @vitest-environment node
 */
describe('IlocParser', () => {
  it('parses item locations from OPPO grid HEIC', () => {
    const buf = readFileSync(HEIC_GRID_SAMPLE)
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const { boxes } = parseBmffBoxes(ab)
    const locs = parseIloc(ab, boxes)
    expect(locs.size).toBeGreaterThan(0)
  })
})

describe('ItemRefBuilder', () => {
  it('parses dimg grid reference in iref', () => {
    const buf = readFileSync(HEIC_GRID_SAMPLE)
    const data = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    const { boxes } = parseBmffBoxes(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
    const iref = boxes.find((b) => b.type === 'iref')
    expect(iref).toBeTruthy()
    const refs = parseIrefReferences(data, iref!)
    const dimg = refs.find((r) => r.kind === 'dimg')
    expect(dimg).toBeTruthy()
    expect(dimg!.fromItemId).toBe(10000)
    expect(dimg!.toItemIds.length).toBe(47)
    expect(dimg!.toItemIds[0]).toBe(10001)
    expect(dimg!.toItemIds.at(-1)).toBe(10047)
    expect(dimg!.catalogId).toBe('PAR-HEIC-C03')
    const cdsc = refs.find((r) => r.kind === 'cdsc')
    expect(cdsc?.fromItemId).toBe(10048)
    expect(cdsc?.toItemIds).toEqual([])
  })
})
