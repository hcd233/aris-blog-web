"use client";

import { useState, useCallback } from "react";
import { listComments, createComment, deleteComment, doAction, undoAction, countComments } from "@/lib/api-config";
import type { ListedComment } from "@/lib/api/types.gen";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const PAGE_SIZE = 20;
// 子评论默认展示条数
const DEFAULT_REPLIES_PREVIEW = 4;

export type RepliesState = {
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

  // 获取某条一级评论的所有回复（通过 rootID 筛选）
  const fetchReplies = useCallback(async (rootId: number, pageNum: number = 1, append: boolean = false, pageSize: number = PAGE_SIZE) => {
    setRepliesMap(prev => ({
      ...prev,
      [rootId]: {
        ...prev[rootId],
        comments: prev[rootId]?.comments ?? [],
        total: prev[rootId]?.total ?? 0,
        page: prev[rootId]?.page ?? 1,
        hasMore: prev[rootId]?.hasMore ?? true,
        loading: true,
      },
    }));

    try {
      // 使用 rootID 获取所有属于该一级评论的回复
      const { data, error } = await listComments({
        query: {
          articleID: articleId,
          rootID: rootId,
          page: pageNum,
          pageSize,
          sort: "asc",
          sortField: "createdAt",
        },
      });
      
      if (error) {
        toast.error("获取回复失败");
        setRepliesMap(prev => ({
          ...prev,
          [rootId]: {
            ...prev[rootId],
            comments: prev[rootId]?.comments ?? [],
            total: prev[rootId]?.total ?? 0,
            page: prev[rootId]?.page ?? 1,
            hasMore: prev[rootId]?.hasMore ?? true,
            loading: false,
          },
        }));
        return;
      }

      const newReplies = data?.comments ?? [];
      const totalCount = data?.pageInfo?.total ?? 0;
      const hasMoreData = pageNum * pageSize < totalCount;
      
      setRepliesMap(prev => ({
        ...prev,
        [rootId]: {
          comments: append ? [...(prev[rootId]?.comments ?? []), ...newReplies] : newReplies,
          total: totalCount,
          page: pageNum,
          hasMore: hasMoreData,
          loading: false,
        },
      }));
    } catch {
      toast.error("获取回复失败");
      setRepliesMap(prev => ({
        ...prev,
        [rootId]: {
          ...prev[rootId],
          comments: prev[rootId]?.comments ?? [],
          total: prev[rootId]?.total ?? 0,
          page: prev[rootId]?.page ?? 1,
          hasMore: prev[rootId]?.hasMore ?? true,
          loading: false,
        },
      }));
    }
  }, [articleId]);

  // 获取一级评论（rootID=0 或 rootID=null）
  const fetchComments = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      // 同时获取评论列表和评论总数
      const [listResult, countResult] = await Promise.all([
        listComments({
          query: {
            articleID: articleId,
            rootID: 0,
            page: pageNum,
            pageSize: PAGE_SIZE,
            sort: "desc",
            sortField: "createdAt",
          },
        }),
        countComments({
          query: {
            articleID: articleId,
          },
        }),
      ]);

      if (listResult.error) {
        toast.error("获取评论失败");
        return;
      }

      if (listResult.data) {
        const newComments = listResult.data.comments ?? [];
        setComments(prev => append ? [...prev, ...newComments] : newComments);
        
        // 使用 countComments 接口获取的评论总数
        const totalCount = countResult.data?.count ?? listResult.data.pageInfo.total;
        setTotal(totalCount);
        
        setPage(pageNum);
        setHasMore(pageNum * PAGE_SIZE < totalCount);
        setInitialLoaded(true);

        // 自动获取每条一级评论的子评论预览
        const rootIds = newComments.map(c => c.id);
        if (rootIds.length > 0) {
          rootIds.forEach(id => fetchReplies(id, 1, false, DEFAULT_REPLIES_PREVIEW));
        }
      }
    } catch {
      toast.error("获取评论失败");
    } finally {
      setLoading(false);
    }
  }, [articleId, loading, fetchReplies]);

  // 加载更多一级评论
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchComments(page + 1, true);
    }
  }, [fetchComments, hasMore, loading, page]);

  // 加载更多回复（展开全部时使用完整分页）
  const loadMoreReplies = useCallback((parentId: number) => {
    const state = repliesMap[parentId];
    if (state && state.hasMore && !state.loading) {
      fetchReplies(parentId, state.page + 1, true, PAGE_SIZE);
    }
  }, [repliesMap, fetchReplies]);

  // 展开全部回复（首次从预览切换到完整列表）
  const expandAllReplies = useCallback((parentId: number) => {
    fetchReplies(parentId, 1, false, PAGE_SIZE);
  }, [fetchReplies]);

  // 发布评论
  // parentID: 0 表示发布一级评论，>0 表示回复某条评论（该评论的ID）
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
        // 发布一级评论
        await fetchComments(1, false);
      } else {
        // 回复评论：需要找到该评论的 rootID 来刷新回复列表
        // 如果是回复一级评论，rootID 就是 parentID
        // 如果是回复回复，需要找到该评论的 rootID
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
  const removeComment = useCallback(async (commentId: number, rootID: number = 0) => {
    try {
      const { error } = await deleteComment({
        query: { id: commentId },
      });
      if (error) {
        toast.error("删除评论失败");
        return;
      }
      toast.success("评论已删除");

      if (rootID === 0) {
        // 一级评论
        setComments(prev => prev.filter(c => c.id !== commentId));
        setTotal(prev => Math.max(0, prev - 1));
        // 同时删除对应的回复映射
        setRepliesMap(prev => {
          const newMap = { ...prev };
          delete newMap[commentId];
          return newMap;
        });
      } else {
        // 回复评论
        setRepliesMap(prev => {
          const state = prev[rootID];
          if (!state) return prev;
          return {
            ...prev,
            [rootID]: {
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
  const toggleCommentLike = useCallback(async (commentId: number, currentLiked: boolean, rootID: number = 0) => {
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

      if (rootID === 0) {
        // 一级评论
        setComments(prev => prev.map(updateComment));
      } else {
        // 回复评论
        setRepliesMap(prev => {
          const state = prev[rootID];
          if (!state) return prev;
          return {
            ...prev,
            [rootID]: {
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
    expandAllReplies,
    submitComment,
    removeComment,
    toggleCommentLike,
  };
}
