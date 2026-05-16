import { useEffect, useRef } from 'react'
import { useViewportStore } from '@/store/viewportStore'
import type { NodeId } from '@/types/node'
import type { LayoutBox } from '@/types/layout'

export function useCameraController(
  focusedId: NodeId | null,
  layoutMap: Map<NodeId, LayoutBox>,
  containerWidth: number,
  containerHeight: number
): void {
  const centerOn = useViewportStore((s) => s.centerOn)
  const lastKeyRef = useRef('')

  useEffect(() => {
    if (!focusedId) return
    const box = layoutMap.get(focusedId)
    if (!box) return

    const key = `${box.x},${box.y},${box.width},${box.height},${containerWidth},${containerHeight}`
    if (key === lastKeyRef.current) return
    lastKeyRef.current = key

    centerOn(box, containerWidth, containerHeight)
  }, [focusedId, layoutMap, containerWidth, containerHeight, centerOn])
}
