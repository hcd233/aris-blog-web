"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
 } from '@/components/ui/dialog'
import { InputField } from '@/components/ui/form-field'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { categoryService } from '@/services/category.service'
import type { 
  CategoryTreeNode
} from '@/types/api/category.types'

// 单个分类节点组件
interface CategoryNodeProps {
  node: CategoryTreeNode
  level: number
  onToggleExpand: (categoryID: number) => void
  onLoadMore: (categoryID: number, type: 'children' | 'articles') => void
  onCreateChild: (parentID: number, name: string) => void
  onRename: (categoryID: number, newName: string) => void
  onDelete: (categoryID: number) => void
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  node,
  level,
  onToggleExpand,
  onLoadMore,
  onCreateChild,
  onRename,
  onDelete,
}) => {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(node.name)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [childName, setChildName] = useState('')

  const handleRename = async () => {
    if (newName.trim() && newName !== node.name) {
      await onRename(node.categoryID, newName.trim())
    }
    setIsRenaming(false)
  }

  const handleCreateChild = async () => {
    if (childName.trim()) {
      await onCreateChild(node.categoryID, childName.trim())
      setChildName('')
      setShowCreateDialog(false)
    }
  }

  const handleDeleteConfirm = async () => {
    await onDelete(node.categoryID)
    setShowDeleteDialog(false)
  }

  const indentLevel = level * 16

  return (
    <div className="select-none">
      {/* 分类节点 - 文件系统风格 */}
      <div 
        className="flex items-center gap-1 py-1 px-1 group hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors duration-200"
        style={{ paddingLeft: `${indentLevel + 4}px` }}
      >
        {/* 展开/折叠按钮占位 */}
        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
          {(node.hasChildren || (node.children && node.children.length > 0)) ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors duration-200"
              onClick={() => onToggleExpand(node.categoryID)}
              disabled={node.isLoading}
            >
              {node.isLoading ? (
                <Icons.spinner className="h-3 w-3 animate-spin" />
              ) : node.isExpanded ? (
                <Icons.chevronDown className="h-3 w-3" />
              ) : (
                <Icons.chevronRight className="h-3 w-3" />
              )}
            </Button>
          ) : (
            <div className="w-4 h-4" />
          )}
        </div>

        {/* 分类图标 */}
        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
          {node.isExpanded ? (
            <Icons.folderOpen className="w-4 h-4 text-purple-600" />
          ) : (
            <Icons.folder className="w-4 h-4 text-purple-600" />
          )}
        </div>

        {/* 分类名称 */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename()
                  if (e.key === 'Escape') setIsRenaming(false)
                }}
                onBlur={handleRename}
                className="h-6 text-sm border-purple-200 focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
                autoFocus
              />
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-200">
              {node.name}
            </span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-purple-100 dark:hover:bg-purple-800"
              >
                <Icons.moreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
                <Icons.plus className="w-3 h-3 mr-2" />
                添加子分类
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                <Icons.edit className="w-3 h-3 mr-2" />
                重命名
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Icons.trash className="w-3 h-3 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 子分类 */}
      {node.isExpanded && node.children && node.children.length > 0 && (
        <div className="ml-4">
          {node.children && node.children.map((child) => (
            <CategoryNode
              key={child.categoryID}
              node={child}
              level={level + 1}
              onToggleExpand={onToggleExpand}
              onLoadMore={onLoadMore}
              onCreateChild={onCreateChild}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* 文章列表 */}
      {node.isExpanded && node.articles && node.articles.length > 0 && (
        <div className="ml-8 space-y-1">
          {node.articles && node.articles.map((article) => (
            <div
              key={article.articleID}
              className="flex items-center gap-2 py-1 px-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors duration-200"
            >
              <Icons.fileText className="w-3 h-3 text-blue-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {article.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 加载更多按钮 */}
      {node.isExpanded && (
        <div className="ml-8">
          {node.hasMoreChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-800"
              onClick={() => onLoadMore(node.categoryID, 'children')}
              disabled={node.isLoading}
            >
              {node.isLoading ? (
                <Icons.spinner className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Icons.chevronDown className="h-3 w-3 mr-1" />
              )}
              加载更多子分类
            </Button>
          )}
          {node.hasMoreArticles && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800"
              onClick={() => onLoadMore(node.categoryID, 'articles')}
              disabled={node.isLoading}
            >
              {node.isLoading ? (
                <Icons.spinner className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Icons.chevronDown className="h-3 w-3 mr-1" />
              )}
              加载更多文章
            </Button>
          )}
        </div>
      )}

      {/* 创建子分类对话框 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">创建子分类</DialogTitle>
          </DialogHeader>
                      <div className="space-y-4 py-4">
              <InputField
                id="childCategoryName"
                label="分类名称"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="请输入子分类名称"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateChild()
                }}
              />
            </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              className="border-2 border-gray-300 hover:bg-gray-100 transition-colors"
            >
              取消
            </Button>
            <Button 
              onClick={handleCreateChild} 
              disabled={!childName.trim()}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Icons.plus className="w-4 h-4 mr-2" />
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="确认删除分类"
        itemName={node.name}
        onConfirm={handleDeleteConfirm}
        variant="purple"
      />
    </div>
  )
}

// 主组件
export function CategoryTree() {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creating, setCreating] = useState(false)
  const [totalCount, setTotalCount] = useState(0)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await categoryService.getCategoryTree()
      // 将 Category 转换为 CategoryTreeNode，确保 children 数组被初始化
      const treeNodes: CategoryTreeNode[] = response.categories.map(cat => ({
        ...cat,
        isExpanded: false,
        isLoading: false,
        hasChildren: false,
        hasLoadedChildren: false,
        hasMoreChildren: false,
        hasMoreArticles: false,
        children: [],
        hasLoadedArticles: false,
        articles: []
      }))
      setCategories(treeNodes)
      setTotalCount(response.totalCount || 0)
    } catch (error) {
      console.error('获取分类树失败:', error)
      toast.error('获取分类树失败')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleToggleExpand = useCallback(async (categoryID: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.categoryID === categoryID) {
        return { ...cat, isExpanded: !cat.isExpanded }
      }
      return cat
    }))
  }, [])

  const handleLoadMore = useCallback(async (categoryID: number, type: 'children' | 'articles') => {
    // 实现加载更多逻辑
    console.log('Loading more:', type, 'for category:', categoryID)
  }, [])

  const handleCreateRootCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      setCreating(true)
      await categoryService.createCategory({
        name: newCategoryName.trim(),
        parentID: 0
      })
      toast.success('分类创建成功')
      setShowCreateDialog(false)
      setNewCategoryName('')
      fetchCategories()
    } catch (error) {
      console.error('创建分类失败:', error)
      toast.error('创建分类失败')
    } finally {
      setCreating(false)
    }
  }

  const handleCreateChild = useCallback(async (parentID: number, name: string) => {
    try {
      await categoryService.createCategory({
        name,
        parentID
      })
      toast.success('子分类创建成功')
      fetchCategories()
    } catch (error) {
      console.error('创建子分类失败:', error)
      toast.error('创建子分类失败')
    }
  }, [fetchCategories])

  const handleRename = useCallback(async (categoryID: number, newName: string) => {
    try {
      await categoryService.updateCategory(categoryID, { name: newName })
      toast.success('分类重命名成功')
      fetchCategories()
    } catch (error) {
      console.error('重命名分类失败:', error)
      toast.error('重命名分类失败')
    }
  }, [fetchCategories])

  const handleDelete = useCallback(async (categoryID: number) => {
    try {
      await categoryService.deleteCategory(categoryID)
      toast.success('分类删除成功')
      fetchCategories()
    } catch (error) {
      console.error('删除分类失败:', error)
      toast.error('删除分类失败')
    }
  }, [fetchCategories])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  if (loading) {
    return (
      <Card className="glass card-hover">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Icons.folder className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Categories</CardTitle>
              <CardDescription>Organize your content</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="mb-6" />
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="glass card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
              <Icons.folder className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Categories</CardTitle>
              <CardDescription>Organize your content</CardDescription>
            </div>
          </div>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 border-purple-200">
              {totalCount}
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-700">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Icons.folder className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
              暂无分类
            </h3>
            <p className="text-purple-600 dark:text-purple-400 mb-6">
              创建你的第一个分类来组织内容
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Icons.plus className="w-4 h-4 mr-2" />
              创建第一个分类
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map((category) => (
              <CategoryNode
                key={category.categoryID}
                node={category}
                level={0}
                onToggleExpand={handleToggleExpand}
                onLoadMore={handleLoadMore}
                onCreateChild={handleCreateChild}
                onRename={handleRename}
                onDelete={handleDelete}
              />
            ))}
            
            {/* 新增分类按钮 */}
            <div className="py-1 px-1" style={{ paddingLeft: '4px' }}>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(true)}
                className="inline-flex items-center justify-start gap-1 px-2 py-1 text-sm font-medium bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-dashed border-purple-200 text-purple-600 rounded-md cursor-pointer hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 hover:text-purple-700 transition-all duration-200 hover:scale-[1.02] w-fit"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <Icons.plus className="w-3 h-3" />
                </div>
                <span className="text-sm">新增分类</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* 创建分类对话框 */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">创建分类</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <InputField
            id="categoryName"
            label="分类名称"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="请输入分类名称"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateRootCategory()
            }}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowCreateDialog(false)}
            className="border-2 border-gray-300 hover:bg-gray-100 transition-colors"
          >
            取消
          </Button>
          <Button 
            onClick={handleCreateRootCategory} 
            disabled={!newCategoryName.trim() || creating}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {creating ? (
              <>
                <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                创建中...
              </>
            ) : (
              "创建"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  )
} 