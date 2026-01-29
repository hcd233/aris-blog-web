"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoverUpload } from "@/components/cover-upload";
import { RichTextEditor } from "@/components/rich-text-editor";
import { createArticle } from "@/lib/api/sdk.gen";
import { cn } from "@/lib/utils";

export default function PublishPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    coverImage: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("请输入标题");
      return;
    }

    if (!formData.content.trim() || formData.content === "<p></p>") {
      alert("请输入正文内容");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await createArticle({
        body: {
          title: formData.title,
          content: formData.content,
          CoverImage: formData.coverImage,
        },
      });

      if (error) {
        throw new Error("发布失败");
      }

      alert("发布成功！");
      router.push("/");
    } catch (err) {
      console.error("发布文章失败:", err);
      alert("发布失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
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
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "发布中..." : "发布"}
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
              封面图片
            </h2>
            <CoverUpload
              value={formData.coverImage}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, coverImage: value }))
              }
            />
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

          {/* Tag Hint */}
          <section className="flex items-start gap-2 text-sm text-muted-foreground">
            <Hash className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              在编辑器中输入 <strong>#</strong> 即可添加话题标签，支持搜索和自定义创建
            </p>
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
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "发布中..." : "发布"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
