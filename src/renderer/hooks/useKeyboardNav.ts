import { useEffect, useRef } from 'react'
import { TreeNode, NodeUIState, NodeId } from '@/types/node'
import { LayoutBox } from '@/types/layout'
import { navigate, getDirectionForKey } from '@/engine/treeNavigation'

interface KeyboardNavDeps {
  tree: TreeNode | null
  layoutMap: Map<NodeId, LayoutBox>
  focusedId: NodeId | null
  states: Map<NodeId, NodeUIState>
  onSetFocused: (id: NodeId) => void
  onToggleMode: (id: NodeId) => void
  onToggleExpanded: (id: NodeId) => void
  onSetExpanded: (id: NodeId, expanded: boolean) => void
  onSetDetailZoom: (id: NodeId, zoom: number) => void
}

export function useKeyboardNav({
  tree,
  layoutMap,
  focusedId,
  states,
  onSetFocused,
  onToggleMode,
  onToggleExpanded,
  onSetExpanded,
  onSetDetailZoom
}: KeyboardNavDeps) {
  const stateSnapshot = useRef(states)
  stateSnapshot.current = states

  const focusedSnapshot = useRef(focusedId)
  focusedSnapshot.current = focusedId

  const treeSnapshot = useRef(tree)
  treeSnapshot.current = tree

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const currentFocused = focusedSnapshot.current
      const currentTree = treeSnapshot.current
      if (!currentFocused || !currentTree) return

      const action = getDirectionForKey(e.key)

      if (!action) return

      // Prevent default for all handled keys
      e.preventDefault()
      e.stopPropagation()

      const currentStates = stateSnapshot.current

      switch (action) {
        case 'right': {
          const state = currentStates.get(currentFocused)
          // If unexpanded with children → expand (don't change focus)
          if (state && !state.expanded) {
            const node = findNodeInTree(currentTree, currentFocused)
            if (node && node.children.length > 0) {
              onSetExpanded(currentFocused, true)
              return
            }
          }
          // Otherwise navigate
          const result = navigate(currentFocused, 'right', currentTree, currentStates, layoutMap)
          if (result) onSetFocused(result)
          break
        }
        case 'left': {
          const result = navigate(currentFocused, 'left', currentTree, currentStates, layoutMap)
          if (result) onSetFocused(result)
          break
        }
        case 'up': {
          const result = navigate(currentFocused, 'up', currentTree, currentStates, layoutMap)
          if (result) onSetFocused(result)
          break
        }
        case 'down': {
          const result = navigate(currentFocused, 'down', currentTree, currentStates, layoutMap)
          if (result) onSetFocused(result)
          break
        }
        case 'enter': {
          onToggleMode(currentFocused)
          break
        }
        case 'tab': {
          onToggleExpanded(currentFocused)
          break
        }
        case 'plus': {
          const s = currentStates.get(currentFocused)
          if (s?.mode === 'detail') {
            onSetDetailZoom(currentFocused, (s.detailZoom ?? 1) + 0.25)
          }
          break
        }
        case 'minus': {
          const s = currentStates.get(currentFocused)
          if (s?.mode === 'detail') {
            onSetDetailZoom(currentFocused, (s.detailZoom ?? 1) - 0.25)
          }
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true })
  }, [layoutMap, onSetFocused, onToggleMode, onToggleExpanded, onSetExpanded, onSetDetailZoom])
}

function findNodeInTree(tree: TreeNode, id: NodeId): TreeNode | null {
  if (tree.id === id) return tree
  for (const child of tree.children) {
    const found = findNodeInTree(child, id)
    if (found) return found
  }
  return null
}
