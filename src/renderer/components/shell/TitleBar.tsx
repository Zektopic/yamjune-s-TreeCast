import { useTreeStore } from '@/store/treeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { t } from '@/i18n/translations'
import type { ThemeKind } from '@/types/settings'

const themeIcons: Record<ThemeKind, string> = {
  light: '☀',
  dark: '☽',
  gray: '◑'
}

const themeCycle: ThemeKind[] = ['light', 'dark', 'gray']

export function TitleBar() {
  const filePath = useTreeStore((s) => s.filePath)
  const fileName = filePath ? filePath.split(/[/\\]/).pop() : null
  const settings = useSettingsStore((s) => s.settings)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const setLanguage = useSettingsStore((s) => s.setLanguage)
  const lang = settings.language

  const handleOpenFile = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.openFile()
      if (result.success && result.content) {
        window.dispatchEvent(new CustomEvent('mindmap:loadFile', {
          detail: { content: result.content, dir: result.dir, path: result.path }
        }))
      }
    }
  }

  const cycleTheme = () => {
    const idx = themeCycle.indexOf(settings.theme)
    const next = themeCycle[(idx + 1) % themeCycle.length]
    setTheme(next)
  }

  const toggleLanguage = () => {
    setLanguage(lang === 'en' ? 'zh' : 'en')
  }

  const handleMinimize = () => window.electronAPI?.minimizeWindow()
  const handleMaximize = () => window.electronAPI?.maximizeWindow()
  const handleClose = () => window.electronAPI?.closeWindow()

  return (
    <div
      style={{
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-primary)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--border-color)',
        paddingLeft: '12px',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        flexShrink: 0
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700 }}>{t('appName', lang)}</span>
        {fileName && (
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            — {fileName}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <IconButton onClick={handleOpenFile} title={t('openFile', lang)}>
          📂
        </IconButton>
        <IconButton onClick={toggleLanguage} title={lang === 'en' ? '切换到中文' : 'Switch to English'}>
          <span style={{ fontSize: '11px', fontWeight: 600, width: '22px', textAlign: 'center' }}>
            {lang === 'en' ? 'EN' : '中'}
          </span>
        </IconButton>
        <IconButton onClick={cycleTheme} title={`${t('theme', lang)}: ${t(settings.theme, lang)}`}>
          <span style={{ fontSize: '14px' }}>{themeIcons[settings.theme]}</span>
        </IconButton>
        <div style={{ display: 'flex', height: '36px', marginLeft: '4px' }}>
          <WindowButton onClick={handleMinimize} title={t('minimize', lang)}>─</WindowButton>
          <WindowButton onClick={handleMaximize} title={t('maximize', lang)}>☐</WindowButton>
          <WindowButton onClick={handleClose} title={t('close', lang)} isClose>✕</WindowButton>
        </div>
      </div>
    </div>
  )
}

function IconButton({
  onClick,
  title,
  children
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        WebkitAppRegion: 'no-drag' as any,
        background: 'none',
        border: 'none',
        color: 'var(--text-primary)',
        cursor: 'pointer',
        padding: '4px 6px',
        height: '28px',
        borderRadius: '6px',
        fontSize: '13px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s'
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'var(--glass-bg)'
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'none'
      }}
    >
      {children}
    </button>
  )
}

function WindowButton({
  onClick,
  title,
  children,
  isClose
}: {
  onClick: () => void
  title: string
  children: string
  isClose?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
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
