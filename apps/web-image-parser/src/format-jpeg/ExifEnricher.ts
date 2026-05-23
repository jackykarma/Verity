import { extractIptcFields } from './IptcExtractor.ts'
import { decodeMakerNote } from './MakerNoteDecoder.ts'
import { extractExifFields } from './ExifExtractor.ts'
import type { RawSegment } from './JpegSegmentScanner.ts'
import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import { appendThumbnailNode, extractThumbnailInfo } from './ThumbnailExtractor.ts'

export async function enrichTreeWithExif(
  segments: RawSegment[],
  buffer: ArrayBuffer,
  nodes: SegmentNodeDto[],
): Promise<void> {
  let exifChildIndex = 0
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (!seg || seg.parCatalogId !== 'PAR-JPEG-004') {
      continue
    }
    const parentNodeId = `seg-${i}`
    const slice = buffer.slice(seg.offset, seg.offset + seg.length)
    const fields = await extractExifFields(slice, buffer)

    if (fields.length > 0) {
      const gpsFields = fields.filter(
        (f) =>
          f.key.includes('纬') ||
          f.key.includes('经') ||
          f.key.includes('高度') ||
          f.key.includes('GPS'),
      )
      const otherFields = fields.filter((f) => !gpsFields.includes(f))

      if (otherFields.length > 0) {
        nodes.push({
          id: `exif-ifd-${exifChildIndex}`,
          parentId: parentNodeId,
          label: 'EXIF IFD',
          parCatalogId: 'PAR-JPEG-005',
          offset: seg.offset,
          length: seg.length,
          loadType: 'metadata',
          warning: false,
        })
        exifChildIndex += 1
      }

      if (gpsFields.length > 0) {
        nodes.push({
          id: `exif-gps-${exifChildIndex}`,
          parentId: parentNodeId,
          label: 'GPS IFD',
          parCatalogId: 'PAR-JPEG-C02',
          offset: seg.offset,
          length: seg.length,
          loadType: 'metadata',
          warning: false,
        })
        exifChildIndex += 1
      }
    }

    const maker = await decodeMakerNote(slice, buffer)
    if (maker.fields.length > 0) {
      nodes.push({
        id: `exif-mn-${exifChildIndex}`,
        parentId: parentNodeId,
        label: `MakerNote（${maker.vendor}）`,
        parCatalogId: 'PAR-JPEG-026',
        offset: seg.offset,
        length: seg.length,
        loadType: 'metadata',
        warning: !maker.supported,
      })
      exifChildIndex += 1
    }

    const thumb = await extractThumbnailInfo(slice)
    if (thumb) {
      appendThumbnailNode(nodes, parentNodeId, seg.offset, thumb, exifChildIndex)
      exifChildIndex += 1
    }

    const iptcFields = await extractIptcFields(slice)
    if (iptcFields.length > 0) {
      nodes.push({
        id: `exif-iptc-${exifChildIndex}`,
        parentId: parentNodeId,
        label: 'IPTC 元数据',
        parCatalogId: 'PAR-JPEG-022',
        offset: seg.offset,
        length: seg.length,
        loadType: 'metadata',
        warning: false,
      })
      exifChildIndex += 1
    }
  }
}

export { extractExifFields, buildExifReadable, buildComReadable, hexPreview } from './ExifExtractor.ts'
