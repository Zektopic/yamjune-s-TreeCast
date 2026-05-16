import { useEffect, useCallback } from 'react'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import { AppShell } from '@/components/shell/AppShell'
import { useTreeStore } from '@/store/treeStore'
import { useNodeStateStore } from '@/store/nodeStateStore'
import { parseContextMD } from '@/engine/markdownParser'
import { renderAllDetails } from '@/engine/markdownRenderer'

export default function App() {
  const setTree = useTreeStore((s) => s.setTree)
  const initStates = useNodeStateStore((s) => s.initStates)

  const loadContent = useCallback((content: string, dir?: string, path?: string) => {
    const tree = parseContextMD(content)
    if (tree) {
      renderAllDetails(tree)
      setTree(tree, dir || '', path)
      initStates(tree)
    }
  }, [setTree, initStates])

  useEffect(() => {
    const handleLoadFile = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.content) {
        loadContent(detail.content, detail.dir, detail.path)
      }
    }

    window.addEventListener('mindmap:loadFile', handleLoadFile)
    return () => window.removeEventListener('mindmap:loadFile', handleLoadFile)
  }, [loadContent])

  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}
