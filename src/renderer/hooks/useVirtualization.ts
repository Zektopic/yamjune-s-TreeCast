import { useMemo } from 'react'
import { TreeNode, NodeId } from '@/types/node'
import { LayoutBox, Viewport } from '@/types/layout'

const VIEWPORT_BUFFER = 300

export function useVirtualization(
  tree: TreeNode | null,
  layoutMap: Map<NodeId, LayoutBox>,
  viewport: Viewport,
  focusedId?: NodeId | null
): Set<NodeId> {
  return useMemo(() => {
    if (!tree) return new Set()

    const visible = new Set<NodeId>()
    const extendedBounds = {
      left: viewport.x - VIEWPORT_BUFFER,
      right: viewport.x + viewport.width + VIEWPORT_BUFFER,
      top: viewport.y - VIEWPORT_BUFFER,
      bottom: viewport.y + viewport.height + VIEWPORT_BUFFER
    }

    function traverse(node: TreeNode): void {
      const box = layoutMap.get(node.id)
      if (!box) {
        for (const child of node.children) {
          traverse(child)
        }
        return
      }

      // Quick reject: node entirely to the right of viewport
      if (box.x > extendedBounds.right) return

      // Quick reject: node entirely below viewport
      if (box.y > extendedBounds.bottom) return

      // Quick reject: node entirely above viewport
      if (box.y + box.height < extendedBounds.top) return

      // AABB intersection test
      const intersects =
        box.x < extendedBounds.right &&
        box.x + box.width > extendedBounds.left &&
        box.y < extendedBounds.bottom &&
        box.y + box.height > extendedBounds.top

      if (intersects) {
        visible.add(node.id)
      }

      for (const child of node.children) {
        traverse(child)
      }
    }

    traverse(tree)

    // Always include focused node (and its ancestors for connection lines)
    if (focusedId && !visible.has(focusedId)) {
      visible.add(focusedId)
      // Also ensure ancestors are visible so connections render
      function ensureAncestorsVisible(id: NodeId): void {
        for (const [nid, box] of layoutMap) {
          if (nid === id) continue
        }
      }
      // Walk up from focused node to ensure all ancestors are visible
      function addAncestors(t: TreeNode, targetId: NodeId, path: NodeId[]): NodeId[] | null {
        if (t.id === targetId) return [...path, t.id]
        for (const child of t.children) {
          const result = addAncestors(child, targetId, [...path, t.id])
          if (result) return result
        }
        return null
      }
      const ancestorPath = addAncestors(tree, focusedId, [])
      if (ancestorPath) {
        for (const id of ancestorPath) {
          visible.add(id)
        }
      }
    }

    return visible
  }, [tree, layoutMap, viewport.x, viewport.y, viewport.width, viewport.height, focusedId])
}
