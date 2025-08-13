"use client"

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
// zod not used in redesigned composer
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Icons } from '@/components/icons'
import Editor from '@/components/Editor'
import { articleService } from '@/services/article.service'
import type { CreateArticleBody } from '@/types/api/article.types'
import { toast } from 'sonner'
import CategorySelect from '@/components/CategorySelect'
import TagMultiSelect from '@/components/TagMultiSelect'
import { generateSlugFromTitle } from '@/lib/slug'

const contentMinChars = 100

export default function NewArticlePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [categoryID, setCategoryID] = useState<number | null>(null)
  const [tagSlugs, setTagSlugs] = useState<string[]>([])
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Auto generate slug on title change
  useEffect(() => {
    if (!title) { setSlug(''); return }
    setSlug(generateSlugFromTitle(title))
  }, [title])

  const canSubmit = useMemo(() => {
    const plain = content.replace(/<[^>]*>/g, '').trim()
    return title.trim().length > 0 && !!categoryID && plain.length >= contentMinChars
  }, [title, categoryID, content])

  const onSubmit = async () => {
    const plain = content.replace(/<[^>]*>/g, '').trim()
    if (plain.length < contentMinChars) {
      toast.error(`内容至少${contentMinChars}个字符`)
      return
    }
    if (!categoryID) {
      toast.error('请选择分类')
      return
    }

    try {
      setSubmitting(true)
      const body: CreateArticleBody = {
        title: title.trim(),
        slug: slug || generateSlugFromTitle(title),
        categoryID: categoryID,
        tags: tagSlugs,
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
      <Card className="overflow-hidden">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icons.plus className="w-5 h-5 text-blue-600" />
            新建文章
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent>
          <div className="space-y-4">
            {/* Title row */}
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
            {/* hint row */}
            <div className="text-xs text-gray-500">Slug 将自动生成：{slug || '（待生成）'}</div>

            {/* Editor */}
            <Editor value={content} onChange={setContent} placeholder="开始写作..." />

            <div className="flex items-center gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
              <Button type="button" onClick={onSubmit} disabled={!canSubmit || submitting}>
                {submitting ? (<><Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> 保存中...</>) : '发布'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}