"use client"

import { useEffect, useState, useCallback } from 'react'
import { articleService } from '@/services/article.service'
import type { Article } from '@/types/api/article.types'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/icons'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pageSize] = useState(10)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const fetchArticles = useCallback(async (p = 1) => {
    try {
      setLoading(true)
      const res = await articleService.listArticles({ page: p, pageSize })
      setArticles(res.articles)
      setTotal(res.pageInfo.total)
      setPage(p)
    } catch (e) {
      const message = e instanceof Error ? e.message : '加载文章失败'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  useEffect(() => {
    fetchArticles(1)
  }, [fetchArticles])

  const handleNew = () => {
    router.push('/articles/new')
  }

  const hasMore = articles.length + (page - 1) * pageSize < total

  return (
    <div className="container mx-auto px-6 py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icons.fileText className="w-5 h-5 text-blue-600" />
            文章列表
          </CardTitle>
          <Button onClick={handleNew}>
            <Icons.plus className="w-4 h-4 mr-2" />
            新建文章
          </Button>
        </CardHeader>
        <Separator />
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <Icons.spinner className="w-4 h-4 animate-spin" /> 加载中...
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">暂无文章</div>
          ) : (
            <div className="space-y-3">
              {articles.map(a => (
                <div key={a.articleID} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                  <div>
                    <div className="font-medium">{a.title}</div>
                    <div className="text-xs text-gray-500">{a.slug} · {a.status} · {new Date(a.updatedAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/articles/${a.articleID}`)}>查看</Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/articles/${a.articleID}/edit`)}>编辑</Button>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => fetchArticles(page - 1)}>
                  上一页
                </Button>
                <div className="text-sm text-gray-500">第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页</div>
                <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => fetchArticles(page + 1)}>
                  下一页
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}