import { describe, expect, it } from 'vitest'
import {
  enrichMpfEntriesWithContainer,
  buildMpfPreviewBytes,
  normalizeMpfEntries,
} from '../MpfParser.ts'
import {
  parseXmpContainerItems,
  resolveContainerItemOffsets,
  semanticDisplayLabel,
} from '../XmpContainer.ts'

const SAMPLE_CONTAINER = `<rdf:Seq>
  <rdf:li rdf:parseType="Resource">
    <Container:Item Item:Mime="image/jpeg" Item:Semantic="Primary" Item:Length="0" Item:Padding="0"/>
  </rdf:li>
  <rdf:li rdf:parseType="Resource">
    <Container:Item Item:Mime="image/jpeg" Item:Semantic="GainMap" Item:Length="22" Item:Padding="0"/>
  </rdf:li>
  <rdf:li rdf:parseType="Resource">
    <Container:Item Item:Mime="video/mp4" Item:Semantic="MotionPhoto" Item:Length="30"/>
  </rdf:li>
</rdf:Seq>`

/**
 * @vitest-environment node
 */
describe('XmpContainer', () => {
  it('parses Container Item semantics and lengths', () => {
    const items = parseXmpContainerItems(SAMPLE_CONTAINER)
    expect(items).toHaveLength(3)
    expect(items[0]?.semantic).toBe('Primary')
    expect(items[1]?.semantic).toBe('GainMap')
    expect(items[1]?.length).toBe(22)
    expect(items[2]?.mime).toBe('video/mp4')
  })

  it('resolves tail-stacked offsets from file end', () => {
    const items = parseXmpContainerItems(SAMPLE_CONTAINER)
    const resolved = resolveContainerItemOffsets(100, items)

    expect(resolved[0]?.offset).toBe(0)
    expect(resolved[1]?.offset).toBe(48)
    expect(resolved[2]?.offset).toBe(70)
    expect(resolved[1]?.offset! + resolved[1]?.length! + resolved[2]?.length!).toBe(100)
  })

  it('labels MPF frame 2 as GainMap and previews via XMP length', () => {
    const gainMapJpeg = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
      0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
    ])
    const motion = new Uint8Array(30).fill(0x42)
    const primary = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xda])

    const file = new Uint8Array(primary.length + gainMapJpeg.length + motion.length)
    file.set(primary, 0)
    file.set(gainMapJpeg, primary.length)
    file.set(motion, primary.length + gainMapJpeg.length)

    const container = resolveContainerItemOffsets(file.length, [
      { index: 0, semantic: 'Primary', mime: 'image/jpeg', length: 0, padding: 0 },
      {
        index: 1,
        semantic: 'GainMap',
        mime: 'image/jpeg',
        length: gainMapJpeg.length,
        padding: 0,
      },
      { index: 2, semantic: 'MotionPhoto', mime: 'video/mp4', length: motion.length, padding: 0 },
    ])

    const entries = enrichMpfEntriesWithContainer(
      normalizeMpfEntries(file.buffer, [
        {
          index: 0,
          rawAttr: 0,
          flags: 0,
          flagsLabel: 'Flags 0x0',
          formatCode: 0,
          format: 'JPEG',
          imageType: 0x30000,
          imageTypeLabel: 'Baseline MP Primary Image',
          size: 0,
          offset: 0,
          role: 'Baseline MP Primary Image',
          dependent1: 0,
          dependent2: 0,
        },
        {
          index: 1,
          rawAttr: 0x50000,
          flags: 0,
          flagsLabel: 'Flags 0x0',
          formatCode: 0,
          format: 'JPEG',
          imageType: 0x50000,
          imageTypeLabel: 'Gain Map Image',
          size: 9999,
          offset: 1,
          role: 'Gain Map Image',
          dependent1: 0,
          dependent2: 0,
        },
      ]),
      container,
    )

    expect(entries[1]?.role).toBe('Gain Map Image')
    expect(entries[1]?.xmpOffset).toBe(primary.length)

    const preview = buildMpfPreviewBytes(file.buffer, entries[1]!, entries)
    expect(preview?.byteLength).toBe(gainMapJpeg.byteLength)
    expect(preview?.[0]).toBe(0xff)
    expect(preview?.[1]).toBe(0xd8)
  })
})
