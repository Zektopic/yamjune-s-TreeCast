import { TreeNode, NodeUIState, NodeId } from '@/types/node'
import { LayoutBox } from '@/types/layout'
import { findParentNode } from './treeTraversal'

export type NavDirection = 'up' | 'down' | 'left' | 'right'

export function navigate(
  focusedId: NodeId,
  direction: NavDirection,
  tree: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>,
  layoutMap: Map<NodeId, LayoutBox>
): NodeId | null {
  const node = findNodeById(tree, focusedId)
  if (!node) return null

  switch (direction) {
    case 'right': return navigateRight(node, tree, nodeStates)
    case 'left':  return navigateLeft(node, tree)
    case 'up':    return navigateUp(node, tree, nodeStates)
    case 'down':  return navigateDown(node, tree, nodeStates)
    default:      return null
  }
}

function findNodeById(tree: TreeNode, id: NodeId): TreeNode | null {
  if (tree.id === id) return tree
  for (const child of tree.children) {
    const found = findNodeById(child, id)
    if (found) return found
  }
  return null
}

// 获取节点的兄弟列表及自身索引
function getSiblingsAndIndex(tree: TreeNode, id: NodeId): {
  siblings: TreeNode[]
  index: number
  parent: TreeNode
} | null {
  const parent = findParentNode(tree, id)
  if (!parent) return null
  const siblings = parent.children
  const index = siblings.findIndex(c => c.id === id)
  if (index < 0) return null
  return { siblings, index, parent }
}

// ---------- adjacent branch root ----------

/** 向上寻找前一个相邻分支的根节点，支持跨祖先及首尾循环 */
function getPrevBranchRoot(node: TreeNode, tree: TreeNode): TreeNode | null {
  let curr = node
  while (true) {
    const info = getSiblingsAndIndex(tree, curr.id)
    if (!info) return null

    if (info.index > 0) {
      return info.siblings[info.index - 1]
    }

    curr = info.parent
    if (curr.id === tree.id) {
      if (tree.children.length > 0) {
        return tree.children[tree.children.length - 1]
      }
      return null
    }
  }
}

/** 向下寻找后一个相邻分支的根节点，支持跨祖先及首尾循环 */
function getNextBranchRoot(node: TreeNode, tree: TreeNode): TreeNode | null {
  let curr = node
  while (true) {
    const info = getSiblingsAndIndex(tree, curr.id)
    if (!info) return null

    if (info.index < info.siblings.length - 1) {
      return info.siblings[info.index + 1]
    }

    curr = info.parent
    if (curr.id === tree.id) {
      if (tree.children.length > 0) {
        return tree.children[0]
      }
      return null
    }
  }
}

// ---------- child-path traversal ----------

/** 沿末位子节点路径下行，匹配目标深度；深度不足时返回路径最深叶子 */
function followLastChildPath(
  branchRoot: TreeNode,
  targetDepth: number,
  nodeStates: Map<NodeId, NodeUIState>
): NodeId {
  let current = branchRoot
  while (true) {
    if (current.depth === targetDepth) {
      return current.id
    }
    const state = nodeStates.get(current.id)
    if (state?.expanded && current.children.length > 0) {
      current = current.children[current.children.length - 1]
    } else {
      return current.id
    }
  }
}

/** 沿首位子节点路径下行，匹配目标深度；深度不足时返回路径最深叶子 */
function followFirstChildPath(
  branchRoot: TreeNode,
  targetDepth: number,
  nodeStates: Map<NodeId, NodeUIState>
): NodeId {
  let current = branchRoot
  while (true) {
    if (current.depth === targetDepth) {
      return current.id
    }
    const state = nodeStates.get(current.id)
    if (state?.expanded && current.children.length > 0) {
      current = current.children[0]
    } else {
      return current.id
    }
  }
}

// ---------- direction handlers ----------

function navigateRight(
  node: TreeNode,
  tree: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>
): NodeId | null {
  const state = nodeStates.get(node.id)

  // 1. 未展开的子节点 → 展开信号
  if (node.children.length > 0 && !state?.expanded) {
    return null
  }

  // 2. 已展开的子节点 → 进入第一个子节点
  if (node.children.length > 0 && state?.expanded) {
    return node.children[0].id
  }

  // 3. 叶子节点 → 跨分支跳至下方相邻分支的叶子节点
  const nextRoot = getNextBranchRoot(node, tree)
  if (!nextRoot) return null
  return followFirstChildPath(nextRoot, -1, nodeStates)
}

function navigateLeft(node: TreeNode, tree: TreeNode): NodeId | null {
  const parent = findParentNode(tree, node.id)
  return parent?.id ?? null
}

function navigateUp(
  node: TreeNode,
  tree: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>
): NodeId | null {
  const prevRoot = getPrevBranchRoot(node, tree)
  if (!prevRoot) return null
  return followLastChildPath(prevRoot, node.depth, nodeStates)
}

function navigateDown(
  node: TreeNode,
  tree: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>
): NodeId | null {
  const nextRoot = getNextBranchRoot(node, tree)
  if (!nextRoot) return null
  return followFirstChildPath(nextRoot, node.depth, nodeStates)
}

export function getDirectionForKey(
  key: string
): NavDirection | 'enter' | 'tab' | 'plus' | 'minus' | null {
  switch (key) {
    case 'ArrowRight': return 'right'
    case 'ArrowLeft':  return 'left'
    case 'ArrowUp':    return 'up'
    case 'ArrowDown':  return 'down'
    case 'Enter':      return 'enter'
    case 'Tab':        return 'tab'
    case '+':
    case '=':          return 'plus'
    case '-':          return 'minus'
    default:           return null
  }
}
