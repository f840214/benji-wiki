import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

const API = [
['核心 API', [
  ['create', 'const useStore = create((set, get) => ({...}))', '建立 store,回傳一個 hook'],
  ['set', 'set({ count: 1 }) / set(s => ({ count: s.count + 1 }))', '更新狀態(淺合併,不用像 setState 展開整個物件)'],
  ['get', 'get().count', '在 action 裡讀當下狀態'],
  ['selector', 'useStore(s => s.count)', '只訂閱需要的欄位,其他欄位變了不重渲染(效能關鍵)'],
  ['getState', 'useStore.getState()', '在 React 外讀狀態(遊戲迴圈、工具函式)'],
  ['setState', 'useStore.setState({...})', '在 React 外改狀態'],
  ['subscribe', 'useStore.subscribe(listener)', '在 React 外監聽變化'],
]],
['Middleware', [
  ['persist', 'create(persist(config, { name: "存檔鍵" }))', '自動存 localStorage——掛機遊戲存檔就靠這個'],
  ['devtools', 'create(devtools(config))', '接 Redux DevTools 看狀態變化'],
  ['immer', 'create(immer(config))', '可以直接「改」巢狀物件,它幫你產生新物件'],
]],
]

export default function ZustandPage() {
  return (
    <div>
      <h1>Zustand</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        輕量全域狀態管理:一個 store 就是一個 hook,不用 Provider 包來包去。
        這個 wiki 的密碼解鎖狀態就是一個 zustand store(src/store.js)。
      </p>

      <DataTable sections={API} headers={['API', '用法', '說明']} placeholder="搜尋 API…" />

      <h2>最小範例</h2>
      <Code>{`import { create } from 'zustand'

const useGame = create((set) => ({
  gold: 0,
  addGold: (n) => set((s) => ({ gold: s.gold + n })),
}))

// 元件裡:像用 useState 一樣自然
function GoldDisplay() {
  const gold = useGame((s) => s.gold)        // 只訂閱 gold
  return <span>💰 {gold}</span>
}

function MineButton() {
  const addGold = useGame((s) => s.addGold)  // 只拿 action,gold 變了這裡不重渲染
  return <button onClick={() => addGold(10)}>挖礦</button>
}`}</Code>

      <h2>persist:自動存檔(放置遊戲必備)</h2>
      <Code>{`import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useGame = create(
  persist(
    (set) => ({
      gold: 0,
      level: 1,
      addGold: (n) => set((s) => ({ gold: s.gold + n })),
    }),
    { name: 'my-game-save' },   // localStorage 的 key,關掉重開進度還在
  ),
)`}</Code>

      <h2>在 React 外面用(遊戲迴圈)</h2>
      <Code>{`// setInterval / Pixi ticker 裡不能用 hook,改用 getState / setState
setInterval(() => {
  const { gold, addGold } = useGame.getState()
  addGold(gold * 0.01)   // 每秒利息 1%
}, 1000)`}</Code>

      <h2>要注意的</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>selector 要選最小範圍</b>:<code>useStore(s =&gt; s.gold)</code> 好;<code>useStore()</code> 整包拿會任何欄位變都重渲染。</li>
        <li><b>set 是淺合併</b>:巢狀物件要自己展開(或上 immer middleware)。</li>
        <li><b>action 直接定義在 store 裡</b>:狀態和改狀態的邏輯放一起,元件保持乾淨。</li>
      </ul>
    </div>
  )
}
