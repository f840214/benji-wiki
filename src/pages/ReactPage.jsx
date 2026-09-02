import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

const HOOKS = [
['Hooks 一覽', [
  ['useState', 'const [v, setV] = useState(初始值)', '元件的狀態;setV 觸發重新渲染'],
  ['useEffect', 'useEffect(fn, [依賴])', '副作用:抓資料、訂閱、計時器;回傳的函式是清理用'],
  ['useRef', 'const r = useRef(初始值)', '存不觸發渲染的值,或抓 DOM 元素(r.current)'],
  ['useMemo', 'useMemo(() => 計算, [依賴])', '快取昂貴的計算結果,依賴沒變就不重算'],
  ['useCallback', 'useCallback(fn, [依賴])', '快取函式本身,傳給子元件時避免不必要的重渲染'],
  ['useContext', 'useContext(MyContext)', '跨層讀取 Context,不用一層層傳 props'],
  ['useReducer', 'useReducer(reducer, 初始值)', '複雜狀態邏輯,像迷你 Redux'],
  ['useId', 'const id = useId()', '產生穩定唯一 id(label 對 input 用)'],
  ['useTransition', 'const [pending, start] = useTransition()', '把更新標成低優先,大列表過濾不卡輸入框'],
]],
]

export default function ReactPage() {
  return (
    <div>
      <h1>React</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        UI = f(state):畫面是狀態的函式,改狀態,React 幫你更新畫面。你只管資料,不用手動操作 DOM。
      </p>

      <DataTable sections={HOOKS} headers={['Hook', '簽名', '說明']} placeholder="搜尋 hook…" />

      <h2>useState:計數器</h2>
      <Code>{`import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(count + 1)}>
      點了 {count} 次
    </button>
  )
}`}</Code>

      <h2>useEffect:依賴陣列的三種寫法</h2>
      <Code>{`useEffect(() => { ... })          // 每次渲染後都跑(很少用)
useEffect(() => { ... }, [])       // 只在掛載時跑一次
useEffect(() => { ... }, [id])     // id 變了才跑

// 清理:回傳的函式會在下次執行前 & 卸載時呼叫
useEffect(() => {
  const timer = setInterval(tick, 1000)   // 掛機遊戲的遊戲迴圈
  return () => clearInterval(timer)       // 忘了清理會越開越多個!
}, [])`}</Code>

      <h2>列表渲染與條件渲染</h2>
      <Code>{`// 列表:map + key(key 要穩定唯一,別用 index 當 key 除非列表不會變動)
{items.map(item => <Row key={item.id} data={item} />)}

// 條件:&& 或三元
{isLoading && <Spinner />}
{error ? <ErrorBox msg={error} /> : <Content />}`}</Code>

      <h2>常見地雷</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>不要直接改 state</b>:<code>arr.push(x)</code> 不會觸發渲染,要 <code>setArr([...arr, x])</code>。</li>
        <li><b>setState 是非同步的</b>:setCount 之後馬上讀 count 還是舊值;連續累加用函式寫法 <code>setCount(c =&gt; c + 1)</code>。</li>
        <li><b>Hook 只能在最上層呼叫</b>:不能放在 if、迴圈、事件處理器裡。</li>
        <li><b>effect 依賴要誠實</b>:用到的變數就放進依賴陣列,漏了會拿到過期的值(閉包陷阱)。</li>
        <li><b>StrictMode 下 effect 會跑兩次</b>(開發模式限定):是故意的,幫你抓沒寫清理的 bug。</li>
      </ul>
    </div>
  )
}
