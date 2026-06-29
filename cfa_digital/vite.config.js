import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,  // ✅ Force le port 5173, erreur si déjà utilisé
    host: 'localhost',
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    cors: true,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,  // ✅ Garder les sourcemaps pour déboguer
    minify: false,
    chunkSizeWarningLimit: 1000,
  }
})
