"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Bold, Italic, Heading1, Heading2, Code, List, Eye, Info, Edit2 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content in Markdown format...",
  label = "Content",
  required = false,
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);


  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="content" className="text-sm font-semibold">
          {label} {required && "*"}
        </Label>
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          {isPreview ? (
            <>
              <Edit2 className="w-3 h-3" />
              Edit
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              Preview
            </>
          )}
        </button>
      </div>
      
      {isPreview ? (
        <div 
          className="min-h-[200px] p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <div className="border-2 border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 rounded-lg transition-all duration-200">
          <div className="border-b border-gray-200 p-2 flex gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1 rounded hover:bg-gray-100 ${
                editor.isActive('bold') ? 'bg-gray-200' : ''
              }`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1 rounded hover:bg-gray-100 ${
                editor.isActive('italic') ? 'bg-gray-200' : ''
              }`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-1 rounded hover:bg-gray-100 ${
                editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
              }`}
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1 rounded hover:bg-gray-100 ${
                editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
              }`}
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-1 rounded hover:bg-gray-100 ${
                editor.isActive('codeBlock') ? 'bg-gray-200' : ''
              }`}
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-1 rounded hover:bg-gray-100 ${
                editor.isActive('bulletList') ? 'bg-gray-200' : ''
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <EditorContent
            editor={editor}
            className="min-h-[200px] p-3 font-mono text-sm"
          />
        </div>
      )}
      
      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
        <Info className="w-3 h-3 mr-1" />
        Supports Markdown formatting
      </div>
    </div>
  );
}