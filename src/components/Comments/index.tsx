import React, { useState, useEffect, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react'
import { List, Pagination, message, Spin } from 'antd'
import CommentService, { Comment } from '@/services/comment'
import CommentItem from './CommentItem'

interface CommentsProps {
  userName: string
  articleSlug: string
  commentContent: string
  onCommentContentChange: (content: string) => void
  replyTo: Comment | null
  onReplyToChange: (comment: Comment | null) => void
}

interface SubCommentsState {
  [commentId: number]: {
    comments: Comment[]
    total: number
    page: number
  }
}

interface CommentWithMeta extends Comment {
  subCommentsCount?: number;
}

const PAGE_SIZE = 5
const MAX_NESTING_LEVEL = 2

interface CommentCount {
  commentId: number;
  count: number;
}

interface CommentCache {
  [key: string]: {
    comments: CommentWithMeta[];
    total: number;
    page: number;
    commentCounts: {[key: number]: number};
  }
}

export interface CommentsRef {
  refreshComments: () => void;
}

const globalCommentCache: CommentCache = {}

const Comments = forwardRef<CommentsRef, CommentsProps>(({
  userName,
  articleSlug,
  commentContent,
  onCommentContentChange,
  replyTo,
  onReplyToChange
}, ref) => {
  const [comments, setComments] = useState<CommentWithMeta[]>([])
  const [subComments, setSubComments] = useState<SubCommentsState>({})
  const [loading, setLoading] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set())
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [commentCounts, setCommentCounts] = useState<{[key: number]: number}>({})

  const cacheKey = useMemo(() => `${userName}/${articleSlug}`, [userName, articleSlug])

  const loadComments = useCallback(async (pageNum: number = page, shouldRefresh: boolean = false) => {
    setLoading(true)
    try {
      const cacheData = globalCommentCache[cacheKey]
      if (!shouldRefresh && cacheData && cacheData.page === pageNum) {
        setComments(cacheData.comments)
        setTotal(cacheData.total)
        setCommentCounts(cacheData.commentCounts)
        setLoading(false)
        return
      }

      const response = await CommentService.getArticleComments(userName, articleSlug, pageNum, PAGE_SIZE)
      const newComments = response.data.comments

      const counts = await Promise.all(newComments.map(async (comment: Comment) => {
        const subResponse = await CommentService.getSubComments(userName, articleSlug, comment.id, 1, 1)
        return { commentId: comment.id, count: subResponse.data.pageInfo.total } as CommentCount
      }))
      const newCommentCounts = counts.reduce((acc: {[key: number]: number}, countObj: CommentCount) => {
        const { commentId, count } = countObj;
        acc[commentId] = count;
        return acc;
      }, {})

      setComments(newComments)
      setTotal(response.data.pageInfo.total)
      setCommentCounts(newCommentCounts)
      
      globalCommentCache[cacheKey] = {
        comments: newComments,
        total: response.data.pageInfo.total,
        page: pageNum,
        commentCounts: newCommentCounts
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
      message.error('加载评论失败')
    } finally {
      setLoading(false)
    }
  }, [userName, articleSlug, page, cacheKey])

  useEffect(() => {
    return () => {
      setTimeout(() => {
        delete globalCommentCache[cacheKey]
      }, 5 * 60 * 1000)
    }
  }, [cacheKey])

  useImperativeHandle(ref, () => ({
    refreshComments: () => {
      loadComments(1, true)
    }
  }))

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleLikeComment = async (commentId: number, isLiked: boolean) => {
    try {
      await CommentService.likeComment(userName, commentId, isLiked)
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: isLiked ? 0 : 1 }
            : comment
        )
      )
      message.success(isLiked ? '取消点赞成功' : '点赞成功')
    } catch (error) {
      message.error(isLiked ? '取消点赞失败' : '点赞失败')
    }
  }

  const handleExpandComment = async (commentId: number) => {
    if (expandedComments.has(commentId)) {
      setExpandedComments(prev => {
        const newExpandedComments = new Set(prev)
        newExpandedComments.delete(commentId)
        return newExpandedComments
      })
      return
    }

    try {
      const response = await CommentService.getSubComments(userName, articleSlug, commentId, 1, PAGE_SIZE)
      if (response.data.pageInfo.total > 0) {
        const counts = await Promise.all(response.data.comments.map(async (comment: Comment) => {
          const subResponse = await CommentService.getSubComments(userName, articleSlug, comment.id, 1, 1)
          return { 
            commentId: comment.id, 
            count: subResponse.data.pageInfo.total 
          } as CommentCount
        }))

        const newCommentCounts = { ...commentCounts }
        counts.forEach(({ commentId, count }: CommentCount) => {
          newCommentCounts[commentId] = count
        })
        
        setCommentCounts(newCommentCounts)
        setSubComments(prev => ({
          ...prev,
          [commentId]: {
            comments: response.data.comments,
            total: response.data.pageInfo.total,
            page: 1
          }
        }))
        setExpandedComments(prev => new Set(prev).add(commentId))
      }
    } catch (error) {
      message.error('加载回复失败')
    }
  }

  const handleShowReply = (comment: Comment) => {
    onReplyToChange(comment)
  }

  const handleSubCommentPageChange = async (commentId: number, page: number) => {
    try {
      const response = await CommentService.getSubComments(userName, articleSlug, commentId, page, PAGE_SIZE)
      setSubComments(prev => ({
        ...prev,
        [commentId]: {
          comments: response.data.comments,
          total: response.data.pageInfo.total,
          page
        }
      }))
    } catch (error) {
      message.error('加载回复失败')
    }
  }

  const renderCommentList = (comments: CommentWithMeta[], level: number = 0) => (
    <List
      itemLayout="vertical"
      dataSource={comments}
      renderItem={(comment) => (
        <div key={comment.id}>
          <CommentItem
            comment={comment}
            isSubComment={level > 0}
            onLike={handleLikeComment}
            onReply={() => handleShowReply(comment)}
            onExpand={commentCounts[comment.id] > 0 ? handleExpandComment : undefined}
            isExpanded={expandedComments.has(comment.id)}
            hasSubComments={commentCounts[comment.id] > 0}
            subCommentsCount={commentCounts[comment.id] || 0}
          />
          {expandedComments.has(comment.id) && 
           subComments[comment.id] && 
           subComments[comment.id].comments.length > 0 && (
            <div 
              className={`mt-4 ${level >= MAX_NESTING_LEVEL ? 'ml-4' : 'ml-12'}`}
              style={{
                borderLeft: level >= MAX_NESTING_LEVEL ? '2px solid #f0f0f0' : 'none',
                paddingLeft: level >= MAX_NESTING_LEVEL ? '12px' : '0'
              }}
            >
              {level >= MAX_NESTING_LEVEL ? (
                <List
                  itemLayout="vertical"
                  dataSource={subComments[comment.id].comments}
                  renderItem={(subComment) => (
                    <div key={subComment.id} className="mb-4">
                      <CommentItem
                        comment={subComment}
                        isSubComment={true}
                        onLike={handleLikeComment}
                        onReply={() => handleShowReply(subComment)}
                        onExpand={undefined}
                        isExpanded={false}
                        hasSubComments={false}
                        subCommentsCount={0}
                      />
                    </div>
                  )}
                />
              ) : (
                renderCommentList(subComments[comment.id].comments, level + 1)
              )}
              
              {subComments[comment.id].total > PAGE_SIZE && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    size="small"
                    current={subComments[comment.id].page}
                    total={subComments[comment.id].total}
                    pageSize={PAGE_SIZE}
                    onChange={(page) => handleSubCommentPageChange(comment.id, page)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    />
  )

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    loadComments(newPage)
  }

  return (
    <div className="px-4 flex flex-col min-h-full">
      <div className="flex-1">
        {loading ? (
          <div className="text-center py-8">
            <Spin />
          </div>
        ) : comments.length > 0 ? (
          renderCommentList(comments, 0)
        ) : (
          <div className="text-center text-gray-500 py-8">
            暂无评论，快来抢沙发吧~
          </div>
        )}
      </div>

      {!loading && total > PAGE_SIZE && (
        <div className="py-4 flex justify-center border-t mt-4">
          <Pagination
            current={page}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={handlePageChange}
            size="small"
          />
        </div>
      )}
    </div>
  )
})

export default React.memo(Comments) 