import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
  maximized: boolean
}

interface AppLike {
  getPath(name: string): string
}

interface WindowLike {
  on(event: string, cb: () => void): void
  isDestroyed(): boolean
  isMaximized(): boolean
  getBounds(): { x: number; y: number; width: number; height: number }
}

function getStatePath(app: AppLike): string {
  return join(app.getPath('userData'), 'window-state.json')
}

export function restoreWindowState(): WindowState {
  return { width: 1280, height: 800, maximized: false }
}

export function trackWindowState(win: WindowLike, app: AppLike): void {
  const save = (): void => {
    if (win.isDestroyed()) return
    if (win.isMaximized()) {
      saveWindowState({ width: 1280, height: 800, maximized: true }, app)
      return
    }
    const bounds = win.getBounds()
    saveWindowState({
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      maximized: false
    }, app)
  }

  const events = ['resize', 'move', 'maximize', 'unmaximize', 'close']
  for (const evt of events) {
    win.on(evt, save)
  }
}

function saveWindowState(state: WindowState, app: AppLike): void {
  try {
    const userDataPath = app.getPath('userData')
    if (!existsSync(userDataPath)) {
      mkdirSync(userDataPath, { recursive: true })
    }
    writeFileSync(getStatePath(app), JSON.stringify(state, null, 2))
  } catch {
    // Silently fail
  }
}
