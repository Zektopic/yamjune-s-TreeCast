import type { ReactNode, CSSProperties } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

interface GlassPaneProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
}

export function GlassPane({ children, style, className = '' }: GlassPaneProps) {
  const glassOpacity = useSettingsStore((s) => s.settings.glassOpacity)

  return (
    <div
      className={className}
      style={{
        backdropFilter: `blur(12px)`,
        WebkitBackdropFilter: `blur(12px)`,
        background: `var(--bg-node)`,
        opacity: glassOpacity > 0 ? undefined : 1,
        ...style
      }}
    >
      {children}
    </div>
  )
}
