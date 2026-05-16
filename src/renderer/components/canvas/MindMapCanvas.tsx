import { useRef, useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTreeStore } from '@/store/treeStore'
import { useNodeStateStore } from '@/store/nodeStateStore'
import { useViewportStore } from '@/store/viewportStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calculateLayout } from '@/engine/treeLayout'
import { useKeyboardNav } from '@/hooks/useKeyboardNav'
import { useVirtualization } from '@/hooks/useVirtualization'
import { useCameraController } from '@/hooks/useCameraController'
import { ConnectionLayer } from './ConnectionLayer'
import { VirtualizedRenderer } from './VirtualizedRenderer'
import type { NodeId, NodeUIState } from '@/types/node'
import { t } from '@/i18n/translations'

export function MindMapCanvas() {
  const tree = useTreeStore((s) => s.tree)
  const states = useNodeStateStore((s) => s.states)
  const focusedId = useNodeStateStore((s) => s.focusedId)
  const toggleMode = useNodeStateStore((s) => s.toggleMode)
  const toggleExpanded = useNodeStateStore((s) => s.toggleExpanded)
  const setExpanded = useNodeStateStore((s) => s.setExpanded)
  const setFocusedId = useNodeStateStore((s) => s.setFocusedId)
  const setDetailZoom = useNodeStateStore((s) => s.setDetailZoom)
  const settings = useSettingsStore((s) => s.settings)
  const viewport = useViewportStore((s) => s.viewport)
  const setViewport = useViewportStore((s) => s.setViewport)
  const panTo = useViewportStore((s) => s.panTo)
  const zoomTo = useViewportStore((s) => s.zoomTo)
  const centerOn = useViewportStore((s) => s.centerOn)

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 1280, h: 800 })

  // Layout calculation
  const statesMap = new Map<string, NodeUIState>(Object.entries(states))
  const layoutMap = tree
    ? calculateLayout(tree, statesMap, settings, focusedId)
    : new Map()

  // Camera auto-center on focus change
  useCameraController(focusedId, layoutMap, containerSize.w, containerSize.h)

  // Virtualization
  const visibleNodeIds = useVirtualization(tree, layoutMap, viewport, focusedId)

  // Double-click detection with delay
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleNodeMouseDown = useCallback((id: NodeId) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
      toggleMode(id)
      return
    }
    clickTimerRef.current = setTimeout(() => {
      setFocusedId(id)
      clickTimerRef.current = null
    }, 300)
  }, [setFocusedId, toggleMode])

  const handleNodeDoubleClick = useCallback((id: NodeId) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }
    toggleMode(id)
  }, [toggleMode])

  // Keyboard navigation
  useKeyboardNav({
    tree,
    layoutMap,
    focusedId,
    states: statesMap,
    onSetFocused: setFocusedId,
    onToggleMode: toggleMode,
    onToggleExpanded: toggleExpanded,
    onSetExpanded: setExpanded,
    onSetDetailZoom: setDetailZoom
  })

  // Measure container
  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    (containerRef as any).current = node
    if (node) {
      const rect = node.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ w: rect.width, h: rect.height })
        setViewport({ width: rect.width, height: rect.height })
      }
    }
  }, [setViewport])

  // ---- Right-click drag pan ----
  const panning = useRef(false)
  const panStart = useRef({ mx: 0, my: 0, vx: 0, vy: 0 })
  const [panCursor, setPanCursor] = useState('default')

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 2) return
    e.preventDefault()
    e.stopPropagation()
    panning.current = true
    panStart.current = { mx: e.clientX, my: e.clientY, vx: viewport.x, vy: viewport.y }
    setPanCursor('grabbing')
  }, [viewport.x, viewport.y])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!panning.current) return
    const dx = e.clientX - panStart.current.mx
    const dy = e.clientY - panStart.current.my
    panTo(
      panStart.current.vx - dx / viewport.zoom,
      panStart.current.vy - dy / viewport.zoom
    )
  }, [viewport.zoom, panTo])

  useEffect(() => {
    const handleMouseUp = () => {
      if (panning.current) {
        panning.current = false
        setPanCursor('default')
      }
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  // ---- Mouse wheel zoom ----
  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    // Ctrl+wheel always zooms the canvas
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      zoomTo(Math.max(0.1, Math.min(3, viewport.zoom * factor)))
      return
    }

    e.preventDefault()

    // On focused node: zoom the node itself (10% per tick)
    if (focusedId) {
      const state = states[focusedId]
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      if (state?.mode === 'detail') {
        const currentZoom = state?.detailZoom ?? 1
        setDetailZoom(focusedId, Math.max(0.5, Math.min(3, currentZoom * factor)))
      } else {
        zoomTo(Math.max(0.1, Math.min(3, viewport.zoom * factor)))
      }
    } else {
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      zoomTo(Math.max(0.1, Math.min(3, viewport.zoom * factor)))
    }
  }, [focusedId, states, viewport.zoom, zoomTo, setDetailZoom])

  // Prevent context menu on canvas
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
  }, [])

  const lang = settings.language

  const handleOpenFile = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openFile()
      if (result.success && result.content) {
        window.dispatchEvent(new CustomEvent('mindmap:loadFile', {
          detail: { content: result.content, dir: result.dir, path: result.path }
        }))
      }
    }
  }

  if (!tree) {
    return (
      <div
        ref={measuredRef}
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '28px',
          background: 'var(--bg-canvas)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          color: 'var(--text-secondary)',
          fontSize: '14px'
        }}
      >
        <button
          onClick={handleOpenFile}
          style={{
            background: 'var(--focus-ring)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            padding: '12px 40px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 16px rgba(66, 99, 235, 0.35)',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(66, 99, 235, 0.5)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
            ;(e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(66, 99, 235, 0.35)'
          }}
        >
          {t('start', lang)}
        </button>
        <div style={{
          fontSize: '12px',
          color: '#888',
          lineHeight: '1.6',
          textAlign: 'left',
          userSelect: 'none',
          maxWidth: '380px'
        }}>
          <div style={{ marginBottom: '2px', fontWeight: 600 }}>{t('workspaceStructure', lang)}</div>
          <div style={{ paddingLeft: '6px' }}>{t('workspaceItem1', lang)}</div>
          <div style={{ paddingLeft: '6px' }}>{t('workspaceItem2', lang)}</div>
          <div style={{ paddingLeft: '6px' }}>{t('workspaceItem3', lang)}</div>
          <div style={{ marginTop: '6px', marginBottom: '2px', fontWeight: 600 }}>{t('usageTitle', lang)}</div>
          <div style={{ paddingLeft: '6px' }}>{t('usageItem1', lang)}</div>
          <div style={{ paddingLeft: '6px' }}>{t('usageItem2', lang)}</div>
          <div style={{ paddingLeft: '6px' }}>{t('usageItem3', lang)}</div>
          <div style={{ paddingLeft: '6px' }}>{t('usageItem4', lang)}</div>
          <div style={{ paddingLeft: '6px' }}>{t('usageItem5', lang)}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={measuredRef}
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-canvas)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        cursor: panCursor
      }}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onWheel={handleCanvasWheel}
      onContextMenu={handleContextMenu}
    >
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%'
        }}
        animate={{
          x: -viewport.x,
          y: -viewport.y,
          scale: viewport.zoom
        }}
        transition={{
          type: 'spring',
          stiffness: 120,
          damping: 18
        }}
      >
        <ConnectionLayer
          tree={tree}
          layoutMap={layoutMap}
          nodeStates={states}
          canvasWidth={containerSize.w}
          canvasHeight={containerSize.h}
        />
        <VirtualizedRenderer
          tree={tree}
          layoutMap={layoutMap}
          visibleNodeIds={visibleNodeIds}
          onNodeMouseDown={handleNodeMouseDown}
          onNodeDoubleClick={handleNodeDoubleClick}
        />
      </motion.div>
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '12px',
        fontSize: '12px',
        color: '#888',
        lineHeight: '1.5',
        userSelect: 'none',
        pointerEvents: 'none',
        zIndex: 100
      }}>
        <div style={{ fontWeight: 600, marginBottom: '1px' }}>{t('usageTitle', lang)}</div>
        <div style={{ paddingLeft: '4px' }}>{t('usageItem1', lang)}</div>
        <div style={{ paddingLeft: '4px' }}>{t('usageItem2', lang)}</div>
        <div style={{ paddingLeft: '4px' }}>{t('usageItem3', lang)}</div>
        <div style={{ paddingLeft: '4px' }}>{t('usageItem4', lang)}</div>
        <div style={{ paddingLeft: '4px' }}>{t('usageItem5', lang)}</div>
      </div>
    </div>
  )
}
