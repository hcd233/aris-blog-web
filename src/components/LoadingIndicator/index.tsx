import React from 'react'
import { motion } from 'framer-motion'
import './styles.css'

interface LoadingIndicatorProps {
  size?: number
  color?: string
  text?: string
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  size = 40, 
  color = '#1677ff',
  text
}) => {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex items-center gap-3">
        <div 
          className="loading-circle"
          style={{ 
            width: size, 
            height: size,
            borderColor: `${color}20`,
            borderTopColor: color,
            borderWidth: Math.max(2, size / 16)
          }}
        />
        {text && (
          <motion.span 
            className="text-gray-500 text-sm whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {text}
          </motion.span>
        )}
      </div>
    </div>
  )
}

export default LoadingIndicator 