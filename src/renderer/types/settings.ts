export type ThemeKind = 'light' | 'dark' | 'gray'
export type Language = 'en' | 'zh'

export interface UserSettings {
  theme: ThemeKind
  language: Language
  animationScale: number
  nodeTitleHeight: number
  glassOpacity: number
  focusScale: number
  detailMaxHeight: number
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  language: 'en',
  animationScale: 1.0,
  nodeTitleHeight: 28,
  glassOpacity: 0.65,
  focusScale: 1.5,
  detailMaxHeight: 500
}
