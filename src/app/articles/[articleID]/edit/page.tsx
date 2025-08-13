"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/icons'
import Editor from '@/components/Editor'
import { articleService } from '@/services/article.service'
import type { Article } from '@/types/api/article.types'
import { toast } from 'sonner'

const schema = z.object({
  title: z.string().min(1, '标题必填'),
  slug: z.string().min(1, 'Slug 必填'),
  categoryID: z.coerce.number().int().min(1, '分类必填'),
  tags: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export default function EditArticlePage() {
  const params = useParams<{ articleID: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  useEffect(() => {
    const load = async () => {
      try {
        if (!params?.articleID) return
        const id = Number(params.articleID)
        const a = await articleService.getArticle(id)
        setArticle(a.article)
        setValue('title', a.article.title)
        setValue('slug', a.article.slug)
        // 后端若返回 categoryID 可在此设置；未在规范中定义，使用1占位
        setValue('categoryID', (a.article as unknown as { categoryID?: number }).categoryID ?? 1)
        setValue('tags', a.article.tags?.join(',') || '')

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
  }, [params, setValue])

  const onSave = async (values: FormValues) => {
    if (!article) return
    if (!content || content.replace(/<[^>]*>/g, '').trim().length < 100) {
      toast.error('内容至少100个字符')
      return
    }

    try {
      setSaving(true)
      await articleService.updateArticle(article.articleID, {
        title: values.title.trim(),
        slug: values.slug.trim(),
        categoryID: values.categoryID,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
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
          <form onSubmit={handleSubmit(onSave)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold">标题</label>
                <Input placeholder="文章标题" {...register('title')} />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold">Slug</label>
                <Input placeholder="文章slug" {...register('slug')} />
                {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
              </div>
              <div>
                <label className="text-sm font-semibold">分类ID</label>
                <Input type="number" placeholder="分类ID" {...register('categoryID')} />
                {errors.categoryID && <p className="text-xs text-red-500 mt-1">{errors.categoryID.message}</p>}
              </div>
              <div className="md:col-span-3">
                <label className="text-sm font-semibold">标签（用逗号分隔）</label>
                <Input placeholder="如：react,frontend,typescript" {...register('tags')} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">内容</label>
              <Editor value={content} onChange={setContent} />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
              <Button type="submit" disabled={saving}>
                {saving ? (<><Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> 保存中...</>) : '保存'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}