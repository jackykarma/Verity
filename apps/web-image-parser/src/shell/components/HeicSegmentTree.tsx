import type { SegmentNodeDto, SegmentTreeDto } from '../../shared/types/parseMessages.ts'

interface HeicSegmentTreeProps {
  tree: SegmentTreeDto | null
  selectedId: string | null
  onSelect: (node: SegmentNodeDto) => void
}

const LOAD_BADGE: Record<string, string> = {
  image: '图',
  video: '视',
  audio: '音',
  metadata: '元',
  mixed: '混',
  other: '其',
}

function buildChildrenMap(nodes: SegmentNodeDto[]): Map<string | null, SegmentNodeDto[]> {
  const map = new Map<string | null, SegmentNodeDto[]>()
  for (const node of nodes) {
    const list = map.get(node.parentId) ?? []
    list.push(node)
    map.set(node.parentId, list)
  }
  return map
}

function HeicTreeNode({
  node,
  depth,
  childrenMap,
  selectedId,
  onSelect,
}: {
  node: SegmentNodeDto
  depth: number
  childrenMap: Map<string | null, SegmentNodeDto[]>
  selectedId: string | null
  onSelect: (node: SegmentNodeDto) => void
}) {
  const children = childrenMap.get(node.id) ?? []
  const badge = LOAD_BADGE[node.loadType] ?? '·'

  return (
    <>
      <button
        type="button"
        data-testid="tree-node"
        className={`tree-node heic-tree-node${selectedId === node.id ? ' tree-node--selected' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(node)}
        title={node.parCatalogId}
      >
        <span className="heic-tree-node__badge" data-load={node.loadType}>
          {badge}
        </span>
        {node.warning ? '⚠ ' : ''}
        {node.label}
      </button>
      {children.map((child) => (
        <HeicTreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          childrenMap={childrenMap}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </>
  )
}

export function HeicSegmentTree({ tree, selectedId, onSelect }: HeicSegmentTreeProps) {
  if (!tree) {
    return (
      <div className="tree-panel tree-panel--empty heic-tree" data-testid="segment-tree">
        解析完成后显示 HEIC 容器树
      </div>
    )
  }

  const childrenMap = buildChildrenMap(tree.nodes)
  const roots = childrenMap.get(null) ?? []

  return (
    <div className="tree-panel heic-tree" data-testid="segment-tree">
      {tree.warnings.length > 0 ? (
        <ul className="tree-panel__warnings">
          {tree.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
      {roots.map((root) => (
        <HeicTreeNode
          key={root.id}
          node={root}
          depth={0}
          childrenMap={childrenMap}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
