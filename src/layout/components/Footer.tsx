import { Layout } from 'antd'

const { Footer: AntFooter } = Layout

const Footer = () => {
  return (
    <AntFooter className="text-center">
      Aris Blog ©{new Date().getFullYear()} Created by Your Name
    </AntFooter>
  )
}

export default Footer 