import React, { useState, useEffect } from 'react'
import { Tree, Spin, Empty, message, Tooltip } from 'antd'
import type { TreeProps } from 'antd'
import { 
  FolderOutlined, 
  FolderOpenOutlined,
  FileTextOutlined 
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import CategoryService, { Category, SubArticle } from '@/services/category'
import { useNavigate } from 'react-router-dom'
import type { DataNode } from 'antd/es/tree'
import './styles.css'

interface CategoryTreeProps {
  userName?: string
}

interface TreeNode extends DataNode {
  key: string
  title: string
  icon?: React.ReactNode
  isLeaf?: boolean
  type: 'category' | 'article'
  children?: TreeNode[]
}

interface RootCategoryResponse {
  message: string
  code: number
  data: {
    id: number
    name: string
    parentID: number
  }
}

const CategoryTree: React.FC<CategoryTreeProps> = ({ userName }) => {
  const [loading, setLoading] = useState(false)
  const [treeData, setTreeData] = useState<TreeNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (userName) {
      loadRootContent()
    }
  }, [userName])

  const loadRootContent = async () => {
    if (!userName) return

    setLoading(true)
    try {
      const rootResponse = await CategoryService.getRootCategory(userName) as RootCategoryResponse
      if (!rootResponse?.data?.id) {
        throw new Error('Invalid root category data')
      }

      const [categoriesResponse, articlesResponse] = await Promise.all([
        CategoryService.getSubCategories(userName, rootResponse.data.id),
        CategoryService.getSubArticles(userName, rootResponse.data.id)
      ])

      const nodes: TreeNode[] = [
        ...categoriesResponse.data.categories.map((category: Category): TreeNode => ({
          key: `category-${category.id}`,
          title: category.name,
          icon: <FolderOutlined className="text-blue-500" />,
          type: 'category',
          children: []
        })),
        ...articlesResponse.data.articles.map((article: SubArticle): TreeNode => ({
          key: `article-${article.slug}`,
          title: article.title,
          icon: <FileTextOutlined className="text-gray-400" />,
          type: 'article',
          isLeaf: true
        }))
      ]

      setTreeData(nodes)
    } catch (error) {
      console.error('Failed to load root content:', error)
      message.error('加载分类失败')
    } finally {
      setLoading(false)
    }
  }

  const loadChildren = async (key: string, categoryId: number) => {
    if (!userName) return

    try {
      const [categoriesResponse, articlesResponse] = await Promise.all([
        CategoryService.getSubCategories(userName, categoryId),
        CategoryService.getSubArticles(userName, categoryId)
      ])

      const children: TreeNode[] = [
        ...categoriesResponse.data.categories.map((category: Category): TreeNode => ({
          key: `category-${category.id}`,
          title: category.name,
          icon: <FolderOutlined className="text-blue-500" />,
          type: 'category',
          children: []
        })),
        ...articlesResponse.data.articles.map((article: SubArticle): TreeNode => ({
          key: `article-${article.slug}`,
          title: article.title,
          icon: <FileTextOutlined className="text-gray-400" />,
          type: 'article',
          isLeaf: true
        }))
      ]

      setTreeData(prev => updateTreeChildren(prev, key, children))
    } catch (error) {
      console.error('Failed to load children:', error)
      message.error('加载内容失败')
    }
  }

  const updateTreeChildren = (data: TreeNode[], key: string, children: TreeNode[]): TreeNode[] => {
    return data.map(node => {
      if (node.key === key) {
        return { ...node, children }
      }
      if (node.children) {
        return { ...node, children: updateTreeChildren(node.children, key, children) }
      }
      return node
    })
  }

  const updateFolderIcon = (node: TreeNode) => {
    if (node.type === 'category') {
      return expandedKeys.includes(node.key) ? (
        <FolderOpenOutlined className="text-blue-500" />
      ) : (
        <FolderOutlined className="text-blue-500" />
      )
    }
    return node.icon
  }

  const onLoadData = async ({ key, type }: TreeNode) => {
    if (type === 'article') return Promise.resolve()

    const categoryId = parseInt(key.replace('category-', ''))
    await loadChildren(key, categoryId)
    return Promise.resolve()
  }

  const onSelect = async (selectedKeys: React.Key[], info: any) => {
    const node = info.node as TreeNode
    if (node.type === 'article') {
      const slug = node.key.replace('article-', '')
      navigate(`/${userName}/${slug}`)
    } else if (node.type === 'category') {
      const key = node.key as string
      if (expandedKeys.includes(key)) {
        setExpandedKeys(expandedKeys.filter(k => k !== key))
      } else {
        setExpandedKeys([...expandedKeys, key])
        if (!node.children?.length) {
          const categoryId = parseInt(key.replace('category-', ''))
          await loadChildren(key, categoryId)
        }
      }
    }
  }

  const onExpand = (newExpandedKeys: React.Key[]) => {
    setExpandedKeys(newExpandedKeys)
  }

  const renderTitle = (nodeData: TreeNode) => {
    return (
      <div className="tree-node-wrapper">
        <Tooltip 
          title={nodeData.title} 
          mouseEnterDelay={0.5}
          placement="topLeft"
          overlayClassName="custom-tooltip"
        >
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className={`
              tree-node-title
              ${nodeData.type === 'article' ? 'article-node' : 'category-node'}
            `}
            title=""
          >
            {nodeData.title}
          </motion.div>
        </Tooltip>
      </div>
    )
  }

  const treeProps: TreeProps = {
    loadData: (node: any) => onLoadData(node as TreeNode),
    treeData: treeData.map(node => ({
      ...node,
      icon: updateFolderIcon(node),
      switcherIcon: <span style={{ width: 24, display: 'inline-block' }} />
    })),
    onSelect,
    onExpand,
    expandedKeys,
    showIcon: true,
    className: "category-tree",
    titleRender: (node: any) => renderTitle(node as TreeNode),
    selectable: true,
    blockNode: true,
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spin />
      </div>
    )
  }

  if (!treeData.length) {
    return <Empty description="暂无分类" />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="category-tree-container"
    >
      <Tree {...treeProps} />
    </motion.div>
  )
}

export default CategoryTree 