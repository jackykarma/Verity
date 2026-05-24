import type { SegmentNodeDto, SegmentTreeDto } from '../shared/types/parseMessages.ts'
import type { BmffBox } from './BmffReader.ts'
import { parseIrefReferences } from './ItemRefBuilder.ts'

export interface ItemRoleMap {
  primaryItemId: number | null
  gridRootItemId: number | null
  gridTileIds: Set<number>
}

export function buildItemRoleMap(boxes: BmffBox[], buffer: ArrayBuffer): ItemRoleMap {
  const pitm = boxes.find((b) => b.type === 'pitm')
  const primaryItemId = pitm?.itemId ?? null

  const iref = boxes.find((b) => b.type === 'iref')
  const gridTileIds = new Set<number>()
  let gridRootItemId: number | null = null

  if (iref) {
    const data = new Uint8Array(buffer)
    const dimg = parseIrefReferences(data, iref).find((r) => r.kind === 'dimg')
    if (dimg) {
      gridRootItemId = dimg.fromItemId
      for (const id of dimg.toItemIds) {
        gridTileIds.add(id)
      }
    }
  }

  return { primaryItemId, gridRootItemId, gridTileIds }
}

function itemIdFromNode(node: SegmentNodeDto, boxes: BmffBox[]): number | null {
  const box = boxes.find((b) => b.type === 'infe' && b.offset === node.offset)
  return box?.itemId ?? null
}

const ITEM_TYPE_LABEL: Record<string, string> = {
  hvc1: 'HEVC 图像',
  hev1: 'HEVC 图像',
  avc1: 'AVC 图像',
  jpeg: 'JPEG 图像',
  grid: '网格合成',
  thmb: '缩略图',
  Exif: 'Exif 元数据',
  mime: 'MIME',
  uri: 'URI',
  auxl: '辅助图像',
}

export function enrichInfeItemLabels(
  nodes: SegmentNodeDto[],
  boxes: BmffBox[],
  roles: ItemRoleMap,
): void {
  for (const node of nodes) {
    const box = boxes.find((b) => b.type === 'infe' && b.offset === node.offset)
    if (!box?.itemId || !box.itemType) {
      continue
    }

    const { itemId, itemType } = box
    const typeKey = itemType.trim()
    const base = ITEM_TYPE_LABEL[typeKey] ?? `项 (${typeKey})`

    if (roles.gridTileIds.has(itemId)) {
      node.label = `网格分块 #${itemId} (${typeKey})`
      node.parCatalogId = 'PAR-HEIC-101'
      node.loadType = 'image'
      continue
    }

    if (roles.gridRootItemId === itemId) {
      node.label = `网格根项 #${itemId} (dimg → ${roles.gridTileIds.size} 块)`
      node.parCatalogId = 'PAR-HEIC-C03'
      node.loadType = 'metadata'
      continue
    }

    if (roles.primaryItemId === itemId) {
      node.label = `★ 主图 · ${base} #${itemId}`
      continue
    }

    if (typeKey === 'Exif') {
      node.label = `Exif 元数据 #${itemId}`
      node.parCatalogId = 'PAR-HEIC-201'
      node.loadType = 'metadata'
      continue
    }

    if (typeKey === 'grid') {
      node.label = `网格合成 #${itemId} (grid)`
      node.parCatalogId = 'PAR-HEIC-103'
      continue
    }

    if (typeKey === 'thmb') {
      node.label = `缩略图 #${itemId} (thmb)`
      node.parCatalogId = 'PAR-HEIC-102'
      continue
    }

    node.label = `${base} #${itemId} (${typeKey})`
  }
}

export function groupGridTileNodes(
  tree: SegmentTreeDto,
  nodes: SegmentNodeDto[],
  boxes: BmffBox[],
  roles: ItemRoleMap,
): void {
  if (roles.gridTileIds.size < 2) {
    return
  }

  const iinfBox = boxes.find((b) => b.type === 'iinf')
  if (!iinfBox) {
    return
  }

  const iinfNode = nodes.find((n) => n.offset === iinfBox.offset)
  if (!iinfNode) {
    return
  }

  const tileNodes = nodes.filter((n) => {
    const id = itemIdFromNode(n, boxes)
    return id !== null && roles.gridTileIds.has(id)
  })
  if (tileNodes.length < 2) {
    return
  }

  const ids = tileNodes
    .map((n) => itemIdFromNode(n, boxes))
    .filter((id): id is number => id !== null)
    .sort((a, b) => a - b)

  const groupId = 'grid-tiles-group'
  tree.nodes.push({
    id: groupId,
    parentId: iinfNode.id,
    label: `网格分块 ×${tileNodes.length} (#${ids[0]}–#${ids[ids.length - 1]})`,
    parCatalogId: 'PAR-HEIC-C03',
    offset: iinfBox.offset,
    length: 0,
    loadType: 'metadata',
    warning: false,
  })

  for (const node of tileNodes) {
    const id = itemIdFromNode(node, boxes)
    node.parentId = groupId
    if (id !== null) {
      node.label = `#${id} (hvc1 分块)`
    }
  }
}

/** iinf 子项排序：主图 → Exif → 网格根 → 分组 → 其余 */
export function sortIinfChildren(tree: SegmentTreeDto, boxes: BmffBox[], roles: ItemRoleMap): void {
  const iinfBox = boxes.find((b) => b.type === 'iinf')
  if (!iinfBox) {
    return
  }
  const iinfNode = tree.nodes.find((n) => n.offset === iinfBox.offset)
  if (!iinfNode) {
    return
  }

  const score = (node: SegmentNodeDto): number => {
    const id = itemIdFromNode(node, boxes)
    if (id === roles.primaryItemId) {
      return 0
    }
    if (id !== null && boxes.find((b) => b.itemId === id)?.itemType?.trim() === 'Exif') {
      return 1
    }
    if (id === roles.gridRootItemId) {
      return 2
    }
    if (node.id === 'grid-tiles-group') {
      return 3
    }
    if (id !== null && roles.gridTileIds.has(id)) {
      return 4
    }
    return 5
  }

  const children = tree.nodes.filter((n) => n.parentId === iinfNode.id)
  children.sort((a, b) => score(a) - score(b) || a.label.localeCompare(b.label))

  const iinfIndex = tree.nodes.findIndex((n) => n.id === iinfNode.id)
  if (iinfIndex < 0) {
    return
  }

  const withoutChildren = tree.nodes.filter((n) => n.parentId !== iinfNode.id || n.id === iinfNode.id)
  const insertAt = withoutChildren.findIndex((n) => n.id === iinfNode.id) + 1
  withoutChildren.splice(insertAt, 0, ...children)
  tree.nodes.length = 0
  tree.nodes.push(...withoutChildren)
}

export function applyItemLabelEnrichment(
  tree: SegmentTreeDto,
  boxes: BmffBox[],
  buffer: ArrayBuffer,
): void {
  const roles = buildItemRoleMap(boxes, buffer)
  enrichInfeItemLabels(tree.nodes, boxes, roles)
  groupGridTileNodes(tree, tree.nodes, boxes, roles)
  sortIinfChildren(tree, boxes, roles)
}
