'use client'

import { useRouter } from 'next/navigation'
import { ArticleForm } from '@/components/article/ArticleForm'
import type { Article, ArticleVersion } from '@/types/api/article.types'

export default function NewArticlePage() {
  const router = useRouter()

  const handleSave = (article: Article, version: ArticleVersion) => {
    // Redirect to the article edit page after creation
    router.push(`/articles/${article.articleID}/edit`)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="container mx-auto py-8">
      <ArticleForm
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  )
}