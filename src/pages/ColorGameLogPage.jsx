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
    title: '大廳區塊 C 落地:桌卡列表 v1 接真實 SDK 資料;cg-client 大廳功能對照表',
    branch: 'benji-dev(未 commit)',
    summary: [
      '資料流:game/hooks/lobbyCardData.ts(Table → 桌卡純資料,唯一讀 SDK 的轉換點)、useLobbyTableList(hiddenRooms → isSubGameOpen → sortTables)、useLobbyCardLive(逐卡訂閱)、useTableCountdown(時間條)、actions/favorite.ts。',
      '畫面:LobbyTableCard(卡 407×167,以稿 192x 為基準版面)、LobbyRoadStrip(六欄路書 + 加成標籤)、LobbyBetPercent(六色比例)、diceColors.ts。',
      'public/project.json 補四支玩法開關 + dev 桌號名單,大廳從 0 桌變 16 桌。',
      'docs/plan/大廳-design-spec.md 加區塊 C 幾何表與 cg-client 大廳逐功能對照表(頂欄 / 跑馬燈 / 廣告 / 活動入口 / 房間列表 / 路書 / 視訊 / jackpot / 桌台大賽 / 直入遊戲 / 換膚 / 教學 / eLog)。',
    ],
    decisions: [
      '四變體先共用一張卡,獎池條依資料切換(有獎池金額顯示金額,否則桌名);變體專屬的頂列彩字與標語列為待做。理由:變體差異只在兩個區塊,先把資料流與版面骨架立起來。',
      '過濾 fail-closed:沒登記的子玩法不顯示。dev 頻道 23 桌只有 16 桌屬於四支在做的玩法(doubleWheel / superDouble / bonusV2 / ultimateJackpotV4),其餘 normal / speed / jackpotV2 / bonusV1 / doubleChallenge 刻意不出現。',
      'isSuspend 只在超級轉盤新 UI 的桌才算狀態(cg-client _isSuspend),由列表層拿 gates 判斷後傳進 toLobbyCardData。',
      'Figma images API 也被 429 鎖了 → 收藏星 / 桌號徽章 / 觀看圖示先用 CSS + inline SVG,標 TODO(colorgame)。',
    ],
    pitfalls: [
      'project.json 沒有八個開關 key 時大廳一桌都不顯示——這是設計(fail-closed),不是 bug;本機驗證要自己補 key(fields.ts 註解有寫)。',
      'Vite dev 下 HMR 過的模組再 import(\'/src/...\') 會拿到第二個實例(SdkAdapter 尚未初始化);probe 改從 performance.getEntriesByType(\'resource\') 取 app 實際載入的 URL 再 import。',
      'prettier 排版後再用字串取代會找不到原文——同一批修改先改完再 prettier,或改用 regex。',
      'formatjs/no-literal-string-in-jsx 連 `${n}%` 這種樣板都擋,runtime 字串要在 JSX 外組好再放進去。',
      '區塊 B 佔位 64px 跟 column gap 9 重複算,列表低了 10px;量測抓到,改 55px。',
      '整個內容區都在捲,跑馬燈列跟著跑:稿上捲軸(1:196)在紅色底板內,只有桌卡列表該捲。捲動容器改到列表本身(min-h-0 flex-1 overflow-y-auto),probe 驗證 scrollTop=300 後跑馬燈 y 仍 57。',
      '獎池條「JACKPOT ₱100,000,000.00」被截:稿是兩段文字(83.5 + 147.4 寬),我做成一段置中;改回兩段後瀏覽器的 Luckiest Guy 仍比 Figma 寬(15 字元要 168 不是 147),金額欄放寬到 168、右邊留 27.6 給 PLAY 鈕,scrollWidth = width 剛好放下。',
      'export 腳本 echo 裡 `$SIMPLIFY_STROKE（` 全形括號被 bash 當變數名一部分 → unbound variable;寫 `${VAR}`。',
    ],
    evidence: [
      '432×768:卡 (12.5,151.5) 407×167;頂列 (20.4,5) 380×26.4;視訊 (7.6,39) 75×120;路書 (99.5,54.4);六色比例 x 273.45;時間條 (101.7,121.6) 253×4;獎池條 (91.2,125.6);PLAY (364.9,125.6) 39.9;收藏星 (2.74,2.5) 30;徽章 (13.7,122.6) 62×15;觀看膠囊 (11.35,102) 52×13——全部 = 設計值 ±0.1。',
      '16 張卡真實資料:路書顏色、3x 加成標籤、六色百分比、限額 5 - 100k、桌號都來自 SDK。typecheck / lint 0 warning / 404 tests / build 綠。',
    ],
    todo: [
      '四變體頂列彩字(逐字漸層 ULTIMATE / BONUS)、108x / 192x 的 UP TO 標語、jackpot 預扣與滾動數字、桌台大賽人數、免費投注狀態、視訊預覽、路書新欄閃爍、語言表桌名。',
      '四支小圖等 Figma API 解鎖後匯出換回;區塊 B(標題 + 活動入口)、D(頁尾)。',
      'MarqueeList handler、主選單面板、Banner 本體。',
    ],
    files: ['src/game/hooks/lobbyCardData.ts', 'src/game/hooks/useLobbyTableList.ts', 'src/game/hooks/useLobbyCardLive.ts', 'src/game/hooks/useTableCountdown.ts', 'src/game/actions/favorite.ts', 'src/views/lobby/LobbyTableCard.tsx', 'src/views/lobby/LobbyRoadStrip.tsx', 'src/views/lobby/LobbyBetPercent.tsx', 'src/views/lobby/diceColors.ts', 'src/views/LobbyView.tsx', 'public/project.json', 'docs/plan/大廳-design-spec.md', 'MEMORY.md', 'CLAUDE.md'],
    links: [['流程頁', '#/figma-to-react'], ['目錄清單', '#/colorgame-dirs']],
  },
  {
    date: '2026-09-09',
    title: '大廳改走 432 縮放舞台(zoom),彩帶還原固定尺寸',
    branch: 'benji-dev(未 commit)',
    summary: [
      'LobbyView 根節點加 [zoom:var(--ui-scale,1)],整頁以 432 畫布等比縮;--ui-scale 由 platform/rwd 的 viewport 追蹤器全域發佈(main.tsx 已裝),不用另接。',
      '彩帶改回稿上的 505.5px 置中;跑馬燈膠囊改回 270px;子孫全部寫設計 px、不再自己縮。',
      'docs/RWD架構.md §一 補「大廳是例外」段,原本「房外流式」只剩登入／載入頁。',
    ],
    decisions: [
      '上一筆只把彩帶改百分比是半套:彩帶縮、膠囊與跑馬燈列不縮,窄機種彩帶下擺蓋到跑馬燈列,使用者截圖「連大小跟著變、很怪」。四張大廳稿沒有窄機種稿,唯一一致的做法是整頁縮。',
      '用 zoom 不用 transform scale:zoom 參與版面,w-full / h-full / 捲動 / 置中都在縮放後的座標系解析,不用做寬度補償(RWD架構 §軸1 消費方式 2)。',
    ],
    pitfalls: ['getBoundingClientRect 回的是螢幕 px(已乘 zoom),對稿時要除回 --ui-scale 才是設計 px;360 寬量到 header 79.2 = 95 × 0.833 才是對的。'],
    evidence: ['360 / 405 / 432 三寬度所有元素座標 = 設計值 × (寬/432),誤差 ≤ 0.2;405×400 截圖:彩帶、膠囊、跑馬燈列、底板一起縮,不再互蓋;typecheck / lint / views+rwd 測試綠。'],
    files: ['src/views/LobbyView.tsx', 'src/views/lobby/LobbyHeader.tsx', 'src/views/lobby/LobbyMessageBar.tsx', 'docs/RWD架構.md'],
  },
  {
    date: '2026-09-09',
    title: '頂欄彩帶隨寬度縮放、文字墨心補 1px、跑馬燈膠囊改彈性寬',
    branch: 'benji-dev(未 commit)',
    summary: [
      '彩帶 bg_ribbon 由固定 505.5px 改為頂欄寬的 117.01%(505.5/432),窄機種跟著等比縮,不再被裁邊。',
      '膠囊文字加 pt-[2px]:canvas measureText 量到墨中心比膠囊中心高 1.2～1.4px(Baloo 2 / Luckiest Guy ascent 偏大),補回後 Δ ≤ 0.5px。',
      '跑馬燈膠囊由 w-[270px] 改 w-full max-w-[270px],360 寬時整列(270+10+69)剛好落在內容區 350 內。',
    ],
    decisions: [
      '四張大廳稿(16:9 1:153 / 20:9 1:1176 / 21:9 1:2200 / 4:3 1:3224)邏輯寬全是 432 或 576,沒有窄手機稿;窄寬只能靠等比縮。',
      '這次用流式版面內的百分比解,沒有把房內的 --frame-w / scale-to-frame 帶進大廳(docs/RWD架構.md §一 明定房外先不混用)。但大廳現在有正式的四比例稿,「房外沒有 RWD 稿」這個前提已經過期——要不要讓大廳整個改走 432 縮放舞台,是待決定的架構題。',
    ],
    pitfalls: [
      '「字不在中間」光看行框對不出來:行框已置中,是字型 ascent 讓墨偏上;要用 measureText 的 actualBoundingBox 量墨。',
      '**Figma REST API 撞 429**:Viewer / Collaborator 席次的 rate limit 很低,同一天多次 get_figma_data(讀 1:153、1:131、再拆三欄各一次)就被鎖,Retry-After 約 4.3 天。skill 寫的「一個對話一次 get_figma_data」不是建議、是硬限制。要讀多個 node 時先落檔一次、之後只 grep;真的要再讀,走官方 figma MCP(OAuth,配額另計)或桌面版 MCP。',
    ],
    evidence: ['432:三段文字墨中心 Δ 0.4 / 0.5 / 0.2;360:彩帶 421 寬置中、跑馬燈列 5.5～354.5 落在 350 內;typecheck / lint 綠。'],
    files: ['src/views/lobby/LobbyHeader.tsx', 'src/views/lobby/LobbyMessageBar.tsx'],
  },
  {
    date: '2026-09-09',
    title: '修頂欄文字被切頂、沒置中',
    branch: 'benji-dev(未 commit)',
    summary: ['暱稱與餘額文字改為行框撐滿膠囊內高 26px、垂直置中;移除照稿抄來的 pt 與 12.5px 行高。'],
    decisions: ['稿的行高 12.5 小於字級 15 / 18,是 Figma 的排版值不是視覺目標;CSS 照抄後 truncate(overflow hidden)會把字頂切掉。視覺目標是「字在膠囊中間」,故行框撐滿再置中。spec 量測表已註明這是刻意不對稿。'],
    pitfalls: ['stage 4 只量了 bounding box、沒看截圖裡的字,行框對到稿了但墨被切一半——「比墨不比框」這條在字型類差異一定要做。'],
    evidence: ['432×768 重量:文字行框 y 8.8 / h 26(膠囊內高),截圖確認字完整置中;typecheck / lint / views 測試綠。'],
    files: ['src/views/lobby/LobbyHeader.tsx', 'docs/plan/大廳-design-spec.md'],
  },
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
