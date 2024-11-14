import { Layout, Menu, Button, Avatar, Dropdown } from 'antd'
import { useNavigate } from 'react-router-dom'
import { EditOutlined, UserOutlined } from '@ant-design/icons'
import { useAppSelector } from '@/hooks/store'
import { useAuth } from '@/hooks/useAuth'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const { isAuthenticated, userInfo } = useAppSelector((state) => state.user)
  const { logout } = useAuth()

  const userMenu = [
    {
      key: 'profile',
      label: '个人主页',
      onClick: () => navigate(`/user/${userInfo?.userName}`),
    },
    {
      key: 'settings',
      label: '设置',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      label: '退出登录',
      onClick: logout,
    },
  ]

  return (
    <AntHeader className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="container mx-auto px-4 flex items-center justify-between h-full">
        <div className="flex items-center">
          <div 
            className="text-2xl font-bold cursor-pointer mr-8" 
            onClick={() => navigate('/')}
          >
            Aris Blog
          </div>
          <Menu mode="horizontal" className="border-0">
            <Menu.Item key="home" onClick={() => navigate('/')}>
              首页
            </Menu.Item>
            <Menu.Item key="following" onClick={() => navigate('/following')}>
              关注
            </Menu.Item>
          </Menu>
        </div>
        
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => navigate('/editor')}
              >
                写文章
              </Button>
              <Dropdown menu={{ items: userMenu }} placement="bottomRight">
                <Avatar 
                  icon={<UserOutlined />} 
                  src={userInfo?.avatar}
                  className="cursor-pointer"
                />
              </Dropdown>
            </>
          ) : (
            <Button type="primary" onClick={() => navigate('/auth')}>
              登录
            </Button>
          )}
        </div>
      </div>
    </AntHeader>
  )
}

export default Header 