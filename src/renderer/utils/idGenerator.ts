export function generateNodeId(path: number[]): string {
  return path.join('-')
}

export function parseNodeId(id: string): number[] {
  return id.split('-').map(Number)
}
