import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { GITHUB_PAGES_BASE_PATH } from './src/utils/githubPages'

export default defineConfig(({ mode }) => ({
  // The demo is published below the repository name, while a package must emit
  // relative asset URLs so installed consumers resolve images next to its JS.
  base: mode === 'lib' ? './' : GITHUB_PAGES_BASE_PATH,
  // Demo-only files must not leak into the npm tarball. Library visuals are
  // imported from src/assets and emitted below dist/assets instead.
  publicDir: mode === 'lib' ? false : 'public',
  plugins: [
    react(),
  ],
  css: {
    postcss: './postcss.config.js',
  },
  build: mode === 'lib'
      ? {
        assetsInlineLimit: 0,
        lib: {
          entry: './src/index.ts',
          name: 'StardewValleyUI',
          formats: ['es', 'cjs'],
          fileName: (format) => `stardew-valley-ui.${format === 'es' ? 'mjs' : 'cjs'}`,
        },
        rollupOptions: {
          // Keep React and lucide-react as real ESM imports. lucide-react ships
          // a CommonJS compatibility path; bundling it here makes the ESM
          // entry call a `require` shim that does not exist in Node/bundlers.
          external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'lucide-react'],
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
