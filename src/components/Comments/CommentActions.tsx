import React from 'react'
import { Space, Button } from 'antd'
import { LikeOutlined, LikeFilled, MessageOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'

interface CommentActionsProps {
  likes: number
  isLiked: boolean
  onLike: () => void
  onReply: () => void
  onExpand?: () => void
  isExpanded?: boolean
  hasSubComments?: boolean
  subCommentsCount?: number
}

const CommentActions: React.FC<CommentActionsProps> = ({
  likes,
  isLiked,
  onLike,
  onReply,
  onExpand,
  isExpanded,
  hasSubComments,
  subCommentsCount = 0
}) => {
  return (
    <Space key="actions">
      <Button 
        type="text" 
        icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
        size="small"
        onClick={onLike}
      >
        {likes}
      </Button>
      <Button
        type="text"
        icon={<MessageOutlined />}
        size="small"
        onClick={onReply}
      >
        回复
      </Button>
      {hasSubComments && onExpand && (
        <Button
          type="link"
          size="small"
          icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
          onClick={onExpand}
        >
          {isExpanded ? '收起' : `${subCommentsCount}条回复`}
        </Button>
      )}
    </Space>
  )
}

export default React.memo(CommentActions) 