import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { useAppSelector } from '@/hooks/store'
import { Layout, Menu, List, Avatar, Space, Button, Divider, Empty, Tooltip } from 'antd'
import { 
  LikeOutlined, 
  MessageOutlined, 
  EyeOutlined,
  RiseOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  PlusOutlined,
  LockOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import CategoryManager from '@/components/CategoryManager'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from 'antd'
import ArticleService, { Article } from '@/services/article'

const { Header, Content, Sider } = Layout

const Home = () => {
  const { userInfo } = useAppSelector((state) => state.user)
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const isCreatorOrAdmin = userInfo?.permission === 'creator' || userInfo?.permission === 'admin'

  const userMenuItems = useMemo(() => [
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
      key: 'divider'
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
    } finally {
      setLoading(false)
    }
  }, [userInfo])

  useEffect(() => {
    if (userInfo) {
      loadArticles()
    }
  }, [userInfo, loadArticles])

  return (
    <Layout className="min-h-screen">
      {/* Top Header */}
      <Header className="bg-white border-b px-4 h-16 flex items-center justify-between fixed w-full z-10">
        <div className="flex items-center">
          <h1 className="text-xl font-bold m-0">Aris Blog</h1>
        </div>
        
        {userInfo && (
          <div className="flex items-center">
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

      {/* Main Layout */}
      <Layout className="mt-16">
        {/* Left Sidebar - Category Manager */}
        <Sider
          width={250}
          className="bg-white border-r overflow-auto fixed h-[calc(100vh-64px)] left-0"
          style={{ top: '64px' }}
        >
          <div className="p-4 h-full relative">
            {!isCreatorOrAdmin && (
              <div className="absolute inset-0 backdrop-blur-sm bg-white/50 z-10 flex flex-col items-center justify-center">
                <div className="flex flex-col items-center px-6">
                  <LockOutlined className="text-2xl text-gray-400 mb-3" />
                  <p className="text-gray-500 text-sm text-center leading-relaxed">
                    只有创作者和管理员可以管理文章分类
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium m-0">文章分类</h3>
              <Button 
                type="primary" 
                size="small"
                className="flex items-center"
                icon={<PlusOutlined />}
                disabled={!isCreatorOrAdmin}
              >
                新建
              </Button>
            </div>
            <CategoryManager userName={userInfo?.userName} />
          </div>
        </Sider>

        {/* Main Content */}
        <Layout className="ml-[250px]">
          <Content className="p-6">
            {/* Article Filters */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <Menu 
                mode="horizontal" 
                selectedKeys={['recommended']}
                className="border-0"
                items={[
                  {
                    key: 'recommended',
                    icon: <RiseOutlined />,
                    label: '推荐'
                  }
                ]}
              />
            </div>

            {/* Article List */}
            <List
              loading={loading}
              itemLayout="vertical"
              size="large"
              className="bg-white rounded-lg p-4"
              dataSource={articles}
              locale={{
                emptyText: <Empty description="暂无文章" />
              }}
              renderItem={(article: Article) => (
                <List.Item
                  key={article.id}
                  className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
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
                      <div>
                        <div className="flex items-center text-gray-500 text-sm mb-2">
                          <span>{article.user.name}</span>
                          <Divider type="vertical" />
                          <span>{dayjs(article.publishedAt).format('YYYY-MM-DD')}</span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Content>
        </Layout>

        {/* Right Sidebar */}
        <Sider
          width={300}
          className="bg-transparent px-6"
        >
          <div className="relative w-full">
            <Button 
              type="primary" 
              size="large" 
              block 
              className="mb-6"
              onClick={() => navigate('/editor')}
              disabled={!isCreatorOrAdmin}
            >
              开始写作
            </Button>
            
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
        </Sider>
      </Layout>
    </Layout>
  )
}

export default Home