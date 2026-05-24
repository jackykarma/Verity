import type { BmffBox } from './BmffReader.ts'

export interface ItemLocation {
  itemId: number
  offset: number
  length: number
}

function readExtentCount(
  data: Uint8Array,
  version: number,
  baseOffsetSize: number,
  pos: number,
): { extentCount: number; nextPos: number } {
  if (version === 1 && baseOffsetSize === 0) {
    // 部分 HEIC 编码器（如 OPPO）在 dref 后插入 16-bit 零填充，再用 8-bit extent_count。
    // 标准 ISO/IEC 14496-12 iloc v1 为 16-bit extent_count；见内部 Wiki「HEIF图像封装格式」§ iloc。
    const nextPos = pos + 2
    return { extentCount: data[nextPos] ?? 0, nextPos: nextPos + 1 }
  }

  if (version === 2) {
    if (nextPosOutOfRange(data, pos, 4)) {
      return { extentCount: 0, nextPos: pos }
    }
    const extentCount =
      ((data[pos]! << 24) | (data[pos + 1]! << 16) | (data[pos + 2]! << 8) | data[pos + 3]!) >>> 0
    return { extentCount, nextPos: pos + 4 }
  }

  if (nextPosOutOfRange(data, pos, 2)) {
    return { extentCount: 0, nextPos: pos }
  }
  const extentCount = (data[pos]! << 8) | data[pos + 1]!
  return { extentCount, nextPos: pos + 2 }
}

function nextPosOutOfRange(data: Uint8Array, pos: number, size: number): boolean {
  return pos + size > data.length
}

export function parseIloc(buffer: ArrayBuffer, boxes: BmffBox[]): Map<number, ItemLocation> {
  const data = new Uint8Array(buffer)
  const map = new Map<number, ItemLocation>()
  const iloc = boxes.find((b) => b.type === 'iloc')
  if (!iloc) {
    return map
  }

  const start = iloc.offset + 12
  if (start + 4 > data.length) {
    return map
  }

  const version = data[iloc.offset + 8] ?? 0
  const offsetSize = (data[start]! >> 4) & 0x0f
  const lengthSize = data[start]! & 0x0f
  const indexSize = (data[start + 1]! >> 4) & 0x0f
  const baseOffsetSize = data[start + 1]! & 0x0f

  let pos = start + 2

  if (pos + 2 > data.length) {
    return map
  }

  const itemCount = (data[pos]! << 8) | data[pos + 1]!
  pos += 2

  const readUint = (size: number): number => {
    let v = 0
    for (let i = 0; i < size; i++) {
      v = (v << 8) | (data[pos + i] ?? 0)
    }
    pos += size
    return v
  }

  for (let i = 0; i < itemCount; i++) {
    if (pos + 2 > data.length) {
      break
    }
    const itemId = version < 2 ? readUint(2) : readUint(4)

    if (version === 1 || version === 2) {
      pos += 1
    }
    if (version === 0 || version === 1 || version === 2) {
      readUint(2)
    }

    const baseOffset = baseOffsetSize > 0 ? readUint(baseOffsetSize) : 0
    const { extentCount, nextPos } = readExtentCount(data, version, baseOffsetSize, pos)
    pos = nextPos

    for (let e = 0; e < extentCount; e++) {
      if ((version === 1 || version === 2) && indexSize > 0) {
        readUint(indexSize)
      }
      const extentOffset = offsetSize > 0 ? readUint(offsetSize) : 0
      const extentLength = lengthSize > 0 ? readUint(lengthSize) : 0
      map.set(itemId, {
        itemId,
        offset: baseOffset + extentOffset,
        length: extentLength,
      })
    }
  }

  return map
}

export function getItemSlice(buffer: ArrayBuffer, loc: ItemLocation): ArrayBuffer {
  return buffer.slice(loc.offset, loc.offset + loc.length)
}
