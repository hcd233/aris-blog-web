import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Tabs, Avatar, Button, Statistic, Card, List, Tag, Space } from 'antd'
import { 
  EditOutlined, 
  SettingOutlined,
  FileTextOutlined,
  LikeOutlined,
  EyeOutlined,
  StarOutlined,
  GithubOutlined,
  TwitterOutlined,
  GlobalOutlined
} from '@ant-design/icons'
import { motion } from 'framer-motion'
import dayjs from 'dayjs'
import PageTransition from '@/components/PageTransition'

const { Content, Sider } = Layout
const { TabPane } = Tabs

// 模拟数据
const mockUserInfo = {
  userName: 'John Doe',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  bio: '全栈开发工程师 / 技术写作者 / 开源爱好者',
  github: 'https://github.com/johndoe',
  twitter: 'https://twitter.com/johndoe',
  website: 'https://johndoe.com',
  stats: {
    articles: 42,
    followers: 1234,
    following: 321,
    likes: 5678
  }
}

const mockArticles = [
  {
    id: 1,
    title: '深入理解 React Hooks: 从原理到实践',
    summary: 'React Hooks 是 React 16.8 引入的新特性，它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性...',
    tags: ['React', 'JavaScript', 'Web Development'],
    publishTime: '2024-01-20T12:00:00Z',
    likes: 128,
    views: 1024
  },
  // 添加更多文章...
]

const Profile = () => {
  const { userName } = useParams()
  const [activeTab, setActiveTab] = useState('articles')
  const isOwner = true // 这里应该根据实际登录用户判断

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 pt-16">
        {/* 用户信息头部 */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Avatar 
                    size={128} 
                    src={mockUserInfo.avatar}
                    className="border-4 border-white shadow-lg"
                  />
                </motion.div>
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <h1 className="text-3xl font-bold mb-2">{mockUserInfo.userName}</h1>
                  <p className="text-gray-600 mb-4">{mockUserInfo.bio}</p>
                  <Space size="large" className="text-gray-500">
                    {mockUserInfo.github && (
                      <a href={mockUserInfo.github} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
                        <GithubOutlined className="mr-1" /> Github
                      </a>
                    )}
                    {mockUserInfo.twitter && (
                      <a href={mockUserInfo.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
                        <TwitterOutlined className="mr-1" /> Twitter
                      </a>
                    )}
                    {mockUserInfo.website && (
                      <a href={mockUserInfo.website} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700">
                        <GlobalOutlined className="mr-1" /> Website
                      </a>
                    )}
                  </Space>
                </motion.div>
              </div>
              {isOwner && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="space-x-4"
                >
                  <Button icon={<EditOutlined />}>编辑个人资料</Button>
                  <Button icon={<SettingOutlined />}>设置</Button>
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex justify-start space-x-12 mt-8"
            >
              <Statistic title="文章" value={mockUserInfo.stats.articles} prefix={<FileTextOutlined />} />
              <Statistic title="获赞" value={mockUserInfo.stats.likes} prefix={<LikeOutlined />} />
              <Statistic title="关注者" value={mockUserInfo.stats.followers} prefix={<StarOutlined />} />
              <Statistic title="关注中" value={mockUserInfo.stats.following} prefix={<EyeOutlined />} />
            </motion.div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="container mx-auto px-4 py-6">
          <Layout className="bg-transparent">
            <Content className="mr-8">
              <Card className="mb-6">
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                  <TabPane tab="文章" key="articles" />
                  <TabPane tab="点赞" key="likes" />
                  <TabPane tab="收藏" key="collections" />
                </Tabs>

                <List
                  itemLayout="vertical"
                  size="large"
                  dataSource={mockArticles}
                  renderItem={(item) => (
                    <List.Item
                      key={item.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                      actions={[
                        <Space className="text-gray-500">
                          <LikeOutlined /> {item.likes}
                        </Space>,
                        <Space className="text-gray-500">
                          <EyeOutlined /> {item.views}
                        </Space>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div className="text-lg font-bold hover:text-blue-600">
                            {item.title}
                          </div>
                        }
                        description={
                          <div>
                            <p className="text-gray-600 mb-2">{item.summary}</p>
                            <div className="flex items-center justify-between">
                              <Space size={[0, 8]} wrap>
                                {item.tags.map((tag) => (
                                  <Tag 
                                    key={tag} 
                                    className="bg-blue-50 text-blue-600 border-blue-100"
                                  >
                                    {tag}
                                  </Tag>
                                ))}
                              </Space>
                              <span className="text-gray-400 text-sm">
                                {dayjs(item.publishTime).format('YYYY-MM-DD')}
                              </span>
                            </div>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Content>

            <Sider width={300} className="bg-transparent">
              <Card title="个人介绍" className="mb-6">
                <p className="text-gray-600">
                  {mockUserInfo.bio}
                </p>
              </Card>

              <Card title="技能标签">
                <Space size={[0, 8]} wrap>
                  {['React', 'TypeScript', 'Node.js', 'Python', 'Docker'].map((tag) => (
                    <Tag 
                      key={tag}
                      className="bg-blue-50 text-blue-600 border-blue-100 mb-2"
                    >
                      {tag}
                    </Tag>
                  ))}
                </Space>
              </Card>
            </Sider>
          </Layout>
        </div>
      </div>
    </PageTransition>
  )
}

export default Profile 