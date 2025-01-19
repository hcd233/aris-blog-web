"use client"

import { useEffect, useState } from "react"
import { ApiService } from "@/lib/api"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Eye, MessageSquare, ThumbsUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { usePopover } from "@/hooks/use-popover"
import { LoginPopover } from "@/components/auth/login-popover"
import { UserAvatar } from "@/components/user/user-avatar"

interface Article {
  articleID: number
  title: string
  slug: string
  tags: string[]
  createdAt: string
  views: number
  likes: number
  comments: number
  userID: number
  user?: {
    name: string
    avatar: string
  }
}

export function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { openPopover } = usePopover()

  const fetchArticles = async () => {
    try {
      setError(null)
      setLoading(true)
      const data = await ApiService.getArticles()
      setArticles(data.articles)
    } catch (error) {
      console.error('获取文章列表失败:', error)
      setError(error instanceof Error ? error.message : '获取文章列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()

    // 监听认证状态变化
    const handleAuthChange = () => {
      fetchArticles()
    }

    window.addEventListener('auth-change', handleAuthChange)
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [isAuthenticated]) // 添加 isAuthenticated 作为依赖

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">文章</h2>
          <p className="text-muted-foreground">
            发现优质的技术文章和见解
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 这里可以添加排序或筛选按钮 */}
        </div>
      </div>

      <Card className="glass-effect border-none p-6">
        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex justify-between items-center pt-4">
                  <div className="flex gap-2">
                    {[...Array(2)].map((_, j) => (
                      <Skeleton key={j} className="h-6 w-16 rounded-full" />
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-4 w-12" />
                    ))}
                  </div>
                </div>
                {i < 2 && <div className="h-px bg-border/20 my-6" />}
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <CardTitle className="text-xl font-medium">出错了</CardTitle>
            <CardDescription className="text-center max-w-md">
              {error}
            </CardDescription>
            <LoginPopover 
              trigger={
                <Button className="mt-4 px-8">
                  去登录
                </Button>
              }
              align="center"
            />
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <CardTitle className="text-xl font-medium">暂无文章</CardTitle>
            <CardDescription className="text-center max-w-md">
              还没有任何文章发布，请稍后再来查看
            </CardDescription>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {articles.map((article, index) => {
              const userName = article.user?.name || 'anonymous'
              const userAvatar = article.user?.avatar || ''

              return (
                <div key={article.articleID} className={index > 0 ? "pt-6 mt-6" : ""}>
                  <Link href={`/article/${userName}/${article.slug}`}>
                    <article className="space-y-4 group">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <UserAvatar 
                            userID={article.userID} 
                            className="text-muted-foreground"
                            initialData={article.user ? {
                              name: article.user.name,
                              avatar: article.user.avatar
                            } : undefined}
                          />
                          <time className="text-sm text-muted-foreground">
                            {format(new Date(article.createdAt), 'yyyy年MM月dd日', { locale: zhCN })}
                          </time>
                          <div className="flex gap-2">
                            {article.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="rounded-full px-3">
                                {tag}
                              </Badge>
                            ))}
                            {article.tags?.length > 2 && (
                              <Badge variant="secondary" className="rounded-full px-3">
                                +{article.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{article.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{article.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{article.comments}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </section>
  )
} 