import React, { useEffect, useState } from 'react'
import { Card, Progress, Anchor, Button, Tooltip } from 'antd'
import { 
  ClockCircleOutlined, 
  OrderedListOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReadOutlined
} from '@ant-design/icons'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { gfm } from 'micromark-extension-gfm'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { visit } from 'unist-util-visit'

interface Heading {
  level: number
  text: string
  id: string
}

interface ArticleSidebarProps {
  content: string
  onCollapsedChange?: (collapsed: boolean) => void
}

const ArticleSidebar: React.FC<ArticleSidebarProps> = ({ 
  content, 
  onCollapsedChange 
}) => {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [readingProgress, setReadingProgress] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  // 使用 fromMarkdown 解析 Markdown AST
  useEffect(() => {
    const tree = fromMarkdown(content, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()]
    })

    const extractedHeadings: Heading[] = []
    visit(tree, 'heading', (node: any) => {
      const text = node.children
        .map((child: any) => (child.type === 'text' ? child.value : ''))
        .join('')
      
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')

      extractedHeadings.push({
        level: node.depth,
        text,
        id
      })
    })

    setHeadings(extractedHeadings)

    // 为文章中的标题添加 id
    setTimeout(() => {
      const articleContent = document.querySelector('.article-content')
      if (articleContent) {
        extractedHeadings.forEach(({ text, id }) => {
          const heading = Array.from(articleContent.querySelectorAll('h1, h2, h3, h4, h5, h6'))
            .find(el => el.textContent === text)
          if (heading) {
            heading.id = id
          }
        })
      }
    }, 100)

    // 计算预计阅读时间（假设每分钟阅读300字）
    const wordCount = content.trim().split(/\s+/).length
    setReadingTime(Math.ceil(wordCount / 300))
  }, [content])

  // 监听滚动更新阅读进度
  useEffect(() => {
    const handleScroll = () => {
      const articleContent = document.querySelector('.article-content')
      if (!articleContent) return

      const contentRect = articleContent.getBoundingClientRect()
      const contentTop = contentRect.top
      const contentHeight = contentRect.height
      const windowHeight = window.innerHeight
      
      // 计算可见区域占比
      let visibleHeight = 0
      if (contentTop < 0) {
        visibleHeight = Math.min(contentHeight + contentTop, windowHeight)
      } else if (contentTop < windowHeight) {
        visibleHeight = Math.min(contentHeight, windowHeight - contentTop)
      }

      // 计算已阅读比例
      const scrolled = Math.abs(Math.min(contentTop, 0))
      const progress = (scrolled / (contentHeight - windowHeight)) * 100
      
      // 只有当内容进入视口时才开始计算进度
      if (contentTop <= windowHeight) {
        setReadingProgress(Math.min(100, Math.max(0, progress)))
      } else {
        setReadingProgress(0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    // 初始化进度
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 处理折叠状态变化
  const handleCollapse = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    onCollapsedChange?.(newCollapsed)  // 通知父组件
  }

  return (
    <div 
      className="fixed transition-all duration-300 flex"
      style={{ 
        left: collapsed ? '-280px' : '0',
        top: '80px',
        bottom: '80px',
        zIndex: 100
      }}
    >
      {/* 侧边栏内容 */}
      <div
        className="h-full bg-white shadow-lg"
        style={{
          width: '280px',
          borderRadius: '0 12px 12px 0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 阅读信息卡片 */}
        <div className="p-4 border-b">
          <div className="flex items-center mb-3">
            <ReadOutlined className="text-blue-500 text-lg mr-2" />
            <span 
              className="text-gray-800 font-medium"
              style={{ fontFamily: 'HanTang, sans-serif' }}
            >
              阅读进度
            </span>
          </div>
          <div 
            className="mb-3 text-gray-600"
            style={{ fontFamily: 'HanTang, sans-serif' }}
          >
            预计阅读时间：{readingTime} 分钟
          </div>
          <Progress 
            percent={Math.round(readingProgress)} 
            size="small" 
            status="active"
            strokeColor={{
              '0%': '#1677ff',
              '100%': '#52c41a',
            }}
          />
        </div>

        {/* 目录部分 */}
        {headings.length > 0 && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center">
                <OrderedListOutlined className="text-blue-500 text-lg mr-2" />
                <span 
                  className="text-gray-800 font-medium"
                  style={{ fontFamily: 'HanTang, sans-serif' }}
                >
                  目录
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2" style={{ maxHeight: 'calc(100% - 56px)' }}>
              <Anchor
                items={headings.map((heading) => ({
                  key: heading.id,
                  href: `#${heading.id}`,
                  title: (
                    <div 
                      style={{ 
                        paddingLeft: `${(heading.level - 1) * 12}px`,
                        fontFamily: 'HanTang, sans-serif',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        margin: '8px 0',
                        color: heading.level === 1 ? '#1677ff' : '#666',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={heading.text}
                    >
                      {heading.text}
                    </div>
                  ),
                }))}
                offsetTop={80}
                targetOffset={80}
                affix={false}
              />
            </div>
          </div>
        )}
      </div>

      {/* 展开/收起按钮 */}
      <Tooltip 
        title={collapsed ? "展开目录" : "收起目录"} 
        placement="right"
      >
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={handleCollapse}
          className="flex items-center justify-center bg-white shadow-md hover:shadow-lg transition-all"
          style={{
            width: '24px',
            height: '48px',
            marginLeft: '-1px',
            borderRadius: '0 8px 8px 0',
            border: '1px solid #f0f0f0',
            borderLeft: 'none',
          }}
        />
      </Tooltip>
    </div>
  )
}

export default ArticleSidebar 