import type { Config } from 'tailwindcss'

export default {
  content: ['./src/renderer/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-canvas': 'var(--bg-canvas)',
        'bg-node': 'var(--bg-node)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'border-color': 'var(--border-color)',
        'connection-color': 'var(--connection-color)',
        'glass-bg': 'var(--glass-bg)'
      }
    }
  },
  plugins: []
} satisfies Config
