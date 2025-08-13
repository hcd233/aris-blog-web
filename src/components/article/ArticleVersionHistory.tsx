'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { TipTapEditor } from '@/components/editor/TipTapEditor'
import { 
  History, 
  Eye, 
  FileText, 
  Clock, 
  User, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw,
  GitBranch,
  Download
} from 'lucide-react'
import { articleService } from '@/services/article.service'
import type { Article, ArticleVersion } from '@/types/api/article.types'
import type { PageInfo } from '@/types/api/common.types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ArticleVersionHistoryProps {
  article: Article
  currentVersion?: ArticleVersion
  onVersionSelect?: (version: ArticleVersion) => void
  onRestore?: (version: ArticleVersion) => void
  showComparison?: boolean
}

export function ArticleVersionHistory({
  article,
  currentVersion,
  onVersionSelect,
  onRestore,
  showComparison = false
}: ArticleVersionHistoryProps) {
  const [versions, setVersions] = useState<ArticleVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<ArticleVersion | null>(null)
  const [compareVersion, setCompareVersion] = useState<ArticleVersion | null>(null)
  const [loading, setLoading] = useState(true)
  const [pageInfo, setPageInfo] = useState<PageInfo>({ page: 1, pageSize: 20, total: 0 })
  const [viewMode, setViewMode] = useState<'list' | 'preview' | 'compare'>('list')

  // Load versions
  const loadVersions = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await articleService.listArticleVersions({
        articleID: article.articleID,
        page,
        pageSize: pageInfo.pageSize
      })
      
      setVersions(response.versions)
      setPageInfo(response.pageInfo)
      
      // Select current version by default
      if (currentVersion && !selectedVersion) {
        setSelectedVersion(currentVersion)
      }
    } catch (error) {
      console.error('Failed to load versions:', error)
      toast.error('加载版本历史失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVersions()
  }, [article.articleID])

  // Handle version selection
  const handleVersionSelect = (version: ArticleVersion) => {
    setSelectedVersion(version)
    onVersionSelect?.(version)
    
    if (viewMode === 'list') {
      setViewMode('preview')
    }
  }

  // Handle version comparison
  const handleCompareToggle = (version: ArticleVersion) => {
    if (compareVersion?.versionID === version.versionID) {
      setCompareVersion(null)
      if (viewMode === 'compare') {
        setViewMode('preview')
      }
    } else {
      setCompareVersion(version)
      setViewMode('compare')
    }
  }

  // Handle version restoration
  const handleRestore = async (version: ArticleVersion) => {
    if (!onRestore) return
    
    try {
      // Create a new version with the content from the selected version
      const newVersion = await articleService.saveArticleContent(
        article.articleID, 
        version.content
      )
      
      onRestore(newVersion)
      toast.success(`已恢复到版本 ${version.version}`)
      
      // Reload versions to show the new version
      loadVersions()
    } catch (error) {
      console.error('Failed to restore version:', error)
      toast.error('恢复版本失败')
    }
  }

  // Get version difference count (simplified)
  const getVersionDiff = (v1: ArticleVersion, v2: ArticleVersion) => {
    const diff = Math.abs(v1.content.length - v2.content.length)
    return diff > 0 ? `${diff > 0 ? '+' : ''}${diff}` : '无变化'
  }

  // Get relative time
  const getRelativeTime = (date: string) => {
    const now = new Date()
    const versionDate = new Date(date)
    const diffInHours = (now.getTime() - versionDate.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return '刚刚'
    if (diffInHours < 24) return `${Math.floor(diffInHours)} 小时前`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} 天前`
    return format(versionDate, 'yyyy年MM月dd日', { locale: zhCN })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">加载版本历史中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            版本历史
          </h2>
          <p className="text-gray-600 mt-1">查看和管理文章的版本变更</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            版本列表
          </Button>
          
          {selectedVersion && (
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('preview')}
            >
              <Eye className="h-4 w-4 mr-2" />
              预览版本
            </Button>
          )}
          
          {showComparison && compareVersion && (
            <Button
              variant={viewMode === 'compare' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('compare')}
            >
              <FileText className="h-4 w-4 mr-2" />
              版本对比
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Version List */}
        <div className={cn(
          "space-y-4",
          viewMode === 'list' ? 'lg:col-span-12' : 'lg:col-span-4'
        )}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">版本列表</CardTitle>
              <CardDescription>
                共 {pageInfo.total} 个版本
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {versions.map((version, index) => (
                    <div
                      key={version.versionID}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedVersion?.versionID === version.versionID 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                        compareVersion?.versionID === version.versionID && 'ring-2 ring-green-500'
                      )}
                      onClick={() => handleVersionSelect(version)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            v{version.version}
                          </Badge>
                          
                          {currentVersion?.versionID === version.versionID && (
                            <Badge variant="default" className="text-xs">
                              当前版本
                            </Badge>
                          )}
                          
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              最新
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {showComparison && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleCompareToggle(version)
                              }}
                              title="选择对比版本"
                            >
                              <FileText className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {onRestore && currentVersion?.versionID !== version.versionID && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRestore(version)
                              }}
                              title="恢复到此版本"
                            >
                              <RotateCcw className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getRelativeTime(version.createdAt)}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {version.content.length.toLocaleString()} 字符
                        </div>
                        
                        {index < versions.length - 1 && (
                          <div className="text-xs text-gray-500">
                            与上一版本: {getVersionDiff(version, versions[index + 1])} 字符
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Pagination */}
              {pageInfo.total > pageInfo.pageSize && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageInfo.page <= 1}
                    onClick={() => loadVersions(pageInfo.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    第 {pageInfo.page} 页，共 {Math.ceil(pageInfo.total / pageInfo.pageSize)} 页
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageInfo.page >= Math.ceil(pageInfo.total / pageInfo.pageSize)}
                    onClick={() => loadVersions(pageInfo.page + 1)}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Version Preview */}
        {viewMode === 'preview' && selectedVersion && (
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>版本 {selectedVersion.version} 预览</span>
                  <Badge variant="outline">
                    {format(new Date(selectedVersion.createdAt), 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  内容长度: {selectedVersion.content.length.toLocaleString()} 字符
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TipTapEditor
                  content={selectedVersion.content}
                  editable={false}
                  className="border-none"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Version Comparison */}
        {viewMode === 'compare' && selectedVersion && compareVersion && (
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>版本对比</CardTitle>
                <CardDescription>
                  对比版本 {selectedVersion.version} 和版本 {compareVersion.version}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Version A */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">版本 {selectedVersion.version}</h4>
                      <Badge variant="outline" className="text-xs">
                        {selectedVersion.content.length.toLocaleString()} 字符
                      </Badge>
                    </div>
                    <div className="border rounded-lg max-h-96 overflow-auto">
                      <TipTapEditor
                        content={selectedVersion.content}
                        editable={false}
                        className="border-none"
                        minHeight="200px"
                      />
                    </div>
                  </div>

                  {/* Version B */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">版本 {compareVersion.version}</h4>
                      <Badge variant="outline" className="text-xs">
                        {compareVersion.content.length.toLocaleString()} 字符
                      </Badge>
                    </div>
                    <div className="border rounded-lg max-h-96 overflow-auto">
                      <TipTapEditor
                        content={compareVersion.content}
                        editable={false}
                        className="border-none"
                        minHeight="200px"
                      />
                    </div>
                  </div>
                </div>

                {/* Comparison Stats */}
                <Separator className="my-4" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.abs(selectedVersion.content.length - compareVersion.content.length)}
                    </div>
                    <div className="text-sm text-gray-600">字符差异</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.abs(selectedVersion.version - compareVersion.version)}
                    </div>
                    <div className="text-sm text-gray-600">版本差距</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.floor(
                        Math.abs(
                          new Date(selectedVersion.createdAt).getTime() - 
                          new Date(compareVersion.createdAt).getTime()
                        ) / (1000 * 60 * 60 * 24)
                      )}
                    </div>
                    <div className="text-sm text-gray-600">天数差异</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default ArticleVersionHistory