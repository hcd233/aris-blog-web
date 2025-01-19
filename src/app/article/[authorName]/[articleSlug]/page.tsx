"use client"

import { useEffect, useState } from "react"
import { ApiService } from "@/lib/api"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user/user-avatar"
import { Eye, ThumbsUp, MessageSquare } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

interface ArticleDetail {
  articleID: number
  title: string
  content: string
  version: number
  createdAt: string
  updatedAt: string
  views: number
  likes: number
  comments: number
  userID: number
  tags: string[]
}

export default function ArticlePage({ params }: { params: { authorName: string; articleSlug: string } }) {
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [content, setContent] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 获取文章基本信息
        const articleData = await ApiService.getArticleBySlug(
          params.authorName,
          params.articleSlug
        )
        setArticle(articleData)

        // 获取最新版本的文章内容
        const content = await ApiService.getArticleContent(articleData.articleID)
        setContent(content)
      } catch (error) {
        console.error('获取文章失败:', error)
        setError(error instanceof Error ? error.message : '获取文章失败')
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.authorName, params.articleSlug])

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-10 space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[600px]" />
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="container mx-auto max-w-4xl py-10">
        <Card className="p-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">出错了</h2>
            <p className="text-muted-foreground">{error || '文章不存在'}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl py-10">
      <article className="space-y-8">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold tracking-tight">
            {article.title}
          </h1>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <UserAvatar userID={article.userID} />
              <time className="text-sm text-muted-foreground">
                {format(new Date(article.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
              </time>
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

          <div className="flex gap-2">
            {article.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator className="bg-border/40" />

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <SyntaxHighlighter
                    {...props}
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                )
              }
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  )
} 