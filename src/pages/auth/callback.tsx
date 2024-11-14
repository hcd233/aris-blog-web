import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Spin, message } from 'antd'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import PageTransition from '@/components/PageTransition'

const AuthCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const processedRef = useRef(false)
  const { handleOAuthCallback } = useAuth()

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    
    if (code && state && !processedRef.current) {
      processedRef.current = true
      handleCallback(code, state)
    } else if (!code || !state) {
      message.error('登录参数错误')
      navigate('/auth')
    }
  }, [searchParams, navigate, handleOAuthCallback])

  const handleCallback = async (code: string, state: string) => {
    try {
      await handleOAuthCallback('GITHUB', { code, state })
    } catch (error) {
      console.error('Callback error:', error)
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <motion.div 
          className="bg-white p-8 rounded-lg shadow-lg text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Spin size="large" />
          </motion.div>
          <motion.div 
            className="mt-4 text-gray-600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            登录中，请稍候...
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}

export default AuthCallback 