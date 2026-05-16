import { motion, AnimatePresence } from 'framer-motion'
import { MarkdownBody } from './MarkdownBody'
import { MediaEmbed } from './MediaEmbed'
import { MediaRef } from '@/types/node'

const APPLE_RADIUS = 14
const INDICATOR_SIZE = 7

interface DetailPanelProps {
  nodeId: string
  detailHtml: string
  mediaRefs: MediaRef[]
  mode: 'title' | 'detail'
  detailZoom?: number
}

const springTransition = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 24,
  mass: 0.6
}

export function DetailPanel({ nodeId, detailHtml, mediaRefs, mode, detailZoom = 1 }: DetailPanelProps) {
  const hasContent = !!(detailHtml || mediaRefs.length > 0)
  if (!hasContent) return null

  const isDetail = mode === 'detail'

  return (
    <div style={{ marginTop: 5 }}>
      <motion.div
        layout
        animate={{
          borderRadius: isDetail ? APPLE_RADIUS : INDICATOR_SIZE / 2,
          boxShadow: isDetail
            ? '0 4px 16px var(--shadow-color)'
            : '0 0px 0px transparent'
        }}
        transition={springTransition}
        style={{
          background: isDetail ? 'var(--bg-detail)' : 'var(--indicator-bg)',
          border: isDetail ? '1.5px solid var(--border-color)' : 'none',
          width: isDetail ? 'fit-content' : INDICATOR_SIZE,
          height: isDetail ? 'auto' : INDICATOR_SIZE,
          minWidth: isDetail ? Math.round(120 * detailZoom) : undefined,
          maxWidth: isDetail ? Math.round(320 * detailZoom) : undefined,
          maxHeight: isDetail ? Math.round(600 * detailZoom) : undefined,
          boxSizing: 'border-box' as const,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}
      >
        <AnimatePresence initial={false}>
          {isDetail ? (
            <motion.div
              key="detail-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflowY: 'auto', maxHeight: Math.round(600 * detailZoom), width: '100%' }}
            >
              <MarkdownBody html={detailHtml} zoom={detailZoom} />
              {mediaRefs.length > 0 && (
                <div style={{ padding: '0 12px 8px' }}>
                  {mediaRefs.map((ref, i) => (
                    <MediaEmbed key={`${ref.relativePath}-${i}`} media={ref} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="indicator"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width={INDICATOR_SIZE} height={INDICATOR_SIZE} viewBox={`0 0 ${INDICATOR_SIZE} ${INDICATOR_SIZE}`}>
                <polygon
                  points={`${INDICATOR_SIZE * 0.2},${INDICATOR_SIZE * 0.3} ${INDICATOR_SIZE * 0.8},${INDICATOR_SIZE * 0.3} ${INDICATOR_SIZE * 0.5},${INDICATOR_SIZE * 0.75}`}
                  fill="var(--indicator-arrow)"
                />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
