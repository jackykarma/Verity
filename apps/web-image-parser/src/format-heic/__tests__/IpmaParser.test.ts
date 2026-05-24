import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseBmffBoxes } from '../BmffReader.ts'
import { parseIpma, formatIpmaSummary } from '../IpmaParser.ts'
import { HEIC_GRID_SAMPLE } from './testAssets.ts'

/**
 * @vitest-environment node
 */
describe('IpmaParser', () => {
  it('parses property associations from OPPO grid HEIC', () => {
    const buf = readFileSync(HEIC_GRID_SAMPLE)
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const data = new Uint8Array(ab)
    const { boxes } = parseBmffBoxes(ab)
    const ipma = boxes.find((b) => b.type === 'ipma')
    expect(ipma).toBeTruthy()

    const entries = parseIpma(data, ipma!)
    expect(entries.length).toBeGreaterThan(40)
    expect(entries.some((e) => e.itemId === 10048)).toBe(true)
    expect(formatIpmaSummary(entries)).toContain('#10048')
  })
})
