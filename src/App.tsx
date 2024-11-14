import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ConfigProvider } from 'antd'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import zhCN from 'antd/locale/zh_CN'
import Router from './router'
import { store } from './store'

function App() {
  return (
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <DndProvider backend={HTML5Backend}>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </DndProvider>
      </ConfigProvider>
    </Provider>
  )
}

export default App
