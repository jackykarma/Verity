import type { SegmentNodeDto } from '../shared/types/parseMessages.ts'
import type { BmffBox } from './BmffReader.ts'
import type { ItemLocation } from './IlocParser.ts'

export function markPrimaryImageItem(nodes: SegmentNodeDto[], boxes: BmffBox[]): void {
  const pitm = boxes.find((b) => b.type === 'pitm')
  if (pitm?.itemId === undefined) {
    return
  }

  for (const node of nodes) {
    if (node.label.includes(`#${pitm.itemId}`)) {
      if (!node.label.startsWith('★')) {
        node.label = `★ ${node.label}`
      }
    }
  }
}

export function classifyAuxiliaryItems(nodes: SegmentNodeDto[], boxes: BmffBox[]): void {
  for (const node of nodes) {
    const box = boxes.find((b) => b.offset === node.offset)
    if (!box) {
      continue
    }
    if (box.itemType === 'auxl' || node.parCatalogId === 'PAR-HEIC-110') {
      node.parCatalogId = 'PAR-HEIC-110'
      node.loadType = 'image'
      node.label = `辅助图像：${node.label}`
    }
    if (box.itemType === 'grid') {
      node.parCatalogId = 'PAR-HEIC-103'
    }
    if (box.itemType === 'hvc1' && node.label.includes('★')) {
      node.parCatalogId = 'PAR-HEIC-101'
    }
  }
}

export function attachItemLocations(
  nodes: SegmentNodeDto[],
  boxes: BmffBox[],
  itemLocations: Map<number, ItemLocation>,
): void {
  for (const node of nodes) {
    const box = boxes.find((b) => b.type === 'infe' && b.offset === node.offset)
    if (!box || box.itemId === undefined) {
      continue
    }
    const loc = itemLocations.get(box.itemId)
    if (loc) {
      node.offset = loc.offset
      node.length = loc.length
    }
  }
}

export function getExifItemSlice(
  buffer: ArrayBuffer,
  boxes: BmffBox[],
  itemLocations: Map<number, ItemLocation>,
): ArrayBuffer | null {
  for (const box of boxes) {
    if (box.type !== 'infe' || box.itemType !== 'Exif') {
      continue
    }
    if (box.itemId === undefined) {
      continue
    }
    const loc = itemLocations.get(box.itemId)
    if (loc) {
      return buffer.slice(loc.offset, loc.offset + loc.length)
    }
  }
  return null
}
