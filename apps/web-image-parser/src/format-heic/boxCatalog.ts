import type { PayloadKind } from '../shared/types/present.ts'

export interface BoxCatalogEntry {
  parCatalogId: string
  label: string
  loadType: PayloadKind
  isContainer: boolean
  childHeaderSize: number
}

export const PAR_UNKNOWN: BoxCatalogEntry = {
  parCatalogId: 'PAR-HEIC-099',
  label: '未知 box',
  loadType: 'other',
  isContainer: false,
  childHeaderSize: 8,
}

const BOX_CATALOG: Record<string, BoxCatalogEntry> = {
  ftyp: {
    parCatalogId: 'PAR-HEIC-001',
    label: 'ftyp',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 8,
  },
  meta: {
    parCatalogId: 'PAR-HEIC-002',
    label: 'meta',
    loadType: 'metadata',
    isContainer: true,
    childHeaderSize: 12,
  },
  hdlr: {
    parCatalogId: 'PAR-HEIC-003',
    label: 'hdlr',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
  pitm: {
    parCatalogId: 'PAR-HEIC-004',
    label: 'pitm',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
  iinf: {
    parCatalogId: 'PAR-HEIC-005',
    label: 'iinf',
    loadType: 'metadata',
    isContainer: true,
    childHeaderSize: 14,
  },
  iloc: {
    parCatalogId: 'PAR-HEIC-006',
    label: 'iloc',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
  iprp: {
    parCatalogId: 'PAR-HEIC-007',
    label: 'iprp',
    loadType: 'metadata',
    isContainer: true,
    childHeaderSize: 8,
  },
  ipco: {
    parCatalogId: 'PAR-HEIC-008',
    label: 'ipco',
    loadType: 'metadata',
    isContainer: true,
    childHeaderSize: 8,
  },
  ipma: {
    parCatalogId: 'PAR-HEIC-009',
    label: 'ipma',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
  iref: {
    parCatalogId: 'PAR-HEIC-010',
    label: 'iref',
    loadType: 'metadata',
    isContainer: true,
    childHeaderSize: 12,
  },
  mdat: {
    parCatalogId: 'PAR-HEIC-011',
    label: 'mdat',
    loadType: 'other',
    isContainer: false,
    childHeaderSize: 8,
  },
  idat: {
    parCatalogId: 'PAR-HEIC-011',
    label: 'idat',
    loadType: 'other',
    isContainer: false,
    childHeaderSize: 8,
  },
  free: {
    parCatalogId: 'PAR-HEIC-012',
    label: 'free',
    loadType: 'other',
    isContainer: false,
    childHeaderSize: 8,
  },
  skip: {
    parCatalogId: 'PAR-HEIC-012',
    label: 'skip',
    loadType: 'other',
    isContainer: false,
    childHeaderSize: 8,
  },
  uuid: {
    parCatalogId: 'PAR-HEIC-013',
    label: 'uuid',
    loadType: 'other',
    isContainer: false,
    childHeaderSize: 8,
  },
  grpl: {
    parCatalogId: 'PAR-HEIC-014',
    label: 'grpl',
    loadType: 'metadata',
    isContainer: true,
    childHeaderSize: 12,
  },
  moov: {
    parCatalogId: 'PAR-HEIC-401',
    label: 'moov',
    loadType: 'metadata',
    isContainer: true,
    childHeaderSize: 8,
  },
  trak: {
    parCatalogId: 'PAR-HEIC-402',
    label: 'trak',
    loadType: 'metadata',
    isContainer: true,
    childHeaderSize: 8,
  },
  ispe: {
    parCatalogId: 'PAR-HEIC-106',
    label: 'ispe',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
  irot: {
    parCatalogId: 'PAR-HEIC-109',
    label: 'irot',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
  imir: {
    parCatalogId: 'PAR-HEIC-109',
    label: 'imir',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
  mdia: {
    parCatalogId: 'PAR-HEIC-403',
    label: 'mdia',
    loadType: 'metadata',
    isContainer: true,
    childHeaderSize: 8,
  },
  minf: {
    parCatalogId: 'PAR-HEIC-403',
    label: 'minf',
    loadType: 'metadata',
    isContainer: true,
    childHeaderSize: 8,
  },
  hvcC: {
    parCatalogId: 'PAR-HEIC-104',
    label: 'hvcC',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
  colr: {
    parCatalogId: 'PAR-HEIC-108',
    label: 'colr',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
  pixi: {
    parCatalogId: 'PAR-HEIC-107',
    label: 'pixi',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
  infe: {
    parCatalogId: 'PAR-HEIC-005',
    label: 'infe',
    loadType: 'metadata',
    isContainer: false,
    childHeaderSize: 12,
  },
}

const ITEM_TYPE_CATALOG: Record<string, { parCatalogId: string; label: string; loadType: PayloadKind }> =
  {
    hvc1: { parCatalogId: 'PAR-HEIC-101', label: '主图像 (hvc1)', loadType: 'image' },
    hev1: { parCatalogId: 'PAR-HEIC-101', label: '主图像 (hev1)', loadType: 'image' },
    avc1: { parCatalogId: 'PAR-HEIC-104', label: 'AVC 图像项', loadType: 'image' },
    jpeg: { parCatalogId: 'PAR-HEIC-105', label: 'JPEG 图像项', loadType: 'image' },
    Exif: { parCatalogId: 'PAR-HEIC-201', label: 'Exif 元数据项', loadType: 'metadata' },
    mime: { parCatalogId: 'PAR-HEIC-202', label: 'MIME 项', loadType: 'metadata' },
    uri: { parCatalogId: 'PAR-HEIC-202', label: 'URI 项', loadType: 'metadata' },
    grid: { parCatalogId: 'PAR-HEIC-103', label: '网格项', loadType: 'image' },
    thmb: { parCatalogId: 'PAR-HEIC-102', label: '缩略图项', loadType: 'image' },
    auxl: { parCatalogId: 'PAR-HEIC-110', label: '辅助图像项', loadType: 'image' },
  }

export function catalogForBox(type: string): BoxCatalogEntry {
  if (!/^[ \x20-\x7e]{4}$/.test(type)) {
    return { ...PAR_UNKNOWN, label: '无效 box' }
  }
  return BOX_CATALOG[type] ?? { ...PAR_UNKNOWN, label: `未知 (${type})` }
}

export function catalogForItemType(itemType: string): {
  parCatalogId: string
  label: string
  loadType: PayloadKind
} {
  return (
    ITEM_TYPE_CATALOG[itemType] ?? {
      parCatalogId: 'PAR-HEIC-099',
      label: `项 (${itemType})`,
      loadType: 'other',
    }
  )
}

export function readFtypBrands(data: Uint8Array, offset: number, size: number): string[] {
  const brands: string[] = []
  if (size < 16) {
    return brands
  }
  const major = String.fromCharCode(data[offset + 8]!, data[offset + 9]!, data[offset + 10]!, data[offset + 11]!)
  brands.push(major)
  for (let i = 16; i + 4 <= offset + size; i += 4) {
    brands.push(
      String.fromCharCode(data[i]!, data[i + 1]!, data[i + 2]!, data[i + 3]!),
    )
  }
  return brands
}

export function readPitmItemId(data: Uint8Array, offset: number, size: number): number | null {
  if (size < 14) {
    return null
  }
  const version = data[offset + 8]
  if (version === 0) {
    return (data[offset + 12]! << 8) | data[offset + 13]!
  }
  if (size >= 16) {
    return (data[offset + 12]! << 24) | (data[offset + 13]! << 16) | (data[offset + 14]! << 8) | data[offset + 15]!
  }
  return null
}

export function readIspeSize(data: Uint8Array, offset: number, size: number): string | null {
  if (size < 20) {
    return null
  }
  const w = (data[offset + 12]! << 24) | (data[offset + 13]! << 16) | (data[offset + 14]! << 8) | data[offset + 15]!
  const h = (data[offset + 16]! << 24) | (data[offset + 17]! << 16) | (data[offset + 18]! << 8) | data[offset + 19]!
  return `${w} × ${h}`
}

export function readInfeItem(data: Uint8Array, offset: number, size: number): {
  itemId: number
  itemType: string
} | null {
  if (size < 20) {
    return null
  }
  const version = data[offset + 8]
  if (version === 2) {
    const itemId = (data[offset + 12]! << 8) | data[offset + 13]!
    const itemType = String.fromCharCode(
      data[offset + 16]!,
      data[offset + 17]!,
      data[offset + 18]!,
      data[offset + 19]!,
    )
    return { itemId, itemType }
  }
  return null
}

export function readHdlrType(data: Uint8Array, offset: number, size: number): string | null {
  if (size < 20) {
    return null
  }
  return String.fromCharCode(data[offset + 16]!, data[offset + 17]!, data[offset + 18]!, data[offset + 19]!)
}
