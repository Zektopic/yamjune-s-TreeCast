import { TreeNode, NodeUIState, NodeId } from '@/types/node'

export function findNodeById(tree: TreeNode, id: NodeId): TreeNode | null {
  if (tree.id === id) return tree
  for (const child of tree.children) {
    const found = findNodeById(child, id)
    if (found) return found
  }
  return null
}

export function findParentNode(tree: TreeNode, childId: NodeId): TreeNode | null {
  for (const child of tree.children) {
    if (child.id === childId) return tree
    const found = findParentNode(child, childId)
    if (found) return found
  }
  return null
}

export function getVisibleNodes(
  tree: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>
): TreeNode[] {
  const result: TreeNode[] = []
  collectVisible(tree, nodeStates, true, result)
  return result
}

function collectVisible(
  node: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>,
  ancestorExpanded: boolean,
  result: TreeNode[]
): void {
  if (!ancestorExpanded) return
  result.push(node)
  const state = nodeStates.get(node.id)
  const expanded = state?.expanded ?? false
  for (const child of node.children) {
    collectVisible(child, nodeStates, expanded, result)
  }
}

export function getSiblings(tree: TreeNode, nodeId: NodeId): TreeNode[] {
  const parent = findParentNode(tree, nodeId)
  if (!parent) return [tree]
  return parent.children
}

export function isAncestorChainExpanded(
  node: TreeNode,
  tree: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>
): boolean {
  let current = node
  while (true) {
    const parent = findParentNode(tree, current.id)
    if (!parent) return true
    const parentState = nodeStates.get(parent.id)
    if (!parentState?.expanded) return false
    current = parent
  }
}

export function findDFSSuccessor(
  node: TreeNode,
  tree: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>
): TreeNode | null {
  let current = node
  while (true) {
    const parent = findParentNode(tree, current.id)
    if (!parent) return null

    const siblings = parent.children
    const idx = siblings.findIndex(c => c.id === current.id)
    if (idx < siblings.length - 1) {
      let next = siblings[idx + 1]
      // Follow first-child chain while each node is expanded → DFS successor
      let nextState = nodeStates.get(next.id)
      while (nextState?.expanded && next.children.length > 0) {
        next = next.children[0]
        nextState = nodeStates.get(next.id)
      }
      if (isAncestorChainExpanded(next, tree, nodeStates)) {
        return next
      }
    }
    current = parent
  }
}

export function findPreviousSibling(
  node: TreeNode,
  tree: TreeNode
): TreeNode | null {
  const parent = findParentNode(tree, node.id)
  if (!parent) return null
  const siblings = parent.children
  const idx = siblings.findIndex(c => c.id === node.id)
  if (idx > 0) return siblings[idx - 1]
  return null
}

export function findNextSibling(
  node: TreeNode,
  tree: TreeNode
): TreeNode | null {
  const parent = findParentNode(tree, node.id)
  if (!parent) return null
  const siblings = parent.children
  const idx = siblings.findIndex(c => c.id === node.id)
  if (idx < siblings.length - 1) return siblings[idx + 1]
  return null
}

export function getVisibleSiblings(
  node: TreeNode,
  tree: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>
): TreeNode[] {
  const parent = findParentNode(tree, node.id)
  if (!parent) return [tree]
  return parent.children.filter(c => {
    return isAncestorChainExpanded(c, tree, nodeStates)
  })
}

export function findFirstVisibleChild(
  node: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>
): TreeNode | null {
  if (node.children.length === 0) return null
  const state = nodeStates.get(node.id)
  if (!state?.expanded) return null
  return node.children[0]
}

export function findLastVisibleDescendant(
  node: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>
): TreeNode {
  const state = nodeStates.get(node.id)
  if (!state?.expanded || node.children.length === 0) return node
  return findLastVisibleDescendant(node.children[node.children.length - 1], nodeStates)
}

export function findNodeAtDepthLastChild(
  branch: TreeNode,
  targetDepth: number,
  nodeStates: Map<NodeId, NodeUIState>
): TreeNode | null {
  let current = branch
  while (current.depth < targetDepth) {
    const state = nodeStates.get(current.id)
    if (!state?.expanded || current.children.length === 0) return null
    current = current.children[current.children.length - 1]
  }
  return current.depth === targetDepth ? current : null
}

export function findNodeAtDepthFirstChild(
  branch: TreeNode,
  targetDepth: number,
  nodeStates: Map<NodeId, NodeUIState>
): TreeNode | null {
  let current = branch
  while (current.depth < targetDepth) {
    const state = nodeStates.get(current.id)
    if (!state?.expanded || current.children.length === 0) return null
    current = current.children[0]
  }
  return current.depth === targetDepth ? current : null
}
