"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/form-field";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { tagService } from "@/services/tag.service";
import type { Tag, CreateTagBody } from "@/types/api/tag.types";
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

  // 创建标签表单状态
  const [createForm, setCreateForm] = useState<CreateTagBody>({
    name: "",
    slug: "",
    description: "",
  });

  const fetchTags = useCallback(async (currentPage = 1, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const response = await tagService.getTagList({
        page: currentPage,
        pageSize: 10,
      });

      if (append) {
        setTags((prev) => [...prev, ...response.tags]);
      } else {
        setTags(response.tags);
      }

      const newTotal = response.pageInfo.total;
      setTotal(newTotal);
      setPage(currentPage);

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

  const hasMoreTags = tags.length < total;

  const handleCreateTag = async () => {
    if (!createForm.name.trim() || !createForm.slug.trim()) {
      toast.error("标签名和slug不能为空");
      return;
    }

    try {
      setCreating(true);
      await tagService.createTag(createForm);
      toast.success("标签创建成功");
      setShowCreateDialog(false);
      setCreateForm({ name: "", slug: "", description: "" });
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

  const handleNameChange = (name: string) => {
    setCreateForm((prev) => ({
      ...prev,
      name,
      slug: name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]/g, ""),
    }));
  };

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  if (loading) {
    return (
      <Card className="glass card-hover">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Icons.tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Tags</CardTitle>
              <CardDescription>Label your articles</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator className="mb-6" />
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-7 w-24 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Icons.tag className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Tags</CardTitle>
              <CardDescription>Label your articles</CardDescription>
            </div>
          </div>
          {total > 0 && (
            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 border-orange-200">
              {total}
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator className="mb-6" />
      <CardContent>
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
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Icons.plus className="w-4 h-4 mr-2" />
              创建第一个标签
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <div key={tag.tagID} className="group relative">
                  <Badge
                    variant="secondary"
                    className="cursor-pointer hover:scale-105 transition-all duration-200 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-orange-700 hover:from-orange-100 hover:to-amber-100 hover:border-orange-300 hover:shadow-md pr-8 py-1.5 text-sm font-medium"
                  >
                    <span className="font-semibold">{tag.name}</span>
                    <span className="ml-1.5 text-xs opacity-75 font-mono">
                      #{tag.slug}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(tag.tagID);
                      }}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 w-4 h-4 bg-red-100 hover:bg-red-200 text-red-500 hover:text-red-600 rounded-sm flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <Icons.x className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                </div>
              ))}
            </div>

            {/* 加载更多按钮 */}
            {hasMoreTags && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMoreTags}
                  disabled={loadingMore}
                  className="btn-modern border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                >
                  {loadingMore ? (
                    <>
                      <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                      加载中...
                    </>
                  ) : (
                    <>
                      <Icons.chevronDown className="w-4 h-4 mr-2" />
                      加载更多
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* 新增标签按钮 */}
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(true)}
                className="btn-modern border-2 border-dashed border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-all duration-200"
              >
                <Icons.plus className="w-4 h-4 mr-2" />
                新增标签
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>

    {/* 创建标签对话框 */}
    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">创建新标签</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            填写标签信息，slug会根据标签名自动生成
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <InputField
            id="name"
            label="标签名"
            required
            placeholder="输入标签名"
            value={createForm.name}
            onChange={(e) => handleNameChange(e.target.value)}
          />
          <InputField
            id="slug"
            label="Slug"
            required
            placeholder="标签slug"
            value={createForm.slug}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, slug: e.target.value }))
            }
            className="font-mono text-sm"
          />
          <TextareaField
            id="description"
            label="描述"
            placeholder="标签描述（可选）"
            value={createForm.description}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            rows={3}
          />
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCreateDialog(false)}
            disabled={creating}
            className="border-2 border-gray-300 hover:bg-gray-100 transition-colors"
          >
            取消
          </Button>
          <Button
            onClick={handleCreateTag}
            disabled={creating}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            {creating ? (
              <>
                <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                创建中...
              </>
            ) : (
              "创建标签"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

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
  </>
  );
}
