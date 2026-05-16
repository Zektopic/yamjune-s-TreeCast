import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { LayoutBox, Viewport } from '@/types/layout'

interface ViewportState {
  viewport: Viewport
  setViewport: (partial: Partial<Viewport>) => void
  centerOn: (box: LayoutBox, viewportW: number, viewportH: number) => void
  panTo: (x: number, y: number) => void
  zoomTo: (zoom: number) => void
}

export const useViewportStore = create<ViewportState>()(
  immer((set) => ({
    viewport: { x: 0, y: 0, width: 1280, height: 800, zoom: 1 },

    setViewport: (partial) =>
      set((s) => {
        Object.assign(s.viewport, partial)
      }),

    centerOn: (box, viewportW, viewportH) =>
      set((s) => {
        s.viewport.x = box.x + box.width / 2 - viewportW / 2
        s.viewport.y = box.y + box.height / 2 - viewportH / 2
      }),

    panTo: (x, y) =>
      set((s) => {
        s.viewport.x = x
        s.viewport.y = y
      }),

    zoomTo: (zoom) =>
      set((s) => {
        s.viewport.zoom = Math.max(0.1, Math.min(3, zoom))
      })
  }))
)
