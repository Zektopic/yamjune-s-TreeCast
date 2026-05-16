import DOMPurify from 'dompurify'

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'blockquote', 'pre', 'code',
      'em', 'strong', 'b', 'i', 'u', 'del', 'ins', 'sub', 'sup', 'mark',
      'a', 'img', 'video', 'source',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'caption',
      'div', 'span', 'section',
      // MathML
      'math', 'maction', 'menclose', 'merror', 'mfenced', 'mfrac', 'mi',
      'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom',
      'mroot', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub',
      'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder',
      'munderover', 'semantics', 'annotation',
      // SVG (KaTeX output)
      'svg', 'g', 'defs', 'path', 'line', 'circle', 'ellipse', 'rect',
      'polygon', 'polyline', 'text', 'tspan', 'use', 'clipPath',
      'foreignObject'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'srcset', 'alt', 'title', 'class', 'id', 'style',
      'width', 'height', 'controls', 'loop', 'muted', 'autoplay', 'playsinline',
      'type', 'start', 'reversed', 'colspan', 'rowspan',
      'target', 'rel', 'data-*', 'crossorigin',
      // SVG
      'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-linecap',
      'stroke-linejoin', 'transform', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry',
      'x1', 'y1', 'x2', 'y2', 'dx', 'dy', 'font-size', 'font-family',
      'text-anchor', 'dominant-baseline', 'clip-path', 'clip-rule',
      'fill-rule', 'overflow', 'preserveAspectRatio',
      'xmlns', 'display', 'opacity'
    ],
    ALLOW_DATA_ATTR: true,
    ALLOW_ARIA_ATTR: true,
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  })
}
