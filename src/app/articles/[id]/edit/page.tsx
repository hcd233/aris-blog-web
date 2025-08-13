'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArticleForm } from '@/components/article/ArticleForm'
import { articleService } from '@/services/article.service'
import type { Article, ArticleVersion } from '@/types/api/article.types'
import { toast } from 'sonner'

export default function EditArticlePage() {
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

  const handleSave = (updatedArticle: Article, updatedVersion: ArticleVersion) => {
    setArticle(updatedArticle)
    setVersion(updatedVersion)
    // Stay on edit page after save
  }

  const handleCancel = () => {
    router.push(`/articles/${articleID}`)
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
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <ArticleForm
        article={article}
        version={version}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}