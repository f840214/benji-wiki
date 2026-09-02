import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

const API = [
['元件', [
  ['BrowserRouter', '<BrowserRouter>', '正常網址(/about),部署到 GitHub Pages 需額外處理刷新 404'],
  ['HashRouter', '<HashRouter>', '井號網址(/#/about),靜態空間免設定就能刷新——本 wiki 用這個'],
  ['Routes / Route', '<Route path="/a" element={<A />} />', '路徑對應元件;path="*" 當 404 頁'],
  ['Link', '<Link to="/about">', '站內連結,取代 <a>(不會整頁重新載入)'],
  ['NavLink', '<NavLink to="/a" className={({isActive}) => …}>', '帶「目前頁面」狀態的 Link,做導覽列高亮'],
  ['Outlet', '<Outlet />', '巢狀路由的子頁面渲染位置(版型共用的關鍵)'],
  ['Navigate', '<Navigate to="/login" replace />', '渲染時直接跳轉(權限擋頁用)'],
]],
['Hooks', [
  ['useNavigate', 'const nav = useNavigate(); nav("/home")', '程式控制跳轉;nav(-1) 是上一頁'],
  ['useParams', 'const { id } = useParams()', '讀網址參數(path="/user/:id" 的 :id)'],
  ['useLocation', 'const loc = useLocation()', '目前網址資訊(pathname、state)'],
  ['useSearchParams', 'const [sp, setSp] = useSearchParams()', '讀寫 query string(?page=2)'],
]],
]

export default function ReactRouterPage() {
  return (
    <div>
      <h1>react-router-dom</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        讓 SPA 有「多個頁面」:網址變了就渲染不同元件,但不重新載入頁面。
        這個 wiki 的側欄和分頁就是用它做的,可以直接看 src/App.jsx 和 Layout.jsx 對照。
      </p>

      <DataTable sections={API} headers={['API', '用法', '說明']} placeholder="搜尋 API…" />

      <h2>基本設定</h2>
      <Code>{`// main.jsx — Router 包在最外層
<HashRouter>
  <App />
</HashRouter>

// App.jsx — 定義路由表
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/user/:id" element={<User />} />
  <Route path="*" element={<NotFound />} />
</Routes>`}</Code>

      <h2>巢狀路由 + Outlet:共用版型</h2>
      <Code>{`// 外層 Route 不給 path 只給 element,子路由的內容會渲染在 <Outlet /> 的位置
<Routes>
  <Route element={<Layout />}>          {/* Layout 裡有側欄 + <Outlet /> */}
    <Route path="/" element={<Home />} />
    <Route path="/tailwind" element={<Tailwind />} />
  </Route>
</Routes>

function Layout() {
  return (
    <div className="flex">
      <Sidebar />
      <main><Outlet /></main>   {/* 子頁面出現在這 */}
    </div>
  )
}`}</Code>

      <h2>讀參數與跳轉</h2>
      <Code>{`// path="/user/:id" 網址是 /user/42
const { id } = useParams()        // "42"(是字串!要數字自己轉)

const nav = useNavigate()
nav('/result')                    // 跳頁
nav('/result', { replace: true }) // 取代目前歷史(登入後跳轉常用)
nav(-1)                           // 上一頁`}</Code>
    </div>
  )
}
