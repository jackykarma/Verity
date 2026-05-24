import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { AuxSubtype, ContentRef, PresentRequest } from '../shared/types/present.ts'
import { buildExifReadable, hexPreview } from '../format-jpeg/ExifExtractor.ts'
import { formatByteOffset } from '../shared/formatUtils.ts'
import { detectHeicEnvironment } from './HeicEnvDetector.ts'
import { buildIpmaReadable } from './IpmaEnricher.ts'
import { extractMetadataItemReadable } from './MetadataItemExtractor.ts'
import { parseBmffBoxes } from './BmffReader.ts'
import { parseIloc } from './IlocParser.ts'

const IMAGE_CATALOG = new Set([
  'PAR-HEIC-101',
  'PAR-HEIC-102',
  'PAR-HEIC-103',
  'PAR-HEIC-104',
  'PAR-HEIC-105',
  'PAR-HEIC-110',
  'PAR-HEIC-111',
  'PAR-HEIC-113',
])

function parseItemIdFromLabel(label: string): number | null {
  const match = label.match(/#(\d+)/)
  return match ? Number(match[1]) : null
}

export async function toHeicPresentRequest(
  node: SegmentNodeDto,
  sessionId: string,
  buffer: ArrayBuffer,
): Promise<PresentRequest> {
  const slice = buffer.slice(node.offset, node.offset + node.length)
  const fields = [
    { key: '目录 ID', value: node.parCatalogId },
    { key: '偏移', value: formatByteOffset(node.offset) },
    { key: '长度', value: String(node.length) },
  ]

  let readablePayload = { title: node.label, fields }

  const { boxes } = parseBmffBoxes(buffer)
  const itemLocations = parseIloc(buffer, boxes)
  const itemId = parseItemIdFromLabel(node.label)
  const infeBox = boxes.find((b) => b.type === 'infe' && b.offset === node.offset)

  if (node.parCatalogId === 'PAR-HEIC-201' || infeBox?.itemType === 'Exif') {
    if (itemId !== null) {
      readablePayload = await extractMetadataItemReadable(
        buffer,
        'Exif',
        itemId,
        itemLocations,
      )
    } else {
      readablePayload = await buildExifReadable(slice)
    }
  } else if (
    node.parCatalogId === 'PAR-HEIC-203' ||
    node.parCatalogId === 'PAR-HEIC-204' ||
    node.parCatalogId === 'PAR-HEIC-202'
  ) {
    if (itemId !== null && infeBox?.itemType) {
      readablePayload = await extractMetadataItemReadable(
        buffer,
        infeBox.itemType.trim(),
        itemId,
        itemLocations,
      )
    }
  } else if (node.parCatalogId === 'PAR-HEIC-302') {
    readablePayload = {
      title: 'Live Photo 关联',
      fields: [{ key: '关系', value: node.label }],
    }
  } else if (node.parCatalogId === 'PAR-HEIC-009') {
    const ipmaBox = boxes.find((b) => b.type === 'ipma' && b.offset === node.offset)
    if (ipmaBox) {
      readablePayload = buildIpmaReadable(buffer, ipmaBox)
    }
  } else if (node.parCatalogId === 'PAR-HEIC-011') {
    readablePayload = {
      title: node.label,
      fields: [...fields, { key: '十六进制预览', value: hexPreview(slice) }],
    }
  } else if (node.parCatalogId === 'PAR-HEIC-099' || node.loadType === 'other') {
    readablePayload = {
      title: node.label,
      fields: [...fields, { key: '十六进制预览', value: hexPreview(slice) }],
    }
  }

  let contentRef: ContentRef | null = null
  const env = detectHeicEnvironment()

  let auxSubtype: AuxSubtype | null = null
  if (node.parCatalogId === 'PAR-HEIC-110' || node.parCatalogId === 'PAR-HEIC-111') {
    auxSubtype = 'depth'
  } else if (node.parCatalogId === 'PAR-HEIC-113') {
    auxSubtype = 'hdrGain'
  }

  if (node.loadType === 'image' || IMAGE_CATALOG.has(node.parCatalogId)) {
    if (env.canPreviewImage) {
      contentRef = {
        kind: 'byteRange',
        sessionId,
        offset: 0,
        length: buffer.byteLength,
      }
    } else {
      readablePayload = {
        title: node.label,
        fields: [
          ...fields,
          { key: '环境', value: env.message },
          { key: '说明', value: '当前浏览器不支持 HEIC 图像预览' },
        ],
      }
    }
  } else if (node.loadType === 'video' || node.parCatalogId === 'PAR-HEIC-301') {
    contentRef =
      env.canPlayVideo
        ? { kind: 'byteRange', sessionId, offset: 0, length: buffer.byteLength }
        : null
    if (!contentRef) {
      readablePayload = {
        title: node.label,
        fields: [...fields, { key: '说明', value: '当前环境不支持 HEIC 视频播放' }],
      }
    }
  } else if (node.loadType === 'audio' || node.parCatalogId === 'PAR-HEIC-305') {
    contentRef = { kind: 'byteRange', sessionId, offset: 0, length: buffer.byteLength }
  } else if (node.loadType === 'mixed' || node.parCatalogId === 'PAR-HEIC-302') {
    return {
      segmentId: node.id,
      sessionId,
      payloadKind: 'mixed',
      auxSubtype: null,
      contentRef: env.canPreviewImage
        ? { kind: 'byteRange', sessionId, offset: 0, length: buffer.byteLength }
        : null,
      readablePayload,
    }
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
