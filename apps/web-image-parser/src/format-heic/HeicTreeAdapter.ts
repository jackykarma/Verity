import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { AuxSubtype, ContentRef, PresentRequest } from '../shared/types/present.ts'
import { formatByteOffset } from '../shared/formatUtils.ts'
import { parseBmffBoxes } from './BmffReader.ts'
import { buildBoxDetailReadable } from './BoxDetailParser.ts'
import { hexDumpAt } from './boxHexDump.ts'
import { detectHeicEnvironment } from './HeicEnvDetector.ts'
import { extractMetadataItemReadable } from './MetadataItemExtractor.ts'
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
  const { boxes } = parseBmffBoxes(buffer)
  const itemLocations = parseIloc(buffer, boxes)
  const itemId = parseItemIdFromLabel(node.label)
  const infeBox =
    itemId !== null
      ? boxes.find((b) => b.type === 'infe' && b.itemId === itemId)
      : boxes.find((b) => b.type === 'infe' && b.offset === node.offset)

  let readablePayload = buildBoxDetailReadable(node, buffer, boxes, itemLocations)

  if (node.parCatalogId === 'PAR-HEIC-201' || infeBox?.itemType === 'Exif') {
    if (itemId !== null) {
      readablePayload = await extractMetadataItemReadable(buffer, 'Exif', itemId, itemLocations)
    }
    if (readablePayload && itemId !== null) {
      const loc = itemLocations.get(itemId)
      if (loc) {
        readablePayload = {
          ...readablePayload,
          hexPreview: hexDumpAt(buffer, loc.offset, loc.length, { maxBytes: 512 }),
        }
      }
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
      const loc = itemLocations.get(itemId)
      if (readablePayload && loc) {
        readablePayload = {
          ...readablePayload,
          hexPreview: hexDumpAt(buffer, loc.offset, loc.length, { maxBytes: 512 }),
        }
      }
    }
  }

  if (!readablePayload) {
    readablePayload = {
      title: node.label,
      fields: [
        { key: '目录 ID', value: node.parCatalogId },
        { key: '偏移', value: formatByteOffset(node.offset) },
        { key: '长度', value: String(node.length) },
      ],
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
    if (!env.canPreviewImage) {
      return {
        segmentId: node.id,
        sessionId,
        payloadKind: 'metadata',
        auxSubtype: null,
        contentRef: null,
        readablePayload,
      }
    }

    const loc = itemId !== null ? itemLocations.get(itemId) : undefined
    if (node.parCatalogId === 'PAR-HEIC-103') {
      contentRef = { kind: 'byteRange', sessionId, offset: 0, length: buffer.byteLength }
    } else if (loc && loc.length > 0) {
      contentRef = {
        kind: 'byteRange',
        sessionId,
        offset: loc.offset,
        length: loc.length,
      }
    } else {
      contentRef = { kind: 'byteRange', sessionId, offset: 0, length: buffer.byteLength }
    }
  } else if (node.loadType === 'video' || node.parCatalogId === 'PAR-HEIC-301') {
    contentRef =
      env.canPlayVideo
        ? { kind: 'byteRange', sessionId, offset: 0, length: buffer.byteLength }
        : null
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

  const useMetadataView =
    node.loadType === 'metadata' ||
    node.loadType === 'other' ||
    contentRef === null ||
    (node.loadType === 'image' && !env.canPreviewImage)

  return {
    segmentId: node.id,
    sessionId,
    payloadKind: useMetadataView ? 'metadata' : node.loadType,
    auxSubtype,
    contentRef,
    readablePayload,
  }
}
