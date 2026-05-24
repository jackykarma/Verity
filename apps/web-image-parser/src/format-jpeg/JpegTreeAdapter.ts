import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { AuxSubtype, ContentRef, GalleryImage, PresentRequest, ReadablePayload } from '../shared/types/present.ts'
import { attachSegmentHex, buildExifReadable } from './ExifExtractor.ts'
import { extractIptcFromApp13 } from './IptcExtractor.ts'
import { buildMakerNoteReadable, decodeMakerNote } from './MakerNoteDecoder.ts'
import {
  buildMpfFrameReadable,
  buildMpfGallery,
  buildMpfReadable,
  createMpfFrameBlobRef,
  mpoFrameIndexFromNodeId,
  parseMpfWithContainer,
} from './MpfParser.ts'
import { buildSegmentDetailReadable } from './SegmentDetailExtractor.ts'
import { comText } from './SegmentTreeBuilder.ts'
import { extractThumbnailInfo, buildExifThumbnailGallery, buildThumbnailReadableFields } from './ThumbnailExtractor.ts'
import { findXmpContainerInBuffer } from './XmpContainer.ts'
import { formatByteOffset } from '../shared/formatUtils.ts'
import { extractXmpFromApp1 } from './XmpExtractor.ts'

const IMAGE_PREVIEW_CATALOG = new Set([
  'PAR-JPEG-015',
  'PAR-JPEG-013',
  'PAR-JPEG-025',
  'PAR-JPEG-MPO-FRAME',
])

function findMpfSegmentForNode(
  node: SegmentNodeDto,
  allNodes: SegmentNodeDto[] | undefined,
): { offset: number; length: number } {
  if (node.parCatalogId === 'PAR-JPEG-028') {
    return { offset: node.offset, length: node.length }
  }

  if (node.parentId && allNodes) {
    const parent = allNodes.find((n) => n.id === node.parentId)
    if (parent?.parCatalogId === 'PAR-JPEG-028') {
      return { offset: parent.offset, length: parent.length }
    }
    if (parent?.parCatalogId === 'PAR-JPEG-019') {
      return { offset: parent.offset, length: parent.length }
    }
  }

  return { offset: node.offset, length: node.length }
}

function mpfPresentExtras(
  node: SegmentNodeDto,
  buffer: ArrayBuffer,
  sessionId: string,
  allNodes?: SegmentNodeDto[],
): { readablePayload: ReadablePayload; gallery: GalleryImage[] } {
  const { offset, length } = findMpfSegmentForNode(node, allNodes)
  const containerItems = findXmpContainerInBuffer(buffer)
  const mpf = parseMpfWithContainer(buffer, offset, length, containerItems)
  if (!mpf) {
    return {
      readablePayload: { title: node.label, fields: [{ key: '提示', value: '无法解析 MPF 结构' }] },
      gallery: [],
    }
  }

  return {
    readablePayload: buildMpfReadable(mpf),
    gallery: buildMpfGallery(buffer, mpf, sessionId),
  }
}

export async function toPresentRequest(
  node: SegmentNodeDto,
  sessionId: string,
  buffer: ArrayBuffer,
  allNodes?: SegmentNodeDto[],
): Promise<PresentRequest> {
  const slice = buffer.slice(node.offset, node.offset + node.length)
  let readablePayload = buildSegmentDetailReadable(node, buffer)

  let gallery: GalleryImage[] | undefined

  const exifThumb = await extractThumbnailInfo(buffer)
  const exifThumbFields = exifThumb ? buildThumbnailReadableFields(exifThumb) : undefined
  const exifThumbGallery =
    exifThumb && exifThumb.jpegBytes ? buildExifThumbnailGallery(exifThumb, sessionId) : undefined

  if (node.parCatalogId === 'PAR-JPEG-004' || node.parCatalogId === 'PAR-JPEG-005') {
    readablePayload = await buildExifReadable(slice, buffer, exifThumbFields)
    if (exifThumbGallery?.length) {
      gallery = exifThumbGallery
    }
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
  } else if (node.parCatalogId === 'PAR-JPEG-021') {
    readablePayload = extractXmpFromApp1(slice)
  } else if (node.parCatalogId === 'PAR-JPEG-028' || node.parCatalogId === 'PAR-JPEG-019') {
    const extras = mpfPresentExtras(node, buffer, sessionId, allNodes)
    readablePayload = extras.readablePayload ?? readablePayload
    gallery = extras.gallery
  } else if (node.parCatalogId === 'PAR-JPEG-MPO-FRAME') {
    const mpfSeg = findMpfSegmentForNode(node, allNodes)
    const containerItems = findXmpContainerInBuffer(buffer)
    const mpf = parseMpfWithContainer(buffer, mpfSeg.offset, mpfSeg.length, containerItems)
    const frameIdx = mpoFrameIndexFromNodeId(node.id)
    const entry =
      frameIdx != null
        ? mpf?.entries.find((e) => e.index === frameIdx)
        : mpf?.entries.find((e) => e.offset === node.offset && e.size === node.length)
    readablePayload = entry ? buildMpfFrameReadable(entry) : { title: node.label, fields: [] }
  } else if (node.parCatalogId === 'PAR-JPEG-MPO-MOTION') {
    readablePayload = {
      title: node.label,
      fields: [
        { key: '类型', value: 'Motion Photo 视频载荷' },
        { key: '偏移', value: formatByteOffset(node.offset) },
        { key: '大小', value: `${node.length} 字节` },
        { key: '说明', value: '来自 XMP Container Item:Semantic=MotionPhoto' },
      ],
    }
  } else if (node.parCatalogId === 'PAR-JPEG-025') {
    readablePayload = {
      title: 'EXIF 缩略图 (ThumbnailImage)',
      fields: exifThumb
        ? buildThumbnailReadableFields(exifThumb)
        : [{ key: '提示', value: '无 EXIF 缩略图' }],
    }
  }

  const hexSlice =
    node.parCatalogId === 'PAR-JPEG-025' && exifThumb && exifThumb.length > 0
      ? buffer.slice(exifThumb.fileOffset, exifThumb.fileOffset + exifThumb.length)
      : slice

  if (readablePayload) {
    readablePayload = attachSegmentHex(readablePayload, hexSlice, Math.min(hexSlice.byteLength, 512))
  }

  let contentRef: ContentRef | null = null
  if (node.loadType === 'image' || IMAGE_PREVIEW_CATALOG.has(node.parCatalogId)) {
    if (node.parCatalogId === 'PAR-JPEG-025') {
      const thumb = exifThumb
      if (thumb?.jpegBytes) {
        const blob = new Blob([thumb.jpegBytes], { type: 'image/jpeg' })
        contentRef = { kind: 'blobUrl', url: URL.createObjectURL(blob), mimeType: 'image/jpeg' }
      } else if (thumb && thumb.fileOffset > 0 && thumb.length > 0) {
        contentRef = {
          kind: 'byteRange',
          sessionId,
          offset: thumb.fileOffset,
          length: thumb.length,
        }
      }
    } else if (node.parCatalogId === 'PAR-JPEG-MPO-FRAME') {
      const mpfSeg = findMpfSegmentForNode(node, allNodes)
      const containerItems = findXmpContainerInBuffer(buffer)
      const mpf = parseMpfWithContainer(buffer, mpfSeg.offset, mpfSeg.length, containerItems)
      const frameIdx = mpoFrameIndexFromNodeId(node.id)
      const entry =
        frameIdx != null ? mpf?.entries.find((e) => e.index === frameIdx) : undefined
      contentRef = entry && mpf ? createMpfFrameBlobRef(buffer, entry, mpf.entries) : null
      if (!contentRef && entry?.index === 0) {
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
    gallery,
  }
}
