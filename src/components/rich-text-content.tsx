"use client";

import { cn } from "@/lib/utils";

interface RichTextContentProps {
  content: string;
  className?: string;
}

export function RichTextContent({ content, className }: RichTextContentProps) {
  if (!content) return null;

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none",
        // Headings
        "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6",
        "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-5",
        // Paragraphs
        "[&_p]:mb-3 [&_p]:leading-relaxed",
        // Lists
        "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3",
        "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3",
        "[&_li]:mb-1",
        // Blockquote
        "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:dark:border-gray-600",
        "[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:dark:text-gray-400",
        "[&_blockquote]:mb-3",
        // Code
        "[&_code]:bg-gray-100 [&_code]:dark:bg-gray-800",
        "[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm",
        "[&_code]:font-mono",
        // Preformatted code blocks
        "[&_pre]:bg-gray-100 [&_pre]:dark:bg-gray-800",
        "[&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-3",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        // Bold and italic
        "[&_strong]:font-bold",
        "[&_em]:italic",
        // Links
        "[&_a]:text-blue-600 [&_a]:dark:text-blue-400 [&_a]:underline",
        // Custom Tag Nodes
        "[&_span[data-type=\"tag\"]]:inline-flex [&_span[data-type=\"tag\"]]:items-center [&_span[data-type=\"tag\"]]:gap-0.5",
        "[&_span[data-type=\"tag\"]]:text-[#576b95] [&_span[data-type=\"tag\"]]:dark:text-[#7b9bd1]",
        "[&_span[data-type=\"tag\"]]:font-medium [&_span[data-type=\"tag\"]]:cursor-pointer",
        "[&_span[data-type=\"tag\"]]:hover:opacity-80",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export default RichTextContent;
