import { useSettingsStore } from '@/store/settingsStore'
import { useNodeStateStore } from '@/store/nodeStateStore'
import { motion } from 'framer-motion'

const APPLE_RADIUS = 14

interface TitleBarProps {
  nodeId: string
  title: string
  hasChildren: boolean
  isFocused: boolean
  isDetailMode: boolean
}

export function TitleBar({ nodeId, title, hasChildren, isFocused, isDetailMode }: TitleBarProps) {
  const glassOpacity = useSettingsStore((s) => s.settings.glassOpacity)
  const nodeTitleHeight = useSettingsStore((s) => s.settings.nodeTitleHeight)
  const states = useNodeStateStore((s) => s.states)

  const expanded = states[nodeId]?.expanded ?? false
  const detailZoom = states[nodeId]?.detailZoom ?? 1

  const baseFontSize = isDetailMode ? 10 * detailZoom : isFocused ? 12 : 10
  const paddingV = isDetailMode ? 4 : 5
  const paddingH = isDetailMode ? 10 : 12
  const minH = isDetailMode ? Math.round(nodeTitleHeight * 0.8 * detailZoom) : nodeTitleHeight

  return (
    <motion.div
      animate={{
        fontSize: `${baseFontSize}px`,
        padding: `${paddingV}px ${paddingH}px`,
        minHeight: `${minH}px`,
        boxShadow: isFocused
          ? `0 0 0 2px var(--focus-ring), 0 4px 12px var(--shadow-color)`
          : `0 1px 4px var(--shadow-color)`
      }}
      transition={{
        type: 'tween',
        duration: 0.2,
        ease: 'easeOut'
      }}
      style={{
        borderRadius: `${APPLE_RADIUS}px`,
        border: `1.5px solid var(--border-color)`,
        width: 'auto',
        maxWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontWeight: 600,
        backdropFilter: glassOpacity > 0 ? 'blur(10px)' : undefined,
        WebkitBackdropFilter: glassOpacity > 0 ? 'blur(10px)' : undefined,
        background: glassOpacity > 0
          ? `rgba(255, 255, 255, ${glassOpacity * 0.8})`
          : 'var(--bg-node)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'normal',
        wordBreak: 'break-all',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        boxSizing: 'border-box' as const
      }}
    >
      <span>{title}</span>
      {hasChildren && (
        <span style={{ fontSize: isDetailMode ? '6px' : '8px', opacity: 0.5, flexShrink: 0 }}>
          {expanded ? '▾' : '▸'}
        </span>
      )}
    </motion.div>
  )
}
