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
      // Proxy to backend; send original host so Auth.js sees 5173 and sets cookies for same origin
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const host = req.headers.host || 'localhost:5173'
            proxyReq.setHeader('Host', host)
            proxyReq.setHeader('X-Forwarded-Host', host)
            proxyReq.setHeader('X-Forwarded-Proto', req.headers['x-forwarded-proto'] || 'http')
          })
        },
      },
      '/auth': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const host = req.headers.host || 'localhost:5173'
            proxyReq.setHeader('Host', host)
            proxyReq.setHeader('X-Forwarded-Host', host)
            proxyReq.setHeader('X-Forwarded-Proto', req.headers['x-forwarded-proto'] || 'http')
          })
        },
      },
    },
  },
})
