import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import PageTransition from '@/components/PageTransition'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        {/* 背景 */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80)',
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />

        {/* 内容 */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
          <motion.div
            className="bg-white/90 backdrop-blur-lg rounded-xl p-12 text-center max-w-lg w-full shadow-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* 404 数字动画 */}
            <motion.h1 
              className="text-9xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text mb-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.4
              }}
            >
              404
            </motion.h1>

            {/* 错误信息 */}
            <motion.h2 
              className="text-2xl font-semibold text-gray-800 mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              页面未找到
            </motion.h2>
            
            <motion.p 
              className="text-gray-600 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              抱歉，您访问的页面不存在或已被移除。
            </motion.p>

            {/* 按钮组 */}
            <motion.div
              className="space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Button 
                type="primary" 
                size="large"
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                className="min-w-[140px] h-10"
              >
                返回首页
              </Button>
              <Button 
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => window.history.back()}
                className="min-w-[140px] h-10"
              >
                返回上页
              </Button>
            </motion.div>

            {/* 装饰元素 */}
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute -top-2 -right-2 w-20 h-20 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
                }}
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360] 
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              <motion.div
                className="absolute -bottom-2 -left-2 w-16 h-16 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))'
                }}
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [360, 180, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}

export default NotFound