import { memo } from 'react'
import { TreeNode } from '@/types/node'
import { LayoutBox } from '@/types/layout'
import { NodeId, NodeUIState } from '@/types/node'
import { ConnectionLine } from './ConnectionLine'

interface ConnectionLayerProps {
  tree: TreeNode
  layoutMap: Map<NodeId, LayoutBox>
  nodeStates: Record<NodeId, NodeUIState>
  canvasWidth: number
  canvasHeight: number
}

export const ConnectionLayer = memo(function ConnectionLayer({
  tree,
  layoutMap,
  nodeStates
}: ConnectionLayerProps) {
  const lines: { parentBox: LayoutBox; childBox: LayoutBox; key: string }[] = []

  function collectLines(node: TreeNode): void {
    const state = nodeStates[node.id]
    if (!state?.expanded || node.children.length === 0) return

    const parentBox = layoutMap.get(node.id)
    if (!parentBox) return

    for (const child of node.children) {
      const childBox = layoutMap.get(child.id)
      if (childBox) {
        lines.push({
          parentBox,
          childBox,
          key: `${node.id}-${child.id}`
        })
      }
      collectLines(child)
    }
  }

  collectLines(tree)

  if (lines.length === 0) return null

  // Compute total content bounds to size the SVG element
  let contentMaxX = 0
  let contentMaxY = 0
  for (const [, box] of layoutMap) {
    const right = box.x + box.width + 60
    const bottom = box.y + box.height + 60
    if (right > contentMaxX) contentMaxX = right
    if (bottom > contentMaxY) contentMaxY = bottom
  }

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: contentMaxX,
        height: contentMaxY,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden'
      }}
    >
      {lines.map(({ parentBox, childBox, key }) => (
        <ConnectionLine
          key={key}
          parentBox={parentBox}
          childBox={childBox}
        />
      ))}
    </svg>
  )
})
