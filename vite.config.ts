import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Check if certificate files exist in the public directory
const certPath = path.resolve('./public/cert.pem')
const keyPath = path.resolve('./public/key.pem')

const hasCertificates = fs.existsSync(certPath) && fs.existsSync(keyPath)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Configure HTTPS if certificates are available
    https: hasCertificates ? {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
    } : undefined,
    proxy: {
      '/api': {
        target: 'https://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization'
        }
      }
    }
  }
})
