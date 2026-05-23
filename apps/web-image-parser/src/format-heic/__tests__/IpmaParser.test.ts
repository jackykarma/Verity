import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseBmffBoxes } from '../BmffReader.ts'
import { parseIpma, formatIpmaSummary } from '../IpmaParser.ts'

const HEIC_SAMPLE = resolve(
  import.meta.dirname,
  '../../../../../specs/epics/EPIC-005-web-image-parser/test-assets/heic/S-HEIC-01_autumn.heic',
)

/**
 * @vitest-environment node
 */
describe('IpmaParser', () => {
  it('parses property associations from S-HEIC-01', () => {
    const buf = readFileSync(HEIC_SAMPLE)
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const data = new Uint8Array(ab)
    const { boxes } = parseBmffBoxes(ab)
    const ipma = boxes.find((b) => b.type === 'ipma')
    expect(ipma).toBeTruthy()

    const entries = parseIpma(data, ipma!)
    expect(entries.length).toBe(2)
    expect(entries[0]?.itemId).toBe(1002)
    expect(entries[0]?.associations.length).toBeGreaterThan(0)
    expect(formatIpmaSummary(entries)).toContain('#1002')
  })
})
