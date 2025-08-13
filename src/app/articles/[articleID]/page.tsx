"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { articleService } from '@/services/article.service'
import type { Article, ArticleVersion } from '@/types/api/article.types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function ArticleDetailPage() {
  const params = useParams<{ articleID: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [version, setVersion] = useState<ArticleVersion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        if (!params?.articleID) return
        const id = Number(params.articleID)
        const a = await articleService.getArticle(id)
        setArticle(a.article)
        const v = await articleService.getLatestVersion(id)
        setVersion(v.version)
      } catch (e) {
        const message = e instanceof Error ? e.message : '加载失败'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center gap-2 text-gray-500">
          <Icons.spinner className="w-4 h-4 animate-spin" /> 加载中...
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="container mx-auto px-6 py-6">未找到文章</div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl">{article.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(`/articles/${article.articleID}/edit`)}>编辑</Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="text-sm text-gray-500 mb-4">{article.slug} · {article.status} · 更新于 {new Date(article.updatedAt).toLocaleString()}</div>
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: version?.content || '<p>无内容</p>' }} />
        </CardContent>
      </Card>
    </div>
  )
}