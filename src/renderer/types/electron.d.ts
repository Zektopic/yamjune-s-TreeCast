export interface FileOpenResult {
  success: boolean
  path?: string
  dir?: string
  content?: string
  error?: string
}

export interface FileResult {
  success: boolean
  error?: string
}

export interface FileReadResult {
  success: boolean
  content?: string
  error?: string
}

export interface ElectronAPI {
  openFile: () => Promise<FileOpenResult>
  saveFile: (path: string, content: string) => Promise<FileResult>
  readFile: (path: string) => Promise<FileReadResult>
  setWorkspaceRoot: (path: string) => Promise<{ success: boolean; path?: string; error?: string }>
  getWorkspaceRoot: () => Promise<string>
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<void>
  closeWindow: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
