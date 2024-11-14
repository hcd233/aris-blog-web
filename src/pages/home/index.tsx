import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAppSelector } from '@/hooks/store'
import { 
  Layout, 
  Menu, 
  List, 
  Avatar, 
  Space, 
  Button, 
  Divider, 
  Empty, 
  Tooltip, 
  Input, 
  Modal, 
  Tag as AntTag, 
  Tabs,
  Dropdown,
  message,
  MenuProps,
  Card
} from 'antd'
import { 
  LikeOutlined, 
  MessageOutlined, 
  EyeOutlined,
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  PlusOutlined,
  LockOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CloseOutlined,
  TagOutlined,
  FolderOutlined
} from '@ant-design/icons'
import { motion, AnimatePresence } from 'framer-motion'
import dayjs from 'dayjs'
import debounce from 'lodash/debounce'
import CategoryManager from '@/components/CategoryManager'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import ArticleService, { Article, SearchArticle } from '@/services/article'
import LoadingIndicator from '@/components/LoadingIndicator'
import UserService, { SearchUser } from '@/services/user'
import TagService, { TagType } from '@/services/tag'
import TagList from '@/components/TagList'

const { Header, Content, Sider } = Layout
const { Search } = Input
const { TabPane } = Tabs

const MIN_QUERY_LENGTH = 2
const MAX_QUERY_LENGTH = 50

const Home = () => {
  const { userInfo } = useAppSelector((state) => state.user)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchArticle[]>([])
  const [searching, setSearching] = useState(false)
  const [searchType, setSearchType] = useState<'article' | 'tag' | 'user'>('article')
  const [tagResults, setTagResults] = useState<TagType[]>([])
  const [userResults, setUserResults] = useState<SearchUser[]>([])

  const isCreatorOrAdmin = userInfo?.permission === 'creator' || userInfo?.permission === 'admin'

  const userMenuItems: MenuProps['items'] = useMemo(() => [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人主页',
      onClick: () => navigate(`/user/${userInfo?.userName}`),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ], [navigate, userInfo?.userName, logout])

  const loadArticles = useCallback(async () => {
    if (!userInfo) return
    
    setLoading(true)
    try {
      const response = await ArticleService.getArticles()
      setArticles(response.data.articles)
    } catch (error) {
      console.error('Failed to fetch articles:', error)
      message.error('获取文章列表失败')
    } finally {
      setLoading(false)
    }
  }, [userInfo])

  useEffect(() => {
    if (userInfo) {
      loadArticles()
    }
  }, [userInfo, loadArticles])

  const executeSearch = useCallback(async (value: string, type: 'article' | 'tag' | 'user') => {
    const trimmedValue = value.trim()
    
    if (trimmedValue.length < MIN_QUERY_LENGTH) {
      message.warning('搜索关键词至少需要2个字符')
      setSearchResults([])
      setTagResults([])
      setUserResults([])
      return
    }
    
    if (trimmedValue.length > MAX_QUERY_LENGTH) {
      message.warning('搜索关键词不能超过50个字符')
      return
    }

    setSearching(true)
    try {
      switch (type) {
        case 'article':
          const articleResponse = await ArticleService.searchArticles(trimmedValue)
          setSearchResults(articleResponse.data.articles)
          break
        case 'tag':
          const tagResponse = await TagService.searchTags(trimmedValue)
          setTagResults(tagResponse.data.tags)
          break
        case 'user':
          const userResponse = await UserService.searchUsers(trimmedValue)
          if (userResponse.data && userResponse.data.users) {
            setUserResults(userResponse.data.users)
          } else {
            setUserResults([])
            console.error('Invalid user search response:', userResponse)
          }
          break
      }
    } catch (error) {
      console.error('Search failed:', error)
      message.error('搜索失败，请稍后重试')
      switch (type) {
        case 'article':
          setSearchResults([])
          break
        case 'tag':
          setTagResults([])
          break
        case 'user':
          setUserResults([])
          break
      }
    } finally {
      setSearching(false)
    }
  }, [])

  const handleSearch = useMemo(
    () => debounce((value: string) => executeSearch(value, searchType), 500),
    [executeSearch, searchType]
  )

  const renderSearchResults = () => {
    if (searching) {
      return (
        <div className="py-12">
          <LoadingIndicator size={48} text="正在搜索..." color="#1677ff" />
        </div>
      )
    }

    switch (searchType) {
      case 'article':
        return (
          <List
            itemLayout="vertical"
            dataSource={searchResults}
            locale={{
              emptyText: searchQuery ? '未找到相关文章' : '输入关键词开始搜索'
            }}
            renderItem={(article) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <List.Item
                  className="cursor-pointer rounded-lg hover:bg-gray-50 transition-all duration-200"
                  onClick={() => {
                    navigate(`/${article.author}/${article.slug}`)
                    setSearchVisible(false)
                  }}
                >
                  <List.Item.Meta
                    title={
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-medium hover:text-blue-500 transition-colors">
                          {article.title}
                        </span>
                      </div>
                    }
                    description={
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <span>作者：{article.author}</span>
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                          {article.content.replace(/[#*`]/g, '')}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {article.tags.map(tag => (
                            <AntTag
                              key={tag}
                              className="px-2 py-0.5 rounded-full border-blue-100 bg-blue-50 text-blue-600"
                            >
                              {tag}
                            </AntTag>
                          ))}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              </motion.div>
            )}
          />
        )

      case 'tag':
        return (
          <List
            itemLayout="horizontal"
            dataSource={tagResults}
            locale={{
              emptyText: searchQuery ? '未找到相关标签' : '输入关键词开始搜索'
            }}
            renderItem={tag => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 transition-colors p-4 rounded-lg"
                  onClick={() => navigate(`/tag/${tag.slug}`)}
                >
                  <List.Item.Meta
                    avatar={<TagOutlined className="text-blue-500 text-2xl" />}
                    title={<div className="text-lg font-medium">{tag.name}</div>}
                    description={<div className="text-gray-500">{tag.slug}</div>}
                  />
                </List.Item>
              </motion.div>
            )}
          />
        )

      case 'user':
        return (
          <List
            itemLayout="horizontal"
            dataSource={userResults}
            locale={{
              emptyText: searchQuery ? '未找到相关用户' : '输入关键词开始搜索'
            }}
            renderItem={user => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 transition-colors p-4 rounded-lg"
                  onClick={() => navigate(`/user/${user.userName}`)}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={user.avatar} size={48} />}
                    title={<div className="text-lg font-medium">{user.userName}</div>}
                  />
                </List.Item>
              </motion.div>
            )}
          />
        )

      default:
        return null
    }
  }

  return (
    <Layout className="min-h-screen bg-white">
      {/* Top Header */}
      <Header className="bg-white border-b px-6 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center flex-1">
          <h1 className="text-xl font-bold m-0 mr-8">Aris Blog</h1>
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="搜索文章..."
            className="max-w-md"
            allowClear
            onClick={() => setSearchVisible(true)}
          />
        </div>
        
        {userInfo && (
          <div className="flex items-center gap-4">
            {isCreatorOrAdmin && (
              <Button 
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => navigate('/editor')}
              >
                写文章
              </Button>
            )}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <div className="flex items-center cursor-pointer rounded-full px-3 py-1.5 transition-colors hover:bg-gray-100">
                <Avatar 
                  src={userInfo.avatar} 
                  size={32}
                  alt={userInfo.userName}
                />
                <span className="ml-2 font-medium text-gray-700">{userInfo.userName}</span>
              </div>
            </Dropdown>
          </div>
        )}
      </Header>

      {/* Main Content Area */}
      <Layout className="bg-gray-50 min-h-[calc(100vh-64px)]">
        {/* Left Sidebar */}
        <Sider
          width={300}
          className="bg-transparent px-6 hidden xl:block"
        >
          <div className="sticky top-[80px]">
            {/* 分类管理卡片 */}
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FolderOutlined className="mr-2 text-blue-500" />
                    文章分类
                  </span>
                  {isCreatorOrAdmin && (
                    <Button 
                      type="text"
                      size="small"
                      icon={<PlusOutlined />}
                    />
                  )}
                </div>
              }
              className="bg-white shadow-sm"
            >
              <CategoryManager userName={userInfo?.userName} />
            </Card>
          </div>
        </Sider>

        {/* Main Content */}
        <Content className="px-6 py-6 mx-auto" style={{ maxWidth: '800px' }}>
          {/* Article Filters */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <Menu 
              mode="horizontal" 
              selectedKeys={['recommended']}
              className="border-0"
              items={[
                {
                  key: 'recommended',
                  icon: <EyeOutlined />,
                  label: '推荐'
                }
              ]}
            />
          </div>

          {/* Article List */}
          <motion.div layout>
            <List
              loading={loading}
              itemLayout="vertical"
              size="large"
              className="bg-white rounded-lg shadow-sm"
              dataSource={articles}
              locale={{
                emptyText: <Empty description="暂无文章" />
              }}
              renderItem={(article: Article) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <List.Item
                    key={article.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors p-6 border-b last:border-b-0"
                    onClick={() => navigate(`/${article.user.name}/${article.slug}`)}
                    actions={[
                      <Space key="likes" className="text-gray-500">
                        <LikeOutlined /> {article.likes}
                      </Space>,
                      <Space key="comments" className="text-gray-500">
                        <MessageOutlined /> {article.comments}
                      </Space>,
                      <Space key="views" className="text-gray-500">
                        <EyeOutlined /> {article.views}
                      </Space>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar src={article.user.avatar} size={40} />}
                      title={
                        <h3 className="text-xl font-bold hover:text-blue-600 m-0">
                          {article.title}
                        </h3>
                      }
                      description={
                        <div className="flex items-center text-gray-500 text-sm mt-2">
                          <span>{article.user.name}</span>
                          <Divider type="vertical" />
                          <span>{dayjs(article.publishedAt).format('YYYY-MM-DD')}</span>
                        </div>
                      }
                    />
                  </List.Item>
                </motion.div>
              )}
            />
          </motion.div>
        </Content>

        {/* Right Sidebar */}
        <Sider
          width={300}
          className="bg-transparent px-6 hidden xl:block"
        >
          <div className="sticky top-[80px] space-y-6">
            <div className="relative w-full">
              
              {!isCreatorOrAdmin && (
                <div className="absolute top-0 left-0 right-0 bottom-0 backdrop-blur-sm bg-white/50 z-10 rounded-lg flex items-center justify-center">
                  <div className="flex flex-col items-center px-2 py-1">
                    <LockOutlined className="text-lg text-gray-400 mb-1" />
                    <p className="text-gray-500 text-xs text-center">
                      只有创作者和管理员可以发布文章
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 标签列表 */}
            <TagList />
          </div>
        </Sider>
      </Layout>

      {/* 搜索弹窗 */}
      <Modal
        title={null}
        open={searchVisible}
        onCancel={() => {
          setSearchVisible(false)
          setSearchQuery('')
          setSearchResults([])
          setTagResults([])
          setUserResults([])
        }}
        footer={null}
        width={800}
        className="search-modal"
        closeIcon={<CloseOutlined className="text-gray-400 hover:text-gray-600" />}
        styles={{
          body: {
            padding: '0',
            borderRadius: '12px',
          },
          mask: {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(4px)',
          },
          content: {
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            borderRadius: '12px',
          }
        }}
        destroyOnClose
      >
        <div className="flex flex-col h-[80vh]">
          <div className="p-4 border-b border-gray-100">
            <Input
              prefix={
                searching ? (
                  <div className="flex items-center pr-2">
                    <LoadingIndicator size={20} color="#1677ff" />
                  </div>
                ) : (
                  <SearchOutlined className="text-gray-400" />
                )
              }
              placeholder={`搜索${
                searchType === 'article' ? '文章' : 
                searchType === 'tag' ? '标签' : '用户'
              }（2-50个字符）...`}
              allowClear
              value={searchQuery}
              onChange={e => {
                const value = e.target.value
                setSearchQuery(value)
                if (value.trim().length >= MIN_QUERY_LENGTH && value.length <= MAX_QUERY_LENGTH) {
                  handleSearch(value)
                } else if (value.trim().length === 0) {
                  setSearchResults([])
                  setTagResults([])
                  setUserResults([])
                }
              }}
              className="text-lg"
              size="large"
              autoFocus
            />
          </div>

          <Tabs
            activeKey={searchType}
            onChange={(key) => {
              const newType = key as 'article' | 'tag' | 'user'
              setSearchType(newType)
              if (searchQuery.trim()) {
                executeSearch(searchQuery, newType)
              }
            }}
            className="px-4 pt-2"
          >
            <TabPane tab="文章" key="article" />
            <TabPane tab="标签" key="tag" />
            <TabPane tab="用户" key="user" />
          </Tabs>

          <div className="flex-1 overflow-auto px-4">
            {searchQuery.trim().length < MIN_QUERY_LENGTH ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <SearchOutlined style={{ fontSize: '24px' }} className="mb-3" />
                <span>请输入至少2个字符开始搜索</span>
              </div>
            ) : searchQuery.length > MAX_QUERY_LENGTH ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <CloseOutlined style={{ fontSize: '24px' }} className="mb-3" />
                <span>搜索关键词不能超过50个字符</span>
              </div>
            ) : (
              renderSearchResults()
            )}
          </div>
        </div>
      </Modal>

      {/* 使用 CSS-in-JS 替代 style jsx */}
      <style>
        {`
          .search-modal .ant-modal-content {
            padding: 0;
            overflow: hidden;
          }
          
          .search-modal .ant-input-affix-wrapper:focus,
          .search-modal .ant-input-affix-wrapper-focused {
            box-shadow: none;
            border-color: #e5e7eb;
          }
          
          .search-modal .ant-list-item {
            padding: 16px;
            margin: 8px 0;
            border: 1px solid transparent;
          }
          
          .search-modal .ant-list-item:hover {
            border-color: #e5e7eb;
          }
          
          .search-modal .ant-modal-close {
            top: 20px;
            right: 20px;
          }
        `}
      </style>
    </Layout>
  )
}

export default Home