import 'react'

declare module 'react' {
  interface CSSProperties {
    WebkitAppRegion?: string
    WebkitBackdropFilter?: string
    WebkitFontSmoothing?: string
    MozOsxFontSmoothing?: string
  }
}
