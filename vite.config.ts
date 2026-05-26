import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { GITHUB_PAGES_BASE_PATH } from './src/utils/githubPages'

export default defineConfig(({ mode }) => ({
  base: GITHUB_PAGES_BASE_PATH,
  plugins: [
    react(),
  ],
  css: {
    postcss: './postcss.config.js',
  },
  build: mode === 'lib'
    ? {
        lib: {
          entry: './src/index.ts',
          name: 'StardewValleyUI',
          formats: ['es', 'cjs'],
          fileName: (format) => `stardew-valley-ui.${format === 'es' ? 'mjs' : 'cjs'}`,
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime',
            },
          },
        },
      }
    : undefined,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
}))
