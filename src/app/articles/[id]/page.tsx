'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { ArticleService } from '@/services/article.service';
import { categoryService } from '@/services/category.service';
import { Article, Category, Comment } from '@/types/api/article';
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar, 
  User, 
  Tag, 
  Loader2,
  ThumbsUp,
  Share2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Navigation } from '@/components/Navigation';

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleID = parseInt(params.id as string);

  const [article, setArticle] = useState<Article | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (articleID) {
      loadArticle();
      loadComments();
      // 记录浏览
      ArticleService.logArticleView({ articleID });
    }
  }, [articleID]);

  const loadArticle = async () => {
    try {
      const articleResponse = await ArticleService.getArticle(articleID);
      const articleData = articleResponse.article;
      setArticle(articleData);

      // 加载分类信息
      if (articleData.categoryID) {
        try {
          const categoryResponse = await categoryService.getCategoryInfo(articleData.categoryID);
          setCategory(categoryResponse.category);
        } catch (error) {
          console.error('Failed to load category:', error);
        }
      }

      // 加载最新版本的内容
      const versionResponse = await ArticleService.getLatestArticleVersion(articleID);
      setContent(versionResponse.articleVersion.content);
    } catch (error) {
      console.error('Failed to load article:', error);
      toast.error('加载文章失败');
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const response = await ArticleService.listArticleComments(articleID);
      setComments(response.comments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleLike = async () => {
    if (!article) return;

    try {
      await ArticleService.likeArticle({ articleID: article.articleID });
      setLiked(!liked);
      setArticle(prev => prev ? { ...prev, likes: prev.likes + (liked ? -1 : 1) } : null);
      toast.success(liked ? '取消点赞' : '点赞成功');
    } catch (error) {
      console.error('Failed to like article:', error);
      toast.error('操作失败');
    }
  };

  const handleSubmitComment = async () => {
    if (!commentContent.trim()) {
      toast.error('评论内容不能为空');
      return;
    }

    setSubmittingComment(true);
    try {
      await ArticleService.createArticleComment({
        articleID: articleID,
        content: commentContent,
      });
      setCommentContent('');
      loadComments();
      toast.success('评论发布成功');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      toast.error('发布评论失败');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('链接已复制到剪贴板');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">加载中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">文章不存在</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-6 space-y-6">
        {/* 头部导航 */}
        <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            分享
          </Button>
          <Button onClick={() => router.push(`/articles/${articleID}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            编辑
          </Button>
        </div>
      </div>

      {/* 文章头部信息 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold mb-4">{article.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(article.createdAt), 'yyyy年MM月dd日')}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {article.views} 次浏览
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {article.comments} 条评论
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={article.status === 'publish' ? 'default' : 'secondary'}>
                  {article.status === 'publish' ? '已发布' : '草稿'}
                </Badge>
                {category && (
                  <Badge variant="outline">{category.name}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 文章内容 */}
      <Card>
        <CardContent className="pt-6">
          <TipTapEditor
            content={content}
            onChange={() => {}}
            editable={false}
            className="prose max-w-none"
          />
        </CardContent>
      </Card>

      {/* 文章操作 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant={liked ? 'default' : 'outline'}
                onClick={handleLike}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                {article.likes} 点赞
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                {article.comments} 评论
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              最后更新：{format(new Date(article.updatedAt), 'yyyy-MM-dd HH:mm')}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 评论区 */}
      <Card>
        <CardHeader>
          <CardTitle>评论 ({article.comments})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 发表评论 */}
          <div className="space-y-2">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="写下你的评论..."
              className="w-full p-3 border border-gray-200 rounded-md resize-none"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={submittingComment || !commentContent.trim()}
              >
                {submittingComment ? '发布中...' : '发布评论'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* 评论列表 */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">暂无评论</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.commentID} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">用户 {comment.userID}</span>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-700">
                          <ThumbsUp className="h-3 w-3" />
                          {comment.likes} 点赞
                        </button>
                        <button className="text-sm text-muted-foreground hover:text-gray-700">
                          回复
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}