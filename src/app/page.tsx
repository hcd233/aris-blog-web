import { ArticleList } from "@/components/article/article-list"
import { TagList } from "@/components/tag/tag-list"

export default function Home() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
      <div className="hidden md:block">
        <TagList />
      </div>
      <ArticleList />
    </div>
  )
}
