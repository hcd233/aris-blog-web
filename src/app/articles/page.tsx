'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArticleList } from '@/components/article/ArticleList'
import type { Article } from '@/types/api/article.types'

export default function ArticlesPage() {
  const router = useRouter()

  const handleCreateArticle = () => {
    router.push('/articles/new')
  }

  const handleEditArticle = (article: Article) => {
    router.push(`/articles/${article.articleID}/edit`)
  }

  const handleViewArticle = (article: Article) => {
    router.push(`/articles/${article.articleID}`)
  }

  return (
    <div className="container mx-auto py-8">
      <ArticleList
        onCreate={handleCreateArticle}
        onEdit={handleEditArticle}
        onView={handleViewArticle}
        showActions={true}
      />
    </div>
  )
}