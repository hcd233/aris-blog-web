import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { ArrowRightOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import PageTransition from '@/components/PageTransition'

const Portal = () => {
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <PageTransition>
      <div className="min-h-screen relative">
        {/* 背景图片和渐变遮罩 */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80)',
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/70" />

        {/* 导航栏 */}
        <nav className="relative z-10 container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="text-3xl font-bold text-white">Aris Blog</div>
          <div className="space-x-4">
            <Button 
              type="text" 
              className="text-white hover:text-white/80"
              onClick={() => window.open('https://github.com/hcd233', '_blank')}
            >
              关于我
            </Button>
            <Button 
              type="primary"
              onClick={() => navigate('/auth')}
            >
              开始使用
            </Button>
          </div>
        </nav>

        {/* 主要内容 */}
        <motion.main 
          className="relative z-10 container mx-auto px-4 pt-20 pb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="max-w-4xl">
            <h1 className="text-6xl font-bold text-white mb-8 leading-tight">
              分享你的想法，
              <br />
              连接开发者世界
            </h1>
            <motion.p variants={itemVariants} className="text-xl text-white/80 mb-12 leading-relaxed">
              Aris Blog 是一个面向开发者的专业博客平台。在这里，你可以分享技术见解，
              <br />
              探索前沿知识，与全球开发者建立联系。
            </motion.p>
            <div className="space-x-6">
              <Button 
                type="primary" 
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/auth')}
                className="h-12 px-8 text-lg"
              >
                立即开始
              </Button>
            </div>
          </motion.div>

          {/* 特性展示 */}
          <motion.div 
            className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={containerVariants}
          >
            {/* 每个卡片都有自己的动画 */}
            {[
              { emoji: '✍️', title: '专业写作体验', desc: '支持 Markdown 编辑，代码高亮，实时预览，让你专注于内容创作。' },
              { emoji: '🔍', title: '知识管理', desc: '强大的标签系统和分类功能，轻松组织和查找你的技术文章。' },
              { emoji: '🌐', title: '开发者社区', desc: '与志同道合的开发者交流，分享经验，共同成长。' }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-8"
              >
                <div className="text-4xl text-white mb-4">{item.emoji}</div>
                <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-white/80">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* 底部信息 */}
          <div className="mt-32 text-center text-white/60">
            <p>© 2024 Aris Blog. All rights reserved.</p>
          </div>
        </motion.main>
      </div>
    </PageTransition>
  )
}

export default Portal