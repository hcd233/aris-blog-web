"use client"

import { useEffect, useState } from "react"
import { ApiService } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Hash } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { UserAvatar } from "@/components/user/user-avatar"

interface Tag {
  tagID: number
  name: string
  slug: string
  description: string
  likes: number
  userID: number
}

export function TagList() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const fetchTags = async () => {
    try {
      setError(null)
      const data = await ApiService.getTags()
      setTags(data.tags)
    } catch (error) {
      console.error('获取标签列表失败:', error)
      setError(error instanceof Error ? error.message : '获取标签列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()

    const handleAuthChange = () => {
      fetchTags()
    }

    window.addEventListener('auth-change', handleAuthChange)
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [isAuthenticated])

  return (
    <Card className="glass-effect border-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          <CardTitle>标签</CardTitle>
        </div>
        <CardDescription>
          探索不同主题的文章
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            {error}
          </div>
        ) : tags.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            暂无标签
          </div>
        ) : (
          <div className="space-y-2">
            {tags.map((tag) => (
              <Link key={tag.tagID} href={`/tags/${tag.slug}`}>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {tag.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {tag.likes}
                      </Badge>
                    </div>
                    {tag.description && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <UserAvatar userID={tag.userID} showName={false} />
                        <p className="line-clamp-1">{tag.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 