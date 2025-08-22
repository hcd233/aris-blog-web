"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateItemDialog } from "@/components/ui/create-item-dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { tagService } from "@/services/tag.service";
import type { Tag } from "@/types/api/tag.types";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { Skeleton } from "@/components/ui/skeleton";

interface TagListProps {
  onTotalChange?: (total: number) => void;
}

export default function TagList({ onTotalChange }: TagListProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);


  const fetchTags = useCallback(async (currentPage = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await tagService.getTagList({
        page: currentPage,
        pageSize: 10, // 改为每页10条
      });

      if (append) {
        // 追加模式：将新数据添加到现有列表
        setTags((prev) => [...prev, ...response.tags]);
      } else {
        // 初始加载模式：替换整个列表
        setTags(response.tags);
      }

      const newTotal = response.pageInfo.total;
      setTotal(newTotal);
      setPage(currentPage);

      // 向父组件传递总数
      onTotalChange?.(newTotal);
    } catch (error: unknown) {
      console.error("获取标签列表失败:", error);
      const message = error instanceof Error ? error.message : "获取标签列表失败";
      toast.error(message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [onTotalChange]);

  const loadMoreTags = () => {
    fetchTags(page + 1, true);
  };

  // 判断是否还有更多标签可加载
  const hasMoreTags = tags.length < total;

  const handleCreateTag = async (formData: { name: string; slug?: string; description?: string }) => {
    if (!formData.name.trim() || !formData.slug?.trim()) {
      toast.error("标签名和slug不能为空");
      return;
    }

    try {
      setCreating(true);
      await tagService.createTag({
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description || ""
      });
      toast.success("标签创建成功");
      setShowCreateDialog(false);
      // 重新获取标签列表（重置到第一页）
      setPage(1);
      fetchTags(1, false);
    } catch (error: unknown) {
      console.error("创建标签失败:", error);
      const message = error instanceof Error ? error.message : "创建标签失败";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTag = async (tagID: number) => {
    try {
      setDeleting(true);
      await tagService.deleteTag(tagID);
      toast.success("标签删除成功");
      setDeleteConfirm(null);
      // 重新获取标签列表（重置到第一页）
      setPage(1);
      fetchTags(1, false);
    } catch (error: unknown) {
      console.error("删除标签失败:", error);
      const message = error instanceof Error ? error.message : "删除标签失败";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };


  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-7 w-24 rounded-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 标签网格 */}
      {tags.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border-2 border-dashed border-orange-200 dark:border-orange-700">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Icons.tag className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-2">
            暂无标签
          </h3>
          <p className="text-orange-600 dark:text-orange-400 mb-6">
            创建你的第一个标签来组织内容
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Icons.plus className="w-4 h-4 mr-2" />
            创建第一个标签
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {/* 现有标签 */}
            {tags.map((tag) => (
              <div key={tag.tagID} className="group relative">
                {/* 标签气泡 */}
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-700 hover:from-orange-100 hover:to-amber-100 hover:border-orange-300 hover:shadow-md pr-8 py-1.5 text-sm font-medium"
                >
                  <span className="font-semibold">{tag.name}</span>
                  <span className="ml-1.5 text-xs opacity-75 font-mono">
                    #{tag.slug}
                  </span>

                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(tag.tagID);
                    }}
                    className="absolute right-1.5 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 w-5 h-5 bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600 rounded-md flex items-center justify-center transition-all duration-200 transform hover:scale-110"
                  >
                    <Icons.x className="w-3 h-3" />
                  </button>
                </Badge>

                {/* 悬停显示描述 */}
                {tag.description && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap max-w-xs z-10">
                    {tag.description}
                    {/* 箭头 */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            ))}

            {/* 新增标签的特殊标签 */}
            <div className="group relative">
              <Badge
                variant="outline"
                className="cursor-pointer hover:scale-105 transition-all duration-200 border-2 border-dashed border-orange-300 text-orange-600 hover:border-orange-400 hover:text-orange-700 hover:bg-orange-50 py-1.5 text-sm font-medium bg-transparent"
                onClick={() => setShowCreateDialog(true)}
              >
                <Icons.plus className="w-3 h-3 mr-1.5" />
                <span className="font-medium">新增标签</span>
              </Badge>
            </div>
          </div>

          {/* 展开更多按钮 */}
          {hasMoreTags && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMoreTags}
                disabled={loadingMore}
                className="border-2 border-orange-300 text-orange-600 hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 transition-all duration-200"
              >
                {loadingMore ? (
                  <>
                    <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    加载中...
                  </>
                ) : (
                  <>
                    <Icons.chevronDown className="w-4 h-4 mr-2" />
                    展开更多
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* 统一创建标签对话框 */}
      <CreateItemDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        itemType="tag"
        onSubmit={handleCreateTag}
        loading={creating}
      />

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
        title="确认删除标签"
        itemName={deleteConfirm ? tags.find(tag => tag.tagID === deleteConfirm)?.name : undefined}
        onConfirm={() => deleteConfirm && handleDeleteTag(deleteConfirm)}
        loading={deleting}
        variant="orange"
      />
    </div>
  );
}
