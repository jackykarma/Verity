import type { PayloadKind } from '../shared/types/present.ts'
import { matchAppPayload } from './jpegExifToolRef.ts'

export interface SegmentCatalogEntry {
  parCatalogId: string
  label: string
  loadType: PayloadKind
  priority: 'P0' | 'P1' | 'P2'
}

const MARKER_CATALOG: Record<number, SegmentCatalogEntry> = {
  0xd8: { parCatalogId: 'PAR-JPEG-001', label: 'SOI', loadType: 'metadata', priority: 'P0' },
  0xd9: { parCatalogId: 'PAR-JPEG-002', label: 'EOI', loadType: 'metadata', priority: 'P0' },
  0xda: { parCatalogId: 'PAR-JPEG-014', label: 'SOS', loadType: 'metadata', priority: 'P0' },
  0xdb: { parCatalogId: 'PAR-JPEG-011', label: 'DQT', loadType: 'other', priority: 'P0' },
  0xc4: { parCatalogId: 'PAR-JPEG-012', label: 'DHT', loadType: 'other', priority: 'P1' },
  0xdd: { parCatalogId: 'PAR-JPEG-016', label: 'DRI', loadType: 'metadata', priority: 'P1' },
  0xfe: { parCatalogId: 'PAR-JPEG-010', label: 'COM', loadType: 'metadata', priority: 'P0' },
}

const SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
])

const RST_MARKERS = new Set([0xd0, 0xd1, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7])

export const PAR_ENTROPY_DATA: SegmentCatalogEntry = {
  parCatalogId: 'PAR-JPEG-015',
  label: '压缩图像数据',
  loadType: 'image',
  priority: 'P0',
}

export const PAR_UNKNOWN: SegmentCatalogEntry = {
  parCatalogId: 'PAR-JPEG-099',
  label: '未知标记段',
  loadType: 'other',
  priority: 'P0',
}

export function isRstMarker(marker: number): boolean {
  return RST_MARKERS.has(marker)
}

export function isSofMarker(marker: number): boolean {
  return SOF_MARKERS.has(marker)
}

function readAscii(data: Uint8Array, offset: number, length: number): string {
  let out = ''
  for (let i = 0; i < length && offset + i < data.length; i++) {
    const c = data[offset + i]
    if (c === undefined || c === 0) {
      break
    }
    out += String.fromCharCode(c)
  }
  return out
}

export function classifyAppSegment(
  data: Uint8Array,
  offset: number,
  length: number,
  appMarker?: number,
): SegmentCatalogEntry {
  const payloadStart = offset + 4
  const payloadLen = Math.max(0, length - 4)
  if (payloadLen < 4) {
    return { parCatalogId: 'PAR-JPEG-099', label: 'APP（空）', loadType: 'other', priority: 'P0' }
  }

  const appNum = appMarker !== undefined ? appMarker - 0xe0 : undefined
  const etMatch = appNum !== undefined ? matchAppPayload(appNum, data, payloadStart) : null

  const head5 = readAscii(data, payloadStart, 5)
  const head6 = readAscii(data, payloadStart, 6)

  if (head5 === 'JFIF\0' || head5.startsWith('JFIF')) {
    return { parCatalogId: 'PAR-JPEG-003', label: labelForApp(appNum, 'JFIF'), loadType: 'metadata', priority: 'P0' }
  }
  if (head5.startsWith('JFXX')) {
    return { parCatalogId: 'PAR-JPEG-003', label: labelForApp(appNum, 'JFXX'), loadType: 'metadata', priority: 'P0' }
  }
  if (head6.startsWith('Exif')) {
    return { parCatalogId: 'PAR-JPEG-004', label: labelForApp(appNum, 'EXIF'), loadType: 'metadata', priority: 'P0' }
  }
  if (head5.startsWith('http:') || readAscii(data, payloadStart, 29).includes('ns.adobe.com/xap')) {
    const xmpName = readAscii(data, payloadStart, 40).includes('xmp/extension') ? 'ExtendedXMP' : 'XMP'
    return { parCatalogId: 'PAR-JPEG-021', label: labelForApp(appNum, xmpName), loadType: 'metadata', priority: 'P1' }
  }
  if (readAscii(data, payloadStart, 12).startsWith('ICC_PROFILE')) {
    return { parCatalogId: 'PAR-JPEG-006', label: labelForApp(appNum, 'ICC_Profile'), loadType: 'metadata', priority: 'P1' }
  }
  const mpfHead = readAscii(data, payloadStart, 4)
  if (mpfHead === 'MPF\0' || mpfHead.startsWith('MPF')) {
    return {
      parCatalogId: 'PAR-JPEG-028',
      label: labelForApp(appNum, 'MPF'),
      loadType: 'metadata',
      priority: 'P1',
    }
  }
  if (readAscii(data, payloadStart, 10).startsWith('Photoshop')) {
    return { parCatalogId: 'PAR-JPEG-007', label: labelForApp(appNum, 'Photoshop'), loadType: 'metadata', priority: 'P1' }
  }
  if (readAscii(data, payloadStart, 5) === 'Adobe') {
    return { parCatalogId: 'PAR-JPEG-008', label: labelForApp(appNum, 'Adobe'), loadType: 'metadata', priority: 'P1' }
  }
  if (readAscii(data, payloadStart, 8) === 'Adobe_CM') {
    return { parCatalogId: 'PAR-JPEG-027', label: labelForApp(appNum, 'Adobe_CM'), loadType: 'metadata', priority: 'P1' }
  }
  if (readAscii(data, payloadStart, 11) === 'HDRGainInfo') {
    return { parCatalogId: 'PAR-JPEG-029', label: labelForApp(appNum, 'HDRGainInfo'), loadType: 'metadata', priority: 'P1' }
  }
  if (readAscii(data, payloadStart, 8).startsWith('JPEG-HDR') || readAscii(data, payloadStart, 5) === 'JUMBF') {
    const name = readAscii(data, payloadStart, 8).startsWith('JPEG-HDR') ? 'JPEG-HDR' : 'JUMBF'
    return { parCatalogId: 'PAR-JPEG-030', label: labelForApp(appNum, name), loadType: 'metadata', priority: 'P1' }
  }
  if (readAscii(data, payloadStart, 5) === 'Ducky') {
    return { parCatalogId: 'PAR-JPEG-031', label: labelForApp(appNum, 'Ducky'), loadType: 'metadata', priority: 'P2' }
  }

  if (etMatch && etMatch.tagName !== `APP${appNum}`) {
    return {
      parCatalogId: 'PAR-JPEG-009',
      label: labelForApp(appNum, etMatch.tagName),
      loadType: 'metadata',
      priority: 'P1',
    }
  }

  return {
    parCatalogId: 'PAR-JPEG-009',
    label: appNum !== undefined ? `APP${appNum}` : '其他 APP 段',
    loadType: 'metadata',
    priority: 'P1',
  }
}

function labelForApp(appNum: number | undefined, tagName: string): string {
  return appNum !== undefined ? `APP${appNum} (${tagName})` : tagName
}

export function catalogForMarker(
  marker: number,
  data: Uint8Array,
  offset: number,
  length: number,
): SegmentCatalogEntry {
  if (marker >= 0xe0 && marker <= 0xef) {
    const appEntry = classifyAppSegment(data, offset, length, marker)
    if (appEntry.parCatalogId !== 'PAR-JPEG-009' && appEntry.parCatalogId !== 'PAR-JPEG-099') {
      return appEntry
    }
    const n = marker - 0xe0
    return {
      parCatalogId: appEntry.parCatalogId === 'PAR-JPEG-009' ? 'PAR-JPEG-009' : appEntry.parCatalogId,
      label: appEntry.label !== '其他 APP 段' ? appEntry.label : `APP${n}`,
      loadType: 'metadata',
      priority: appEntry.priority,
    }
  }

  if (isSofMarker(marker)) {
    const sofNum = marker - 0xc0
    const progressive = marker === 0xc2 || marker === 0xc6 || marker === 0xca || marker === 0xce
    return {
      parCatalogId: progressive ? 'PAR-JPEG-020' : 'PAR-JPEG-013',
      label: progressive ? `SOF${sofNum} (渐进式)` : `SOF${sofNum}`,
      loadType: progressive ? 'image' : 'metadata',
      priority: progressive ? 'P1' : 'P0',
    }
  }

  if (isRstMarker(marker)) {
    const n = marker - 0xd0
    return {
      parCatalogId: 'PAR-JPEG-017',
      label: `RST${n}`,
      loadType: 'metadata',
      priority: 'P1',
    }
  }

  return MARKER_CATALOG[marker] ?? {
    ...PAR_UNKNOWN,
    label: `未知 0x${marker.toString(16).toUpperCase()}`,
  }
}

export function isUnknownCatalog(parCatalogId: string): boolean {
  return parCatalogId === 'PAR-JPEG-099'
}
