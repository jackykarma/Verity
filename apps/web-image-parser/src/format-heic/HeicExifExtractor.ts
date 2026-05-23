import { buildExifReadable } from '../format-jpeg/ExifExtractor.ts'
import type { ReadablePayload } from '../shared/types/present.ts'
import type { BmffBox } from './BmffReader.ts'
import type { ItemLocation } from './IlocParser.ts'
import { getExifItemSlice } from './AuxImageCatalog.ts'
import { getItemSlice } from './IlocParser.ts'

export async function extractHeicExifReadable(
  buffer: ArrayBuffer,
  boxes: BmffBox[],
  itemLocations: Map<number, ItemLocation>,
): Promise<ReadablePayload | null> {
  const slice = getExifItemSlice(buffer, boxes, itemLocations)
  if (slice) {
    return buildExifReadable(slice)
  }
  return null
}

export async function extractMetadataItemReadable(
  buffer: ArrayBuffer,
  itemType: string,
  itemId: number,
  itemLocations: Map<number, ItemLocation>,
): Promise<ReadablePayload> {
  const loc = itemLocations.get(itemId)
  if (!loc) {
    return { title: `项 #${itemId}`, fields: [{ key: '提示', value: '无 iloc 位置' }] }
  }

  const slice = getItemSlice(buffer, loc)

  if (itemType === 'Exif') {
    return buildExifReadable(slice)
  }

  if (itemType === 'mime' || itemType === 'uri') {
    const text = new TextDecoder('utf-8', { fatal: false }).decode(slice).slice(0, 512)
    return {
      title: `MIME/URI 项 #${itemId}`,
      fields: [
        { key: '类型', value: itemType },
        { key: '内容摘要', value: text || '（空）' },
      ],
    }
  }

  if (itemType === 'xml ' || itemType === 'json') {
    const text = new TextDecoder('utf-8', { fatal: false }).decode(slice).slice(0, 800)
    return {
      title: `XMP/JSON 元数据项 #${itemId}`,
      fields: [{ key: '摘要', value: text }],
    }
  }

  return {
    title: `项 #${itemId} (${itemType})`,
    fields: [{ key: '长度', value: String(loc.length) }],
  }
}

export function readGridRotation(data: Uint8Array, boxOffset: number, boxSize: number): string | null {
  const type = String.fromCharCode(
    data[boxOffset + 4]!,
    data[boxOffset + 5]!,
    data[boxOffset + 6]!,
    data[boxOffset + 7]!,
  )
  if (type === 'irot' && boxSize >= 13) {
    const angle = (data[boxOffset + 12]! & 0x03) * 90
    return `旋转 ${angle}°`
  }
  if (type === 'imir' && boxSize >= 13) {
    const axis = data[boxOffset + 12]! & 0x01
    return axis === 0 ? '水平镜像' : '垂直镜像'
  }
  return null
}
