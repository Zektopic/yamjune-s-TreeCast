export function isLocalResource(url: string, workspaceRoot: string): boolean {
  if (url.startsWith('http://') || url.startsWith('https://')) return false
  if (url.startsWith('file://')) return true
  // Relative paths are local
  return !url.includes('://')
}

export async function confirmExternalResource(url: string): Promise<boolean> {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // In a full implementation, this would show an IPC confirmation dialog
    return true
  }
  return true
}

export function resolveMediaPath(
  relativePath: string,
  workspaceDir: string
): string {
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath
  }

  if (relativePath.startsWith('file://')) {
    return relativePath
  }

  // Join workspace dir and relative path with forward slashes
  const base = workspaceDir.replace(/\\/g, '/').replace(/\/$/, '')
  const rel = relativePath.replace(/\\/g, '/').replace(/^\//, '')
  const fullPath = `${base}/${rel}`

  return `file:///${fullPath.replace(/^\//, '')}`
}
