import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { GITHUB_PAGES_BASE_PATH } from './src/utils/githubPages'

export default defineConfig({
  base: GITHUB_PAGES_BASE_PATH,
  plugins: [
    react(),
  ],
  css: {
    postcss: './postcss.config.js',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
})
