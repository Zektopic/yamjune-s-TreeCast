import { describe, it, expect } from 'vitest'
import { parseContextMD } from '../../src/renderer/engine/markdownParser'

describe('markdownParser', () => {
  it('parses a single root node with no children', () => {
    const tree = parseContextMD('# Hello World\n\nSome content here.')
    expect(tree).not.toBeNull()
    expect(tree!.title).toBe('Hello World')
    expect(tree!.depth).toBe(0)
    expect(tree!.children).toHaveLength(0)
    expect(tree!.detailRaw).toContain('Some content here')
  })

  it('parses root with children', () => {
    const tree = parseContextMD([
      '# Root',
      '',
      'Root detail.',
      '',
      '## Child 1',
      '',
      'Child detail.',
      '',
      '## Child 2',
      ''
    ].join('\n'))

    expect(tree).not.toBeNull()
    expect(tree!.children).toHaveLength(2)
    expect(tree!.children[0].title).toBe('Child 1')
    expect(tree!.children[1].title).toBe('Child 2')
    expect(tree!.children[0].depth).toBe(1)
  })

  it('parses three levels of nesting', () => {
    const tree = parseContextMD([
      '# Root',
      '## Level 1',
      '### Level 2',
      '#### Level 3',
      'Deep content.'
    ].join('\n'))

    expect(tree).not.toBeNull()
    const l1 = tree!.children[0]
    expect(l1.children).toHaveLength(1)
    const l2 = l1.children[0]
    expect(l2.children).toHaveLength(1)
    expect(l2.children[0].title).toBe('Level 3')
  })

  it('extracts media references', () => {
    const tree = parseContextMD([
      '# Root',
      '## Media Node',
      'Some text',
      '![Example](images/example.png)',
      '<video src="videos/demo.mp4" controls></video>',
      '![GIF](images/animation.gif)'
    ].join('\n'))

    const mediaNode = tree!.children[0]
    expect(mediaNode.mediaRefs).toHaveLength(3)
    expect(mediaNode.mediaRefs[0]).toMatchObject({ type: 'image', relativePath: 'images/example.png' })
    expect(mediaNode.mediaRefs[1]).toMatchObject({ type: 'gif', relativePath: 'images/animation.gif' })
    expect(mediaNode.mediaRefs[2]).toMatchObject({ type: 'video', relativePath: 'videos/demo.mp4' })
  })

  it('generates deterministic IDs', () => {
    const tree1 = parseContextMD('# Root\n## Child\n### Grandchild')
    const tree2 = parseContextMD('# Root\n## Child\n### Grandchild')
    expect(tree1!.children[0].id).toBe(tree2!.children[0].id)
    expect(tree1!.children[0].children[0].id).toBe(tree2!.children[0].children[0].id)
  })

  it('handles empty detail', () => {
    const tree = parseContextMD('# Root\n## No Detail\n## Has Detail\n\nSome detail.')
    expect(tree!.children[0].detailRaw).toBe('')
    expect(tree!.children[1].detailRaw).toBe('Some detail.')
  })

  it('returns synthetic root for content without level-1 heading', () => {
    const tree = parseContextMD('## Topic 1\nContent\n## Topic 2')
    expect(tree).not.toBeNull()
    expect(tree!.title).toBe('Untitled')
    expect(tree!.depth).toBe(0)
    expect(tree!.children).toHaveLength(2)
  })

  it('handles empty input', () => {
    const tree = parseContextMD('')
    expect(tree).toBeNull()
  })
})
