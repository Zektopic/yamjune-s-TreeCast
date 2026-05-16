import { useMemo } from 'react'
import { useSettingsStore } from '@/store/settingsStore'

export function useNodeVariants() {
  const animationScale = useSettingsStore((s) => s.settings.animationScale)

  const springConfig = useMemo(() => {
    const adjustedStiffness = 250 * (animationScale * animationScale)
    const adjustedDamping = 22 * animationScale
    return {
      type: 'spring' as const,
      stiffness: adjustedStiffness,
      damping: adjustedDamping,
      mass: 0.7
    }
  }, [animationScale])

  const nodeContainerVariants = useMemo(() => ({
    title: {
      width: 'var(--title-width)',
      transition: springConfig
    },
    detail: {
      width: 400,
      transition: springConfig
    }
  }), [springConfig])

  const detailPanelVariants = useMemo(() => ({
    hidden: {
      opacity: 0,
      height: 0,
      scaleY: 0.3,
      transformOrigin: 'top'
    },
    visible: {
      opacity: 1,
      height: 'auto',
      scaleY: 1,
      transition: {
        ...springConfig,
        opacity: { duration: 0.15 }
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      scaleY: 0.3,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  }), [springConfig])

  return {
    springConfig,
    nodeContainerVariants,
    detailPanelVariants
  }
}
