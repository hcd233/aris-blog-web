'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  MoreHorizontal, 
  FileText, 
  Calendar, 
  User, 
  Heart, 
  MessageCircle,
  TrendingUp,
  Filter
} from 'lucide-react'
import { articleService } from '@/services/article.service'
import { categoryService } from '@/services/category.service'
import type { Article, ArticleStatus } from '@/types/api/article.types'
import type { Category } from '@/types/api/category.types'
import type { PageInfo } from '@/types/api/common.types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ArticleListProps {
  onEdit?: (article: Article) => void
  onCreate?: () => void
  onView?: (article: Article) => void
  showActions?: boolean
  compact?: boolean
}

export function ArticleList({ 
  onEdit, 
  onCreate, 
  onView, 
  showActions = true, 
  compact = false 
}: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 10, total: 0 })
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<ArticleStatus | ''>('')
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'views' | 'likes'>('updatedAt')

  // Load articles
  const loadArticles = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await articleService.listArticles({
        page,
        pageSize: pageInfo.pageSize
      })
      
      setArticles(response.articles)
      setPageInfo(response.pageInfo)
    } catch (error) {
      console.error('Failed to load articles:', error)
      toast.error('加载文章列表失败')
    } finally {
      setLoading(false)
    }
  }

  // Load categories for filter
  const loadCategories = async () => {
    try {
      const categories = await categoryService.getCategoryTree()
      setCategories(categories)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  useEffect(() => {
    loadArticles()
    loadCategories()
  }, [])

  // Handle article deletion
  const handleDelete = async (article: Article) => {
    try {
      await articleService.deleteArticle(article.articleID)
      toast.success('文章删除成功')
      loadArticles(pageInfo.page)
    } catch (error) {
      console.error('Failed to delete article:', error)
      toast.error('删除文章失败')
    }
  }

  // Handle status toggle
  const handleStatusToggle = async (article: Article) => {
    try {
      const newStatus: ArticleStatus = article.status === 'publish' ? 'draft' : 'publish'
      await articleService.updateArticleStatus(article.articleID, { status: newStatus })
      
      // Update local state
      setArticles(prev => prev.map(a => 
        a.articleID === article.articleID 
          ? { ...a, status: newStatus }
          : a
      ))
      
      toast.success(newStatus === 'publish' ? '文章已发布' : '文章已设为草稿')
    } catch (error) {
      console.error('Failed to update article status:', error)
      toast.error('更新文章状态失败')
    }
  }

  // Filter and sort articles
  const filteredArticles = articles
    .filter(article => {
      if (searchTerm && !article.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (selectedStatus && article.status !== selectedStatus) {
        return false
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'updatedAt':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'views':
          return b.views - a.views
        case 'likes':
          return b.likes - a.likes
        default:
          return 0
      }
    })

  const getStatusBadgeVariant = (status: ArticleStatus) => {
    return status === 'publish' ? 'default' : 'secondary'
  }

  const getStatusIcon = (status: ArticleStatus) => {
    return status === 'publish' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />
  }

  if (loading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">文章管理</h1>
          <p className="text-gray-600 mt-1">管理和编辑您的文章</p>
        </div>
        
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" />
            创建文章
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            筛选和搜索
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索文章标题..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">所有分类</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.categoryID} value={category.categoryID.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ArticleStatus | '')}>
              <SelectTrigger>
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">所有状态</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
                <SelectItem value="publish">已发布</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger>
                <SelectValue placeholder="排序方式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">最近更新</SelectItem>
                <SelectItem value="createdAt">创建时间</SelectItem>
                <SelectItem value="views">浏览量</SelectItem>
                <SelectItem value="likes">点赞数</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <div className="space-y-4">
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文章</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory || selectedStatus 
                  ? '没有找到符合条件的文章' 
                  : '开始创建您的第一篇文章吧'}
              </p>
              {onCreate && !searchTerm && !selectedCategory && !selectedStatus && (
                <Button onClick={onCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  创建文章
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredArticles.map((article) => (
            <Card key={article.articleID} className={cn(
              "transition-shadow hover:shadow-md",
              compact && "p-4"
            )}>
              <CardContent className={cn("p-6", compact && "p-4")}>
                <div className="flex items-start justify-between">
                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={cn(
                        "font-semibold text-gray-900 truncate",
                        compact ? "text-base" : "text-lg"
                      )}>
                        {article.title}
                      </h3>
                      <Badge 
                        variant={getStatusBadgeVariant(article.status)}
                        className="flex items-center gap-1 text-xs"
                      >
                        {getStatusIcon(article.status)}
                        {article.status === 'publish' ? '已发布' : '草稿'}
                      </Badge>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(article.updatedAt), 'yyyy年MM月dd日', { locale: zhCN })}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {article.views} 浏览
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {article.likes} 点赞
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {article.comments} 评论
                      </div>
                    </div>

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {article.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Slug */}
                    <p className="text-xs text-gray-500 font-mono">
                      /{article.slug}
                    </p>
                  </div>

                  {/* Actions */}
                  {showActions && (
                    <div className="flex items-center gap-2 ml-4">
                      {onView && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onView(article)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {onEdit && (
                            <DropdownMenuItem onClick={() => onEdit(article)}>
                              <Edit className="h-4 w-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuItem onClick={() => handleStatusToggle(article)}>
                            {article.status === 'publish' ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                设为草稿
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                发布
                              </>
                            )}
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除文章 "{article.title}" 吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(article)}
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {pageInfo.total > pageInfo.pageSize && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            显示 {Math.min((pageInfo.page - 1) * pageInfo.pageSize + 1, pageInfo.total)} 到{' '}
            {Math.min(pageInfo.page * pageInfo.pageSize, pageInfo.total)} 条，共 {pageInfo.total} 条
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pageInfo.page <= 1}
              onClick={() => loadArticles(pageInfo.page - 1)}
            >
              上一页
            </Button>
            
            <span className="text-sm text-gray-600">
              第 {pageInfo.page} 页，共 {Math.ceil(pageInfo.total / pageInfo.pageSize)} 页
            </span>
            
            <Button
              variant="outline"
              size="sm"
              disabled={pageInfo.page >= Math.ceil(pageInfo.total / pageInfo.pageSize)}
              onClick={() => loadArticles(pageInfo.page + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ArticleList