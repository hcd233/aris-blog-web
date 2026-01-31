"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CoverUpload, type ImageItem } from "@/components/cover-upload";
import { RichTextEditor } from "@/components/rich-text-editor";
import { createArticle } from "@/lib/api/config";
import { processAndUploadImage } from "@/lib/cos-upload";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function PublishPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("");
  const formDataRef = useRef({
    title: "",
    content: "",
    images: [] as ImageItem[],
  });
  const [formData, setFormData] = useState(formDataRef.current);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("请先登录", {
        description: "请从侧边栏点击登录按钮",
      });
      router.push("/");
    }
  }, [isAuthenticated, router]);

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
    setUploadProgress(0);

    try {
      const totalSteps = formData.images.length + 1; // 所有图片 + 创建文章
      let currentStep = 0;
      const uploadedImageNames: string[] = [];

      // 1. 上传所有图片到 COS
      for (let i = 0; i < formData.images.length; i++) {
        const imageItem = formData.images[i];
        setUploadStatus(`正在上传第 ${i + 1}/${formData.images.length} 张图片...`);

        const fileName = await processAndUploadImage(
          imageItem.file,
          String(user!.id),
          (percent: number) => {
            // 计算总体进度
            const fileProgress = percent / 100;
            const overallProgress = ((currentStep + fileProgress) / totalSteps) * 100;
            setUploadProgress(Math.round(overallProgress));
          }
        );

        uploadedImageNames.push(fileName);
        currentStep++;
      }

      // 2. 创建文章
      setUploadStatus("正在发布文章...");
      setUploadProgress(Math.round((currentStep / totalSteps) * 100));

      const { error } = await createArticle({
        body: {
          title: formData.title,
          content: formData.content,
          images: uploadedImageNames.length > 0 ? uploadedImageNames : null,
        },
      });

      if (error) {
        throw new Error("发布失败");
      }

      setUploadProgress(100);
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
      setUploadStatus("");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleImagesChange = (images: ImageItem[]) => {
    const newData = { ...formData, images };
    setFormData(newData);
    formDataRef.current = newData;
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
                已选择 {formData.images.length} 张图片
                <span className="ml-2 text-muted-foreground">
                  （发布时会上传到云端）
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
              disabled={isSubmitting}
              className="text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/60 disabled:opacity-50"
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
              disabled={isSubmitting}
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

      {/* Upload Progress Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-xl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="font-medium">{uploadStatus || "处理中..."}</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {uploadProgress}%
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
