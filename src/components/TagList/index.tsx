import React, { useEffect, useState } from 'react'
import { Card, Tag, Spin, Empty } from 'antd'
import { TagOutlined } from '@ant-design/icons'
import { motion } from 'framer-motion'
import TagService, { TagType } from '@/services/tag'

const TagList: React.FC = () => {
  const [tags, setTags] = useState<TagType[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadTags = async () => {
      setLoading(true)
      try {
        const response = await TagService.getTags(1, 20) // 获取前20个标签
        setTags(response.data.tags)
      } catch (error) {
        console.error('Failed to load tags:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTags()
  }, [])

  if (loading) {
    return (
      <Card className="mt-6">
        <div className="flex justify-center py-4">
          <Spin />
        </div>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        className="mt-6"
        title={
          <div className="flex items-center">
            <TagOutlined className="mr-2 text-blue-500" />
            <span>热门标签</span>
          </div>
        }
      >
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Tag
                key={tag.id}
                className="px-3 py-1 cursor-pointer transition-colors hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                style={{ 
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontFamily: 'HanTang, sans-serif'
                }}
              >
                {tag.name}
              </Tag>
            ))}
          </div>
        ) : (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="暂无标签" 
          />
        )}
      </Card>
    </motion.div>
  )
}

export default TagList 