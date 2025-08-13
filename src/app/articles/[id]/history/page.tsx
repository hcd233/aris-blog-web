'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArticleVersionHistory } from '@/components/article/ArticleVersionHistory'
import { articleService } from '@/services/article.service'
import type { Article, ArticleVersion } from '@/types/api/article.types'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'

export default function ArticleHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const articleID = parseInt(params.id as string)

  const [article, setArticle] = useState<Article | null>(null)
  const [currentVersion, setCurrentVersion] = useState<ArticleVersion | null>(null)
  const [loading, setLoading] = useState(true)

  // Load article and current version
  useEffect(() => {
    if (!articleID) return

    const loadArticle = async () => {
      try {
        setLoading(true)
        const { article, version } = await articleService.getArticleWithLatestVersion(articleID)
        setArticle(article)
        setCurrentVersion(version)
      } catch (error) {
        console.error('Failed to load article:', error)
        toast.error('加载文章失败')
        router.push('/articles')
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [articleID, router])

  const handleVersionRestore = (newVersion: ArticleVersion) => {
    setCurrentVersion(newVersion)
    toast.success('版本恢复成功')
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

  if (!article || !currentVersion) {
    return null
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
        </div>
        
        <div className="text-right">
          <h1 className="text-2xl font-bold">{article.title}</h1>
          <p className="text-gray-600">版本历史管理</p>
        </div>
      </div>

      <ArticleVersionHistory
        article={article}
        currentVersion={currentVersion}
        onRestore={handleVersionRestore}
        showComparison={true}
      />
    </div>
  )
}