import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { UserSettings, DEFAULT_SETTINGS, ThemeKind, Language } from '@/types/settings'

interface SettingsState {
  settings: UserSettings
  setTheme: (theme: ThemeKind) => void
  setLanguage: (language: Language) => void
  setAnimationScale: (scale: number) => void
  setNodeTitleHeight: (height: number) => void
  setGlassOpacity: (opacity: number) => void
  setFocusScale: (scale: number) => void
  setDetailMaxHeight: (height: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    immer((set) => ({
      settings: { ...DEFAULT_SETTINGS },

      setTheme: (theme) =>
        set((s) => { s.settings.theme = theme }),

      setLanguage: (language) =>
        set((s) => { s.settings.language = language }),

      setAnimationScale: (scale) =>
        set((s) => { s.settings.animationScale = Math.max(0, Math.min(2, scale)) }),

      setNodeTitleHeight: (height) =>
        set((s) => { s.settings.nodeTitleHeight = Math.max(20, Math.min(80, height)) }),

      setGlassOpacity: (opacity) =>
        set((s) => { s.settings.glassOpacity = Math.max(0, Math.min(1, opacity)) }),

      setFocusScale: (scale) =>
        set((s) => { s.settings.focusScale = Math.max(1, Math.min(3, scale)) }),

      setDetailMaxHeight: (height) =>
        set((s) => { s.settings.detailMaxHeight = Math.max(200, Math.min(1000, height)) })
    })),
    {
      name: 'mindmap-settings',
      version: 2
    }
  )
)
