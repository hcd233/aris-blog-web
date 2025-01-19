"use client"

import { useEffect, useState, useRef } from "react"
import { ApiService } from "@/lib/api"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/user/user-avatar"
import { Eye, ThumbsUp, MessageSquare } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useParams } from "next/navigation"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

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
  user?: {
    name: string
    avatar: string
  }
}

interface ArticleVersion {
  version: number
  content: string
  createdAt: string
}

interface TableOfContents {
  id: string
  level: number
  text: string
}

export default function ArticlePage() {
  const params = useParams()
  const [article, setArticle] = useState<ArticleDetail | null>(null)
  const [version, setVersion] = useState<ArticleVersion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [toc, setToc] = useState<TableOfContents[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [renderedContent, setRenderedContent] = useState("")
  const articleRef = useRef<HTMLDivElement>(null)

  // 初始化 markdown-it 和渲染内容
  useEffect(() => {
    if (version?.content) {
      const initMarkdown = async () => {
        try {
          const md = require('markdown-it')({
            html: true,
            linkify: true,
            typographer: true,
            highlight: function (str: string, lang: string) {
              if (lang) {
                try {
                  const hljs = require('highlight.js')
                  if (hljs.getLanguage(lang)) {
                    return hljs.highlight(str, { language: lang }).value
                  }
                } catch (__) {}
              }
              return ''
            }
          })

          // 渲染内容
          const rendered = md.render(version.content)
          setRenderedContent(rendered)

          // 生成目录
          const tokens = md.parse(version.content, {})
          const headings: TableOfContents[] = []

          tokens.forEach((token: any, index: number) => {
            if (token.type === 'heading_open') {
              const level = parseInt(token.tag.slice(1))
              const contentToken = tokens[index + 1]
              if (contentToken && contentToken.type === 'inline') {
                const text = contentToken.content
                const id = text.toLowerCase().replace(/\s+/g, '-')
                headings.push({ id, level, text })
              }
            }
          })

          setToc(headings)
        } catch (error) {
          console.error('Markdown 渲染失败:', error)
          setError('内容渲染失败')
        }
      }

      initMarkdown()
    }
  }, [version?.content])

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // 获取文章基本信息
        const articleData = await ApiService.getArticleBySlug(
          params.authorName as string,
          params.articleSlug as string
        )
        setArticle(articleData)

        // 获取最新版本的文章内容
        const versionData = await ApiService.getArticleContent(articleData.articleID)
        setVersion(versionData)
      } catch (error) {
        console.error('获取文章失败:', error)
        setError(error instanceof Error ? error.message : '文章不存在')
        setArticle(null) // 确保清空文章数据
        setVersion(null) // 清空版本数据
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.authorName, params.articleSlug])

  // 添加滚动监听，计算阅读进度
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!articleRef.current) return

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const article = articleRef.current
          if (!article) return
          const articleRect = article.getBoundingClientRect()

          // 文章的总高度（包括不可见部分）
          const totalHeight = article.scrollHeight

          // 文章顶部距离视口顶部的距离
          const distanceFromTop = window.scrollY - article.offsetTop

          // 视口高度
          const viewportHeight = window.innerHeight

          // 计算阅读进度
          const progress = Math.max(0, Math.min(100, 
            ((distanceFromTop + viewportHeight) / totalHeight) * 100
          ))

          setProgress(progress)

          // 更新当前活动标题
          const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6')
          let current = ''

          for (const heading of headings) {
            const top = heading.getBoundingClientRect().top
            if (top > 0 && top < window.innerHeight / 2) {
              current = heading.id
              break
            }
          }

          setActiveId(current)
          ticking = false
        })

        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 初始化时计算一次进度
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
        <Card className="glass-effect border-none p-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">找不到文章</h2>
            <p className="text-muted-foreground">
              {error === '文章不存在' ? '该文章可能已被删除或移动' : error || '文章不存在'}
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4 overscroll-none">
      <div className="relative max-w-4xl mx-auto">
        <div className="fixed left-[max(2rem,calc(50%-48rem))] top-[6rem] w-[280px] space-y-6">
          <Card className="glass-effect border-none p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">阅读进度</div>
                <Progress value={progress} className="h-2" />
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {Math.round(progress)}%
              </div>
            </div>
          </Card>

          <Card className="glass-effect border-none p-4 max-h-[calc(100vh-14rem)] overflow-hidden flex flex-col">
            <div className="flex flex-col h-full">
              <div className="font-medium mb-4">目录</div>
              <ScrollArea className="flex-1 -mx-4 px-4">
                <div className="space-y-1 pb-4">
                  {toc.map(({ id, level, text }) => (
                    <a
                      key={id}
                      href={`#${id}`}
                      className={cn(
                        "block py-1 text-sm transition-colors hover:text-primary",
                        level > 1 && "pl-4",
                        activeId === id ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {text}
                    </a>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>
        </div>

        <article ref={articleRef} className="space-y-8">
          <Card className="glass-effect border-none p-8">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold tracking-tight">
                {article.title}
              </h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <UserAvatar 
                    userID={article.userID}
                    initialData={article.user}
                  />
                  {/* use color */}
                  <Badge 
                    variant="secondary" 
                    className="rounded-full px-3 font-normal"
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    v{version?.version}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="rounded-full px-3 font-normal"
                    style={{
                      fontWeight: 'bold',
                    }}
                  >
                    {version?.createdAt && 
                      format(new Date(version.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })
                    }
                  </Badge>
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

            <Separator className="my-8 bg-border/40" />

            <div 
              className="prose prose-lg dark:prose-invert prose-pre:mx-0 prose-pre:w-full prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ 
                __html: renderedContent
              }}
            />
          </Card>
        </article>
      </div>
    </div>
  )
} 