import { memo } from 'react'
import { TreeNode, NodeId, NodeUIState } from '@/types/node'
import { LayoutBox } from '@/types/layout'
import { TreeNodeComponent } from '@/components/node/TreeNode'

interface VirtualizedRendererProps {
  tree: TreeNode
  layoutMap: Map<NodeId, LayoutBox>
  visibleNodeIds: Set<NodeId>
  onNodeMouseDown: (id: string) => void
  onNodeDoubleClick: (id: string) => void
}

interface VisibleNode {
  node: TreeNode
  layout: LayoutBox
  staggerDelay: number
}

export const VirtualizedRenderer = memo(function VirtualizedRenderer({
  tree,
  layoutMap,
  visibleNodeIds,
  onNodeMouseDown,
  onNodeDoubleClick
}: VirtualizedRendererProps) {
  const nodes: VisibleNode[] = []

  function collectVisible(node: TreeNode): void {
    if (visibleNodeIds.has(node.id)) {
      const layout = layoutMap.get(node.id)
      if (layout) {
        // Sibling index is the last element of the path array
        const siblingIndex = node.path.length > 0 ? node.path[node.path.length - 1] : 0
        nodes.push({ node, layout, staggerDelay: siblingIndex })
      }
    }
    for (const child of node.children) {
      collectVisible(child)
    }
  }

  collectVisible(tree)

  // Compute total bounds for the container
  let maxX = 0, maxY = 0
  for (const { layout } of nodes) {
    const right = layout.x + layout.width + 200
    const bottom = layout.y + layout.height + 200
    if (right > maxX) maxX = right
    if (bottom > maxY) maxY = bottom
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: maxX,
        height: maxY,
        zIndex: 1
      }}
    >
      {nodes.map(({ node, layout, staggerDelay }) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          layout={layout}
          staggerDelay={staggerDelay}
          onMouseDown={onNodeMouseDown}
          onDoubleClick={onNodeDoubleClick}
        />
      ))}
    </div>
  )
})
