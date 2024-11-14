import React, { useState, useRef } from 'react'
import { Button, Tooltip, Input, message } from 'antd'
import { 
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CommentOutlined,
  SendOutlined,
  CloseOutlined
} from '@ant-design/icons'
import Comments, { CommentsRef } from '@/components/Comments'
import CommentService, { Comment } from '@/services/comment'

interface ArticleRightSidebarProps {
  userName: string
  articleSlug: string
  likes: number
  views: number
  onCollapsedChange?: (collapsed: boolean) => void
}

const ArticleRightSidebar: React.FC<ArticleRightSidebarProps> = ({
  userName,
  articleSlug,
  likes,
  views,
  onCollapsedChange
}) => {
  const [collapsed, setCollapsed] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)

  const commentsRef = useRef<CommentsRef>(null)

  const handleCollapse = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    onCollapsedChange?.(newCollapsed)
  }

  const handleSendComment = async () => {
    if (!commentContent.trim()) {
      message.warning('请输入评论内容')
      return
    }

    try {
      await CommentService.createComment(
        userName, 
        articleSlug, 
        commentContent.trim(),
        replyTo?.id
      )
      message.success(replyTo ? '回复成功' : '评论成功')
      setCommentContent('')
      setReplyTo(null)
      commentsRef.current?.refreshComments()
    } catch (error) {
      message.error(replyTo ? '回复失败' : '评论失败')
    }
  }

  const handleCancelReply = () => {
    setReplyTo(null)
  }

  return (
    <div 
      className="fixed transition-all duration-300 flex"
      style={{ 
        right: collapsed ? '-320px' : '0',
        top: '80px',
        bottom: '80px',
        zIndex: 100
      }}
    >
      {/* 展开/收起按钮 */}
      <Tooltip 
        title={collapsed ? "展开评论" : "收起评论"} 
        placement="left"
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={handleCollapse}
          className="flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-all"
          style={{
            width: '24px',
            height: '48px',
            marginRight: '-1px',
            borderRadius: '8px 0 0 8px',
            border: '1px solid #f0f0f0',
            borderRight: 'none',
          }}
        />
      </Tooltip>

      {/* 侧边栏内容 */}
      <div
        className="h-full bg-white shadow-lg flex flex-col"
        style={{
          width: '320px',
          borderRadius: '12px 0 0 12px',
        }}
      >
        {/* 评论标题 */}
        <div className="p-4 border-b flex-shrink-0">
          <div className="flex items-center">
            <CommentOutlined className="text-blue-500 text-lg mr-2" />
            <span 
              className="text-gray-800 font-medium"
              style={{ fontFamily: 'HanTang, sans-serif' }}
            >
              评论区
            </span>
          </div>
        </div>

        {/* 评论列表容器 - 使用 flex-1 和 overflow-auto */}
        <div className="flex-1 overflow-auto">
          <Comments
            ref={commentsRef}
            userName={userName}
            articleSlug={articleSlug}
            likes={likes}
            views={views}
            commentContent={commentContent}
            onCommentContentChange={setCommentContent}
            replyTo={replyTo}
            onReplyToChange={setReplyTo}
          />
        </div>

        {/* 评论输入框 - 使用 flex-shrink-0 确保不会被压缩 */}
        <div className="border-t bg-white flex-shrink-0">
          {/* 回复提示信息 */}
          {replyTo && (
            <div className="px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span>回复 </span>
                <span className="font-medium">{replyTo.commenter.name}</span>
                <span> 的评论：</span>
                <span className="text-gray-400 ml-1">
                  {replyTo.content.length > 20 
                    ? `${replyTo.content.slice(0, 20)}...` 
                    : replyTo.content}
                </span>
              </div>
              <Button
                type="text"
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancelReply}
              />
            </div>
          )}
          <div className="p-3">
            <div className="flex">
              <Input.TextArea
                value={commentContent}
                onChange={e => setCommentContent(e.target.value)}
                placeholder={replyTo ? "输入回复内容..." : "写下你的评论..."}
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="flex-1 mr-2"
                style={{ 
                  fontFamily: 'HanTang, sans-serif',
                  resize: 'none'
                }}
                onPressEnter={e => {
                  if (!e.shiftKey) {
                    e.preventDefault()
                    handleSendComment()
                  }
                }}
              />
              <Button 
                type="primary"
                icon={<SendOutlined />}
                className="flex items-center justify-center"
                style={{ width: '40px', padding: 0 }}
                onClick={handleSendComment}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default React.memo(ArticleRightSidebar) 