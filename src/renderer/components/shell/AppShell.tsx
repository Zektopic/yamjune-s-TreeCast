import { TitleBar } from './TitleBar'
import { QuickSettingsPanel } from './QuickSettingsPanel'
import { MindMapCanvas } from '@/components/canvas/MindMapCanvas'
import { useTreeStore } from '@/store/treeStore'

export function AppShell() {
  const tree = useTreeStore((s) => s.tree)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)'
      }}
    >
      <TitleBar />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <MindMapCanvas />
        {tree && <QuickSettingsPanel />}
      </div>
    </div>
  )
}
