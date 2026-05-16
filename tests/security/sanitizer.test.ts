// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { sanitizeHtml } from '../../src/renderer/security/sanitizer'

describe('sanitizeHtml XSS prevention', () => {
  it('removes script tags', () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>')
    expect(result).not.toContain('<script>')
    expect(result).not.toContain('alert')
    expect(result).toContain('<p>Hello</p>')
  })

  it('removes inline event handlers (onerror)', () => {
    const result = sanitizeHtml('<img src=x onerror="alert(1)">')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('alert(1)')
  })

  it('removes onclick handlers', () => {
    const result = sanitizeHtml('<div onclick="stealCookies()">click</div>')
    expect(result).not.toContain('onclick')
    expect(result).toContain('click')
  })

  it('removes javascript: protocol from href', () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">link</a>')
    // DOMPurify removes javascript: protocol
    expect(result).not.toContain('javascript:')
  })

  it('removes iframe tags', () => {
    const result = sanitizeHtml('<iframe src="https://evil.com"></iframe>')
    expect(result).not.toContain('<iframe')
  })

  it('removes object/embed tags', () => {
    const result = sanitizeHtml('<object data="evil.swf"></object><embed src="evil.swf">')
    expect(result).not.toContain('<object')
    expect(result).not.toContain('<embed')
  })

  it('removes form/input/button tags', () => {
    const result = sanitizeHtml('<form action="/steal"><input name="pw"><button>Go</button></form>')
    expect(result).not.toContain('<form')
    expect(result).not.toContain('<input')
    expect(result).not.toContain('<button')
  })

  it('allows safe markdown output (headings, paragraphs, lists)', () => {
    const result = sanitizeHtml('<h1>Title</h1><p>Text with <strong>bold</strong></p><ul><li>Item</li></ul>')
    expect(result).toContain('<h1>Title</h1>')
    expect(result).toContain('<p>Text with <strong>bold</strong></p>')
    expect(result).toContain('<ul><li>Item</li></ul>')
  })

  it('allows links with safe protocols', () => {
    const result = sanitizeHtml('<a href="https://example.com" target="_blank">link</a>')
    expect(result).toContain('href="https://example.com"')
    expect(result).toContain('link')
  })

  it('allows images with safe attributes', () => {
    const result = sanitizeHtml('<img src="image.png" alt="pic" width="100">')
    expect(result).toContain('src="image.png"')
    expect(result).toContain('alt="pic"')
  })

  it('allows SVG elements (KaTeX output)', () => {
    const result = sanitizeHtml(
      '<svg viewBox="0 0 100 100"><g><path d="M10,10 L90,90" stroke="black"></path></g></svg>'
    )
    expect(result).toContain('<svg')
    expect(result).toContain('<path')
  })

  it('allows data-* attributes', () => {
    const result = sanitizeHtml('<div data-id="123" data-custom="val">text</div>')
    expect(result).toContain('data-id="123"')
    expect(result).toContain('data-custom="val"')
  })

  it('handles empty string', () => {
    expect(sanitizeHtml('')).toBe('')
  })

  it('strips SVG onload handler on use element', () => {
    const result = sanitizeHtml('<svg><use onload="fetch(`evil`)" href="#x"/></svg>')
    expect(result).not.toContain('onload')
    expect(result).not.toContain('fetch')
  })
})
