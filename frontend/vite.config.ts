import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Optional: proxy /api for non-admin requests; admin uses VITE_API_URL (backend) directly
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
})
