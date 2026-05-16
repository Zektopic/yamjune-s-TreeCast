import { LayoutBox } from '@/types/layout'

export interface BezierPathResult {
  path: string
  startDot: { cx: number; cy: number; r: number }
  endArrow: string
}

const EDGE_OFFSET = 5

export function computeBezierPath(
  parentBox: LayoutBox,
  childBox: LayoutBox
): BezierPathResult {
  // Start 5px from midpoint of parent's right border
  const x1 = parentBox.x + parentBox.width + EDGE_OFFSET
  const y1 = parentBox.y + parentBox.height / 2

  // End 5px from midpoint of child's left border
  const x2 = childBox.x - EDGE_OFFSET
  const y2 = childBox.y + childBox.height / 2

  const dx = Math.abs(x2 - x1)
  const cpOffset = Math.min(dx * 0.4, 150)

  const cp1x = x1 + cpOffset
  const cp1y = y1
  const cp2x = x2 - cpOffset
  const cp2y = y2

  const path = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`

  const arrowSize = 5
  const arrow = `${x2},${y2 - arrowSize} ${x2 + arrowSize + 2},${y2} ${x2},${y2 + arrowSize}`

  return {
    path,
    startDot: { cx: x1, cy: y1, r: 2.5 },
    endArrow: arrow
  }
}
