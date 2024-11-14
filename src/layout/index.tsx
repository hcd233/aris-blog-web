import { Outlet } from 'react-router-dom'
import { Layout } from 'antd'
import Header from './components/Header'
import Footer from './components/Footer'

const { Content } = Layout

const MainLayout = () => {
  return (
    <Layout className="min-h-screen">
      <Header />
      <Content>
        <Outlet />
      </Content>
      <Footer />
    </Layout>
  )
}

export default MainLayout 