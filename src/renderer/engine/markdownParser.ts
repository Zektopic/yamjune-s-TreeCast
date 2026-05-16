import { TreeNode, MediaRef } from '@/types/node'

interface HeadingBlock {
  level: number
  title: string
  contentLines: string[]
  children: HeadingBlock[]
}

function parseHeadingLevel(line: string): number {
  const match = line.match(/^(#{1,6})\s/)
  if (!match) return -1
  return match[1].length
}

function getHeadingTitle(line: string): string {
  return line.replace(/^#{1,6}\s+/, '').trim()
}

function extractMediaRefs(markdown: string): MediaRef[] {
  const refs: MediaRef[] = []

  // Standard markdown images: ![alt](path)
  const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g
  let match: RegExpExecArray | null
  while ((match = imgRegex.exec(markdown)) !== null) {
    const alt = match[1]
    const relativePath = match[2]
    const isGif = relativePath.toLowerCase().endsWith('.gif')
    refs.push({
      type: isGif ? 'gif' : 'image',
      relativePath,
      alt
    })
  }

  // Video tags: <video src="path" ...>
  const videoRegex = /<video\s[^>]*src="([^"]+)"[^>]*>/gi
  while ((match = videoRegex.exec(markdown)) !== null) {
    refs.push({
      type: 'video',
      relativePath: match[1],
      alt: ''
    })
  }

  return refs
}

function generateNodeId(path: number[]): string {
  return path.join('-')
}

function buildTree(blocks: HeadingBlock[], depth: number, parentPath: number[]): TreeNode[] {
  const nodes: TreeNode[] = []

  blocks.forEach((block, index) => {
    const nodePath = [...parentPath, index]
    const detailRaw = block.contentLines.join('\n').trim()
    const mediaRefs = extractMediaRefs(detailRaw)

    const node: TreeNode = {
      id: generateNodeId(nodePath),
      title: block.title,
      detailRaw,
      detailHtml: '', // Will be populated later by markdownRenderer
      mediaRefs,
      children: block.children.length > 0
        ? buildTree(block.children, depth + 1, nodePath)
        : [],
      depth,
      path: nodePath
    }

    nodes.push(node)
  })

  return nodes
}

export function parseContextMD(markdownText: string): TreeNode | null {
  const lines = markdownText.split('\n')
  const rootBlocks = buildHeadingTree(lines)

  if (rootBlocks.length === 0) return null

  // First `#` is the root; if the first heading is not `#`, wrap in a synthetic root
  if (rootBlocks[0].level === 1) {
    const rootBlock = rootBlocks[0]
    const detailRaw = rootBlock.contentLines.join('\n').trim()

    return {
      id: '0',
      title: rootBlock.title,
      detailRaw,
      detailHtml: '',
      mediaRefs: extractMediaRefs(detailRaw),
      children: buildTree(rootBlock.children, 1, [0]),
      depth: 0,
      path: [0]
    }
  }

  // No level-1 heading: create synthetic root, treat all top-level blocks as children
  const synChildren = rootBlocks.map((block, index) => {
    const detailRaw = block.contentLines.join('\n').trim()
    return {
      id: `0-${index}`,
      title: block.title,
      detailRaw,
      detailHtml: '',
      mediaRefs: extractMediaRefs(detailRaw),
      children: block.children.length > 0
        ? buildTree(block.children, block.level, [0, index])
        : [],
      depth: 1,
      path: [0, index]
    }
  })

  return {
    id: '0',
    title: 'Untitled',
    detailRaw: '',
    detailHtml: '',
    mediaRefs: [],
    children: synChildren,
    depth: 0,
    path: [0]
  }
}

function buildHeadingTree(lines: string[]): HeadingBlock[] {
  const root: HeadingBlock[] = []
  const stack: { level: number; block: HeadingBlock }[] = []

  let currentBlock: HeadingBlock | null = null

  for (const line of lines) {
    const level = parseHeadingLevel(line)

    if (level > 0) {
      // Finish current block
      if (currentBlock) {
        placeBlock(currentBlock, stack, root)
      }

      currentBlock = {
        level,
        title: getHeadingTitle(line),
        contentLines: [],
        children: []
      }
    } else if (currentBlock) {
      currentBlock.contentLines.push(line)
    }
  }

  // Finish last block
  if (currentBlock) {
    placeBlock(currentBlock, stack, root)
  }

  return root
}

function placeBlock(
  block: HeadingBlock,
  stack: { level: number; block: HeadingBlock }[],
  root: HeadingBlock[]
): void {
  // Pop stack until we find a parent (strictly lower level)
  while (stack.length > 0 && stack[stack.length - 1].level >= block.level) {
    stack.pop()
  }

  if (stack.length === 0) {
    root.push(block)
  } else {
    stack[stack.length - 1].block.children.push(block)
  }

  stack.push({ level: block.level, block })
}
