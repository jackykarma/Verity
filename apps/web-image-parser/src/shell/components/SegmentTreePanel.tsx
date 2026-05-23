import type { SegmentNodeDto, SegmentTreeDto } from '../../shared/types/parseMessages.ts'

interface SegmentTreePanelProps {
  tree: SegmentTreeDto | null
  selectedId: string | null
  onSelect: (node: SegmentNodeDto) => void
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

function TreeNode({
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
  return (
    <>
      <button
        type="button"
        data-testid="tree-node"
        className={`tree-node${selectedId === node.id ? ' tree-node--selected' : ''}`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {node.warning ? '⚠ ' : ''}
        {node.label}
      </button>
      {children.map((child) => (
        <TreeNode
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

export function SegmentTreePanel({ tree, selectedId, onSelect }: SegmentTreePanelProps) {
  if (!tree) {
    return (
      <div className="tree-panel tree-panel--empty" data-testid="segment-tree">
        解析完成后显示分区树
      </div>
    )
  }

  const childrenMap = buildChildrenMap(tree.nodes)
  const roots = childrenMap.get(null) ?? []

  return (
    <div className="tree-panel" data-testid="segment-tree">
      {tree.warnings.length > 0 ? (
        <ul className="tree-panel__warnings">
          {tree.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      ) : null}
      {roots.map((root) => (
        <TreeNode
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
