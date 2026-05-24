import type { PayloadKind } from '../shared/types/present.ts'
import {
  catalogForBox,
  catalogForItemType,
  readFtypBrands,
  readHdlrType,
  readInfeItem,
  readIspeSize,
  readPitmItemId,
} from './boxCatalog.ts'

export interface BmffBox {
  type: string
  offset: number
  size: number
  headerSize: number
  catalogId: string
  label: string
  loadType: PayloadKind
  warning: boolean
  parentOffset: number | null
  itemId?: number
  itemType?: string
}

export interface BmffParseResult {
  boxes: BmffBox[]
  truncated: boolean
  /** 文件末尾存在无 BMFF 头的厂商媒体数据（非截断） */
  vendorTailBytes: number
  warnings: string[]
}

const OPAQUE_TAIL_MIN_BYTES = 1024

function hasTopLevelHeicStructure(boxes: BmffBox[]): boolean {
  const topTypes = new Set(boxes.filter((b) => b.parentOffset === null).map((b) => b.type))
  return topTypes.has('ftyp') && topTypes.has('meta')
}

function canAbsorbVendorTail(
  boxes: BmffBox[],
  parentOffset: number | null,
  remaining: number,
): boolean {
  if (parentOffset !== null || remaining < OPAQUE_TAIL_MIN_BYTES) {
    return false
  }
  if (!hasTopLevelHeicStructure(boxes)) {
    return false
  }
  const top = boxes.filter((b) => b.parentOffset === null)
  return top.some((b) => b.type === 'mdat' || b.type === 'idat' || b.type === 'QTI ')
}

function readQtiLabel(data: Uint8Array, offset: number, size: number): string | null {
  const payload = data.subarray(offset + 8, offset + size)
  const text = new TextDecoder('ascii', { fatal: false }).decode(payload)
  if (text.includes('QTI Debug')) {
    return 'QTI Debug Metadata'
  }
  return null
}

function isPrintableType(type: string): boolean {
  return /^[\x20-\x7e]{4}$/.test(type)
}

function readBoxHeader(data: Uint8Array, offset: number, end: number): {
  size: number
  type: string
  headerSize: number
} | null {
  if (offset + 8 > end) {
    return null
  }
  let size =
    (data[offset]! << 24) | (data[offset + 1]! << 16) | (data[offset + 2]! << 8) | data[offset + 3]!
  const type = String.fromCharCode(data[offset + 4]!, data[offset + 5]!, data[offset + 6]!, data[offset + 7]!)
  let headerSize = 8

  if (size === 1) {
    if (offset + 16 > end) {
      return null
    }
    size = Number(
      (BigInt(data[offset + 8]!) << 56n) |
        (BigInt(data[offset + 9]!) << 48n) |
        (BigInt(data[offset + 10]!) << 40n) |
        (BigInt(data[offset + 11]!) << 32n) |
        (BigInt(data[offset + 12]!) << 24n) |
        (BigInt(data[offset + 13]!) << 16n) |
        (BigInt(data[offset + 14]!) << 8n) |
        BigInt(data[offset + 15]!),
    )
    headerSize = 16
  }

  if (size === 0) {
    size = end - offset
  }

  if (size < 8 || !isPrintableType(type)) {
    return null
  }

  return { size, type, headerSize }
}

function childStart(entry: ReturnType<typeof catalogForBox>, offset: number): number {
  return offset + entry.childHeaderSize
}

export function parseBmffBoxes(buffer: ArrayBuffer): BmffParseResult {
  const data = new Uint8Array(buffer)
  const boxes: BmffBox[] = []
  const warnings: string[] = []
  let truncated = false
  let vendorTailBytes = 0

  function walk(start: number, end: number, parentOffset: number | null): void {
    let offset = start
    while (offset + 8 <= end) {
      const header = readBoxHeader(data, offset, end)
      if (!header) {
        const remaining = end - offset
        if (canAbsorbVendorTail(boxes, parentOffset, remaining)) {
          vendorTailBytes = remaining
          boxes.push({
            type: 'tail',
            offset,
            size: remaining,
            headerSize: 0,
            catalogId: 'PAR-HEIC-011',
            label: `媒体数据续区 (${remaining.toLocaleString()} 字节，无 BMFF 头)`,
            loadType: 'other',
            warning: false,
            parentOffset,
          })
          warnings.push(
            `末尾 ${remaining.toLocaleString()} 字节为厂商未封装媒体数据（常见于 OPPO/高通），非文件截断`,
          )
          break
        }
        truncated = true
        warnings.push(`偏移 0x${offset.toString(16)} 处 box 头无效`)
        break
      }

      const { size, type, headerSize } = header
      if (offset + size > data.length) {
        truncated = true
        warnings.push(`${type} box 超出文件末尾`)
      }

      const entry = catalogForBox(type)
      const boxEnd = Math.min(offset + size, end, data.length)
      let label = entry.label
      let loadType = entry.loadType
      let catalogId = entry.parCatalogId
      const warning = catalogId === 'PAR-HEIC-099'
      let itemId: number | undefined
      let itemType: string | undefined

      if (type === 'ftyp') {
        const brands = readFtypBrands(data, offset, boxEnd - offset)
        label = `ftyp (${brands.join(', ')})`
      } else if (type === 'pitm') {
        const id = readPitmItemId(data, offset, boxEnd - offset)
        if (id !== null) {
          label = `pitm → 项 #${id}`
          itemId = id
        }
      } else if (type === 'hdlr') {
        const handler = readHdlrType(data, offset, boxEnd - offset)
        if (handler) {
          label = `hdlr (${handler.trim()})`
        }
      } else if (type === 'ispe') {
        const dim = readIspeSize(data, offset, boxEnd - offset)
        if (dim) {
          label = `ispe (${dim})`
        }
      } else if (type === 'infe') {
        const infe = readInfeItem(data, offset, boxEnd - offset)
        if (infe) {
          itemId = infe.itemId
          itemType = infe.itemType
          const itemCatalog = catalogForItemType(infe.itemType)
          catalogId = itemCatalog.parCatalogId
          label = `${itemCatalog.label} #${infe.itemId}`
          loadType = itemCatalog.loadType
        }
      } else if (type === 'mdat' || type === 'idat') {
        label = `${type} (${(boxEnd - offset - headerSize).toLocaleString()} 字节)`
      } else if (type === 'QTI ') {
        const qti = readQtiLabel(data, offset, boxEnd - offset)
        if (qti) {
          label = qti
        }
      }

      boxes.push({
        type,
        offset,
        size: boxEnd - offset,
        headerSize,
        catalogId,
        label,
        loadType,
        warning,
        parentOffset,
        itemId,
        itemType,
      })

      if (entry.isContainer) {
        const cs = childStart(entry, offset)
        if (cs + 8 <= boxEnd) {
          walk(cs, boxEnd, offset)
        }
      }

      offset += size
      if (offset > end) {
        break
      }
    }
  }

  if (data.length < 12) {
    return { boxes, truncated: true, vendorTailBytes: 0, warnings: ['文件过短'] }
  }

  const ftyp = String.fromCharCode(data[4]!, data[5]!, data[6]!, data[7]!)
  if (ftyp !== 'ftyp') {
    return { boxes, truncated: true, vendorTailBytes: 0, warnings: ['缺少 ftyp box'] }
  }

  walk(0, data.length, null)
  return { boxes, truncated, vendorTailBytes, warnings }
}
