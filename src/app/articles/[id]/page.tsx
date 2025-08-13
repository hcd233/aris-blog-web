'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { 
  Edit, 
  Eye, 
  EyeOff, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Calendar, 
  User, 
  ArrowLeft,
  History
} from 'lucide-react'
import { articleService } from '@/services/article.service'
import type { Article, ArticleVersion } from '@/types/api/article.types'
import { toast } from 'sonner'

export default function ArticleViewPage() {
  const params = useParams()
  const router = useRouter()
  const articleID = parseInt(params.id as string)

  const [article, setArticle] = useState<Article | null>(null)
  const [version, setVersion] = useState<ArticleVersion | null>(null)
  const [loading, setLoading] = useState(true)

  // Load article and version
  useEffect(() => {
    if (!articleID) return

    const loadArticle = async () => {
      try {
        setLoading(true)
        const { article, version } = await articleService.getArticleWithLatestVersion(articleID)
        setArticle(article)
        setVersion(version)

        // Log article view
        await articleService.logArticleView({ articleID })
      } catch (error) {
        console.error('Failed to load article:', error)
        toast.error('加载文章失败')
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [articleID])

  // Handle like toggle
  const handleLikeToggle = async () => {
    if (!article) return

    try {
      await articleService.likeArticle({ 
        articleID: article.articleID,
        undo: false // Would need to track like state properly
      })
      
      // Update local state optimistically
      setArticle(prev => prev ? { ...prev, likes: prev.likes + 1 } : null)
      toast.success('点赞成功')
    } catch (error) {
      console.error('Failed to like article:', error)
      toast.error('点赞失败')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!article || !version) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">文章不存在</h3>
            <p className="text-gray-600 mb-4">请检查链接是否正确</p>
            <Button onClick={() => router.push('/articles')}>
              返回文章列表
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/articles/${article.articleID}/history`)}
          >
            <History className="h-4 w-4 mr-2" />
            版本历史
          </Button>
          
          <Button onClick={() => router.push(`/articles/${article.articleID}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            编辑文章
          </Button>
        </div>
      </div>

      {/* Article Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant={article.status === 'publish' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  {article.status === 'publish' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  {article.status === 'publish' ? '已发布' : '草稿'}
                </Badge>
              </div>
              
              <CardTitle className="text-3xl mb-2">{article.title}</CardTitle>
              
              <CardDescription className="text-base">
                <span className="font-mono">/{article.slug}</span>
              </CardDescription>
            </div>
          </div>
          
          {/* Meta Info */}
          <div className="flex items-center gap-6 text-sm text-gray-600 mt-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {article.publishedAt 
                ? `发布于 ${format(new Date(article.publishedAt), 'yyyy年MM月dd日', { locale: zhCN })}`
                : `创建于 ${format(new Date(article.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}`
              }
            </div>
            
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              {article.views.toLocaleString()} 浏览
            </div>
            
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {article.likes.toLocaleString()} 点赞
            </div>
            
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {article.comments.toLocaleString()} 评论
            </div>
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Article Content */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>文章内容</CardTitle>
          <CardDescription>
            版本 {version.version} • 更新于 {format(new Date(version.updatedAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TipTapEditor
            content={version.content}
            editable={false}
            className="border-none"
          />
        </CardContent>
      </Card>

      {/* Interaction Actions */}
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLikeToggle}
              className="flex items-center gap-2"
            >
              <Heart className="h-5 w-5" />
              点赞 ({article.likes})
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // Would navigate to comments section
                toast.info('评论功能待实现')
              }}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              评论 ({article.comments})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}