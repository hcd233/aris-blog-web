import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Connect } from 'vite'

// 扩展 IncomingMessage 类型
interface ExtendedIncomingMessage extends IncomingMessage {
  body?: any
  query?: any
  _startTime?: number
}

// 定义状态图标函数
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
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('proxy error', err)
          })
          proxy.on('proxyReq', (proxyReq, req: ExtendedIncomingMessage, res) => {
            // 记录请求开始时间
            req._startTime = Date.now()

            // 构建请求日志
            const logParts = [
              '\n🚀 Request:',
              `${req.method} ${req.url}`,
            ]

            // 添加查询参数
            const urlObj = new URL(req.url || '', 'http://dummy.com')
            const params = Object.fromEntries(urlObj.searchParams)
            if (Object.keys(params).length > 0) {
              logParts.push('Query Parameters:')
              logParts.push(JSON.stringify(params, null, 2))
              logParts.push('Request Body:')
              logParts.push(JSON.stringify(req.body, null, 2))
            }

            console.log(logParts.join('\n'))
          })
          proxy.on('proxyRes', (proxyRes, req: ExtendedIncomingMessage, res) => {
            const duration = Date.now() - (req._startTime || Date.now())
            const statusCode = proxyRes.statusCode || 500
            const icon = getStatusIcon(statusCode)  // 使用函数获取状态图标
            
            // 构建响应日志
            const logParts = [
              `\n${icon} Response:`,  // 使用获取到的图标
              `${req.method} ${req.url}`,
              `Status: ${statusCode}`,
              `Duration: ${duration}ms`,
            ]

            // 尝试解析响应体
            let rawData = ''
            proxyRes.on('data', (chunk) => {
              rawData += chunk
            })

            proxyRes.on('end', () => {
              try {
                const parsedData = JSON.parse(rawData)
                logParts.push('Response Data:')
                logParts.push(JSON.stringify(parsedData, null, 2))
              } catch (e) {
                // 如果响应不是 JSON 格式，忽略解析错误
              }
              console.log(logParts.join('\n'))
            })
          })
          proxy.on('error', (err, req: ExtendedIncomingMessage, res) => {
            console.log('\n❌ Proxy Error:')
            console.error('URL:', req.url)
            console.error('Method:', req.method)
            console.error('Error:', err.message)
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