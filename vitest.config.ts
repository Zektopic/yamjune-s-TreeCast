import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve('src/renderer')
    }
  },
  test: {
    include: ['tests/**/*.test.ts']
  }
})
