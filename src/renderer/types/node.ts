export interface MediaRef {
  type: 'image' | 'gif' | 'video'
  relativePath: string
  alt: string
}

export interface TreeNode {
  id: string
  title: string
  detailRaw: string
  detailHtml: string
  mediaRefs: MediaRef[]
  children: TreeNode[]
  depth: number
  path: number[]
}

export type NodeMode = 'title' | 'detail'

export interface NodeUIState {
  mode: NodeMode
  expanded: boolean
  detailZoom: number
}

export type NodeId = string
