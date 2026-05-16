export function WelcomeControls() {
  const handleMinimize = () => window.electronAPI?.minimizeWindow()
  const handleMaximize = () => window.electronAPI?.maximizeWindow()
  const handleClose = () => window.electronAPI?.closeWindow()

  return (
    <div
      style={{
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        background: 'transparent',
        paddingLeft: '12px',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      <div style={{ display: 'flex', height: '36px' }}>
        <WindowButton onClick={handleMinimize}>─</WindowButton>
        <WindowButton onClick={handleMaximize}>☐</WindowButton>
        <WindowButton onClick={handleClose} isClose>✕</WindowButton>
      </div>
    </div>
  )
}

function WindowButton({
  onClick,
  children,
  isClose
}: {
  onClick: () => void
  children: string
  isClose?: boolean
}) {
  return (
    <button
      onClick={onClick}
      style={{
        WebkitAppRegion: 'no-drag' as any,
        background: 'none',
        border: 'none',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        padding: '0 12px',
        height: '36px',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 0,
        transition: 'background 0.15s'
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = isClose ? '#e74c3c' : 'var(--glass-bg)'
        if (isClose) (e.currentTarget as HTMLElement).style.color = 'white'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'none'
        ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
      }}
    >
      {children}
    </button>
  )
}
