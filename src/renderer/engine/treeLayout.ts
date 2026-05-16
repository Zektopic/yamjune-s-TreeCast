import { TreeNode, NodeUIState, NodeId } from '@/types/node'
import { LayoutBox } from '@/types/layout'
import { UserSettings } from '@/types/settings'

const H_GAP = 50
const V_GAP = 18
const TITLE_H_PADDING = 24
const LATIN_CHAR_W = 7
const CJK_CHAR_W = 13

const MAX_CHARS_PER_LINE = 10

// Detail box constants
const DETAIL_CHARS_PER_LINE = 30
const DETAIL_AVG_CHAR_W = 5.5
const DETAIL_H_PADDING = 32
const DETAIL_MIN_WIDTH = 120
const DETAIL_MIN_HEIGHT = 60
const DETAIL_MAX_HEIGHT = 800
const DETAIL_LINE_HEIGHT = 10
const DETAIL_MEDIA_HEIGHT = 120
const INDICATOR_SIZE = 7
const INDICATOR_GAP = 2
const BOX_GAP = 5

const FOCUS_EXTRA_GAP = 8

function estimateTitleWidth(title: string): number {
  let w = 0
  let count = 0
  for (const ch of title) {
    if (count >= MAX_CHARS_PER_LINE) break
    w += /[一-鿿　-〿＀-￯぀-ゟ゠-ヿ]/.test(ch)
      ? CJK_CHAR_W
      : LATIN_CHAR_W
    count++
  }
  return Math.max(60, Math.ceil(w + TITLE_H_PADDING))
}

function hasDetailContent(node: TreeNode): boolean {
  return !!(node.detailRaw?.trim() || node.mediaRefs.length > 0)
}

function estimateDetailWidth(node: TreeNode): number {
  if (!hasDetailContent(node)) return 0
  const rawLines = (node.detailRaw || '').split('\n')
  let maxLen = 0
  for (const line of rawLines) {
    const cleaned = line.replace(/[#*_`~\[\]()!>\-|]/g, '').trim()
    if (cleaned.length > maxLen) maxLen = cleaned.length
  }
  maxLen = Math.min(maxLen, DETAIL_CHARS_PER_LINE)
  return Math.max(DETAIL_MIN_WIDTH, Math.ceil(maxLen * DETAIL_AVG_CHAR_W + DETAIL_H_PADDING))
}

function estimateDetailHeight(node: TreeNode): number {
  if (!hasDetailContent(node)) return 0
  const rawLines = (node.detailRaw || '').split('\n')
  const lineCount = Math.max(1, rawLines.length)
  const textHeight = lineCount * DETAIL_LINE_HEIGHT + 24
  const mediaHeight = node.mediaRefs.length * DETAIL_MEDIA_HEIGHT
  return Math.max(DETAIL_MIN_HEIGHT, Math.min(textHeight + mediaHeight, DETAIL_MAX_HEIGHT))
}

function getNodeWidth(node: TreeNode, state: NodeUIState | undefined): number {
  const titleW = estimateTitleWidth(node.title)
  if (state?.mode === 'detail') {
    const detailW = estimateDetailWidth(node)
    const zoom = state?.detailZoom ?? 1
    return Math.max(titleW, Math.round(detailW * zoom))
  }
  return titleW
}

function getNodeHeight(node: TreeNode, state: NodeUIState | undefined, settings: UserSettings): number {
  const zoom = state?.detailZoom ?? 1
  if (state?.mode === 'detail') {
    const titleH = Math.round(settings.nodeTitleHeight * 0.8 * zoom)
    const detailH = estimateDetailHeight(node)
    return Math.round(titleH + BOX_GAP + detailH * zoom)
  }
  if (hasDetailContent(node)) {
    return settings.nodeTitleHeight + INDICATOR_GAP + INDICATOR_SIZE
  }
  return settings.nodeTitleHeight
}

function extraGap(
  focusedId: string | null,
  id: string,
  nodeStates: Map<NodeId, NodeUIState>
): number {
  if (id === focusedId) return FOCUS_EXTRA_GAP
  const state = nodeStates.get(id)
  if (state?.mode === 'detail' && (state?.detailZoom ?? 1) > 1) {
    return FOCUS_EXTRA_GAP
  }
  return 0
}

function computeSubtreeHeight(
  node: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>,
  settings: UserSettings,
  focusedId: string | null
): number {
  const state = nodeStates.get(node.id)
  const nodeHeight = getNodeHeight(node, state, settings)
  const extraV = extraGap(focusedId, node.id, nodeStates)

  if (!state?.expanded || node.children.length === 0) {
    return nodeHeight + extraV * 2
  }

  let totalChildHeight = 0
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    totalChildHeight += computeSubtreeHeight(child, nodeStates, settings, focusedId)
    if (i < node.children.length - 1) {
      const nextChild = node.children[i + 1]
      const childState = nodeStates.get(child.id)
      const nextState = nodeStates.get(nextChild.id)
      const childH = getNodeHeight(child, childState, settings)
      const nextH = getNodeHeight(nextChild, nextState, settings)
      const extraFromChild = extraGap(focusedId, child.id, nodeStates)
      const extraFromNext = extraGap(focusedId, nextChild.id, nodeStates)
      totalChildHeight += V_GAP + extraFromChild + extraFromNext
    }
  }

  return Math.max(nodeHeight + extraV * 2, totalChildHeight)
}

const subtreeHeightCache = new Map<NodeId, number>()

function assignPositions(
  node: TreeNode,
  parentX: number,
  parentY: number,
  nodeStates: Map<NodeId, NodeUIState>,
  settings: UserSettings,
  layoutMap: Map<NodeId, LayoutBox>,
  focusedId: string | null
): void {
  const state = nodeStates.get(node.id)
  const nodeHeight = getNodeHeight(node, state, settings)
  const nodeWidth = getNodeWidth(node, state)

  const themeTitleH = state?.mode === 'detail'
    ? Math.round(settings.nodeTitleHeight * 0.8)
    : settings.nodeTitleHeight

  layoutMap.set(node.id, {
    x: parentX,
    y: parentY - nodeHeight / 2,
    width: nodeWidth,
    height: nodeHeight,
    titleHeight: themeTitleH
  })

  if (!state?.expanded || node.children.length === 0) return

  let totalChildrenHeight = 0
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    totalChildrenHeight += subtreeHeightCache.get(child.id) ?? 0
    if (i < node.children.length - 1) {
      const nextChild = node.children[i + 1]
      const childState = nodeStates.get(child.id)
      const nextState = nodeStates.get(nextChild.id)
      const childH = getNodeHeight(child, childState, settings)
      const nextH = getNodeHeight(nextChild, nextState, settings)
      const extraFromChild = extraGap(focusedId, child.id, nodeStates)
      const extraFromNext = extraGap(focusedId, nextChild.id, nodeStates)
      totalChildrenHeight += V_GAP + extraFromChild + extraFromNext
    }
  }

  const extraH = extraGap(focusedId, node.id, nodeStates)
  const childX = parentX + nodeWidth + H_GAP + extraH
  const startY = parentY - totalChildrenHeight / 2

  let currentY = startY
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i]
    const childSubtreeHeight = subtreeHeightCache.get(child.id) ?? 0
    const childCenterY = currentY + childSubtreeHeight / 2
    assignPositions(child, childX, childCenterY, nodeStates, settings, layoutMap, focusedId)
    if (i < node.children.length - 1) {
      const nextChild = node.children[i + 1]
      const childState = nodeStates.get(child.id)
      const nextState = nodeStates.get(nextChild.id)
      const childH = getNodeHeight(child, childState, settings)
      const nextH = getNodeHeight(nextChild, nextState, settings)
      const extraFromChild = extraGap(focusedId, child.id, nodeStates)
      const extraFromNext = extraGap(focusedId, nextChild.id, nodeStates)
      currentY += childSubtreeHeight + V_GAP + extraFromChild + extraFromNext
    } else {
      currentY += childSubtreeHeight
    }
  }
}

export function calculateLayout(
  root: TreeNode,
  nodeStates: Map<NodeId, NodeUIState>,
  settings: UserSettings,
  focusedId?: string | null
): Map<NodeId, LayoutBox> {
  const fid = focusedId ?? null
  subtreeHeightCache.clear()

  function computeAndCache(node: TreeNode): number {
    const h = computeSubtreeHeight(node, nodeStates, settings, fid)
    subtreeHeightCache.set(node.id, h)
    for (const child of node.children) {
      computeAndCache(child)
    }
    return h
  }

  computeAndCache(root)

  const layoutMap = new Map<NodeId, LayoutBox>()
  const rootState = nodeStates.get(root.id)
  const rootHeight = getNodeHeight(root, rootState, settings)
  const rootX = 60
  const rootY = 350

  assignPositions(root, rootX, rootY, nodeStates, settings, layoutMap, fid)

  return layoutMap
}
