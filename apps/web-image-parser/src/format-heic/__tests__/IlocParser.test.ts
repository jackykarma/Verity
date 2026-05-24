/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseBmffBoxes } from '../BmffReader.ts'
import { parseIloc } from '../IlocParser.ts'
import { HEIC_GRID_SAMPLE } from './testAssets.ts'

function loadSample(): ArrayBuffer {
  const buf = readFileSync(HEIC_GRID_SAMPLE)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

describe('parseIloc', () => {
  it('parses version-1 iloc with 50 items including Exif #10049', () => {
    const buffer = loadSample()
    const { boxes } = parseBmffBoxes(buffer)
    const itemLocations = parseIloc(buffer, boxes)

    expect(itemLocations.size).toBe(50)
    expect(itemLocations.get(10048)?.length).toBeGreaterThan(0)
    expect(itemLocations.get(10049)?.length).toBeGreaterThan(0)
  })
})
