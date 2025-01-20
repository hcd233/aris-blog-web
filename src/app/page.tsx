import { ArticleList } from "@/components/article/article-list"
import { TagList } from "@/components/tag/tag-list"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Lightbulb, Share2, Sparkles } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 via-background to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4" variant="secondary">
            <Sparkles className="mr-2 h-4 w-4" />
            Welcome to Aris Blog
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Link the world of knowledge
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore insightful articles, share your thoughts, and connect with a community of knowledge seekers.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg">
              <BookOpen className="mr-2 h-5 w-5" />
              Start Reading
            </Button>
            <Button size="lg" variant="outline">
              <Share2 className="mr-2 h-5 w-5" />
              Share Knowledge
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-primary/5">
            <CardHeader>
              <Lightbulb className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Discover Ideas</CardTitle>
              <CardDescription>
                Explore diverse perspectives and groundbreaking insights from our community.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-primary/5">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Learn Together</CardTitle>
              <CardDescription>
                Join discussions and share your knowledge with fellow enthusiasts.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-primary/5">
            <CardHeader>
              <Share2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Share Stories</CardTitle>
              <CardDescription>
                Create and share your own stories, experiences, and insights.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <div className="hidden md:block space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Explore Topics
                </CardTitle>
                <CardDescription>
                  Browse articles by your interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TagList />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Latest Articles
                </CardTitle>
                <CardDescription>
                  Discover the newest content from our writers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ArticleList />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
