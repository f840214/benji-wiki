import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

const API = [
['常用 API', [
  ['createRoot', "createRoot(document.getElementById('root'))", '把 React 掛到真實 DOM 上,一個 app 呼叫一次'],
  ['root.render', 'root.render(<App />)', '渲染根元件'],
  ['root.unmount', 'root.unmount()', '整個卸載(嵌入別人頁面時才用得到)'],
  ['createPortal', 'createPortal(children, domNode)', '把子元素渲染到 DOM 樹的別處(modal、tooltip 防被 overflow 裁切)'],
  ['flushSync', 'flushSync(() => setX(1))', '強制同步更新,更新完馬上量 DOM 尺寸時用(少用)'],
  ['hydrateRoot', 'hydrateRoot(node, <App />)', 'SSR 用:接管伺服器渲染好的 HTML(Vite SPA 用不到)'],
]],
]

export default function ReactDomPage() {
  return (
    <div>
      <h1>react-dom</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        react 負責元件邏輯(平台無關),react-dom 負責把它畫到瀏覽器 DOM 上。
        手機的 react-native 就是換掉 react-dom 這層。平常 99% 只會碰到入口那兩行。
      </p>

      <DataTable sections={API} headers={['API', '用法', '說明']} placeholder="搜尋 API…" />

      <h2>標準入口(main.jsx)</h2>
      <Code>{`import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'   // 注意是 react-dom/client
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)`}</Code>

      <h2>Portal:modal 跳出容器</h2>
      <Code>{`import { createPortal } from 'react-dom'

function Modal({ children }) {
  // 渲染到 body 底下,不受父層 overflow: hidden / z-index 影響
  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      {children}
    </div>,
    document.body,
  )
}`}</Code>
    </div>
  )
}
