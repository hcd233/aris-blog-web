"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CoverUpload } from "@/components/cover-upload";
import { RichTextEditor } from "@/components/rich-text-editor";
import { createArticle, uploadImage } from "@/lib/api/config";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PublishPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
    message: "",
  });
  const [showProgress, setShowProgress] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    images: [] as File[],
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
    setShowProgress(true);

    try {
      let imageNames: string[] = [];

      // Step 1: Upload images if any
      if (formData.images.length > 0) {
        const totalSteps = formData.images.length + 1; // images + create article
        setUploadProgress({
          current: 0,
          total: totalSteps,
          message: `准备上传 ${formData.images.length} 张图片...`,
        });

        const uploadedNames: string[] = [];

        for (let i = 0; i < formData.images.length; i++) {
          const file = formData.images[i];
          setUploadProgress({
            current: i,
            total: totalSteps,
            message: `正在上传第 ${i + 1}/${formData.images.length} 张图片: ${file.name}...`,
          });

          const { data, error } = await uploadImage({
            body: {
              image: file,
            },
          });

          if (error) {
            throw new Error(`上传图片 "${file.name}" 失败: ${error}`);
          }

          if (data?.imageName) {
            uploadedNames.push(data.imageName);
          } else {
            throw new Error(`上传图片 "${file.name}" 返回数据异常`);
          }

          setUploadProgress({
            current: i + 1,
            total: totalSteps,
            message: `已上传 ${i + 1}/${formData.images.length} 张图片`,
          });
        }

        imageNames = uploadedNames;
      }

      // Step 2: Create article
      const totalSteps = formData.images.length + 1;
      setUploadProgress({
        current: formData.images.length,
        total: totalSteps,
        message: "正在发布文章...",
      });

      const { error } = await createArticle({
        body: {
          title: formData.title,
          content: formData.content,
          images: imageNames.length > 0 ? imageNames : null,
        },
      });

      if (error) {
        throw new Error("发布失败");
      }

      setUploadProgress({
        current: totalSteps,
        total: totalSteps,
        message: "发布成功！",
      });

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
      setShowProgress(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleImagesChange = (images: File[]) => {
    setFormData((prev) => ({
      ...prev,
      images,
    }));
  };

  const progressPercent =
    uploadProgress.total > 0
      ? Math.round((uploadProgress.current / uploadProgress.total) * 100)
      : 0;

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
              图片
            </h2>
            <CoverUpload
              images={formData.images}
              onChange={handleImagesChange}
              maxImages={9}
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

      {/* Progress Overlay */}
      {showProgress && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border rounded-xl p-6 w-full max-w-md mx-4 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">发布中</h3>
                <span className="text-sm text-muted-foreground">
                  {uploadProgress.current} / {uploadProgress.total}
                </span>
              </div>

              <Progress value={progressPercent} className="h-2" />

              <p className="text-sm text-muted-foreground text-center">
                {uploadProgress.message}
              </p>

              {progressPercent === 100 && (
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Send className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
