'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { categoryService } from '@/services/category.service'
import { tagService } from '@/services/tag.service'
import { articleService } from '@/services/article.service'
import type { 
  Article, 
  ArticleVersion, 
  ArticleFormData, 
  ArticleStatus, 
  CreateArticleRequest 
} from '@/types/api/article.types'
import type { Category } from '@/types/api/category.types'
import type { Tag } from '@/types/api/tag.types'
import { toast } from 'sonner'
import { Save, Eye, FileText, Settings, Tag as TagIcon, X } from 'lucide-react'

// Form validation schema
const articleFormSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(100, '标题不能超过100个字符'),
  slug: z.string()
    .min(1, 'URL别名不能为空')
    .max(50, 'URL别名不能超过50个字符')
    .regex(/^[a-z0-9-]+$/, 'URL别名只能包含小写字母、数字和连字符'),
  categoryID: z.number().min(1, '请选择一个分类'),
  tags: z.array(z.string()).min(1, '至少需要一个标签'),
  content: z.string().min(100, '内容至少需要100个字符').max(20000, '内容不能超过20000个字符'),
  status: z.enum(['draft', 'publish'] as const)
})

type ArticleFormValues = z.infer<typeof articleFormSchema>

interface ArticleFormProps {
  article?: Article
  version?: ArticleVersion
  onSave?: (article: Article, version: ArticleVersion) => void
  onCancel?: () => void
  isLoading?: boolean
}

export function ArticleForm({ 
  article, 
  version, 
  onSave, 
  onCancel, 
  isLoading = false 
}: ArticleFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: article?.title || '',
      slug: article?.slug || '',
      categoryID: 0,
      tags: article?.tags || [],
      content: version?.content || '',
      status: article?.status || 'draft'
    }
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form

  const watchTitle = watch('title')
  const watchContent = watch('content')

  // Load categories and tags
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingData(true)
        const [categoriesResponse, tagsResponse] = await Promise.all([
          categoryService.getCategoryTree(),
          tagService.listTags({ page: 1, pageSize: 100 })
        ])
        
        setCategories(categoriesResponse)
        setTags(tagsResponse.tags)
        
        // Set selected tags if editing
        if (article?.tags) {
          setSelectedTags(article.tags)
          setValue('tags', article.tags)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        toast.error('加载数据失败')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadData()
  }, [article, setValue])

  // Auto-generate slug from title
  useEffect(() => {
    if (watchTitle && !article) { // Only auto-generate for new articles
      const slug = articleService.generateSlug(watchTitle)
      setValue('slug', slug)
    }
  }, [watchTitle, setValue, article])

  // Handle tag selection
  const handleTagSelect = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      const newSelectedTags = [...selectedTags, tagName]
      setSelectedTags(newSelectedTags)
      setValue('tags', newSelectedTags)
    }
  }

  // Handle tag removal
  const handleTagRemove = (tagName: string) => {
    const newSelectedTags = selectedTags.filter(tag => tag !== tagName)
    setSelectedTags(newSelectedTags)
    setValue('tags', newSelectedTags)
  }

  // Handle new tag creation
  const handleCreateTag = async () => {
    if (!newTag.trim()) return

    try {
      const tagData = {
        name: newTag.trim(),
        slug: articleService.generateSlug(newTag.trim()),
        description: ''
      }
      
      await tagService.createTag(tagData)
      
      // Add to tags list and select it
      const newTagObj = { ...tagData, tagID: Date.now(), userID: 0, likes: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setTags(prev => [...prev, newTagObj])
      handleTagSelect(newTag.trim())
      setNewTag('')
      toast.success('标签创建成功')
    } catch (error) {
      console.error('Failed to create tag:', error)
      toast.error('创建标签失败')
    }
  }

  // Handle form submission
  const onSubmit = async (data: ArticleFormValues) => {
    try {
      setIsSaving(true)
      
      if (article) {
        // Update existing article
        // First update metadata if changed
        const hasMetadataChanges = 
          data.title !== article.title ||
          data.slug !== article.slug ||
          data.categoryID !== article.categoryID

        if (hasMetadataChanges) {
          await articleService.updateArticle(article.articleID, {
            title: data.title,
            slug: data.slug,
            categoryID: data.categoryID
          })
        }

        // Save new version if content changed
        let newVersion = version
        if (data.content !== version?.content) {
          newVersion = await articleService.saveArticleContent(article.articleID, data.content)
        }

        // Update status if changed
        if (data.status !== article.status) {
          await articleService.updateArticleStatus(article.articleID, { status: data.status })
        }

        const updatedArticle: Article = {
          ...article,
          title: data.title,
          slug: data.slug,
          status: data.status,
          tags: data.tags,
          updatedAt: new Date().toISOString()
        }

        onSave?.(updatedArticle, newVersion!)
        toast.success('文章更新成功')
      } else {
        // Create new article
        const articleData: CreateArticleRequest = {
          title: data.title,
          slug: data.slug,
          categoryID: data.categoryID,
          tags: data.tags
        }

        const { article: newArticle, version: newVersion } = await articleService.createArticleWithContent(
          articleData,
          data.content
        )

        // Set status if not draft
        if (data.status === 'publish') {
          await articleService.publishArticle(newArticle.articleID)
        }

        onSave?.(newArticle, newVersion)
        toast.success('文章创建成功')
      }
    } catch (error) {
      console.error('Failed to save article:', error)
      toast.error(error instanceof Error ? error.message : '保存失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = () => {
    setValue('status', 'draft')
    handleSubmit(onSubmit)()
  }

  const handlePublish = () => {
    setValue('status', 'publish')
    handleSubmit(onSubmit)()
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {article ? '编辑文章' : '创建文章'}
            </h1>
            <p className="text-gray-600 mt-1">
              {article ? '修改文章内容和设置' : '创建一篇新文章'}
            </p>
          </div>
          
          <div className="flex gap-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isSaving}>
                取消
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              保存草稿
            </Button>
            <Button 
              type="button" 
              onClick={handlePublish}
              disabled={isSaving}
            >
              <Eye className="h-4 w-4 mr-2" />
              发布
            </Button>
          </div>
        </div>

        <Separator />

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              基本信息
            </CardTitle>
            <CardDescription>
              文章的标题、URL别名和分类
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  {...register('title')}
                  placeholder="输入文章标题"
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="slug">URL别名 *</Label>
                <Input
                  id="slug"
                  {...register('slug')}
                  placeholder="url-alias"
                  className={errors.slug ? 'border-red-500' : ''}
                />
                {errors.slug && (
                  <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="categoryID">分类 *</Label>
              <Select
                value={watch('categoryID')?.toString() || ''}
                onValueChange={(value) => setValue('categoryID', parseInt(value))}
              >
                <SelectTrigger className={errors.categoryID ? 'border-red-500' : ''}>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.categoryID} value={category.categoryID.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryID && (
                <p className="text-red-500 text-sm mt-1">{errors.categoryID.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="h-5 w-5" />
              标签
            </CardTitle>
            <CardDescription>
              为文章添加标签，便于分类和搜索
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => handleTagRemove(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}

            {/* Tag Selection */}
            <div className="flex flex-wrap gap-2">
              {tags
                .filter(tag => !selectedTags.includes(tag.name))
                .map((tag) => (
                  <Badge 
                    key={tag.tagID} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTagSelect(tag.name)}
                  >
                    {tag.name}
                  </Badge>
                ))}
            </div>

            {/* Create New Tag */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="创建新标签"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCreateTag())}
              />
              <Button type="button" onClick={handleCreateTag} disabled={!newTag.trim()}>
                添加
              </Button>
            </div>

            {errors.tags && (
              <p className="text-red-500 text-sm">{errors.tags.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>内容</CardTitle>
            <CardDescription>
              使用富文本编辑器编写文章内容
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TipTapEditor
              content={watchContent}
              onChange={(content) => setValue('content', content)}
              placeholder="开始写作..."
              minHeight="400px"
            />
            {errors.content && (
              <p className="text-red-500 text-sm mt-2">{errors.content.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              发布设置
            </CardTitle>
            <CardDescription>
              文章的发布状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="status">状态</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as ArticleStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="publish">已发布</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default ArticleForm