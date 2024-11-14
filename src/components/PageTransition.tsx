import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const PageTransition = ({ children, className = '' }: PageTransitionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1] // 使用 ease-out 缓动函数
      }}
      className={className}
    >
      {/* 内容淡入上移 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.4, 0, 0.2, 1],
          delay: 0.1 // 稍微延迟内容的动画
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export default PageTransition 