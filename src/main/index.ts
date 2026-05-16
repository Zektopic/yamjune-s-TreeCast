// Note: On Windows, require('electron') may return a path string due to
// Electron bug #49034. We use dynamic import() and fallback to require().

async function main() {
  const electronModule = await loadElectron()

  if (!electronModule || typeof electronModule !== 'object' || !electronModule.app) {
    console.error(
      '\n╔══════════════════════════════════════════════════════════════╗\n' +
      '║  Failed to load Electron API module.                        ║\n' +
      '║  This is a known issue on some Windows systems.             ║\n' +
      '║  GitHub: electron/electron#49034                            ║\n' +
      '╚══════════════════════════════════════════════════════════════╝\n'
    )
    process.exit(1)
  }

  const app = electronModule.app
  const BrowserWindow = electronModule.BrowserWindow
  const shell = electronModule.shell
  const { join } = await import('path')
  const { restoreWindowState, trackWindowState } = await import('./windowManager')
  const { registerIpcHandlers } = await import('./ipcHandlers')

  registerIpcHandlers({ app, BrowserWindow, dialog: electronModule.dialog, ipcMain: electronModule.ipcMain })

  let mainWindow: typeof BrowserWindow.prototype | null = null

  function createWindow(): void {
    const savedState = restoreWindowState()

    mainWindow = new BrowserWindow({
      x: savedState.x,
      y: savedState.y,
      width: savedState.width || 1280,
      height: savedState.height || 800,
      frame: false,
      titleBarStyle: 'hidden',
      backgroundColor: '#1a1a2e',
      webPreferences: {
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
        preload: join(__dirname, '../preload/index.js')
      },
      show: false
    })

    if (savedState.maximized) {
      mainWindow.maximize()
    }

    mainWindow.on('ready-to-show', () => {
      if (mainWindow) mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details: { url: string }) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mainWindow.webContents.session.webRequest.onHeadersReceived((details: any, callback: any) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: file:; media-src 'self' file:; font-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'"
          ]
        }
      })
    })

    trackWindowState(mainWindow, app)

    if (process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
  }

  app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}

async function loadElectron() {
  try {
    const m = await import('electron')
    if (m.default && typeof m.default === 'object' && m.default.app) {
      return m.default
    }
    return m
  } catch {
    try {
      return require('electron')
    } catch {
      return null
    }
  }
}

main()
