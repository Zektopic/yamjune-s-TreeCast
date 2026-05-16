export function squirclePath(width: number, height: number, radius: number): string {
  const w = width / 2
  const h = height / 2
  const r = Math.min(radius, w, h)

  // Use a cubic bezier approximation of a superellipse (n=4)
  // The control points are positioned to create continuous curvature
  const cx = r * 0.5522847498 // Magic constant for circle approximation
  const cy = r * 0.5522847498

  // Top edge
  const topLeft = `${-w},${-h + r}`
  const topLeftCp1 = `${-w},${-h + r - cy}`
  const topLeftCp2 = `${-w + r - cx},${-h}`
  const topRightCorner = `${-w + r},${-h}`

  const topRight = `${w - r},${-h}`
  const topRightCp1 = `${w - r + cx},${-h}`
  const topRightCp2 = `${w},${-h + r - cy}`
  const rightTop = `${w},${-h + r}`

  const rightBottom = `${w},${h - r}`
  const rightBottomCp1 = `${w},${h - r + cy}`
  const rightBottomCp2 = `${w - r + cx},${h}`
  const bottomRightCorner = `${w - r},${h}`

  const bottomLeft = `${-w + r},${h}`
  const bottomLeftCp1 = `${-w + r - cx},${h}`
  const bottomLeftCp2 = `${-w},${h - r + cy}`
  const leftBottom = `${-w},${h - r}`

  const leftTop = `${-w},${-h + r}`
  const leftTopCp1 = `${-w},${-h + r - cy}`
  const leftTopCp2 = `${-w + r - cx},${-h}`

  return `
    M ${topLeft}
    C ${topLeftCp1}, ${topLeftCp2}, ${topRightCorner}
    L ${topRight}
    C ${topRightCp1}, ${topRightCp2}, ${rightTop}
    L ${rightBottom}
    C ${rightBottomCp1}, ${rightBottomCp2}, ${bottomRightCorner}
    L ${bottomLeft}
    C ${bottomLeftCp1}, ${bottomLeftCp2}, ${leftBottom}
    L ${leftTop}
    C ${leftTopCp1}, ${leftTopCp2}, ${topLeft}
    Z
  `.replace(/\s+/g, ' ').trim()
}
