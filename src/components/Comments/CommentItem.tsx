import React from 'react'
import { List, Avatar, Space, Button } from 'antd'
import { LikeOutlined, LikeFilled, MessageOutlined, DownOutlined, UpOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { Comment } from '@/services/comment'

interface CommentItemProps {
  comment: Comment & {
    children?: Comment[]
  }
  isSubComment?: boolean
  onLike: (commentId: number, isLiked: boolean) => void
  onReply: (comment: Comment) => void
  onExpand?: (commentId: number) => void
  isExpanded?: boolean
  hasSubComments?: boolean
  subCommentsCount?: number
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  isSubComment = false,
  onLike,
  onReply,
  onExpand,
  isExpanded: parentIsExpanded,
  hasSubComments,
  subCommentsCount = 0
}) => {
  return (
    <div className="comment-item">
      <List.Item
        key={comment.id}
        actions={[
          <Space key="actions">
            <Button 
              type="text" 
              icon={comment.likes > 0 ? <LikeFilled /> : <LikeOutlined />}
              size="small"
              onClick={() => onLike(comment.id, comment.likes > 0)}
            >
              {comment.likes}
            </Button>
            <Button
              type="text"
              icon={<MessageOutlined />}
              size="small"
              onClick={() => onReply(comment)}
            >
              回复
            </Button>
            {hasSubComments && onExpand && (
              <Button
                type="link"
                size="small"
                icon={parentIsExpanded ? <UpOutlined /> : <DownOutlined />}
                onClick={() => onExpand(comment.id)}
              >
                {parentIsExpanded ? '收起' : `${subCommentsCount}条回复`}
              </Button>
            )}
          </Space>
        ]}
      >
        <List.Item.Meta
          avatar={<Avatar src={comment.commenter.avatar} />}
          title={
            <div className="flex items-center">
              <span 
                className="font-medium mr-2 select-text"
                style={{ fontFamily: 'HanTang, sans-serif' }}
              >
                {comment.commenter.name}
              </span>
              <span 
                className="text-gray-400 text-sm select-text"
                style={{ fontFamily: 'HanTang, sans-serif' }}
              >
                {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
              </span>
              {comment.parent && (
                <span 
                  className="ml-2 text-gray-400 text-sm select-text"
                  style={{ fontFamily: 'HanTang, sans-serif' }}
                >
                  回复 @{comment.parent.commenter.name}
                </span>
              )}
            </div>
          }
          description={
            <div 
              className="mt-2 text-gray-800 select-text whitespace-pre-wrap"
              style={{ fontFamily: 'HanTang, sans-serif' }}
            >
              {comment.content}
            </div>
          }
        />
      </List.Item>

      {comment.children && comment.children.length > 0 && (
        <div className="comment-children" style={{ marginLeft: '20px' }}>
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              isSubComment={true}
              onLike={onLike}
              onReply={onReply}
              onExpand={onExpand}
              hasSubComments={hasSubComments}
              subCommentsCount={subCommentsCount}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem 