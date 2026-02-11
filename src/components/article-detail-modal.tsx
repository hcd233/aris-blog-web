"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Heart, MessageCircle, Star, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getArticle } from "@/lib/api-config";
import type { DetailedArticle } from "@/lib/api/types.gen";
import { RichTextContent } from "@/components/rich-text-content";
import { CommentSection } from "@/components/comment-section";
import { cn, formatDate } from "@/lib/utils";
import { useArticleActions } from "@/hooks/use-article-actions";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

interface ArticleDetailModalProps {
  articleSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleDetailModal({ articleSlug, isOpen, onClose }: ArticleDetailModalProps) {
  const [article, setArticle] = useState<DetailedArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  const { user: currentUser } = useAuth();
  const [commentTotal, setCommentTotal] = useState(0);

  const {
    isLiked,
    isSaved,
    likesCount,
    savesCount,
    isLikeLoading,
    isSaveLoading,
    handleLike,
    handleSave,
    setInitialState,
  } = useArticleActions();

  useEffect(() => {
    if (isOpen && articleSlug) {
      fetchArticleDetail();
    }
  }, [isOpen, articleSlug]);

  useEffect(() => {
    setCurrentImageIndex(0);
    setTranslateX(0);
  }, [article?.id]);

  const fetchArticleDetail = async () => {
    setLoading(true);
    try {
      const { data } = await getArticle({
        query: { slug: articleSlug },
      });
      if (data?.article) {
        setArticle(data.article);
        setInitialState(data.article.liked, data.article.saved, data.article.likes, data.article.saves);
      }
    } catch (error) {
      console.error("获取文章详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImages = useCallback(() => {
    if (!article?.images) return [];
    return article.images.filter((img): img is string => !!img);
  }, [article?.images]);

  const images = getImages();
  const hasMultipleImages = images.length > 1;

  const goToImage = useCallback((index: number) => {
    if (index < 0 || index >= images.length) return;
    setCurrentImageIndex(index);
    setTranslateX(0);
  }, [images.length]);

  const goToPrev = useCallback(() => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setTranslateX(0);
    }
  }, [currentImageIndex]);

  const goToNext = useCallback(() => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setTranslateX(0);
    }
  }, [currentImageIndex, images.length]);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!hasMultipleImages) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    touchStartX.current = clientX;
  }, [hasMultipleImages]);

  const handleTouchMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging || !hasMultipleImages) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - touchStartX.current;
    setTranslateX(diff);
  }, [isDragging, hasMultipleImages]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || !hasMultipleImages) return;
    setIsDragging(false);
    
    const threshold = 50;
    if (translateX > threshold && currentImageIndex > 0) {
      goToPrev();
    } else if (translateX < -threshold && currentImageIndex < images.length - 1) {
      goToNext();
    } else {
      setTranslateX(0);
    }
  }, [isDragging, hasMultipleImages, translateX, currentImageIndex, images.length, goToPrev, goToNext]);

  const handleLikeClick = async () => {
    if (article) {
      await handleLike(article.id);
    }
  };

  const handleSaveClick = async () => {
    if (article) {
      await handleSave(article.id);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onClose}>
        <Dialog.Portal>
          <Dialog.Overlay 
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            onClick={onClose}
          />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
              "w-[95vw] md:w-[80vw] h-[90vh] md:h-[85vh]",
              "bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl",
              "flex flex-col md:flex-row",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
              "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
              "duration-300 ease-out"
            )}
            onInteractOutside={onClose}
          >
            <Dialog.Title className="sr-only">
              {article?.title || "文章详情"}
            </Dialog.Title>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : !article ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                文章加载失败
              </div>
            ) : (
              <>
                <div 
                  className="relative w-full md:w-[55%] h-[40vh] md:h-full bg-gray-100 dark:bg-[#0a0a0a] overflow-hidden"
                  ref={carouselRef}
                >
                  {images.length > 0 ? (
                    <>
                      <div
                        className="flex h-full transition-transform duration-300 ease-out"
                        style={{
                          transform: `translateX(calc(-${currentImageIndex * 100}% + ${translateX}px))`,
                          cursor: isDragging ? 'grabbing' : hasMultipleImages ? 'grab' : 'default'
                        }}
                        onMouseDown={handleTouchStart}
                        onMouseMove={handleTouchMove}
                        onMouseUp={handleTouchEnd}
                        onMouseLeave={handleTouchEnd}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                      >
                        {images.map((image, index) => (
                          <div
                            key={index}
                            className="w-full h-full flex-shrink-0 flex items-center justify-center"
                            onClick={() => setIsImagePreviewOpen(true)}
                          >
                            <img
                              src={image}
                              alt={`${article.title} - ${index + 1}`}
                              className="max-w-full max-h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>

                      {hasMultipleImages && (
                        <>
                          {currentImageIndex > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToPrev();
                              }}
                              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10"
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </button>
                          )}

                          {currentImageIndex < images.length - 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                              }}
                              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-all z-10"
                            >
                              <ChevronRight className="w-6 h-6" />
                            </button>
                          )}

                          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-medium z-10">
                            {currentImageIndex + 1}/{images.length}
                          </div>

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                            {images.map((_, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  goToImage(index);
                                }}
                                className={cn(
                                  "w-2 h-2 rounded-full transition-all duration-300",
                                  index === currentImageIndex
                                    ? "bg-gray-800 dark:bg-white w-4"
                                    : "bg-gray-400 dark:bg-white/50 hover:bg-gray-600 dark:hover:bg-white/70"
                                )}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-8xl opacity-20 text-gray-900 dark:text-white">
                        {article.title.charAt(0) || "A"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col h-[50vh] md:h-full">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={article.author.avatar} alt={article.author.name} />
                        <AvatarFallback className="text-sm bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                          {article.author.name.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {article.author.name}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#ff2442] hover:bg-[#e01e3a] text-white rounded-full px-5 text-xs font-medium"
                      onClick={() =>
                        toast.info("敬请期待", {
                          description: "关注功能正在开发中",
                        })
                      }
                    >
                      关注
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="px-5 py-4">
                      <h1 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 leading-snug">
                        {article.title}
                      </h1>

                      <RichTextContent
                        content={article.content}
                        className="text-gray-700 dark:text-gray-300 text-sm"
                      />

                      {article.tags && article.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {article.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="text-[rgb(87,107,149)] dark:text-[rgb(123,155,209)] text-sm cursor-pointer hover:opacity-80"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                        编辑于 {formatDate(article.publishedAt || article.updatedAt)}
                      </div>
                    </div>

                    {article.id && (
                      <CommentSection
                        articleId={article.id}
                        articleAuthorId={article.author.id}
                        onTotalChange={setCommentTotal}
                      />
                    )}
                  </div>

                  {/* 底部操作栏 */}
                  <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-4 bg-white dark:bg-[#1a1a1a]">
                    <button
                      className={cn(
                        "flex flex-col items-center gap-0.5 transition-colors",
                        isLiked
                          ? "text-[#ff2442]"
                          : "text-gray-600 dark:text-gray-400 hover:text-[#ff2442]"
                      )}
                      onClick={handleLikeClick}
                      disabled={isLikeLoading}
                    >
                      <Heart
                        className={cn(
                          "w-6 h-6 transition-all",
                          isLiked && "fill-current scale-110"
                        )}
                      />
                      <span className="text-[10px]">{likesCount}</span>
                    </button>
                    <button
                      className={cn(
                        "flex flex-col items-center gap-0.5 transition-colors",
                        isSaved
                          ? "text-yellow-500"
                          : "text-gray-600 dark:text-gray-400 hover:text-yellow-500"
                      )}
                      onClick={handleSaveClick}
                      disabled={isSaveLoading}
                    >
                      <Star
                        className={cn(
                          "w-6 h-6 transition-all",
                          isSaved && "fill-current scale-110"
                        )}
                      />
                      <span className="text-[10px]">{savesCount}</span>
                    </button>
                    <button
                      className="flex flex-col items-center gap-0.5 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="w-6 h-6" />
                      <span className="text-[10px]">{commentTotal}</span>
                    </button>
                    <button
                      className="flex flex-col items-center gap-0.5 text-gray-600 dark:text-gray-400 hover:text-green-500 transition-colors"
                      onClick={() =>
                        toast.info("敬请期待", {
                          description: "分享功能正在开发中",
                        })
                      }
                    >
                      <Share2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay 
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
            onClick={() => setIsImagePreviewOpen(false)}
          />
          <Dialog.Content
            className={cn(
              "fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2",
              "w-[98vw] h-[98vh] flex items-center justify-center",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "duration-300 ease-out"
            )}
            onInteractOutside={() => setIsImagePreviewOpen(false)}
          >
            <Dialog.Title className="sr-only">
              图片预览
            </Dialog.Title>
            
            {images.length > 0 && (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={images[currentImageIndex]}
                  alt={`${article?.title || '图片'} - ${currentImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                />

                {hasMultipleImages && (
                  <>
                    {currentImageIndex > 0 && (
                      <button
                        onClick={() => goToPrev()}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all"
                      >
                        <ChevronLeft className="w-8 h-8" />
                      </button>
                    )}
                    {currentImageIndex < images.length - 1 && (
                      <button
                        onClick={() => goToNext()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-all"
                      >
                        <ChevronRight className="w-8 h-8" />
                      </button>
                    )}
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setIsImagePreviewOpen(false)}
              className="absolute top-4 left-4 z-[70] flex w-10 h-10 rounded-full bg-black/50 items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
