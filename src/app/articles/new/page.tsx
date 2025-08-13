"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import type { CreateArticleBody } from '@/types/api/article.types'
import { toast } from 'sonner'

const schema = z.object({
  title: z.string().min(1, '标题必填'),
  slug: z.string().min(1, 'Slug 必填'),
  categoryID: z.coerce.number().int().min(1, '分类必填'),
  tags: z.string().optional(), // 逗号分隔
})

type FormValues = z.infer<typeof schema>

export default function NewArticlePage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    if (!content || content.replace(/<[^>]*>/g, '').trim().length < 100) {
      toast.error('内容至少100个字符')
      return
    }

    try {
      setSubmitting(true)
      const body: CreateArticleBody = {
        title: values.title.trim(),
        slug: values.slug.trim(),
        categoryID: values.categoryID,
        tags: values.tags ? values.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      }

      const createRes = await articleService.createArticle(body)
      const articleID = createRes.article.articleID

      await articleService.createArticleVersion(articleID, { content })
      toast.success('文章创建成功')
      router.push(`/articles/${articleID}`)
    } catch (e) {
      const message = e instanceof Error ? e.message : '创建文章失败'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icons.plus className="w-5 h-5 text-blue-600" />
            新建文章
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <Editor value={content} onChange={setContent} placeholder="开始写作..." />
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (<><Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> 保存中...</>) : '创建'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}