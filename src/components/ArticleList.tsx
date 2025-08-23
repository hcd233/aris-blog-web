"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { useArticles, useDeleteArticle, useUpdateArticleStatus } from "@/hooks";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
// import type { Article } from "@/types/dto";
import { ArticleStatus } from "@/types/dto/article.dto";
import { Eye } from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";
import { hasCreatorAccess } from "@/lib/permissions";

interface ArticleListProps {
  onTotalChange?: (total: number) => void;
  onCreateArticle?: () => void;
}

export default function ArticleList({ onTotalChange, onCreateArticle }: ArticleListProps) {
  // const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const [page, setPage] = useState(1);
  // const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: articlesResponse, isLoading, refetch } = useArticles({ 
    page, 
    pageSize: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const deleteArticleMutation = useDeleteArticle();
  const updateStatusMutation = useUpdateArticleStatus();

  const articles = articlesResponse?.articles || [];
  const total = articlesResponse?.pageInfo?.total || 0;
  const hasMore = articles.length < total;

  // const handleCreateSuccess = () => {
  //   refetch();
  //   onTotalChange?.(total + 1);
  // };

  const handleDeleteArticle = async (articleID: number) => {
    try {
      await deleteArticleMutation.mutateAsync(articleID);
      toast.success("Article deleted successfully");
      setDeleteConfirm(null);
      refetch();
      onTotalChange?.(total - 1);
    } catch (error) {
      console.error("Failed to delete article:", error);
      toast.error("Failed to delete article");
    }
  };

  const handleUpdateStatus = async (articleID: number, status: ArticleStatus) => {
    try {
      await updateStatusMutation.mutateAsync(articleID, status);
      toast.success(`Article ${status === ArticleStatus.PUBLISH ? 'published' : 'saved as draft'}`);
      refetch();
    } catch (error) {
      console.error("Failed to update article status:", error);
      toast.error("Failed to update article status");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 文章列表 */}
      {articles.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-700">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icons.fileText className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">
            暂无文章
          </h3>
          <p className="text-blue-600 dark:text-blue-400 mb-6">
            创建你的第一篇文章来开始写作
          </p>
          {hasCreatorAccess(currentUser?.permission) && (
            <Button
              onClick={onCreateArticle}
              className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Icons.plus className="w-4 h-4 mr-2" />
              创建第一篇文章
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* 文章卡片列表 */}
          <div className="grid gap-4">
            {articles.map((article) => (
              <Card key={article.articleID} className="hover:shadow-lg transition-shadow duration-200 border-2">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {article.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <Badge 
                          variant={article.status === ArticleStatus.PUBLISH ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {article.status}
                        </Badge>
                        <span>Slug: {article.slug}</span>
                        <span>ID: #{article.articleID}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Icons.heart className="w-3 h-3" />
                          {article.likes} likes
                        </div>
                        <div className="flex items-center gap-1">
                          <Icons.messageSquare className="w-3 h-3" />
                          {article.comments} comments
                        </div>
                      </div>

                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span>Created: {formatDate(article.createdAt)}</span>
                        {article.publishedAt && (
                          <span>Published: {formatDate(article.publishedAt)}</span>
                        )}
                      </div>
                    </div>

                    {hasCreatorAccess(currentUser?.permission) && (
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(article.articleID)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Icons.trash className="w-3 h-3" />
                        </Button>

                        {article.status === ArticleStatus.DRAFT && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateStatus(article.articleID, ArticleStatus.PUBLISH)}
                            className="h-8 text-xs"
                          >
                            Publish
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 加载更多按钮 */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
                className="border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 transition-all duration-200"
              >
                <Icons.chevronDown className="w-4 h-4 mr-2" />
                加载更多
              </Button>
            </div>
          )}

          {/* 新增文章按钮 - 仅限有权限的用户 */}
          {hasCreatorAccess(currentUser?.permission) && (
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={onCreateArticle}
                className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200"
              >
                <Icons.plus className="w-4 h-4 mr-2" />
                新增文章
              </Button>
            </div>
          )}
        </div>
      )}



      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
        title="确认删除文章"
        itemName={deleteConfirm ? articles.find(a => a.articleID === deleteConfirm)?.title : undefined}
        onConfirm={() => deleteConfirm && handleDeleteArticle(deleteConfirm)}
        loading={deleteArticleMutation.isLoading}
        variant="blue"
      />
    </div>
  );
}