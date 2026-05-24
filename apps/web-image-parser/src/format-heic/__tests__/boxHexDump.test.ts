/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { hexDumpAt } from '../boxHexDump.ts'

describe('hexDumpAt', () => {
  it('formats bytes with absolute file offset', () => {
    const buffer = new Uint8Array(128)
    buffer.set([0x00, 0x01, 0x41, 0x42, 0xff], 100)
    const dump = hexDumpAt(buffer.buffer, 100, 5)
    expect(dump).toContain('0x64 (100)')
    expect(dump).toContain('41 42')
    expect(dump).toContain('AB')
  })

  it('truncates large ranges and notes total length', () => {
    const buffer = new Uint8Array(10_000).buffer
    const dump = hexDumpAt(buffer, 0, 10_000, { maxBytes: 32 })
    expect(dump).toContain('共 10,000 字节')
    expect(dump).toContain('已显示前 32 字节')
  })

  it('returns placeholder for zero length', () => {
    expect(hexDumpAt(new ArrayBuffer(8), 0, 0)).toBe('（无数据）')
  })
})
