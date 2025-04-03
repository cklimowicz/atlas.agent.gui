import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Check for certificate files
const certPath = path.resolve(__dirname, 'cert/cert.pem')
const keyPath = path.resolve(__dirname, 'cert/key.pem')

let httpsOptions = {}

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  httpsOptions = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath)
  }
  console.log('✅ HTTPS certificates loaded successfully')
} else {
  console.warn('⚠️ Certificate files not found in cert directory. HTTPS will use default settings.')
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    https: httpsOptions,
    proxy: {
      '/api': {
        target: 'https://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
