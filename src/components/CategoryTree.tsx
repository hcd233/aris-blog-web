"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CreateItemDialog } from '@/components/ui/create-item-dialog'
import { Input } from '@/components/ui/input'
import { hasCreatorAccess as checkCreatorAccess } from '@/lib/permissions'
// import { 
//   DropdownMenu, 
//   DropdownMenuContent, 
//   DropdownMenuItem, 
//   DropdownMenuTrigger 
// } from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog'
import { categoryService } from '@/services/category.service'
import type { 
  Category, 
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
  // hasCreatorAccess: boolean
}

const CategoryNode: React.FC<CategoryNodeProps> = ({
  node,
  level,
  onToggleExpand,
  onLoadMore,
  onCreateChild,
  onRename,
  onDelete,
  // hasCreatorAccess,
}) => {
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(node.name)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleRename = async () => {
    if (newName.trim() && newName !== node.name) {
      await onRename(node.categoryID, newName.trim())
    }
    setIsRenaming(false)
  }

  const handleCreateChild = async (parentID: number, name: string) => {
    await onCreateChild(parentID, name)
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
        className="flex items-center gap-1 py-1 px-1 group hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md"
        style={{ paddingLeft: `${indentLevel + 4}px` }}
      >
        {/* 展开/折叠按钮占位 */}
        <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
          {(node.hasChildren || node.children.length > 0) ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-purple-100"
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
          ) : null}
        </div>

        {/* 分类Badge - 文件系统风格 */}
        <div className="relative flex items-center flex-1">
          {isRenaming ? (
            <div className="flex-1 px-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename()
                  if (e.key === 'Escape') {
                    setNewName(node.name)
                    setIsRenaming(false)
                  }
                }}
                className="h-7 text-sm border-purple-200 focus:border-purple-400 focus:ring-purple-400/20 bg-white shadow-sm rounded-md"
                autoFocus
              />
            </div>
          ) : (
            <>
              <div className="group/badge relative">
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:scale-[1.02] transition-all duration-200 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-purple-700 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 hover:shadow-sm pr-16 py-1 text-sm font-medium group-hover:pr-20"
                  onDoubleClick={() => setIsRenaming(true)}
                >
                  <Icons.folder className="w-3 h-3 mr-1.5 text-purple-500 group-hover:text-purple-600 transition-colors" />
                  <span className="font-semibold group-hover:text-purple-800 transition-colors">{node.name}</span>
                  <span className="ml-1.5 text-xs opacity-70 font-mono group-hover:opacity-90 transition-opacity">
                    #{node.categoryID}
                  </span>
                </Badge>

                {/* Quick action buttons that appear on hover */}
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/badge:opacity-100 transition-all duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateDialog(true);
                    }}
                    className="w-4 h-4 bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 rounded-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Add subcategory"
                  >
                    <Icons.plus className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                    className="w-4 h-4 bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600 rounded-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
                    title="Delete category"
                  >
                    <Icons.x className="w-2.5 h-2.5" />
                  </button>
                </div>

              </div>

              {/* 子分类总数显示 */}
              {node.childrenPageInfo && node.childrenPageInfo.total > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 text-xs bg-purple-100 text-purple-700 border-purple-200 px-1.5 py-0.5"
                >
                  {node.childrenPageInfo.total}
                </Badge>
              )}
            </>
          )}
        </div>

      </div>

      {/* 子分类 */}
      {node.isExpanded && (
        <div>
          {node.children.map((child) => (
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

          {/* 加载更多子分类按钮 */}
          {node.childrenPageInfo && 
           node.children.length < node.childrenPageInfo.total && (
            <div style={{ paddingLeft: `${(level + 1) * 16 + 20}px` }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoadMore(node.categoryID, 'children')}
                disabled={node.isLoading}
                className="text-xs text-gray-500 hover:text-gray-700 h-6"
              >
                {node.isLoading ? (
                  <>
                    <Icons.spinner className="h-3 w-3 mr-1 animate-spin" />
                    加载中...
                  </>
                ) : (
                  '加载更多分类...'
                )}
              </Button>
            </div>
          )}

          {/* 文章列表 */}
          {node.articles && node.articles.length > 0 && (
            <div>
              {node.articles.map((article) => (
                <div
                  key={article.articleID}
                  className="flex items-center gap-2 py-1 px-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                  style={{ paddingLeft: `${(level + 1) * 16 + 20}px` }}
                >
                  <Icons.file className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {article.title}
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {article.status}
                  </Badge>
                </div>
              ))}

              {/* 加载更多文章按钮 */}
              {node.articlesPageInfo && 
               node.articles.length < node.articlesPageInfo.total && (
                <div style={{ paddingLeft: `${(level + 1) * 16 + 20}px` }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLoadMore(node.categoryID, 'articles')}
                    disabled={node.isLoading}
                    className="text-xs text-gray-500 hover:text-gray-700 h-6"
                  >
                    {node.isLoading ? (
                      <>
                        <Icons.spinner className="h-3 w-3 mr-1 animate-spin" />
                        加载中...
                      </>
                    ) : (
                      '加载更多文章...'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 创建子分类对话框 */}
      <CreateItemDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        itemType="category"
        onSubmit={async (formData) => {
          await handleCreateChild(node.categoryID, formData.name)
          setShowCreateDialog(false)
        }}
        parentName={node.name}
      />

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

// 工具函数：根据ID查找节点
const findNodeById = (nodes: CategoryTreeNode[], id: number): CategoryTreeNode | null => {
  for (const node of nodes) {
    if (node.categoryID === id) {
      return node
    }
    if (node.children.length > 0) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 主分类树组件
export const CategoryTree: React.FC = () => {
  const { data: currentUser } = useCurrentUser()
  const [categories, setCategories] = useState<CategoryTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // 将Category转换为CategoryTreeNode
  const convertToTreeNode = (category: Category): CategoryTreeNode => ({
    ...category,
    isExpanded: false,
    isLoading: false,
    hasChildren: false,
    hasLoadedChildren: false,
    children: [],
    hasLoadedArticles: false,
  })

  // 初始化加载分类树
  const loadInitialCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const categories = await categoryService.getCategoryTree()
      const treeNodes = categories.map(convertToTreeNode)
      
      // 优化：检查分类是否有子分类并预加载第一页数据（避免重复请求）
      for (const node of treeNodes) {
        const result = await categoryService.checkAndGetChildren(node.categoryID, 10)
        node.hasChildren = result.hasChildren
        
        // 如果有子分类，使用已加载的数据
        if (result.hasChildren && result.children) {
          node.childrenPageInfo = result.children.pageInfo
        }
      }
      
      setCategories(treeNodes)
      setTotalCount(categories.length)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载分类失败')
      toast.error('加载分类失败')
    } finally {
      setLoading(false)
    }
  }, [])

  // 切换展开/折叠状态
  const handleToggleExpand = async (categoryID: number) => {
    setCategories(prev => {
      const updateNode = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
        return nodes.map(node => {
          if (node.categoryID === categoryID) {
            const isExpanding = !node.isExpanded
            
            // 如果是展开且还没加载过子内容，则需要加载
            if (isExpanding && !node.hasLoadedChildren) {
              // 异步加载子内容
              setTimeout(() => {
                loadCategoryChildren(categoryID)
                loadCategoryArticles(categoryID)
              }, 0)
            }
            
            return { ...node, isExpanded: isExpanding }
          }
          
          if (node.children.length > 0) {
            return { ...node, children: updateNode(node.children) }
          }
          
          return node
        })
      }
      
      return updateNode(prev)
    })
  }

  // 加载子分类
  const loadCategoryChildren = useCallback(async (categoryID: number, page = 1) => {
    try {
      // 设置加载状态
      setCategories(prev => {
        const updateNode = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
          return nodes.map(node => {
            if (node.categoryID === categoryID) {
              return { ...node, isLoading: true }
            }
            if (node.children.length > 0) {
              return { ...node, children: updateNode(node.children) }
            }
            return node
          })
        }
        return updateNode(prev)
      })

      const response = await categoryService.getCategoryChildren({ 
        categoryID, 
        page, 
        pageSize: 10 
      })

      const newChildren = response.categories.map(convertToTreeNode)
      
      // 优化：使用更高效的方式检查子分类（避免立即检查，采用懒加载方式）
      // 默认设置为 false，当用户展开时再检查
      for (const child of newChildren) {
        child.hasChildren = false // 初始设为false，展开时再检查
      }

      setCategories(prev => {
        const updateNode = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
          return nodes.map(node => {
            if (node.categoryID === categoryID) {
              const existingChildren = page === 1 ? [] : node.children
              return {
                ...node,
                isLoading: false,
                hasLoadedChildren: true,
                children: [...existingChildren, ...newChildren],
                childrenPageInfo: response.pageInfo,
              }
            }
            if (node.children.length > 0) {
              return { ...node, children: updateNode(node.children) }
            }
            return node
          })
        }
        return updateNode(prev)
      })
    } catch (error) {
      console.error('加载子分类失败:', error)
      toast.error('加载子分类失败')
      
      // 移除加载状态
      setCategories(prev => {
        const updateNode = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
          return nodes.map(node => {
            if (node.categoryID === categoryID) {
              return { ...node, isLoading: false }
            }
            if (node.children.length > 0) {
              return { ...node, children: updateNode(node.children) }
            }
            return node
          })
        }
        return updateNode(prev)
      })
    }
  }, [])

  // 加载分类下的文章
  const loadCategoryArticles = useCallback(async (categoryID: number, page = 1) => {
    try {
      const response = await categoryService.getCategoryArticles({ 
        categoryID, 
        page, 
        pageSize: 10 
      })

      setCategories(prev => {
        const updateNode = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
          return nodes.map(node => {
            if (node.categoryID === categoryID) {
              const existingArticles = page === 1 ? [] : (node.articles || [])
              return {
                ...node,
                hasLoadedArticles: true,
                articles: [...existingArticles, ...response.articles],
                articlesPageInfo: response.pageInfo,
              }
            }
            if (node.children.length > 0) {
              return { ...node, children: updateNode(node.children) }
            }
            return node
          })
        }
        return updateNode(prev)
      })
    } catch (error) {
      console.error('加载分类文章失败:', error)
    }
  }, [])

  // 加载更多（子分类或文章）
  const handleLoadMore = async (categoryID: number, type: 'children' | 'articles') => {
    // 重新查找节点以获取最新状态
    const targetNode = findNodeById(categories, categoryID)
    if (!targetNode) return

    if (type === 'children' && targetNode.childrenPageInfo) {
      // 计算下一页：当前已加载的数量 / 页面大小 + 1
      const nextPage = Math.floor(targetNode.children.length / 10) + 1
      await loadCategoryChildren(categoryID, nextPage)
    } else if (type === 'articles' && targetNode.articlesPageInfo && targetNode.articles) {
      // 计算下一页：当前已加载的数量 / 页面大小 + 1
      const nextPage = Math.floor(targetNode.articles.length / 10) + 1
      await loadCategoryArticles(categoryID, nextPage)
    }
  }

  // 创建子分类
  const handleCreateChild = useCallback(async (parentID: number, name: string) => {
    try {
      await categoryService.createCategory({ name, parentID })
      toast.success('分类创建成功')
      
      // 重新加载父分类的子分类
      await loadCategoryChildren(parentID, 1)
    } catch (error) {
      console.error('创建分类失败:', error)
      toast.error('创建分类失败')
    }
  }, [loadCategoryChildren])

  // 创建根级分类
  const handleCreateRootCategory = useCallback(async (formData: { name: string }) => {
    if (!formData.name.trim()) return

    try {
      // 先获取根分类ID
      const rootResponse = await categoryService.getRootCategory()
      const rootCategoryID = rootResponse.category.categoryID

      await categoryService.createCategory({ 
        name: formData.name.trim(), 
        parentID: rootCategoryID 
      })
      
      toast.success('分类创建成功')
      setShowCreateDialog(false)
      
      // 重新加载整个分类树
      await loadInitialCategories()
    } catch (error) {
      console.error('创建分类失败:', error)
      toast.error('创建分类失败')
    }
  }, [loadInitialCategories])

  // 重命名分类
  const handleRename = useCallback(async (categoryID: number, newName: string) => {
    try {
      await categoryService.updateCategory(categoryID, { name: newName })
      
      setCategories(prev => {
        const updateNode = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
          return nodes.map(node => {
            if (node.categoryID === categoryID) {
              return { ...node, name: newName }
            }
            if (node.children.length > 0) {
              return { ...node, children: updateNode(node.children) }
            }
            return node
          })
        }
        return updateNode(prev)
      })
      
      toast.success('分类重命名成功')
    } catch (error) {
      console.error('重命名分类失败:', error)
      toast.error('重命名分类失败')
    }
  }, [])

  // 删除分类
  const handleDelete = useCallback(async (categoryID: number) => {
    try {
      await categoryService.deleteCategory(categoryID)
      
      setCategories(prev => {
        const removeNode = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
          return nodes.filter(node => {
            if (node.categoryID === categoryID) {
              return false
            }
            if (node.children.length > 0) {
              node.children = removeNode(node.children)
            }
            return true
          })
        }
        return removeNode(prev)
      })
      
      setTotalCount(prev => prev - 1)
      toast.success('分类删除成功')
    } catch (error) {
      console.error('删除分类失败:', error)
      toast.error('删除分类失败')
    }
  }, [])

  useEffect(() => {
    loadInitialCategories()
  }, [loadInitialCategories])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Icons.spinner className="h-6 w-6 animate-spin mr-2" />
            <span>加载分类中...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <Icons.alertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
            <Button variant="outline" onClick={loadInitialCategories} className="mt-2">
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icons.folder className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-lg">Categories</CardTitle>
          </div>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
              {totalCount}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">Organize your content</p>
      </CardHeader>
      <Separator />
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-700 hover:border-purple-300 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg transform hover:scale-110 transition-transform duration-300">
              <Icons.folder className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-2">
              暂无分类
            </h3>
            <p className="text-purple-600 dark:text-purple-400 mb-6">
              创建你的第一个分类来组织内容
            </p>
                      {checkCreatorAccess(currentUser?.permission) && (
            <Button
              className="bg-purple-500 hover:bg-purple-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 group"
              onClick={() => setShowCreateDialog(true)}
            >
              <Icons.plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
              创建第一个分类
            </Button>
          )}
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
                // hasCreatorAccess={checkCreatorAccess(currentUser?.permission)}
              />
            ))}
            
            {/* 新增分类按钮 - 类似tag样式 - 仅限有权限的用户 */}
            {checkCreatorAccess(currentUser?.permission) && (
              <div className="py-1 px-1" style={{ paddingLeft: '4px' }}>
                <div 
                  className="inline-flex items-center justify-start gap-1 px-3 py-2 text-sm font-medium bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-dashed border-purple-200 text-purple-600 rounded-lg cursor-pointer hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 hover:text-purple-700 hover:shadow-md transition-all duration-300 hover:scale-[1.02] w-fit group/add-button"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <div className="w-4 h-4 flex items-center justify-center transform group-hover/add-button:rotate-90 transition-transform duration-300">
                    <Icons.plus className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-medium">新增分类</span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* 统一创建分类对话框 */}
      <CreateItemDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        itemType="category"
        onSubmit={handleCreateRootCategory}
      />
    </Card>
  )
} 