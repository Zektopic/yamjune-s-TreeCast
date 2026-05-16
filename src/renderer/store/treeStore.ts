import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { TreeNode } from '@/types/node'

interface TreeState {
  tree: TreeNode | null
  workspaceDir: string
  filePath: string | null
  setTree: (tree: TreeNode, workspaceDir: string, filePath?: string) => void
  clearTree: () => void
}

export const useTreeStore = create<TreeState>()(
  immer((set) => ({
    tree: null,
    workspaceDir: '',
    filePath: null,
    setTree: (tree, workspaceDir, filePath) =>
      set((state) => {
        state.tree = tree as any
        state.workspaceDir = workspaceDir
        state.filePath = filePath ?? null
      }),
    clearTree: () =>
      set((state) => {
        state.tree = null
        state.workspaceDir = ''
        state.filePath = null
      })
  }))
)
