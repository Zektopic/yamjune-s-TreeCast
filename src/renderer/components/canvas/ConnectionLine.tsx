import { memo } from 'react'
import { LayoutBox } from '@/types/layout'
import { computeBezierPath } from '@/engine/bezierGeometry'

interface ConnectionLineProps {
  parentBox: LayoutBox
  childBox: LayoutBox
}

export const ConnectionLine = memo(function ConnectionLine({
  parentBox,
  childBox
}: ConnectionLineProps) {
  const { path, startDot, endArrow } = computeBezierPath(parentBox, childBox)

  return (
    <g>
      <path
        d={path}
        stroke="var(--connection-color)"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />
      <circle
        cx={startDot.cx}
        cy={startDot.cy}
        r={startDot.r}
        fill="var(--connection-color)"
      />
      <polygon
        points={endArrow}
        fill="var(--connection-color)"
      />
    </g>
  )
})
