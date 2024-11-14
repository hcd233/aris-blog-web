import React, { useState } from 'react'
import { Button, message } from 'antd'
import { LikeOutlined, LikeFilled } from '@ant-design/icons'
import CommentService from '@/services/comment'

interface ArticleActionsProps {
  userName: string
  articleSlug: string
  likes: number
  onLikeSuccess?: () => void
}

const ArticleActions: React.FC<ArticleActionsProps> = ({
  userName,
  articleSlug,
  likes,
  onLikeSuccess
}) => {
  const [isLiked, setIsLiked] = useState(likes > 0)

  const handleLike = async () => {
    try {
      await CommentService.likeArticle(userName, articleSlug, isLiked)
      setIsLiked(!isLiked)
      onLikeSuccess?.()
      message.success(isLiked ? '取消点赞成功' : '点赞成功')
    } catch (error) {
      message.error(isLiked ? '取消点赞失败' : '点赞失败')
    }
  }

  return (
    <Button
      type="text"
      icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
      onClick={handleLike}
    >
      {likes}
    </Button>
  )
}

export default ArticleActions 