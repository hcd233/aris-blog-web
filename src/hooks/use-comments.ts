"use client";

import { useState, useCallback } from "react";
import { listComments, createComment, deleteComment, doAction, undoAction } from "@/lib/api-config";
import type { ListedComment } from "@/lib/api/types.gen";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const PAGE_SIZE = 20;

// 一级评论的回复数缓存（parentID -> 回复总数）
type RepliesState = {
  comments: ListedComment[];
  total: number;
  page: number;
  hasMore: boolean;
  loading: boolean;
};

export function useComments(articleId: number) {
  const { isAuthenticated } = useAuth();

  // 一级评论状态
  const [comments, setComments] = useState<ListedComment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // 二级评论状态，按 parentID 索引
  const [repliesMap, setRepliesMap] = useState<Record<number, RepliesState>>({});

  // 提交中状态
  const [submitting, setSubmitting] = useState(false);

  // 获取一级评论（parentID=0）
  const fetchComments = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const { data, error } = await listComments({
        query: {
          articleID: articleId,
          parentID: 0,
          page: pageNum,
          pageSize: PAGE_SIZE,
          sort: "desc",
          sortField: "createdAt",
        },
      });
      if (error) {
        toast.error("获取评论失败");
        return;
      }
      if (data) {
        const newComments = data.comments ?? [];
        setComments(prev => append ? [...prev, ...newComments] : newComments);
        setTotal(data.pageInfo.total);
        setPage(pageNum);
        setHasMore(pageNum * PAGE_SIZE < data.pageInfo.total);
        setInitialLoaded(true);
      }
    } catch {
      toast.error("获取评论失败");
    } finally {
      setLoading(false);
    }
  }, [articleId, loading]);

  // 加载更多一级评论
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchComments(page + 1, true);
    }
  }, [fetchComments, hasMore, loading, page]);

  // 获取某条评论的二级回复
  const fetchReplies = useCallback(async (parentId: number, pageNum: number = 1, append: boolean = false) => {
    setRepliesMap(prev => ({
      ...prev,
      [parentId]: {
        ...prev[parentId],
        comments: prev[parentId]?.comments ?? [],
        total: prev[parentId]?.total ?? 0,
        page: prev[parentId]?.page ?? 1,
        hasMore: prev[parentId]?.hasMore ?? true,
        loading: true,
      },
    }));

    try {
      const { data, error } = await listComments({
        query: {
          articleID: articleId,
          parentID: parentId,
          page: pageNum,
          pageSize: PAGE_SIZE,
          sort: "asc",
          sortField: "createdAt",
        },
      });
      if (error) {
        toast.error("获取回复失败");
        return;
      }
      if (data) {
        const newReplies = data.comments ?? [];
        setRepliesMap(prev => ({
          ...prev,
          [parentId]: {
            comments: append ? [...(prev[parentId]?.comments ?? []), ...newReplies] : newReplies,
            total: data.pageInfo.total,
            page: pageNum,
            hasMore: pageNum * PAGE_SIZE < data.pageInfo.total,
            loading: false,
          },
        }));
      }
    } catch {
      toast.error("获取回复失败");
      setRepliesMap(prev => ({
        ...prev,
        [parentId]: {
          ...prev[parentId],
          comments: prev[parentId]?.comments ?? [],
          total: prev[parentId]?.total ?? 0,
          page: prev[parentId]?.page ?? 1,
          hasMore: prev[parentId]?.hasMore ?? true,
          loading: false,
        },
      }));
    }
  }, [articleId]);

  // 加载更多回复
  const loadMoreReplies = useCallback((parentId: number) => {
    const state = repliesMap[parentId];
    if (state && state.hasMore && !state.loading) {
      fetchReplies(parentId, state.page + 1, true);
    }
  }, [repliesMap, fetchReplies]);

  // 发布评论
  const submitComment = useCallback(async (content: string, parentID: number = 0) => {
    if (!isAuthenticated) {
      toast.error("请先登录", { description: "登录后即可评论" });
      return false;
    }
    if (!content.trim()) {
      toast.error("评论内容不能为空");
      return false;
    }

    setSubmitting(true);
    try {
      const { error } = await createComment({
        body: {
          articleID: articleId,
          parentID,
          content: content.trim(),
          images: null,
        },
      });
      if (error) {
        toast.error("发送评论失败");
        return false;
      }
      toast.success("评论成功");

      // 刷新对应列表
      if (parentID === 0) {
        await fetchComments(1, false);
      } else {
        await fetchReplies(parentID, 1, false);
        // 更新一级评论总数（需要重新获取）
        await fetchComments(1, false);
      }
      return true;
    } catch {
      toast.error("发送评论失败");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [articleId, isAuthenticated, fetchComments, fetchReplies]);

  // 删除评论
  const removeComment = useCallback(async (commentId: number, parentID: number = 0) => {
    try {
      const { error } = await deleteComment({
        query: { id: commentId },
      });
      if (error) {
        toast.error("删除评论失败");
        return;
      }
      toast.success("评论已删除");

      if (parentID === 0) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setTotal(prev => Math.max(0, prev - 1));
      } else {
        setRepliesMap(prev => {
          const state = prev[parentID];
          if (!state) return prev;
          return {
            ...prev,
            [parentID]: {
              ...state,
              comments: state.comments.filter(c => c.id !== commentId),
              total: Math.max(0, state.total - 1),
            },
          };
        });
        // 刷新一级评论以更新总数
        await fetchComments(1, false);
      }
    } catch {
      toast.error("删除评论失败");
    }
  }, [fetchComments]);

  // 点赞评论
  const toggleCommentLike = useCallback(async (commentId: number, currentLiked: boolean, parentID: number = 0) => {
    if (!isAuthenticated) {
      toast.error("请先登录", { description: "登录后即可点赞" });
      return;
    }

    const action = currentLiked ? undoAction : doAction;
    try {
      const { error } = await action({
        body: {
          actionType: "like",
          entityID: commentId,
          entityType: "comment",
        },
      });
      if (error) return;

      // 更新评论点赞状态
      const updateComment = (c: ListedComment): ListedComment => {
        if (c.id !== commentId) return c;
        return {
          ...c,
          liked: !currentLiked,
          likes: currentLiked ? Math.max(0, c.likes - 1) : c.likes + 1,
        };
      };

      if (parentID === 0) {
        setComments(prev => prev.map(updateComment));
      } else {
        setRepliesMap(prev => {
          const state = prev[parentID];
          if (!state) return prev;
          return {
            ...prev,
            [parentID]: {
              ...state,
              comments: state.comments.map(updateComment),
            },
          };
        });
      }
    } catch {
      toast.error("操作失败");
    }
  }, [isAuthenticated]);

  return {
    comments,
    total,
    hasMore,
    loading,
    initialLoaded,
    submitting,
    repliesMap,
    fetchComments,
    loadMore,
    fetchReplies,
    loadMoreReplies,
    submitComment,
    removeComment,
    toggleCommentLike,
  };
}
