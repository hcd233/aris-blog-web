"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { generateSlug } from "@/lib/slugify";

export interface CreateItemForm {
  name: string;
  slug?: string;
  description?: string;
  parentID?: number;
}

export interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "category" | "tag";
  initialData?: Partial<CreateItemForm>;
  onSubmit: (data: CreateItemForm) => Promise<void>;
  loading?: boolean;
  parentName?: string;
}

export function CreateItemDialog({
  open,
  onOpenChange,
  itemType,
  initialData = { name: "", slug: "", description: "" },
  onSubmit,
  loading = false,
  parentName,
}: CreateItemDialogProps) {
  const [formData, setFormData] = useState<CreateItemForm>({
    name: "",
    slug: "",
    description: "",
    ...initialData,
  });

  const isCategory = itemType === "category";
  const isTag = itemType === "tag";

  // 根据name自动生成slug（仅对标签有效）
  const handleNameChange = async (name: string) => {
    const slug = isTag ? await generateSlug(name) : formData.slug;
    setFormData((prev) => ({
      ...prev,
      name,
      slug,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      return;
    }

    await onSubmit(formData);
    if (!loading) {
      setFormData({ name: "", slug: "", description: "" });
    }
  };

  // 重置表单当对话框关闭
  useEffect(() => {
    if (!open) {
      setFormData({ name: "", slug: "", description: "" });
    }
  }, [open]);

  const getItemConfig = () => {
    if (isCategory) {
      return {
        title: parentName ? `在"${parentName}"下创建子分类` : "创建分类",
        description: parentName ? "为父分类创建新的子分类" : "创建新的内容分类",
        icon: <Icons.folder className="w-5 h-5 mr-2" />,
        color: "purple",
        gradient: "from-purple-50 to-indigo-50",
        border: "border-purple-100",
        text: "text-purple-700",
        button: "bg-purple-600 hover:bg-purple-700",
      };
    } else {
      return {
        title: "创建新标签",
        description: "填写标签信息，slug会根据标签名自动生成",
        icon: <Icons.tag className="w-5 h-5 mr-2" />,
        color: "orange",
        gradient: "from-orange-50 to-amber-50",
        border: "border-orange-100",
        text: "text-orange-700",
        button: "bg-orange-500 hover:bg-orange-600",
      };
    }
  };

  const config = getItemConfig();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] border-0 shadow-xl p-0 overflow-hidden">
        {/* 头部渐变背景 */}
        <div
          className={`p-6 rounded-t-lg border-b ${config.border} dark:border-${config.color}-800 bg-gradient-to-br ${config.gradient} dark:from-${config.color}-900/20 dark:to-amber-900/20`}
        >
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${config.text} dark:text-${config.color}-300 flex items-center`}>
              {config.icon}
              {config.title}
            </DialogTitle>
            <DialogDescription className={`${config.text} dark:text-${config.color}-400`}>
              {config.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* 表单内容 */}
        <div className="px-6 py-6 space-y-4">
          {/* 名称字段 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              {isCategory ? "分类名称" : "标签名"} *
            </Label>
            <Input
              id="name"
              placeholder={isCategory ? "输入分类名称" : "输入标签名"}
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-lg transition-all duration-200"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
            />
          </div>

          {/* Slug字段（仅标签） */}
          {isTag && (
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-semibold">
                Slug *
              </Label>
              <Input
                id="slug"
                placeholder="标签slug"
                value={formData.slug || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-lg transition-all duration-200 font-mono text-sm"
              />
            </div>
          )}

          {/* 描述字段（仅标签） */}
          {isTag && (
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold">
                描述
              </Label>
              <Textarea
                id="description"
                placeholder="标签描述（可选）"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="border-2 border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-lg transition-all duration-200"
              />
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <DialogFooter className="px-6 pb-6 space-x-3 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-2 border-gray-300 hover:bg-gray-100 transition-colors"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
            className={`${config.button} text-white border-0 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
          >
            {loading ? (
              <>
                <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                {isCategory ? "创建中..." : "创建中..."}
              </>
            ) : (
              `${isCategory ? "创建分类" : "创建标签"}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}