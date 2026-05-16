// Preload script — uses dynamic import for electron on Windows compatibility
async function init() {
  let contextBridge: any
  let ipcRenderer: any

  try {
    const m = await import('electron')
    const api = m.default && m.default.contextBridge ? m.default : m
    contextBridge = api.contextBridge
    ipcRenderer = api.ipcRenderer
  } catch {
    try {
      const e = require('electron')
      contextBridge = e.contextBridge
      ipcRenderer = e.ipcRenderer
    } catch {
      console.error('Failed to load electron in preload')
      return
    }
  }

  if (!contextBridge || !ipcRenderer) return

  contextBridge.exposeInMainWorld('electronAPI', {
    openFile: () => ipcRenderer.invoke('file:open'),
    saveFile: (path: string, content: string) => ipcRenderer.invoke('file:save', path, content),
    readFile: (path: string) => ipcRenderer.invoke('file:read', path),
    setWorkspaceRoot: (path: string) => ipcRenderer.invoke('workspace:setRoot', path),
    getWorkspaceRoot: () => ipcRenderer.invoke('workspace:getRoot'),
    minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
    maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
    closeWindow: () => ipcRenderer.invoke('window:close')
  })
}

init()
