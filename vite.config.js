import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => ({
  base: mode === 'shopify' ? './' : '/',
  plugins: [vue()],
  build: mode === 'shopify'
    ? {
        cssCodeSplit: false,
        rollupOptions: {
          output: {
            entryFileNames: 'asteroid-bounce.js',
            chunkFileNames: 'asteroid-bounce-[name].js',
            assetFileNames: 'asteroid-bounce.[ext]',
          },
        },
      }
    : {},
}))
