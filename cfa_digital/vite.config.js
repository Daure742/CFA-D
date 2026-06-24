import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

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
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:5000/api'),
    'import.meta.env.VITE_SOCKET_URL': JSON.stringify(process.env.VITE_SOCKET_URL || 'http://localhost:5000'),
  }
})
