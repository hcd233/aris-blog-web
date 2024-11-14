import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Spin, Typography, Avatar, Space, Tag, Divider } from 'antd'
import { 
  LikeOutlined, 
  MessageOutlined, 
  EyeOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import MarkdownPreview from '@uiw/react-markdown-preview'
import ArticleService, { Article as ArticleType, ArticleVersion } from '@/services/article'
import Comments from '@/components/Comments'
import ArticleActions from '@/components/ArticleActions'
import ArticleSidebar from '@/components/ArticleSidebar'
import ArticleRightSidebar from '@/components/ArticleRightSidebar'
import './styles/article.css'
import { getStoredTokens } from '@/utils/auth'
import { imageRequest } from '@/utils/request'

const { Content } = Layout
const { Title, Text } = Typography

interface Tag {
  id: number
  name: string
  slug: string
}

interface Author {
  id: number
  name: string
  avatar: string
}

export interface Article {
  id: number
  title: string
  slug: string
  status: string
  publishedAt: string
  likes: number
  comments: number
  views: number
  tags: Tag[]
  user: Author
}

const ArticlePage: React.FC = () => {
  const { userName, articleSlug } = useParams<{ userName: string; articleSlug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [version, setVersion] = useState<ArticleVersion | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      if (!userName || !articleSlug) return

      setLoading(true)
      try {
        const [articleRes, versionRes] = await Promise.all([
          ArticleService.getArticle(userName, articleSlug),
          ArticleService.getLatestVersion(userName, articleSlug)
        ])

        setArticle(articleRes.data)
        setVersion(versionRes.data)
      } catch (error) {
        console.error('Failed to fetch article:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [userName, articleSlug])

  const handleLikeSuccess = async () => {
    if (userName && articleSlug) {
      const response = await ArticleService.getArticle(userName, articleSlug)
      setArticle(response.data)
    }
  }

  const handleImageLoad = async (node: any) => {
    const originalSrc = node.properties?.src as string
    if (!originalSrc || !originalSrc.includes('152.32.211.122:8170')) return

    try {
      const response = await imageRequest.get(
        originalSrc.replace('http://152.32.211.122:8170', ''),
      )

      const blob = response.data
      const objectUrl = URL.createObjectURL(blob)
      
      node.properties = {
        ...node.properties,
        src: objectUrl,
        loading: "lazy",
        onLoad: () => {
          URL.revokeObjectURL(objectUrl)
        }
      }
    } catch (error) {
      console.error('Failed to load image:', error)
      node.properties = {
        ...node.properties,
        loading: "lazy",
        onerror: "this.style.display='none'"
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (!article || !version) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Text type="secondary">文章不存在</Text>
      </div>
    )
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
      {article && version && (
        <ArticleSidebar 
          content={version.content} 
          onCollapsedChange={setSidebarCollapsed}
        />
      )}

      {article && (
        <ArticleRightSidebar
          userName={article.user.name}
          articleSlug={article.slug}
          likes={article.likes}
          views={article.views}
          onCollapsedChange={setRightSidebarCollapsed}
        />
      )}

      <Content 
        className="mx-auto py-8 transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: sidebarCollapsed ? '64px' : '320px',
          marginRight: rightSidebarCollapsed ? '64px' : '360px',
          maxWidth: `calc(100% - ${
            (sidebarCollapsed ? 128 : 680)
          }px)`,
        }}
      >
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <Title 
            level={1} 
            className="mb-6 article-title"
            style={{ 
              fontFamily: 'HanTang, sans-serif',
              fontSize: '2.5em',
              fontWeight: 500
            }}
          >
            {article.title}
          </Title>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Avatar src={article.user.avatar} size={40} />
              <div className="ml-3">
                <Text 
                  strong 
                  className="block article-author"
                  style={{ 
                    fontFamily: 'HanTang, sans-serif',
                    fontSize: '1.1em'
                  }}
                >
                  {article.user.name}
                </Text>
                <Text 
                  type="secondary"
                  style={{ 
                    fontFamily: 'HanTang, sans-serif',
                    fontSize: '0.9em'
                  }}
                >
                  发布于 {dayjs(article.publishedAt).format('YYYY-MM-DD HH:mm')}
                </Text>
              </div>
            </div>
            <ArticleActions
              userName={article.user.name}
              articleSlug={article.slug}
              likes={article.likes}
              comments={article.comments}
              views={article.views}
              onLikeSuccess={handleLikeSuccess}
            />
          </div>

          <div className="mb-8">
            <Space size={[0, 8]} wrap>
              {article.tags.map((tag) => (
                <Tag 
                  key={tag.id}
                  className="bg-blue-50 text-blue-600 border-blue-100 article-tag"
                  style={{ fontFamily: 'HanTang, sans-serif' }}
                >
                  {tag.name}
                </Tag>
              ))}
            </Space>
          </div>

          <Divider />

          <div className="article-content">
            <MarkdownPreview 
              source={version.content}
              wrapperElement={{
                "data-color-mode": "light"
              }}
              style={{
                backgroundColor: 'transparent',
                fontFamily: 'HanTang, sans-serif'
              }}
              rehypeRewrite={(node, index, parent) => {
                if (node.type === 'element') {
                  if (node.tagName === "a") {
                    node.properties = {
                      ...node.properties,
                      target: "_blank",
                      rel: "noopener noreferrer"
                    }
                  }
                  
                  if (node.tagName === "img") {
                    handleImageLoad(node)
                  }
                }
              }}
            />
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default ArticlePage 