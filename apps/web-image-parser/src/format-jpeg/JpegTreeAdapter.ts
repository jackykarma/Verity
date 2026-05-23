import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { AuxSubtype, ContentRef, PresentRequest } from '../shared/types/present.ts'
import { buildExifReadable, hexPreview } from './ExifExtractor.ts'
import { extractIptcFromApp13 } from './IptcExtractor.ts'
import { buildMakerNoteReadable, decodeMakerNote } from './MakerNoteDecoder.ts'
import { comText, segmentReadableHint } from './SegmentTreeBuilder.ts'
import { extractThumbnailInfo } from './ThumbnailExtractor.ts'

const IMAGE_PREVIEW_CATALOG = new Set([
  'PAR-JPEG-015',
  'PAR-JPEG-013',
  'PAR-JPEG-025',
])

export async function toPresentRequest(
  node: SegmentNodeDto,
  sessionId: string,
  buffer: ArrayBuffer,
): Promise<PresentRequest> {
  const slice = buffer.slice(node.offset, node.offset + node.length)
  let readablePayload = segmentReadableHint(
    {
      marker: 0,
      label: node.label,
      parCatalogId: node.parCatalogId,
      offset: node.offset,
      length: node.length,
      loadType: node.loadType,
      warning: node.warning,
    },
    new Uint8Array(buffer),
  )

  if (node.parCatalogId === 'PAR-JPEG-004' || node.parCatalogId === 'PAR-JPEG-005') {
    readablePayload = await buildExifReadable(slice, buffer)
  } else if (node.parCatalogId === 'PAR-JPEG-C02') {
    const exif = await buildExifReadable(
      buffer.slice(node.offset, node.offset + node.length),
      buffer,
    )
    readablePayload = {
      title: 'GPS IFD',
      fields: exif.fields.filter(
        (f) =>
          f.key.includes('纬') ||
          f.key.includes('经') ||
          f.key.includes('高度') ||
          f.key.includes('GPS'),
      ),
    }
  } else if (node.parCatalogId === 'PAR-JPEG-026' || node.parCatalogId === 'PAR-JPEG-C03') {
    const maker = await decodeMakerNote(slice, buffer)
    readablePayload = buildMakerNoteReadable(maker)
  } else if (node.parCatalogId === 'PAR-JPEG-007' || node.parCatalogId === 'PAR-JPEG-022') {
    readablePayload = await extractIptcFromApp13(slice)
  } else if (node.parCatalogId === 'PAR-JPEG-010') {
    readablePayload = {
      title: 'COM 注释',
      fields: [{ key: '内容', value: comText(new Uint8Array(buffer), node.offset, node.length) }],
    }
  } else if (node.parCatalogId === 'PAR-JPEG-099' || node.loadType === 'other') {
    readablePayload = {
      ...readablePayload,
      fields: [
        ...readablePayload.fields,
        { key: '十六进制预览', value: hexPreview(slice) },
      ],
    }
  }

  let contentRef: ContentRef | null = null
  if (node.loadType === 'image' || IMAGE_PREVIEW_CATALOG.has(node.parCatalogId)) {
    if (node.parCatalogId === 'PAR-JPEG-025') {
      const thumb = await extractThumbnailInfo(buffer)
      if (thumb?.jpegBytes) {
        const blob = new Blob([thumb.jpegBytes], { type: 'image/jpeg' })
        contentRef = { kind: 'blobUrl', url: URL.createObjectURL(blob), mimeType: 'image/jpeg' }
      } else {
        contentRef = {
          kind: 'byteRange',
          sessionId,
          offset: 0,
          length: buffer.byteLength,
        }
      }
    } else {
      contentRef = {
        kind: 'byteRange',
        sessionId,
        offset: 0,
        length: buffer.byteLength,
      }
    }
  } else if (node.loadType === 'video' || node.loadType === 'audio') {
    contentRef = {
      kind: 'byteRange',
      sessionId,
      offset: node.offset,
      length: node.length,
    }
  }

  let auxSubtype: AuxSubtype | null = null
  if (node.parCatalogId.includes('depth')) {
    auxSubtype = 'depth'
  }

  return {
    segmentId: node.id,
    sessionId,
    payloadKind: node.loadType,
    auxSubtype,
    contentRef,
    readablePayload,
  }
}
