"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Icons } from '@/components/icons'
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

  const indentLevel = level * 20

  return (
    <div className="select-none">
      {/* 分类节点 */}
      <div 
        className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md group cursor-pointer"
        style={{ paddingLeft: `${indentLevel + 8}px` }}
      >
        {/* 展开/折叠按钮 */}
        {(node.hasChildren || node.children.length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
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
        )}

        {/* 文件夹图标 */}
        <div className="flex-shrink-0">
          {node.isExpanded ? (
            <Icons.folderOpen className="h-4 w-4 text-blue-500" />
          ) : (
            <Icons.folder className="h-4 w-4 text-blue-500" />
          )}
        </div>

        {/* 分类名称 */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
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
              className="h-6 text-sm"
              autoFocus
            />
          ) : (
            <span 
              className="text-sm font-medium truncate"
              onDoubleClick={() => setIsRenaming(true)}
            >
              {node.name}
            </span>
          )}
        </div>

        {/* 操作菜单 */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Icons.moreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
                <Icons.folderPlus className="h-4 w-4 mr-2" />
                新建子分类
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                <Icons.edit className="h-4 w-4 mr-2" />
                重命名
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(node.categoryID)}
                className="text-red-600 dark:text-red-400"
              >
                <Icons.trash className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            <div style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onLoadMore(node.categoryID, 'children')}
                disabled={node.isLoading}
                className="text-xs text-gray-500 hover:text-gray-700"
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
                  className="flex items-center gap-2 py-1 px-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md"
                  style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
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
                <div style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onLoadMore(node.categoryID, 'articles')}
                    disabled={node.isLoading}
                    className="text-xs text-gray-500 hover:text-gray-700"
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
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建子分类</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="childName">分类名称</Label>
              <Input
                id="childName"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="请输入分类名称"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateChild()
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                取消
              </Button>
              <Button onClick={handleCreateChild} disabled={!childName.trim()}>
                创建
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
  const [categories, setCategories] = useState<CategoryTreeNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

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
      
      // 检查每个节点是否有子分类
      for (const node of treeNodes) {
        node.hasChildren = await categoryService.hasChildren(node.categoryID)
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
      
      // 检查新子分类是否还有子分类
      for (const child of newChildren) {
        child.hasChildren = await categoryService.hasChildren(child.categoryID)
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
  const handleCreateRootCategory = useCallback(async () => {
    if (!newCategoryName.trim()) return

    try {
      // 先获取根分类ID
      const rootResponse = await categoryService.getRootCategory()
      const rootCategoryID = rootResponse.category.categoryID

      await categoryService.createCategory({ 
        name: newCategoryName.trim(), 
        parentID: rootCategoryID 
      })
      
      toast.success('分类创建成功')
      setNewCategoryName('')
      setShowCreateDialog(false)
      
      // 重新加载整个分类树
      await loadInitialCategories()
    } catch (error) {
      console.error('创建分类失败:', error)
      toast.error('创建分类失败')
    }
  }, [newCategoryName, loadInitialCategories])

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
    if (!confirm('确定要删除这个分类吗？此操作不可撤销。')) {
      return
    }

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Categories</CardTitle>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {totalCount}
            </Badge>
          )}
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8">
              <Icons.plus className="h-4 w-4 mr-1" />
              新建
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建分类</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">分类名称</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="请输入分类名称"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateRootCategory()
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleCreateRootCategory} disabled={!newCategoryName.trim()}>
                  创建
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Icons.folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-4">还没有分类</p>
            <Button onClick={() => setShowCreateDialog(true)} size="sm">
              <Icons.plus className="h-4 w-4 mr-1" />
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
          </div>
        )}
      </CardContent>
    </Card>
  )
} 