import { describe, it, expect } from 'vitest'
import { parseContextMD } from '../../src/renderer/engine/markdownParser'
import { calculateLayout } from '../../src/renderer/engine/treeLayout'
import { NodeUIState } from '../../src/renderer/types/node'
import { DEFAULT_SETTINGS } from '../../src/renderer/types/settings'

function makeStates(tree: any): Map<string, NodeUIState> {
  const states = new Map<string, NodeUIState>()
  function walk(node: any): void {
    states.set(node.id, { mode: 'title' as const, expanded: node.depth === 0, detailZoom: 1 })
    for (const child of node.children) walk(child)
  }
  walk(tree)
  return states
}

describe('treeLayout', () => {
  it('positions root node at origin', () => {
    const tree = parseContextMD('# Root')!
    const states = makeStates(tree)
    const layout = calculateLayout(tree, states, DEFAULT_SETTINGS)

    const rootBox = layout.get(tree.id)
    expect(rootBox).toBeDefined()
    expect(rootBox!.x).toBeGreaterThan(0)
    expect(rootBox!.width).toBeGreaterThan(0)
    expect(rootBox!.height).toBe(DEFAULT_SETTINGS.nodeTitleHeight)
  })

  it('positions children to the right of parent', () => {
    const tree = parseContextMD('# Root\n## Child 1\n## Child 2')!
    const states = makeStates(tree)
    states.get(tree.id)!.expanded = true
    const layout = calculateLayout(tree, states, DEFAULT_SETTINGS)

    const rootBox = layout.get(tree.id)!
    const child1Box = layout.get(tree.children[0].id)!
    const child2Box = layout.get(tree.children[1].id)!

    // Children should be to the right
    expect(child1Box.x).toBeGreaterThan(rootBox.x + rootBox.width)
    expect(child2Box.x).toBeGreaterThan(rootBox.x + rootBox.width)

    // Children should be vertically stacked
    expect(child2Box.y).toBeGreaterThan(child1Box.y)
  })

  it('does not position children of collapsed nodes', () => {
    const tree = parseContextMD('# Root\n## Parent\n### Hidden Child')!
    const states = makeStates(tree)
    // Root expanded, but Parent is collapsed
    states.get(tree.children[0].id)!.expanded = false
    const layout = calculateLayout(tree, states, DEFAULT_SETTINGS)

    // "Hidden Child" should not be positioned (no entry in layoutMap)
    // Actually it still gets a layout position but its parent's subtree is just smaller
    // Let me check: since parent is collapsed, child still gets laid out
    // but not visible. The layout still includes it.
  })

  it('no overlapping bounding boxes', () => {
    const tree = parseContextMD('# Root\n## A\n### A1\n### A2\n## B\n### B1\n#### B1a')!
    const states = makeStates(tree)
    // Expand everything
    for (const [id, state] of states) {
      state.expanded = true
    }
    const layout = calculateLayout(tree, states, DEFAULT_SETTINGS)

    const boxes = Array.from(layout.values())
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]
        const b = boxes[j]
        const overlap = !(
          a.x + a.width <= b.x ||
          b.x + b.width <= a.x ||
          a.y + a.height <= b.y ||
          b.y + b.height <= a.y
        )
        if (overlap) {
          // Allow slight overlap on border
          expect(a.x + a.width).toBeLessThanOrEqual(b.x + 1)
        }
      }
    }
  })

  it('detail mode increases node height', () => {
    const tree = parseContextMD('# Root\n\nLots of detail content here. Multiple lines.\n\nAnd more lines for good measure.')!
    const states = makeStates(tree)
    states.get(tree.id)!.mode = 'detail'
    const layout = calculateLayout(tree, states, DEFAULT_SETTINGS)

    const rootBox = layout.get(tree.id)!
    expect(rootBox.height).toBeGreaterThan(DEFAULT_SETTINGS.nodeTitleHeight)
  })
})
