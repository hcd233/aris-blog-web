"use client"

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/icons'
import Editor from '@/components/Editor'
import { articleService } from '@/services/article.service'
import type { Article } from '@/types/api/article.types'
import { toast } from 'sonner'
import CategorySelect from '@/components/CategorySelect'
import TagMultiSelect from '@/components/TagMultiSelect'
import { generateSlugFromTitle } from '@/lib/slug'

export default function EditArticlePage() {
  const params = useParams<{ articleID: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryID, setCategoryID] = useState<number | null>(null)
  const [tagSlugs, setTagSlugs] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (!params?.articleID) return
        const id = Number(params.articleID)
        const a = await articleService.getArticle(id)
        setArticle(a.article)
        setTitle(a.article.title)
        setSlug(a.article.slug)
        setCategoryID((a.article as unknown as { categoryID?: number }).categoryID ?? null)
        setTagSlugs(a.article.tags || [])

        const v = await articleService.getLatestVersion(id)
        setContent(v.version.content)
      } catch (e) {
        const message = e instanceof Error ? e.message : '加载失败'
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params])

  useEffect(() => {
    if (!title || !article) return
    const wasAuto = article.slug === slug
    if (wasAuto) setSlug(generateSlugFromTitle(title))
  }, [title, article, slug])

  const canSave = useMemo(() => {
    const plain = content.replace(/<[^>]*>/g, '').trim()
    return !!article && title.trim().length > 0 && !!categoryID && plain.length >= 100
  }, [article, title, categoryID, content])

  const onSave = async () => {
    if (!article) return
    const plain = content.replace(/<[^>]*>/g, '').trim()
    if (plain.length < 100) {
      toast.error('内容至少100个字符')
      return
    }

    try {
      setSaving(true)
      await articleService.updateArticle(article.articleID, {
        title: title.trim(),
        slug: slug || generateSlugFromTitle(title),
        categoryID: categoryID ?? undefined,
        tags: tagSlugs,
      })
      await articleService.createArticleVersion(article.articleID, { content })
      toast.success('已保存新版本')
      router.push(`/articles/${article.articleID}`)
    } catch (e) {
      const message = e instanceof Error ? e.message : '保存失败'
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const onPublishToggle = async () => {
    if (!article) return
    try {
      setPublishing(true)
      const nextStatus = article.status === 'publish' ? 'draft' : 'publish'
      await articleService.updateArticleStatus(article.articleID, { status: nextStatus as 'draft' | 'publish' })
      toast.success(nextStatus === 'publish' ? '已发布' : '已切换为草稿')
      setArticle({ ...article, status: nextStatus })
    } catch (e) {
      const message = e instanceof Error ? e.message : '更新状态失败'
      toast.error(message)
    } finally {
      setPublishing(false)
    }
  }

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
    return <div className="container mx-auto px-6 py-6">未找到文章</div>
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg">编辑文章</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onPublishToggle} disabled={publishing}>
              {publishing ? (<><Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> 更新中...</>) : (article.status === 'publish' ? '切换为草稿' : '发布')}
            </Button>
          </div>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="space-y-4">
            {/* Title and selectors */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Input
                placeholder="输入标题..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="text-lg h-11"
              />
              <div className="flex items-center gap-2">
                <CategorySelect value={categoryID ?? undefined} onChange={setCategoryID} />
                <TagMultiSelect value={tagSlugs} onChange={setTagSlugs} />
              </div>
            </div>
            <div className="text-xs text-gray-500">Slug：{slug}</div>

            {/* Editor */}
            <Editor value={content} onChange={setContent} />

            <div className="flex items-center gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
              <Button type="button" onClick={onSave} disabled={!canSave || saving}>
                {saving ? (<><Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> 保存中...</>) : '保存'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}