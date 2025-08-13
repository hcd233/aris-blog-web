"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
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
      Link.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    editable: !disabled,
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

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 dark:bg-gray-900/40">
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBold().run()} aria-pressed={editor.isActive('bold')} className={editor.isActive('bold') ? 'bg-gray-200' : ''}>
          <strong>B</strong>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleItalic().run()} aria-pressed={editor.isActive('italic')} className={editor.isActive('italic') ? 'bg-gray-200' : ''}>
          <em>I</em>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleStrike().run()} aria-pressed={editor.isActive('strike')} className={editor.isActive('strike') ? 'bg-gray-200' : ''}>
          <span className="line-through">S</span>
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} aria-pressed={editor.isActive('heading', { level: 1 })}>
          H1
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-pressed={editor.isActive('heading', { level: 2 })}>
          H2
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aria-pressed={editor.isActive('heading', { level: 3 })}>
          H3
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleBulletList().run()} aria-pressed={editor.isActive('bulletList')}>
          <Icons.chevronRight className="w-4 h-4 rotate-90" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-pressed={editor.isActive('orderedList')}>
          1.
        </Button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
          <Icons.chevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
          <Icons.chevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-3 min-h-[200px]">
        <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />
      </div>
    </div>
  )
}