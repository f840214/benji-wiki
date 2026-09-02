import { Link } from 'react-router-dom'

const TOPICS = [
  { to: '/tailwind', tag: 'CSS', title: 'Tailwind CSS', desc: 'v4 常用 class 中文對照,含間距刻度、顏色寫法、前綴修飾。' },
  { to: '/html-tags', tag: '基礎', title: 'HTML 標籤', desc: '常用標籤分類查詢:結構、文字、表單、表格、媒體。' },
  { to: '/react', tag: 'React 生態', title: 'React', desc: 'Hooks 一覽、JSX 規則、常見模式與地雷。' },
  { to: '/react-dom', tag: 'React 生態', title: 'react-dom', desc: 'createRoot、Portal、與 react 套件的分工。' },
  { to: '/react-router', tag: 'React 生態', title: 'react-router-dom', desc: '路由設定、Link 導航、useNavigate / useParams。' },
  { to: '/zustand', tag: 'React 生態', title: 'Zustand', desc: '建 store、selector 用法、persist 存檔。' },
]

export default function Home() {
  return (
    <div>
      <h1>Benji Wiki</h1>
      <p className="text-muted mb-6 max-w-[62ch]">
        自己的前端查詢筆記。每頁都有即時搜尋(中文、API 名稱都能搜),想加什麼主題就加什麼。
        這個 wiki 本身就是用它教的東西做的:React + Vite + Tailwind v4 + react-router-dom + zustand。
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5 mt-6">
        {TOPICS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className="block bg-panel border border-line rounded-xl px-4 py-4 text-ink transition hover:border-accent-deep hover:-translate-y-0.5 hover:no-underline"
          >
            <span className="inline-block text-[.68rem] text-accent bg-accent-soft rounded px-1.5 py-px mb-2 tracking-wide">
              {t.tag}
            </span>
            <h3 className="mt-0 mb-1">{t.title}</h3>
            <p className="m-0 text-[.83rem] text-muted">{t.desc}</p>
          </Link>
        ))}
      </div>

      <h2>怎麼新增頁面</h2>
      <ol className="list-decimal pl-5 space-y-1 max-w-[70ch]">
        <li>在 <code>src/pages/</code> 複製一頁改內容(表格型用 <code>DataTable</code>,文章型參考 React 那幾頁)。</li>
        <li><code>src/nav.js</code> 加一行,側欄自動出現。</li>
        <li><code>src/App.jsx</code> 加對應的 <code>&lt;Route&gt;</code>。</li>
        <li><code>git push</code> 之後 GitHub Actions 會自動 build 部署。</li>
      </ol>
    </div>
  )
}
