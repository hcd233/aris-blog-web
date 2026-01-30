"use client";

import { useState, useCallback } from "react";
import { doAction, undoAction } from "@/lib/api/config";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

type ActionType = "like" | "save";

interface UseArticleActionsOptions {
  onLikeChange?: (liked: boolean, likes: number) => void;
  onSaveChange?: (saved: boolean, saves: number) => void;
}

interface UseArticleActionsReturn {
  isLiked: boolean;
  isSaved: boolean;
  likesCount: number;
  savesCount: number;
  isLikeLoading: boolean;
  isSaveLoading: boolean;
  handleLike: (articleId: number) => Promise<void>;
  handleSave: (articleId: number) => Promise<void>;
  setInitialState: (liked: boolean, saved: boolean, likes: number, saves: number) => void;
}

export function useArticleActions(
  options: UseArticleActionsOptions = {}
): UseArticleActionsReturn {
  const { onLikeChange, onSaveChange } = options;
  const { isAuthenticated } = useAuth();
  
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [savesCount, setSavesCount] = useState(0);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveLoading, setIsSaveLoading] = useState(false);

  const setInitialState = useCallback((
    liked: boolean,
    saved: boolean,
    likes: number,
    saves: number
  ) => {
    setIsLiked(liked);
    setIsSaved(saved);
    setLikesCount(likes);
    setSavesCount(saves);
  }, []);

  const handleLike = useCallback(async (articleId: number) => {
    if (!isAuthenticated) {
      toast.error("请先登录", {
        description: "登录后即可点赞",
      });
      return;
    }

    if (isLikeLoading) return;

    setIsLikeLoading(true);

    try {
      if (isLiked) {
        const { error } = await undoAction({
          body: {
            actionType: "like",
            entityID: articleId,
            entityType: "article",
          },
        });

        if (!error) {
          const newLiked = false;
          const newLikes = Math.max(0, likesCount - 1);
          setIsLiked(newLiked);
          setLikesCount(newLikes);
          onLikeChange?.(newLiked, newLikes);
        }
      } else {
        const { error } = await doAction({
          body: {
            actionType: "like",
            entityID: articleId,
            entityType: "article",
          },
        });

        if (!error) {
          const newLiked = true;
          const newLikes = likesCount + 1;
          setIsLiked(newLiked);
          setLikesCount(newLikes);
          onLikeChange?.(newLiked, newLikes);
        }
      }
    } catch (error) {
      console.error("点赞操作失败:", error);
      toast.error("操作失败", {
        description: "请稍后重试",
      });
    } finally {
      setIsLikeLoading(false);
    }
  }, [isAuthenticated, isLiked, likesCount, isLikeLoading, onLikeChange]);

  const handleSave = useCallback(async (articleId: number) => {
    if (!isAuthenticated) {
      toast.error("请先登录", {
        description: "登录后即可收藏",
      });
      return;
    }

    if (isSaveLoading) return;

    setIsSaveLoading(true);

    try {
      if (isSaved) {
        const { error } = await undoAction({
          body: {
            actionType: "save",
            entityID: articleId,
            entityType: "article",
          },
        });

        if (!error) {
          const newSaved = false;
          const newSaves = Math.max(0, savesCount - 1);
          setIsSaved(newSaved);
          setSavesCount(newSaves);
          onSaveChange?.(newSaved, newSaves);
        }
      } else {
        const { error } = await doAction({
          body: {
            actionType: "save",
            entityID: articleId,
            entityType: "article",
          },
        });

        if (!error) {
          const newSaved = true;
          const newSaves = savesCount + 1;
          setIsSaved(newSaved);
          setSavesCount(newSaves);
          onSaveChange?.(newSaved, newSaves);
        }
      }
    } catch (error) {
      console.error("收藏操作失败:", error);
      toast.error("操作失败", {
        description: "请稍后重试",
      });
    } finally {
      setIsSaveLoading(false);
    }
  }, [isAuthenticated, isSaved, savesCount, isSaveLoading, onSaveChange]);

  return {
    isLiked,
    isSaved,
    likesCount,
    savesCount,
    isLikeLoading,
    isSaveLoading,
    handleLike,
    handleSave,
    setInitialState,
  };
}
