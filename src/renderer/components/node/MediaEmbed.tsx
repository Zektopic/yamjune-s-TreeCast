import { MediaRef } from '@/types/node'
import { useTreeStore } from '@/store/treeStore'
import { resolveMediaPath } from '@/security/resourceGuard'

interface MediaEmbedProps {
  media: MediaRef
}

export function MediaEmbed({ media }: MediaEmbedProps) {
  const workspaceDir = useTreeStore((s) => s.workspaceDir)
  const src = resolveMediaPath(media.relativePath, workspaceDir)

  const style: React.CSSProperties = {
    maxWidth: '100%',
    borderRadius: '6px',
    marginTop: '8px'
  }

  if (media.type === 'video') {
    return (
      <div style={{ marginTop: '8px' }}>
        <video
          src={src}
          controls
          style={{ ...style, width: '100%' }}
          preload="metadata"
        >
          Your browser does not support video playback.
        </video>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <img
        src={src}
        alt={media.alt}
        style={style}
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
        }}
      />
      {media.type === 'gif' && (
        <div style={{
          fontSize: '10px',
          color: 'var(--text-secondary)',
          marginTop: '2px'
        }}>
          GIF
        </div>
      )}
    </div>
  )
}
