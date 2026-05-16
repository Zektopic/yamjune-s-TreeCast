import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '@/store/settingsStore'
import { t } from '@/i18n/translations'
import type { ThemeKind } from '@/types/settings'

export function QuickSettingsPanel() {
  const [isExpanded, setIsExpanded] = useState(false)
  const settings = useSettingsStore((s) => s.settings)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const setAnimationScale = useSettingsStore((s) => s.setAnimationScale)
  const setNodeTitleHeight = useSettingsStore((s) => s.setNodeTitleHeight)
  const setGlassOpacity = useSettingsStore((s) => s.setGlassOpacity)
  const lang = settings.language

  const themes: { value: ThemeKind; label: string }[] = [
    { value: 'light', label: t('light', lang) },
    { value: 'dark', label: t('dark', lang) },
    { value: 'gray', label: t('gray', lang) }
  ]

  return (
    <div
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '30px',
          height: '30px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-node)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          boxShadow: '0 2px 8px var(--shadow-color)'
        }}
        title={t('settings', lang)}
      >
        ⚙
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              marginTop: '8px',
              padding: '16px',
              borderRadius: '14px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-node)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: '0 4px 16px var(--shadow-color)',
              minWidth: '220px',
              color: 'var(--text-primary)',
              fontSize: '12px'
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '12px' }}>{t('settings', lang)}</div>

            {/* Theme */}
            <SettingRow label={t('theme', lang)}>
              <select
                value={settings.theme}
                onChange={(e) => setTheme(e.target.value as ThemeKind)}
                style={{
                  background: 'var(--glass-bg)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  fontSize: '11px'
                }}
              >
                {themes.map((th) => (
                  <option key={th.value} value={th.value}>{th.label}</option>
                ))}
              </select>
            </SettingRow>

            {/* Animation Scale */}
            <SettingRow label={`${t('animation', lang)}: ${settings.animationScale.toFixed(1)}x`}>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={settings.animationScale}
                onChange={setAnimationScale}
              />
            </SettingRow>

            {/* Glass Opacity */}
            <SettingRow label={`${t('glass', lang)}: ${(settings.glassOpacity * 100).toFixed(0)}%`}>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={settings.glassOpacity}
                onChange={setGlassOpacity}
              />
            </SettingRow>

            {/* Title Height */}
            <SettingRow label={`Title H: ${settings.nodeTitleHeight}px`}>
              <Slider
                min={20}
                max={48}
                step={2}
                value={settings.nodeTitleHeight}
                onChange={setNodeTitleHeight}
              />
            </SettingRow>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ marginBottom: '4px', fontSize: '10px', color: 'var(--text-secondary)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function Slider({
  min,
  max,
  step,
  value,
  onChange
}: {
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{
        width: '100%',
        height: '4px',
        accentColor: 'var(--focus-ring)',
        cursor: 'pointer'
      }}
    />
  )
}
