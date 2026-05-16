import { describe, it, expect } from 'vitest'
import { parseContextMD } from '../../src/renderer/engine/markdownParser'
import { calculateLayout } from '../../src/renderer/engine/treeLayout'
import { navigate } from '../../src/renderer/engine/treeNavigation'
import { NodeUIState } from '../../src/renderer/types/node'
import { DEFAULT_SETTINGS } from '../../src/renderer/types/settings'

function setup(markdown: string) {
  const tree = parseContextMD(markdown)!
  const states = new Map<string, NodeUIState>()

  function walk(node: any): void {
    states.set(node.id, { mode: 'title', expanded: node.depth === 0, detailZoom: 1 })
    for (const child of node.children) walk(child)
  }
  walk(tree)

  const layout = calculateLayout(tree, states, DEFAULT_SETTINGS)
  return { tree, states, layout }
}

describe('treeNavigation', () => {
  it('right on expanded parent → first child', () => {
    const { tree, states, layout } = setup('# Root\n## Child 1\n## Child 2')
    const result = navigate('0', 'right', tree, states, layout)
    expect(result).toBe(tree.children[0].id)
  })

  it('left from child → parent', () => {
    const { tree, states, layout } = setup('# Root\n## Child 1')
    const result = navigate(tree.children[0].id, 'left', tree, states, layout)
    expect(result).toBe(tree.id)
  })

  it('left from root → null', () => {
    const { tree, states, layout } = setup('# Root')
    const result = navigate('0', 'left', tree, states, layout)
    expect(result).toBeNull()
  })

  it('down from middle sibling → next sibling', () => {
    const { tree, states, layout } = setup('# Root\n## A\n## B\n## C')
    const result = navigate(tree.children[0].id, 'down', tree, states, layout)
    expect(result).toBe(tree.children[1].id)
  })

  it('up from middle sibling → previous sibling', () => {
    const { tree, states, layout } = setup('# Root\n## A\n## B\n## C')
    const result = navigate(tree.children[1].id, 'up', tree, states, layout)
    expect(result).toBe(tree.children[0].id)
  })

  it('down from last sibling wraps to first', () => {
    const { tree, states, layout } = setup('# Root\n## A\n## B\n## C')
    const result = navigate(tree.children[2].id, 'down', tree, states, layout)
    expect(result).toBe(tree.children[0].id)
  })

  it('right on collapsed parent with children → null (expand signal)', () => {
    const { tree, states, layout } = setup('# Root\n## Child')
    states.get(tree.id)!.expanded = false
    const result = navigate('0', 'right', tree, states, layout)
    expect(result).toBeNull()
  })
})
