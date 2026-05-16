import { readFile, writeFile, access, mkdir } from 'fs/promises'
import { join, resolve, normalize, dirname } from 'path'

let workspaceRoot: string | null = null

async function getConfigDir(app: { getPath(name: string): string }): Promise<string> {
  const dir = join(app.getPath('userData'), 'config')
  await mkdir(dir, { recursive: true }).catch(() => {})
  return dir
}

async function loadLastDir(app: { getPath(name: string): string }): Promise<string> {
  try {
    const configPath = join(await getConfigDir(app), 'lastDir.json')
    const data = await readFile(configPath, 'utf-8')
    const parsed = JSON.parse(data)
    if (parsed.lastDir) {
      await access(parsed.lastDir)
      return parsed.lastDir
    }
  } catch {
    // File doesn't exist or directory no longer accessible
  }
  return app.getPath('documents')
}

async function saveLastDir(app: { getPath(name: string): string }, dir: string): Promise<void> {
  try {
    const configPath = join(await getConfigDir(app), 'lastDir.json')
    await writeFile(configPath, JSON.stringify({ lastDir: dir }), 'utf-8')
  } catch {
    // Non-critical, ignore write failures
  }
}

async function getWorkspaceRoot(app: { getPath(name: string): string }): Promise<string> {
  if (workspaceRoot === null) {
    workspaceRoot = await loadLastDir(app)
  }
  return workspaceRoot
}

async function isPathWithinWorkspace(filePath: string, app: { getPath(name: string): string }): Promise<boolean> {
  const root = await getWorkspaceRoot(app)
  const normalizedPath = normalize(resolve(filePath))
  const normalizedRoot = normalize(resolve(root))
  return normalizedPath.startsWith(normalizedRoot)
}

// Minimal interface for the electron API subset we need
interface ElectronSubset {
  ipcMain: {
    handle(channel: string, listener: (...args: any[]) => any): void
  }
  dialog: {
    showOpenDialog(win: any, opts: any): Promise<{ canceled: boolean; filePaths: string[] }>
  }
  BrowserWindow: {
    getFocusedWindow(): { minimize(): void; isMaximized(): boolean; maximize(): void; unmaximize(): void; close(): void } | null
  }
  app: {
    getPath(name: string): string
  }
}

export function registerIpcHandlers(e: ElectronSubset): void {
  const { ipcMain, dialog, BrowserWindow, app } = e

  ipcMain.handle('workspace:setRoot', async (_event: any, newRoot: string) => {
    const resolved = resolve(newRoot)
    try {
      await access(resolved)
      workspaceRoot = resolved
      return { success: true, path: resolved }
    } catch {
      return { success: false, error: 'Directory does not exist' }
    }
  })

  ipcMain.handle('workspace:getRoot', async () => {
    return getWorkspaceRoot(app)
  })

  ipcMain.handle('file:open', async () => {
    const win = BrowserWindow.getFocusedWindow()
    if (!win) return { success: false, error: 'No window' }

    const defaultPath = await getWorkspaceRoot(app)

    const result = await dialog.showOpenDialog(win, {
      title: 'Open context.md',
      filters: [{ name: 'Markdown', extensions: ['md'] }],
      properties: ['openFile'],
      defaultPath
    })

    if (result.canceled || result.filePaths.length === 0) {
      return { success: false, error: 'Cancelled' }
    }

    const filePath = result.filePaths[0]
    try {
      const content = await readFile(filePath, 'utf-8')
      const dir = resolve(dirname(filePath))
      workspaceRoot = dir
      await saveLastDir(app, dir)
      // Auto-create images/ and videos/ subdirectories
      await mkdir(join(dir, 'images'), { recursive: true }).catch(() => {})
      await mkdir(join(dir, 'videos'), { recursive: true }).catch(() => {})
      return { success: true, path: filePath, dir, content }
    } catch (err) {
      return { success: false, error: `Failed to read file: ${err}` }
    }
  })

  ipcMain.handle('file:save', async (_event, filePath: string, content: string) => {
    if (!(await isPathWithinWorkspace(filePath, app))) {
      return { success: false, error: 'Path outside workspace' }
    }
    try {
      await writeFile(filePath, content, 'utf-8')
      return { success: true }
    } catch (err) {
      return { success: false, error: `Failed to write: ${err}` }
    }
  })

  ipcMain.handle('file:read', async (_event, filePath: string) => {
    if (!(await isPathWithinWorkspace(filePath, app))) {
      return { success: false, error: 'Path outside workspace' }
    }
    try {
      const content = await readFile(filePath, 'utf-8')
      return { success: true, content }
    } catch (err) {
      return { success: false, error: `Failed to read: ${err}` }
    }
  })

  ipcMain.handle('window:minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize()
  })

  ipcMain.handle('window:maximize', () => {
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
    }
  })

  ipcMain.handle('window:close', () => {
    BrowserWindow.getFocusedWindow()?.close()
  })
}
