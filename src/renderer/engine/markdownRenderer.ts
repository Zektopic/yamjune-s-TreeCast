import MarkdownIt from 'markdown-it'
import katex from 'katex'
import { TreeNode } from '@/types/node'
import { sanitizeHtml } from '@/security/sanitizer'

function renderMath(match: string, math: string, displayMode: boolean): string {
  try {
    return katex.renderToString(math.trim(), {
      throwOnError: false,
      displayMode
    })
  } catch {
    return `<code>${math}</code>`
  }
}

export function renderMarkdown(rawMarkdown: string): string {
  if (!rawMarkdown) return ''

  // Phase 1: Replace LaTeX math with placeholders to protect from markdown processing
  const mathBlocks: string[] = []
  const MATH_PLACEHOLDER = 'MATH'

  let processed = rawMarkdown

  // Protect $$...$$ display math
  processed = processed.replace(/\$\$([^$]+?)\$\$/g, (_full, math) => {
    const html = renderMath(_full, math, true)
    mathBlocks.push(html)
    return `${MATH_PLACEHOLDER}${mathBlocks.length - 1}${MATH_PLACEHOLDER}`
  })

  // Protect $...$ inline math
  processed = processed.replace(/\$([^$\n]+?)\$/g, (_full, math) => {
    const html = renderMath(_full, math, false)
    mathBlocks.push(html)
    return `${MATH_PLACEHOLDER}${mathBlocks.length - 1}${MATH_PLACEHOLDER}`
  })

  // Phase 2: Render markdown
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false
  })

  let html = md.render(processed)

  // Phase 3: Restore math placeholders
  html = html.replace(
    new RegExp(`${MATH_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)${MATH_PLACEHOLDER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
    (_full, index) => {
      return mathBlocks[parseInt(index)] || ''
    }
  )

  // Phase 4: Sanitize
  html = sanitizeHtml(html)

  // Phase 5: Strip img/video tags — MediaEmbed handles media rendering separately
  html = html.replace(/<img[^>]*>/gi, '')
  html = html.replace(/<video[\s\S]*?<\/video>/gi, '')

  return html
}

export function renderAllDetails(tree: TreeNode): void {
  tree.detailHtml = renderMarkdown(tree.detailRaw)
  for (const child of tree.children) {
    renderAllDetails(child)
  }
}
