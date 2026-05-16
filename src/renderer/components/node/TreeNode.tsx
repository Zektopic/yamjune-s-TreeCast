import { memo } from 'react'
import { motion } from 'framer-motion'
import { TreeNode as TreeNodeType } from '@/types/node'
import { LayoutBox } from '@/types/layout'
import { useNodeStateStore } from '@/store/nodeStateStore'
import { TitleBar } from './TitleBar'
import { DetailPanel } from './DetailPanel'

interface TreeNodeProps {
  node: TreeNodeType
  layout: LayoutBox
  staggerDelay: number
  onMouseDown: (id: string) => void
  onDoubleClick: (id: string) => void
}

export const TreeNodeComponent = memo(function TreeNodeComponent({
  node,
  layout,
  staggerDelay,
  onMouseDown,
  onDoubleClick
}: TreeNodeProps) {
  const focusedId = useNodeStateStore((s) => s.focusedId)
  const states = useNodeStateStore((s) => s.states)

  const isFocused = focusedId === node.id
  const state = states[node.id]
  const mode = state?.mode ?? 'title'
  const isDetailMode = mode === 'detail'
  const detailZoom = state?.detailZoom ?? 1

  // Title mode: container width scales 1.2x when focused (for 12px font vs 10px default)
  const focusScale = isFocused && !isDetailMode ? 1.2 : 1

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: staggerDelay * 0.06,
        type: 'spring',
        stiffness: 300,
        damping: 24,
        mass: 0.5
      }}
      style={{
        position: 'absolute',
        left: layout.x,
        top: layout.y,
        width: isDetailMode
          ? Math.round(layout.width * detailZoom)
          : Math.round(layout.width * focusScale),
        zIndex: isFocused ? 10 : 1,
        transformOrigin: 'center center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}
      onMouseDown={(e) => {
        e.stopPropagation()
        onMouseDown(node.id)
      }}
      onDoubleClick={(e) => {
        e.stopPropagation()
        onDoubleClick(node.id)
      }}
    >
      <TitleBar
        nodeId={node.id}
        title={node.title}
        hasChildren={node.children.length > 0}
        isFocused={isFocused}
        isDetailMode={isDetailMode}
      />
      <DetailPanel
        nodeId={node.id}
        detailHtml={node.detailHtml}
        mediaRefs={node.mediaRefs}
        mode={mode}
        detailZoom={detailZoom}
      />
    </motion.div>
  )
})
