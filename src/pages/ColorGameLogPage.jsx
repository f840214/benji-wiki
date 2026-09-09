import { useState } from 'react'
import Code from '../components/Code.jsx'

// nexus-colorgame-client 製作歷程:一筆一個工作段落,最新在最上面。
// 加新紀錄:在 ENTRIES 最前面加一個物件就好,欄位都可省略(空的不會畫出來)。
//   date     日期
//   title    一句話標題
//   branch   分支 / commit(未 commit 就寫 branch 名 + 未 commit)
//   summary  做了什麼(陣列,一條一句)
//   decisions 做了哪些決定、為什麼(陣列)
//   pitfalls 踩到的坑(陣列)
//   evidence 驗證證據:量測 / 閘門(陣列)
//   todo     這段留下的待辦(陣列)
//   files    動到的主要檔案(陣列,顯示成 code)
//   links    相關頁 / 文件([[文字, href]])

const ENTRIES = [
  {
    date: '2026-09-09',
    title: '大廳區塊 A 落地:頁面殼 + 頂欄 + 跑馬燈列(第一個依 Figma 稿建的畫面)',
    branch: 'benji-dev(未 commit)',
    summary: [
      '照 figma-to-react 流程走完整趟:讀 lobby_all-size node 1:153 → design-spec → 匯圖 → TSX → headless Chrome 量測。',
      '新增 views/lobby/:LobbyBackdrop(四層背景,底板純 CSS 漸層)、LobbyHeader(Home / 頭像 / 暱稱 / 餘額 / 儲值 / Menu)、LobbyMessageBar(跑馬燈 40 px/s + Banner 切換)、lobbyAssets(+測試)、homeButtonVisibility(自 roulette 複製)。',
      'LobbyView 由文字殼改成真殼,內容區留 B(標題+活動入口)/ C(桌卡)/ D(頁尾)佔位。',
      'useUiStore 加 isMenuOpen / openMenu / closeMenu;主選單面板本體沒做。',
      '字型裝 @fontsource/baloo-2 與 luckiest-guy(400),index.css 加 font-baloo / font-luckiest token。',
      '匯圖:figma-export-assets.sh 首批七項;PNG 母檔 assets-raw/lobby/,runtime public/assets/lobby/(WebP);三支 icon 進 src/assets/icons/ 走 ?react。',
    ],
    decisions: [
      '整頁稿切五塊,先做 A:它是底座,B / C / D 都掛在它上面。',
      '頂欄那顆不明 icon 回 cg-client ColorGameLobbyTopBar 對,是 RechargeButton → 接 requestDeposit;Home 顯示規則沿用 roulette 的 shouldShowHomeButton(試玩非嵌入時隱藏、仍佔位)。',
      '稿上 info player 框寬 304.5 比子項總和 310.75 小(stale container)。取框寬讓 Home / Menu / 頭像座標對稿,兩顆膠囊各縮約 3px;儲值鈕照稿座標錨在框右緣外 5.25。',
      'bg_room 四層漸層不切圖,純 CSS 重繪;布幔淺色副本(1:157)重用同一張圖 + CSS 上蓋漸層,省一支 120KB。',
      '稿上餘額列的底字型 Baloo Bhaijaan 沒有任何可見字元用到 → 不載。',
      '跑馬燈訊息暫為固定預設公告(cg-client DEFAULT_MESSAGE_LIST 同文),SDK MarqueeList 接線另開工作。',
    ],
    pitfalls: [
      '.env.local 的 VITE_FIGMA_FILE_KEY 還是舊檔 → images API 回 err:null 但 images 空,腳本顯示「找不到 node 的 URL」。換成大廳 key GDKlKfyqIwbQUMguc26yci 才拿得到。',
      'Tailwind v4 @theme 的 --animate-* 若引用元素層 CSS 變數(var(--marquee-duration)),會在 :root 解析、永遠吃 fallback 12s。改成 @utility 直接寫 animation、keyframes 放頂層才吃到 inline 變數。',
      'svgo 會順手改到既有的 icon_loading.svg,commit 前 git checkout 還原,diff 才乾淨。',
      'svgo 後 fill 會變小寫 #f6e404 / #fff,sed 換 currentColor 要對這個格式。',
      'Figma 節點匯出的 SVG 含效果外溢(緞帶 880×193 → 1011×205),不能照節點 x/y 放,改置中。',
    ],
    evidence: [
      '432×768:頂欄 / Home / Menu / 頭像 / 儲值 / 跑馬燈膠囊 / Banner / 底板 Δ ≤ 0.5px;跑馬燈時長 21.475s = (237.5+621.4)/40。',
      '兩顆膠囊寬 Δ −3(stale container 取捨);緞帶只置中未做像素比對;375 / 432×960 / 576×768 有量但沒稿可對。',
      'document.fonts.check 全 true;typecheck / lint 0 warning / 404 tests / build(首屏 chunk 閘門)全綠;assets:check 過。',
      '量測工具:scratchpad 的 measure.mjs(CDP 驅動 headless Chrome,setDeviceMetricsOverride 設尺寸,走試玩登入到大廳後讀 getBoundingClientRect / computed style)。',
    ],
    todo: [
      'Baloo vs Baloo 2 字幅差異,問設計稿用哪版。',
      '區塊 C 桌卡(四變體 + 路書)→ B 標題與活動入口(走 campaigns registry)→ D 頁尾。',
      'SDK MarqueeList:global handler + store,輪播與點擊跳轉(url / targetTable)。',
      '主選單面板、Banner 本體、20:9 / 21:9 / 4:3 三張稿對位、bg_ribbon 像素比對。',
    ],
    files: [
      'src/views/LobbyView.tsx', 'src/views/lobby/LobbyBackdrop.tsx', 'src/views/lobby/LobbyHeader.tsx',
      'src/views/lobby/LobbyMessageBar.tsx', 'src/views/lobby/lobbyAssets.ts', 'src/game/store/useUiStore.ts',
      'src/index.css', 'src/main.tsx', 'scripts/figma-export-assets.sh', 'docs/plan/大廳-design-spec.md', 'MEMORY.md', 'CLAUDE.md',
    ],
    links: [['流程怎麼走', '#/figma-to-react'], ['目錄清單', '#/colorgame-dirs']],
  },
  {
    date: '2026-09-09',
    title: 'figma-to-react 試跑:讀大廳稿、產 design-spec、拆分計畫',
    branch: 'master(只產文件,未進 repo)',
    summary: [
      '用 figma-framelink(Personal Access Token)讀 node 1:153,回傳 2,574 行超 token 上限 → 落檔用 grep / awk 解析。',
      '寫出區塊 A 的 design-spec(元件樹 / 設計標記 / 間距 / 字型 / 色票 / i18n key / 資產清單),整頁拆五塊。',
      '確認三套稿上字型專案沒有、只量了 16:9、兩個語意(儲值 icon、跑馬燈)要回 cg-client 對。',
    ],
    decisions: ['spec 先放 scratchpad,決定開工才移進 docs/plan/(有壽命的實作期文件)。'],
    links: [['Figma → React 流程頁', '#/figma-to-react']],
  },
  {
    date: '2026-09-08',
    title: '實作範圍定案、資料流設計、移除換皮總表(commit 9bcd828 / 3953fc3 / aaca951)',
    branch: 'master',
    summary: [
      'PulaPuti 另開 repo,本專案永遠只做 tableType 31。',
      'docs/plan/資料流與Store設計.md:四支玩法 + 四個檔期活動的層級歸屬。',
      '可插拔 UI 只留檔期活動一張總表(views/campaigns/),skins registry 移除。',
      'domain 9 → 15 支,統一改為回報事實,+117 測試。',
    ],
    links: [['架構頁', '#/nexus-client']],
  },
]

function Section({ label, items, mono }) {
  if (!items || items.length === 0) return null
  return (
    <div className="mt-3">
      <div className="text-[.72rem] font-semibold tracking-wide text-accent mb-1">{label}</div>
      <ul className="list-disc pl-5 space-y-1 text-[.86rem]">
        {items.map((it, i) => (
          <li key={i}>{mono ? <code>{it}</code> : it}</li>
        ))}
      </ul>
    </div>
  )
}

function Entry({ e, open, onToggle }) {
  return (
    <article className="bg-panel border border-line rounded-xl px-5 py-4 mb-4">
      <button type="button" onClick={onToggle} className="w-full text-left cursor-pointer">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[.78rem] text-muted tabular-nums">{e.date}</span>
          {e.branch && <span className="text-[.7rem] text-accent bg-accent-soft rounded px-1.5 py-px">{e.branch}</span>}
          <span className="ml-auto text-[.75rem] text-muted">{open ? '收合 ▲' : '展開 ▼'}</span>
        </div>
        <h3 className="mt-1 mb-0 text-[1rem]">{e.title}</h3>
      </button>
      {open && (
        <div>
          <Section label="做了什麼" items={e.summary} />
          <Section label="決定與理由" items={e.decisions} />
          <Section label="踩到的坑" items={e.pitfalls} />
          <Section label="驗證證據" items={e.evidence} />
          <Section label="留下的待辦" items={e.todo} />
          <Section label="動到的檔" items={e.files} mono />
          {e.links && e.links.length > 0 && (
            <div className="mt-3 text-[.82rem]">
              {e.links.map(([text, href]) => (
                <a key={href} href={href} className="mr-3">{text} →</a>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

export default function ColorGameLogPage() {
  const [q, setQ] = useState('')
  const [openSet, setOpenSet] = useState(() => new Set([0]))
  const term = q.trim().toLowerCase()
  const flat = (e) => [e.date, e.title, e.branch, ...(e.summary || []), ...(e.decisions || []), ...(e.pitfalls || []), ...(e.evidence || []), ...(e.todo || []), ...(e.files || [])].join(' ').toLowerCase()
  const shown = ENTRIES.map((e, i) => [e, i]).filter(([e]) => !term || flat(e).includes(term))
  const toggle = (i) => setOpenSet((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })

  return (
    <div>
      <h1>colorgame 製作歷程</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        <code>nexus-colorgame-client</code> 每個工作段落的紀錄:做了什麼、做了哪些決定、踩到什麼坑、拿什麼證據說做完了、留下什麼。
        最新在最上面。repo 內的正式紀錄是 <code>MEMORY.md</code> 的重大變更記錄,這頁是自己看的、可以更囉嗦。
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜尋日期、標題、坑、檔名…"
          className="flex-1 min-w-[220px] bg-panel border border-line rounded-lg px-3 py-1.5 text-[.9rem] outline-none focus:border-accent-deep"
        />
        <button type="button" className="text-[.8rem] text-muted hover:text-accent cursor-pointer" onClick={() => setOpenSet(new Set(ENTRIES.map((_, i) => i)))}>全部展開</button>
        <button type="button" className="text-[.8rem] text-muted hover:text-accent cursor-pointer" onClick={() => setOpenSet(new Set())}>全部收合</button>
        <span className="text-[.75rem] text-muted tabular-nums">{shown.length} / {ENTRIES.length}</span>
      </div>

      {shown.map(([e, i]) => (
        <Entry key={i} e={e} open={openSet.has(i)} onToggle={() => toggle(i)} />
      ))}

      <h2>怎麼加一筆</h2>
      <Code>{`src/pages/ColorGameLogPage.jsx 的 ENTRIES 最前面加一個物件(欄位都可省略):
{
  date: '2026-09-10',
  title: '一句話',
  branch: 'benji-dev(未 commit)| commit abc1234',
  summary:   ['做了什麼…'],
  decisions: ['決定 + 為什麼…'],
  pitfalls:  ['坑…'],
  evidence:  ['量測 / 閘門…'],
  todo:      ['留下的…'],
  files:     ['src/…'],
  links:     [['文字', '#/route']],
}
跟 agent 說「把這次的紀錄補到 benji-wiki 製作歷程」就會照這個格式加。`}</Code>
    </div>
  )
}
