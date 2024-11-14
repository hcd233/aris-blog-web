import { useEffect } from 'react'
import { Card, Button, Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import { 
  GithubOutlined, 
  GoogleOutlined,
  QqOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { OAUTH_PROVIDERS, BACKGROUND_IMAGES } from '@/constants'
import PageTransition from '@/components/PageTransition'
import { getStoredTokens } from '@/utils/auth'

const Auth = () => {
  const navigate = useNavigate()
  const { handleOAuthLogin } = useAuth()

  useEffect(() => {
    const { accessToken, refreshToken } = getStoredTokens()
    if (accessToken && refreshToken) {
      navigate('/home', { replace: true })
    }
  }, [navigate])

  const buttonVariants = {
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  }

  const loginButtons = [
    {
      key: 'GITHUB',
      icon: <GithubOutlined />,
      text: '使用 Github 账号登录',
      enabled: true
    },
    {
      key: 'GOOGLE',
      icon: <GoogleOutlined />,
      text: '使用 Google 账号登录',
      enabled: false,
      tooltip: '即将支持'
    },
    {
      key: 'QQ',
      icon: <QqOutlined />,
      text: '使用 QQ 账号登录',
      enabled: false,
      tooltip: '即将支持'
    }
  ]

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        {/* 背景动画 */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{ 
            backgroundImage: `url(${BACKGROUND_IMAGES.AUTH})`,
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />

        {/* 返回按钮 */}
        <div className="relative z-10 p-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            className="text-white hover:text-white/80"
          >
            返回首页
          </Button>
        </div>

        {/* 登录卡片 */}
        <motion.div 
          className="relative z-10 flex items-center justify-center min-h-[calc(100vh-136px)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="w-full max-w-md mx-4 bg-white/90 backdrop-blur-lg shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">选择登录方式</h1>
              <p className="text-gray-600 mt-3">
                选择以下任一方式登录到 Aris Blog
              </p>
            </div>

            <motion.div 
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
            >
              {loginButtons.map((btn) => (
                <motion.div key={btn.key} variants={buttonVariants}>
                  <Tooltip title={!btn.enabled && btn.tooltip} placement="right">
                    <Button
                      block
                      size="large"
                      icon={btn.icon}
                      onClick={() => btn.enabled && handleOAuthLogin(btn.key)}
                      disabled={!btn.enabled}
                      className={`
                        h-12 flex items-center justify-center text-base
                        ${!btn.enabled && 'opacity-60 cursor-not-allowed'}
                      `}
                    >
                      {btn.text}
                      {!btn.enabled && (
                        <InfoCircleOutlined className="ml-2 text-gray-400" />
                      )}
                    </Button>
                  </Tooltip>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                登录即表示同意 
                <Button type="link" size="small" className="px-1">服务条款</Button>
                和
                <Button type="link" size="small" className="px-1">隐私政策</Button>
              </p>
            </div>

            {/* 装饰元素 */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  )
}

export default Auth