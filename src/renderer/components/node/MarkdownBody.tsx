interface MarkdownBodyProps {
  html: string
  zoom?: number
}

export function MarkdownBody({ html, zoom = 1 }: MarkdownBodyProps) {
  if (!html) {
    return (
      <div style={{ padding: '16px', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: `${12 * zoom}px` }}>
        No details
      </div>
    )
  }

  return (
    <div
      className="node-detail"
      dangerouslySetInnerHTML={{ __html: html }}
      style={{
        padding: '8px 12px',
        fontSize: `${12 * zoom}px`,
        lineHeight: 1.5,
        color: 'var(--text-primary)',
        overflow: 'auto'
      }}
    />
  )
}
