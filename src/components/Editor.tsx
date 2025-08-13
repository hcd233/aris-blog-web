"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import LinkExt from '@tiptap/extension-link'
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

interface EditorProps {
  value?: string
  onChange?: (content: string) => void
  placeholder?: string
  disabled?: boolean
}

export default function Editor({ value = '', onChange, placeholder = '开始写点什么...', disabled = false }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      LinkExt.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    if (typeof value === 'string' && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  if (!editor) return null

  const BarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: { onClick: () => void; active?: boolean; disabled?: boolean; children: React.ReactNode; title?: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`h-8 w-8 p-0 rounded-md ${active ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
    >
      {children}
    </Button>
  )

  const Divider = () => <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1" />

  return (
    <div className="rounded-xl border bg-white dark:bg-gray-950 shadow-sm overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur supports-[backdrop-filter]:bg-gray-50/60 sticky top-0 z-10">
        {/* Left group */}
        <div className="flex items-center gap-1">
          <BarButton onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="正文">
            <Icons.paragraph className="w-4 h-4" />
          </BarButton>
          <BarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="标题 1">
            <Icons.h1 className="w-4 h-4" />
          </BarButton>
          <BarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="标题 2">
            <Icons.h2 className="w-4 h-4" />
          </BarButton>
          <BarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="标题 3">
            <Icons.h3 className="w-4 h-4" />
          </BarButton>
        </div>

        <Divider />

        {/* Text style */}
        <div className="flex items-center gap-1">
          <BarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="加粗">
            <Icons.bold className="w-4 h-4" />
          </BarButton>
          <BarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="斜体">
            <Icons.italic className="w-4 h-4" />
          </BarButton>
          <BarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="删除线">
            <Icons.strike className="w-4 h-4" />
          </BarButton>
          <BarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="行内代码">
            <Icons.code className="w-4 h-4" />
          </BarButton>
          <BarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="分割线">
            <Icons.hr className="w-4 h-4" />
          </BarButton>
        </div>

        <Divider />

        {/* Structure */}
        <div className="flex items-center gap-1">
          <BarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="无序列表">
            <Icons.list className="w-4 h-4" />
          </BarButton>
          <BarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="有序列表">
            <Icons.listOrdered className="w-4 h-4" />
          </BarButton>
          <BarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="引用">
            <Icons.quote className="w-4 h-4" />
          </BarButton>
        </div>

        <Divider />

        {/* Link */}
        <div className="flex items-center gap-1">
          <BarButton
            onClick={() => {
              const url = prompt('输入链接 URL')?.trim()
              if (!url) return
              editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
            }}
            active={editor.isActive('link')}
            title="插入链接"
          >
            <Icons.link className="w-4 h-4" />
          </BarButton>
          <BarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={!editor.isActive('link')}
            title="移除链接"
          >
            <Icons.unlink className="w-4 h-4" />
          </BarButton>
        </div>

        <Divider />

        {/* Undo/Redo */}
        <div className="ml-auto flex items-center gap-1">
          <BarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="撤销">
            <Icons.undo className="w-4 h-4" />
          </BarButton>
          <BarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="重做">
            <Icons.redo className="w-4 h-4" />
          </BarButton>
        </div>
      </div>

      <div className="p-4 min-h-[220px]">
        <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />
      </div>
    </div>
  )
}