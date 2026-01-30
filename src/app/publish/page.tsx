"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoverUpload } from "@/components/cover-upload";
import { RichTextEditor } from "@/components/rich-text-editor";
import { createArticle } from "@/lib/api/config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PublishPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    images: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("请填写标题", {
        description: "标题不能为空",
      });
      return;
    }

    if (!formData.content.trim() || formData.content === "<p></p>") {
      toast.error("请填写正文", {
        description: "正文内容不能为空",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await createArticle({
        body: {
          title: formData.title,
          content: formData.content,
          images: formData.images.length > 0 ? formData.images : null,
        },
      });

      if (error) {
        throw new Error("发布失败");
      }

      toast.success("发布成功！", {
        description: "您的文章已成功发布",
      });

      // Delay slightly to show completion
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (err) {
      console.error("发布文章失败:", err);
      toast.error("发布失败", {
        description: err instanceof Error ? err.message : "请检查网络连接后重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleImagesChange = (images: string[]) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        )}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleGoBack}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">发布笔记</h1>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                "bg-[#ff2442] hover:bg-[#e01e3a] text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  发布中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  发布
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Upload */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">
              图片
            </h2>
            <CoverUpload
              images={formData.images}
              onChange={handleImagesChange}
              maxImages={9}
            />
            {formData.images.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                已上传 {formData.images.length} 张图片
                <span className="ml-2 text-green-600">
                  ✓ 按顺序上传完成
                </span>
              </p>
            )}
          </section>

          {/* Title Input */}
          <section>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="一个好标题会有更多赞哦~"
              className="text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/60"
            />
          </section>

          {/* Rich Text Editor */}
          <section>
            <RichTextEditor
              content={formData.content}
              onChange={(content) =>
                setFormData((prev) => ({ ...prev, content }))
              }
              placeholder="输入正文描述，真诚有价值的分享予人温暖"
            />
          </section>

          {/* Submit Button (Mobile) */}
          <div className="sm:hidden pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "w-full bg-[#ff2442] hover:bg-[#e01e3a] text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  发布中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  发布
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
