import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { TreeNode, NodeUIState, NodeMode, NodeId } from '@/types/node'

interface NodeStateStore {
  states: Record<NodeId, NodeUIState>
  focusedId: NodeId | null
  initStates: (tree: TreeNode) => void
  setMode: (id: NodeId, mode: NodeMode) => void
  toggleMode: (id: NodeId) => void
  setExpanded: (id: NodeId, expanded: boolean) => void
  toggleExpanded: (id: NodeId) => void
  setFocusedId: (id: NodeId | null) => void
  setDetailZoom: (id: NodeId, zoom: number) => void
  getState: (id: NodeId) => NodeUIState | undefined
}

function initNodeStates(tree: TreeNode): Record<NodeId, NodeUIState> {
  const states: Record<NodeId, NodeUIState> = {}

  function walk(node: TreeNode): void {
    states[node.id] = {
      mode: 'title',
      expanded: node.depth === 0, // Root expanded by default
      detailZoom: 1
    }
    for (const child of node.children) {
      walk(child)
    }
  }

  walk(tree)
  return states
}

export const useNodeStateStore = create<NodeStateStore>()(
  immer((set, get) => ({
    states: {},
    focusedId: '0',

    initStates: (tree) =>
      set((s) => {
        s.states = initNodeStates(tree)
        s.focusedId = tree.id
      }),

    setMode: (id, mode) =>
      set((s) => {
        if (s.states[id]) {
          s.states[id].mode = mode
        }
      }),

    toggleMode: (id) =>
      set((s) => {
        if (s.states[id]) {
          s.states[id].mode = s.states[id].mode === 'title' ? 'detail' : 'title'
        }
      }),

    setExpanded: (id, expanded) =>
      set((s) => {
        if (s.states[id]) {
          s.states[id].expanded = expanded
        }
      }),

    toggleExpanded: (id) =>
      set((s) => {
        if (s.states[id]) {
          s.states[id].expanded = !s.states[id].expanded
        }
      }),

    setFocusedId: (id) =>
      set((s) => {
        s.focusedId = id
      }),

    setDetailZoom: (id, zoom) =>
      set((s) => {
        if (s.states[id]) {
          s.states[id].detailZoom = Math.max(0.5, Math.min(3, zoom))
        }
      }),

    getState: (id) => get().states[id]
  }))
)
