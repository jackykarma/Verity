/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { parseHeicBuffer } from '../HeicParser.ts'
import { HEIC_GRID_SAMPLE } from './testAssets.ts'

function loadSample(): ArrayBuffer {
  const buf = readFileSync(HEIC_GRID_SAMPLE)
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
}

describe('ItemLabelEnricher', () => {
  const parsed = parseHeicBuffer(loadSample())
  const nodes = parsed.tree!.nodes

  it('labels primary grid item distinctly', () => {
    const primary = nodes.find((n) => n.label.includes('★ 主图'))
    expect(primary).toBeTruthy()
    expect(primary!.label).toContain('#10048')
    expect(primary!.label).toContain('网格')
  })

  it('groups grid tiles under collapsible group node', () => {
    const group = nodes.find((n) => n.id === 'grid-tiles-group')
    expect(group).toBeTruthy()
    expect(group!.label).toContain('×47')
    const tiles = nodes.filter((n) => n.parentId === 'grid-tiles-group')
    expect(tiles.length).toBe(47)
  })

  it('does not label all hvc1 as 主图像', () => {
    const mainImageLabels = nodes.filter((n) => n.label.startsWith('主图像'))
    expect(mainImageLabels.length).toBe(0)
  })

  it('shows Exif item with metadata label', () => {
    const exif = nodes.find((n) => n.label.includes('Exif 元数据 #10049'))
    expect(exif).toBeTruthy()
    expect(exif!.loadType).toBe('metadata')
  })

  it('labels grid root dimg item', () => {
    const root = nodes.find((n) => n.label.includes('网格根项 #10000'))
    expect(root).toBeTruthy()
  })
})
