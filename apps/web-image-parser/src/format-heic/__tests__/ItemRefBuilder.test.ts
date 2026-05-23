import { describe, expect, it } from 'vitest'
import { parseIloc } from '../IlocParser.ts'
import { parseIrefReferences } from '../ItemRefBuilder.ts'
import { parseBmffBoxes } from '../BmffReader.ts'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const HEIC_SAMPLE = resolve(
  import.meta.dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/heic/S-HEIC-01_autumn.heic',
)

/**
 * @vitest-environment node
 */
describe('IlocParser', () => {
  it('parses item locations from S-HEIC-01', () => {
    const buf = readFileSync(HEIC_SAMPLE)
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const { boxes } = parseBmffBoxes(ab)
    const locs = parseIloc(ab, boxes)
    expect(locs.size).toBeGreaterThan(0)
    const primary = locs.get(1002)
    expect(primary?.offset).toBeGreaterThan(0)
    expect(primary?.length).toBeGreaterThan(0)
  })
})

describe('ItemRefBuilder', () => {
  it('parses thmb reference in iref', () => {
    const buf = readFileSync(HEIC_SAMPLE)
    const data = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength)
    const { boxes } = parseBmffBoxes(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength))
    const iref = boxes.find((b) => b.type === 'iref')
    expect(iref).toBeTruthy()
    const refs = parseIrefReferences(data, iref!)
    expect(refs.some((r) => r.kind === 'thmb' && r.fromItemId === 1002)).toBe(true)
  })
})
