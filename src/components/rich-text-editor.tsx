"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import { Node, mergeAttributes } from "@tiptap/core";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Hash,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useCallback } from "react";
import { listTags } from "@/lib/api-config";

// Custom Tag Node Extension
const TagNode = Node.create({
  name: "tag",
  group: "inline",
  inline: true,
  selectable: false,
  atom: true,

  addAttributes() {
    return {
      label: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="tag"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": "tag",
        class:
          "inline-flex items-center gap-0.5 text-[rgb(87,107,149)] dark:text-[rgb(123,155,209)] font-medium cursor-pointer hover:opacity-80",
      }),
      `#${HTMLAttributes.label}`,
    ];
  },
});

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
  title,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-2 rounded-md transition-colors",
        "hover:bg-gray-100 dark:hover:bg-gray-800",
        isActive && "bg-gray-200 dark:bg-gray-700 text-primary",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {children}
    </button>
  );
}

function EditorToolbar({ editor, disabled }: { editor: Editor | null; disabled?: boolean }) {
  if (!editor) return null;

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30 rounded-t-lg",
      disabled && "opacity-50 pointer-events-none"
    )}>
      {/* Text Style */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-border">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="粗体"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Headings */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-border">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="一级标题"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="二级标题"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-border">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Other */}
      <div className="flex items-center gap-0.5 pr-2 border-r border-border">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="代码"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* History */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="撤销"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="重做"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}

// Tag Suggestion Dropdown Component
interface TagSuggestionDropdownProps {
  query: string;
  onSelect: (tag: string) => void;
  position: { top: number; left: number };
  selectedIndex: number;
  filteredTags: string[];
  isLoading: boolean;
  error: string | null;
  onMouseEnterItem: (index: number) => void;
}

function TagSuggestionDropdown({
  query,
  onSelect,
  position,
  selectedIndex,
  filteredTags,
  isLoading,
  error,
  onMouseEnterItem,
}: TagSuggestionDropdownProps) {
  return (
    <div
      className="fixed z-50 w-64 max-h-60 overflow-y-auto bg-popover border border-border rounded-md shadow-lg py-1"
      style={{ top: position.top, left: position.left }}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="px-3 py-3 text-center">
          <p className="text-sm text-destructive">{error}</p>
          <p className="text-xs text-muted-foreground mt-1">可输入创建新标签</p>
        </div>
      ) : filteredTags.length > 0 ? (
        <div>
          <div className="px-3 py-1.5 text-xs text-muted-foreground">
            推荐标签
          </div>
          {filteredTags.map((tag, index) => (
            <button
              key={tag}
              onClick={() => onSelect(tag)}
              onMouseEnter={() => onMouseEnterItem(index)}
              className={cn(
                "w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors",
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
            >
              <Hash className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{tag}</span>
            </button>
          ))}
        </div>
      ) : query ? (
        <button
          onClick={() => onSelect(query)}
          className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-accent transition-colors"
        >
          <Hash className="w-3.5 h-3.5 text-muted-foreground" />
          <span>
            创建标签 "<strong>{query}</strong>"
          </span>
        </button>
      ) : (
        <div className="px-3 py-3 text-center">
          <p className="text-sm text-muted-foreground">输入关键词搜索标签</p>
        </div>
      )}
    </div>
  );
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "输入正文内容...",
  className,
  disabled = false,
}: RichTextEditorProps) {
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [tagQuery, setTagQuery] = useState("");
  const [tagDropdownPosition, setTagDropdownPosition] = useState({
    top: 0,
    left: 0,
  });
  const [filteredTags, setFilteredTags] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const showDropdownRef = useRef(false);
  const tagsRef = useRef<string[]>([]);
  const selectedIndexRef = useRef(0);

  // Keep refs in sync
  useEffect(() => {
    showDropdownRef.current = showTagDropdown;
  }, [showTagDropdown]);

  useEffect(() => {
    tagsRef.current = filteredTags;
  }, [filteredTags]);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  // Fetch tags from API
  useEffect(() => {
    if (!showTagDropdown) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const fetchTags = async () => {
      setIsLoading(true);
      setError(null);
      
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const { data, error: apiError } = await listTags({
          query: {
            page: 1,
            pageSize: 8,
            query: tagQuery || undefined,
            sort: 'desc',
            sortField: 'name',
          },
        });

        if (controller.signal.aborted) return;

        if (apiError) {
          setError("获取标签失败");
          setFilteredTags([]);
        } else if (data?.tags) {
          const tagNames = data.tags.map((tag) => tag.name);
          setFilteredTags(tagNames);
          setSelectedIndex(0);
        } else {
          setFilteredTags([]);
          setSelectedIndex(0);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError("获取标签失败");
        setFilteredTags([]);
        setSelectedIndex(0);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(() => {
      fetchTags();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [tagQuery, showTagDropdown]);

  const handleTagSelect = useCallback(
    (tag: string) => {
      const editor = editorRef.current;
      if (!editor || !tag) {
        setShowTagDropdown(false);
        return;
      }

      const { selection } = editor.state;
      const { $from } = selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      const hashIndex = textBefore.lastIndexOf("#");

      if (hashIndex !== -1) {
        // Delete the # and query text
        const from = $from.pos - (textBefore.length - hashIndex);
        const to = $from.pos;

        editor
          .chain()
          .focus()
          .deleteRange({ from, to })
          .insertContent({
            type: "tag",
            attrs: { label: tag },
          })
          .insertContent(" ")
          .run();
      }

      setShowTagDropdown(false);
    },
    []
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!showDropdownRef.current) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      setSelectedIndex((prev) =>
        prev < tagsRef.current.length - 1 ? prev + 1 : prev
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      const currentTags = tagsRef.current;
      const currentIndex = selectedIndexRef.current;
      
      if (currentTags[currentIndex]) {
        handleTagSelect(currentTags[currentIndex]);
      } else if (tagQuery) {
        handleTagSelect(tagQuery);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setShowTagDropdown(false);
    }
  }, [tagQuery, handleTagSelect]);

  // Global keydown listener for dropdown
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [handleKeyDown]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Heading.configure({
        levels: [1, 2],
      }).extend({
        addKeyboardShortcuts() {
          return {
            // Disable all markdown heading shortcuts
            'Mod-Alt-1': () => false,
            'Mod-Alt-2': () => false,
          };
        },
      }),
      TagNode,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());

      // Check for # trigger
      const { selection } = editor.state;
      const { $from } = selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      const hashIndex = textBefore.lastIndexOf("#");

      if (hashIndex !== -1) {
        const query = textBefore.slice(hashIndex + 1);
        const afterHash = textBefore.slice(hashIndex);
        if (!afterHash.includes(" ") || afterHash === "#") {
          setTagQuery(query);
          setShowTagDropdown(true);

          // Calculate position
          try {
            const coords = editor.view.coordsAtPos($from.pos);
            setTagDropdownPosition({
              top: coords.bottom + 8,
              left: coords.left,
            });
          } catch {
            setTagDropdownPosition({
              top: 100,
              left: 20,
            });
          }
          return;
        }
      }

      setShowTagDropdown(false);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[300px] px-4 py-3",
      },
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor;
    },
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as HTMLElement)
      ) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "border border-border rounded-lg overflow-hidden bg-background relative",
        disabled && "opacity-50",
        className
      )}
    >
      <EditorToolbar editor={editor} disabled={disabled} />
      <EditorContent editor={editor} />

      {showTagDropdown && (
        <TagSuggestionDropdown
          query={tagQuery}
          onSelect={handleTagSelect}
          position={tagDropdownPosition}
          selectedIndex={selectedIndex}
          filteredTags={filteredTags}
          isLoading={isLoading}
          error={error}
          onMouseEnterItem={setSelectedIndex}
        />
      )}
    </div>
  );
}

export default RichTextEditor;
