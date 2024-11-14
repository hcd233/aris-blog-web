import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Connect } from 'vite'

interface ExtendedIncomingMessage extends IncomingMessage {
  body?: any
  query?: any
  _startTime?: number
}

// 定义状态图标
const getStatusIcon = (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 300) return '✅'
  if (statusCode >= 400 && statusCode < 500) return '⚠️'
  if (statusCode >= 500) return '❌'
  return '❓'
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src')
      }
    ]
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://152.32.211.122:8170',
        changeOrigin: true,
        rewrite: (path) => {
          // 处理图片代理请求
          if (path.startsWith('/api/image-proxy')) {
            const url = new URL(path, 'http://dummy.com')
            const imageUrl = url.searchParams.get('url')
            const token = url.searchParams.get('token')
            if (imageUrl) {
              return imageUrl
            }
          }
          return path.replace(/^\/api/, '')
        },
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req: ExtendedIncomingMessage, res) => {
            if (req.url?.includes('/image-proxy')) {
              const url = new URL(req.url, 'http://dummy.com')
              const token = url.searchParams.get('token')
              if (token) {
                proxyReq.setHeader('Authorization', `Bearer ${token}`)
                console.log('Setting Authorization header:', `Bearer ${token}`)
              }
            }
          })

          proxy.on('proxyRes', (proxyRes, req: ExtendedIncomingMessage, res) => {
            // 记录响应信息
            console.log('\n✅ Proxy Response:', {
              url: req.url,
              status: proxyRes.statusCode,
              headers: proxyRes.headers
            })

            // 确保图片请求的响应头正确
            if (req.url?.includes('/image-proxy')) {
              // 清除可能导致问题的响应头
              res.removeHeader('www-authenticate')
              res.removeHeader('content-length')
              res.removeHeader('content-encoding')
            }
          })

          proxy.on('error', (err, req: ExtendedIncomingMessage, res) => {
            console.error('\n❌ Proxy Error:', {
              url: req.url,
              method: req.method,
              error: err.message
            })
          })
        }
      }
    }
  },
  build: {
    // Other build options
  },
  define: {
    'process.env.APP_NAME': JSON.stringify('Aris Blog'),
  },
})