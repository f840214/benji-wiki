import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

// nexus-roulette-client 技術棧與架構筆記。
// 資料來源:repo 的 CLAUDE.md / README.md / MEMORY.md / docs/*.md / eslint.config.js / vite.config.ts 與 src 原始碼(2026-09-08)。
// 版本號只寫大版(React 19、Pixi 8…),精確版一律看 repo 的 package.json。

const TECH = [
['核心 runtime', [
  ['react / react-dom', 'UI 基底', 'React 19。頁面、面板、注盤、籌碼、聊天、視訊容器全是 React 元件。選它:元件化成熟、好配置化(不同桌台 / 皮膚 / 活動)、與 SDK 事件串接自然、測試工具齊。限制:不適合高頻動畫,那段交給 Pixi + Spine'],
  ['typescript', '型別', 'TS 6.0(最後一個 JS 基底版本,7.0 改 Go 重寫,故鎖 6.0.x)。strict + noEmit;typecheck 是本地唯一型別閘門,CI 結構上跑不了'],
  ['zustand', '狀態容器', '輕量、可在 React 樹外 getState() / setState()。SDK 事件、handler、Pixi 層都不在 React 樹內,需要一個共同的外部狀態容器;selector 訂閱讓元件只重繪自己要的欄位'],
  ['react-router-dom', '路由', 'MemoryRouter:路由只在記憶體,網址列不露頁面與桌號。四條路由 / → /login → /lobby → /room/:tableCode;非 React 層經 SceneManager 導航'],
  ['react-intl', '多語系', '只用 IntlProvider + formatMessage。文案唯一來源是遠端 CSV 語言表,本地零語言檔;全專案透過 t({ id, defaultMessage }) 取字,lint 強制兩者為字面值'],
]],
['渲染與動畫', [
  ['tailwindcss v4', '樣式', '所有 React UI 一律 utility class 寫在 className;v4 免 config 檔、arbitrary value 直接 [..]。禁 inline style(動態 CSS 變數例外)、禁內建斷點 sm:/lg:——螢幕相關值一律走 RWD 引擎'],
  ['pixi.js 8', 'Spine 承載', '只畫 Spine 特效(派彩 / 送禮 / 載入動效),全房只有 2 張 canvas。注盤、籌碼、高亮全是 DOM/SVG。一律經 pixi-game-framework,不自建 Application / ticker / renderer'],
  ['@esotericsoftware/spine-pixi-v8', '骨骼動畫', 'Spine 4.3 runtime,major.minor 必須與美術的 Spine Editor 一致,否則要重匯出。比序列圖省資源,派彩 / 禮物 / 荷官演出重用度高'],
  ['CSS transition / animation', '簡單動效', 'hover、fade、toast、滑入、中獎呼吸燈都是 CSS;多物件遊戲演出才用 Spine。@theme 內的 @keyframes 按需輸出,沒被工具類引用會被剪掉、onAnimationEnd 狀態機就卡死'],
  ['@fontsource/inter、barlow-condensed', '字體自託管', '只載用到的字重(400 / 500 / 600 / 700);沒 import 的字重會靜默假粗。房內標籤用窄體 Barlow Condensed 才對得上稿寬'],
  ['vite-plugin-svgr', 'SVG 當元件', '*.svg?react 轉 React 元件(可 currentColor 換色的單色 icon);靜態圖走 ?url。裸 .svg import 與 png / jpg 都被 lint 擋'],
]],
['視訊', [
  ['trtc-sdk-v5 / agora-rtc-sdk-ng / aliyun-rtc-sdk', 'WebRTC 拉流', '三家 provider 都裝,由設定決定用哪家、失敗自動 failover;vendor chunk 進房前閒時預抓。播放器 / failover / 品質監控在 game-client-framework/video 的 VideoManager,本專案只留 VideoAdapter 接線'],
  ['<video> 容器 + DomRenderer 收養', '畫面掛載', 'VideoLayer 只提供一個 div 並登記到 useVideoStore,真正的 video 元素由 framework 的 DomRenderer reparent 進來;React 不碰 video 元素'],
]],
['自家 @toppath 套件(file: 連結同父目錄的鄰居 repo)', [
  ['@toppath/game-client-sdk', '後端協定', 'WebSocket + HTTP、所有 model(Table / Round / User / BetInfoCollection / ChipSelector…)與事件。只經 SdkAdapter 出入,其他層不得 import;走 games/roulette 子路徑入口,少 22K gz'],
  ['@toppath/shared-code', '共用型別', 'G.ITable / G.IRound / G.IBet 等 codegen 型別;dist 有進 git,不用 build'],
  ['@toppath/game-client-framework', '框架無關工具', 'ELog 埋點、DeviceChecker 裝置分級、storage、Video(RTC) VideoManager、scheduleWhenIdle 閒時排程、isConstrainedNetwork 網路提示、SoundManager'],
  ['@toppath/pixi-game-framework', 'React + Pixi 渲染層', 'PixiCanvas / SceneStack / RenderPlane / CanvasScope / RenderLayer / <Spine> 與資源生命週期;/surfaces 子路徑是可插拔 UI 的工廠(純 React、不碰 pixi);/geometry 有 containRect 這類幾何工具'],
]],
['工具鏈', [
  ['vite 8(Rolldown 核心)', 'dev + build', 'base "./" 讓同一份 build 可放任意子路徑;dev 時兩個 framework alias 到上游 src 直接 HMR;dedupe pixi.js / react 防雙實例;版號由 package.json + git sha 8 碼以 define 注入'],
  ['@vitejs/plugin-react', 'JSX / Fast Refresh', '標準 React 插件'],
  ['@tailwindcss/vite', 'Tailwind 編譯', 'v4 官方 Vite 插件;index.css 用 source(none) 關掉全 repo 自動掃描,只登記 src 與 index.html(避免 docs 裡的 class 字樣被生成 CSS)'],
  ['code-inspector-plugin', 'dev 點畫面跳原始碼', 'dev-only,點頁面元素直接開編輯器對應行'],
  ['sharp / svgo', '圖檔管線', 'assets:compress 把 PNG 母檔轉 WebP(repo 有 webp-only gate);assets:svgo 壓 SVG'],
]],
['品質閘門', [
  ['tsc --noEmit', '型別閘門', 'npm run typecheck;husky pre-commit 也跑。CI 的 quality lane 會剝掉 @toppath 才 install,所以本地是唯一型別閘門'],
  ['eslint 10(flat config)', '0 warning 閘門', '非 type-aware;no-restricted-imports 實作四個分環方向與封裝邊界;formatjs 擋 JSX 裸字串;禁 console;每個 eslint-disable 必附 -- 理由'],
  ['vitest 4 + testing-library', '單元 / 元件測試', '預設 node 環境,需要 DOM 的檔案頂端加 @vitest-environment jsdom;@toppath 全部 alias 到 stub,沒替身的直接撞 toppathAbsentGuard 報錯(本地就炸,不必等 CI)'],
  ['prettier + lint-staged + husky', '格式與 pre-commit', '格式交 Prettier 單一權威;commit 時 lint-staged 只跑改到的檔'],
  ['scripts/check-dist-preload.mjs', 'build gate', '首屏 chunk 不得含 pixi / pixi-game-framework / 房間面板。誰進首屏由靜態 import 圖決定,不是 chunk 設定'],
]],
]

const DIRS = [
['指令', [
  ['npm run setup', '首次建置', '驗 Node 與鄰居 repo、build SDK 與兩個 framework、裝依賴、連 skills 與 MCP;只在第一次或鄰居換分支後跑'],
  ['npm run dev', '日常開發', '三個依賴 watcher(gcf / pixi / sdk)+ Vite dev server 一起起'],
  ['npm run dev:app', '只起 Vite', '上游 dist 已是最新時用,比 dev 快'],
  ['npm run sync', '拉同事 framework 改動', 'pull + rebuild + relink 兩個前端 framework'],
  ['npm run typecheck', '第一道驗證', 'tsc --noEmit,秒級;CI 跑不了所以本地必跑'],
  ['npm run lint', '0 warning', 'eslint src dev --max-warnings 0 + 語言 key 檢查 + 文件連結檢查'],
  ['npm run test', '全量測試', 'vitest run;單檔 npx vitest run <檔>(共 71 個 *.test 檔)'],
  ['npm run build', '發佈前', 'tsc → vite build → check-dist-paths → check-dist-preload'],
  ['npm run build:staging', 'staging 包', '--mode staging:行內腳本只去註解不壓、會掛 devConsole'],
  ['npm run assets:compress', '圖進 repo 前', 'PNG → WebP 標準路徑'],
  ['npm run commentsCheck', '註解用字檢查', 'grep 出「比照 Cocos / 原本 / 後來改成」這類不該進註解的字樣(report-only)'],
  ['npm run sfx:proxy / assets:proxy', '弱網重現', '慢速資源代理,量載入三態'],
]],
['目錄地圖(環由內到外)', [
  ['src/platform/', '最內環', '零遊戲知識、零 SDK:rwd 引擎、i18n 橋、uiManager(Toast / Modal / Loading)、sceneManager、sound、loading 進度、state(偏好 / 視訊 / 聊天 / i18n store)、dom 工具'],
  ['src/integrations/', '外部系統', 'sdk/SdkAdapter(SDK 唯一出入口)+ sdk/queries(讀取模組)、config(fields.ts 唯一欄位清單 + ConfigManager)、elog 埋點、video/VideoAdapter、host 宿主橋'],
  ['src/game/domain/', '純函式', 'rouletteWheel(號碼顏色 / 鄰號)、rouletteBetTypes(注型 ↔ 注區 id)、tableLimitRange、roomListSort、tableCardData;不碰 SDK 實例、全部有測試'],
  ['src/game/store/', 'Zustand', 'useGameStore(局態)/ useBetStore(注單)/ useWalletStore(餘額)/ useUiStore(面板開關、派彩窗)/ useTutorialStore;一檔一 store'],
  ['src/game/actions/', '玩家寫入', 'bet / auth / navigation / video / chat / gift / favoriteBet / customChips / deposit / tutorial;emit + 樂觀旗標 + elog + toast,永不寫金錢'],
  ['src/game/handlers/global/', 'App 啟動掛', 'Loading / Message / Scene / User / PageVisibility / LogMgr;名冊 globalHandlers.ts;活到關頁'],
  ['src/game/handlers/room/', '進房掛、離房拆', 'Game / Bet / Chat;名冊 roomHandlers.ts;由 SceneHandler 的 POSITION_CHANGED 驅動,不綁 React'],
  ['src/game/hooks/', '畫面讀', 'useTableLimits / useTableRoadmap / useTableSummaryRevision / useLobbyTableList / useLayoutWidth / useAppConfig…;回純資料,不外露 SDK 實例'],
  ['src/views/', '畫面', 'LoadingView / LoginView / LobbyView / RoomView 四頁 + lobby/ room/ popup/ components/;campaigns/ skins/ 兩張可插拔總表'],
  ['src/views/room/layers/', '房間分層', 'roomLayers.ts 是 z 序唯一真相(Stage 0 / ChatFloat 1 / Play 2 / UI 3 / Overlay 4 / Tutorial 5);每層一個 XxxLayer 元件'],
  ['src/views/room/betarea/', '注盤', 'rect/(矩形盤)與 oval/(racetrack)姊妹盤,各自 Base / Label / Chip / Highlight / Click 五層 DOM,共用 store 與 actions/bet'],
  ['src/views/room/payout/', '派彩特效', 'PayoutFx(顯示窗狀態機)→ PayoutEffect(命令式 pixi + RenderLayer)→ payoutSpines / payoutTimeline(純函式時間軸)'],
  ['src/views/room/runtime/', '房間 runtime', 'loadRoomView(進房唯一載入點)、pixiRuntime(Spine 註冊)、roomGeometry / roomRatioSpec(RWD 查表)、roomAssets 預載清單'],
  ['src/views/popup/', '面板', 'panels.ts 唯一匯出口;panels.sync.ts / panels.lazy.ts 各一份名單,同一面板只能在其一'],
  ['src/tutorial/', '新手教學', 'core/(可攜機制)ui/(可攜演出)roulette/(輪盤劇本與閘門);前兩層 lint 禁 import store / handlers'],
  ['src/assets/ vs public/assets/', '資源', 'bundled(import 的 svg / 小圖)vs served(runtime URL:籌碼系列、spine、字型、音效、大背景)'],
  ['src/testing/', '測試專用', '@toppath 替身 stub、toppathAbsentGuard、surfaceRegistryGates 六道守門、moduleGraphScan'],
  ['src/debug/ + dev/', '除錯', 'devConsole(window.__GAME_DEVTOOLS__,只在 DEV / staging 掛);dev/ 是元件檢視與測試工具框架'],
  ['docs/', '中文文件', '開發規範與指引(規範本體)/ 設計背景與決策(為什麼)/ RWD架構 / 遊戲規格與畫面流程 / 資源規範與流程 / tutorial-system'],
]],
['鐵則', [
  ['前端不算結果、不決定派彩', '安全 1', '開獎、派彩、餘額全來自 server;action 永不寫金錢欄位,只有 handler 從 SDK 事件回寫'],
  ['下注開關跟 Table.GameState', '安全 2', '1 開注 / 2 洗牌 / 3 封盤 / 5 派彩 / 8 取消局;不用本地計時器決定能不能下注'],
  ['每筆注帶 roundCode', '安全 3', 'server 端冪等,重送不會重複扣款'],
  ['重連是 SDK 的事', '安全 4', 'app 只在回前景 emit SWITCH_PAGE_VISIBILITY(true);不得自己 emit CHECK_CONNECTION_AND_RESUME_GAME'],
  ['寫走 actions、讀走 hooks', '§8', '共享權威鏡像才進 handler;SDK 只經 SdkAdapter,adapter 零業務邏輯'],
  ['一個 store 欄位只能當自己資料的訊號', '§9', '拿 A 欄位觸發 B 重讀必競態;SDK 就地 mutate 的物件要訂它自己的事件轉版號'],
  ['螢幕相關值一律走 RWD 引擎', 'RWD', '禁 matchMedia、禁 Tailwind 斷點、禁手刻 viewport 判斷(兩個測試守著)'],
  ['Pixi 一律走 pixi-game-framework', '§11', '不自建 Application;雙實例症狀是 currentTarget.isInteractive is not a function'],
  ['文案一律 t({ id, defaultMessage })', '§6', '遠端 CSV 是唯一語言表;JSX 禁裸字串(lint 擋);runtime 動態 key 讀 useI18nStore'],
  ['首屏由 import 圖決定', '§14.1', 'pixi 只准從首屏程式碼 import() 到;預抓走 scheduleWhenIdle + isConstrainedNetwork,永不掛載即抓'],
  ['註解一律繁中、當規格寫', '§3', '決定值與行為進註解;「比照 Cocos / 對 Figma / 原本…」這類來源與歷史進 commit message'],
  ['行為看 Cocos、外觀看 Figma', '真相源', '衝突時:行為 Cocos 贏、外觀 Figma(2× 稿,px ÷ 2)贏、票 vs 重現 → 重現贏'],
]],
]

export default function RoulettePage() {
  return (
    <div>
      <h1>nexus-roulette-client</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        H5 WebRTC 輪盤客戶端:React 19 + PixiJS 8 + Spine + Zustand,取代載入慢、低階 Android 跑不動的
        Cocos <code>roulette-client</code>,對標 Evolution Roulette。這頁講「用了哪些技術、怎麼用、為什麼這樣用」,
        每一段都附專案裡的真實寫法;規範原文回 repo 的 <code>docs/</code>。
      </p>

      <DataTable sections={TECH} headers={['技術', '負責什麼', '怎麼用 / 為什麼']} placeholder="搜尋套件、用途…" />

      <h2>一分鐘看懂整體架構</h2>
      <p className="max-w-[70ch]">
        四個環由外向內 <code>views → game → integrations → platform</code>,import 只准往內指(eslint 強制)。
        SDK 只經 <code>SdkAdapter</code> 出入,狀態單向流動,React 只是最外面那層畫面。
      </p>
      <Code>{`┌─ views ────────────────────────────────────────────────────────┐  畫面(React + Tailwind)
│  LoadingView / LoginView / LobbyView / RoomView                │  RoomView = 五層 z-stack
│  room/betarea(DOM/SVG 注盤) room/payout(Spine) popup/(面板)  │  2 張 pixi canvas 只畫 Spine
├─ game ─────────────────────────────────────────────────────────┤  輪盤領域
│  store/(Zustand) actions/(寫) hooks/(讀) handlers/(鏡像) domain/(純函式) │
├─ integrations ─────────────────────────────────────────────────┤  認識協定、不認識輪盤
│  sdk/SdkAdapter + queries   config/fields.ts   elog   video/VideoAdapter │
├─ platform ─────────────────────────────────────────────────────┤  零遊戲知識、零 SDK
│  rwd 引擎  i18n 橋  uiManager(Toast/Modal/Loading)  sceneManager  sound  state │
└────────────────────────────────────────────────────────────────┘
      ▲ 外環可以 import 內環;內環 import 外環 → lint 紅
tutorial/ debug/ testing/ assets/ 是橫切關注,住在環外

四條資料流(改東西前先定位是哪一條):
① 玩家寫入      view ──▶ action ──emit──▶ SdkAdapter ──▶ SDK ──▶ server
② 共享權威鏡像  SDK event ──▶ handler ──▶ Zustand store ──▶ hook/selector ──▶ view
③ 單一畫面自用  SDK event / model ──▶ feature hook ──▶ React local state ──▶ view
④ await 一個回應 view ──▶ queries ──▶ SDK ──▶ Promise ──▶ local state`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼分環</b>:platform 零遊戲知識,整包可搬去下一款遊戲(colorgame 就是這樣長出來的);integrations 換 SDK 只動一層;views 永遠不知道 WebSocket 長什麼樣。</li>
        <li><b>為什麼 Pixi 只畫 Spine</b>:注盤 / 籌碼 / 高亮原本打算用 Pixi,最後改 DOM/SVG——排版交給 Tailwind、點擊命中用 CSS grid / 多邊形索引,低階機更省,而且 RWD 跟 DOM 一起縮不用算矩陣。Pixi 只留給真的需要 WebGL 的骨骼動畫。</li>
        <li><b>為什麼保護順序是「視訊 &gt; 下注 &gt; 狀態同步 &gt; 盤面動畫 &gt; Spine」</b>:資源不足時由後往前砍,視訊永遠最後才動;低階機自動降 Pixi resolution(<code>platform/device.ts</code>)。</li>
      </ul>

      <h2>啟動流程(main.tsx,順序不可亂)</h2>
      <Code>{`bootstrap()
  defineLoadingMap + completeTask(APP_SHELL)   進度地圖(index.html 內聯進度條先接棒)
  initScrollbarWidth / installZoomLock / installViewportTracker   任何版面渲染前
  registerRoomPreload(loadRoomView)            進房 action(game 環)不認識 views 的 chunk,在此注入
  const appConfig = await ConfigManager.load() project.json + coreProject.json + URL 參數
  直進房 → 先 import('./views/RoomView') + 預抓視訊 vendor(用登入 RTT 的空檔)
  initElog(appConfig)                          埋點最早起,後面錯誤才抓得到
  SoundManager.instance.init()                 AudioContext + 首次手勢解鎖
  SdkAdapter.instance.init(appConfig)          GameClient
  emit(INIT_CONFIG, appConfig)                 設定同步進 SDK Config model
  emit(LOAD_CHANNEL_INFO)                      渠道資訊,先掛監聽再 emit 避免 race
  setupGlobalHandlers()                        React render 前就訂閱 LOGIN_SUCCESS / SYNC_MONEY…
  useI18nStore.apply(lang, {})                 語言表還沒下載,先用 defaultMessage(英文)
  renderApp()                                  createRoot(...).render(<StrictMode><I18nProvider><App/>)
  之後才 await 渠道 → 下載語言表 → apply → 等字體 → 100%

路由(App.tsx):MemoryRouter,initialEntries ['/']
  /  LoadingView → /login LoginView → /lobby LobbyView → /room/:tableCode RoomView(lazy)
  <IntlBridge/>   把 intl 實例塞進 i18nBridge,非 React 層才能 t()
  <RouterBridge/> 把 navigate 塞進 SceneManager,handler 才能 goto()
  <LayerHost/>    Toast / Modal / Loading 三件套,UIManager 經 zustand 驅動`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼 handler 在 React render 之前就訂閱</b>:SDK 的 model 連線前就存在、事件連線後才發,提早訂閱無害;晚訂閱會漏掉登入回應。</li>
        <li><b>為什麼 MemoryRouter</b>:網址列不能露桌號與頁面,而且 base 設 <code>./</code> 之後同一份 build 可放任意子路徑,沒有 URL 路由就沒有副作用。</li>
        <li><b>Bridge 模式</b>:React 的 <code>useNavigate</code>、<code>useIntl</code> 只能在元件裡拿,handler / action 不是元件。解法是在 Router / IntlProvider 子樹裡放一個不渲染任何東西的元件,render 時把實例存進模組單例。</li>
      </ul>

      <h2>React 入門(用這個專案的寫法學)</h2>
      <p className="max-w-[70ch]">
        通用 hook 表在 <a href="#/react">React</a> 那頁;這裡只講「這專案怎麼寫、為什麼」。核心一句話:
        <b>畫面是狀態的函式</b>——你改狀態,React 幫你更新 DOM;你永遠不手動操作 DOM。
      </p>

      <h3>1. 元件 = 一個回傳 JSX 的函式;props 用 interface</h3>
      <Code>{`// 專案規範:functional component、React.FC<IXxxProps>、export default、props interface 加 I 前綴
import React from 'react';
import { t } from '../../platform/i18n/i18nBridge';

interface IBetLimitProps {
  min: number;
  max: number;
  onClick?: () => void;          // 事件 prop 命名 onXxx
}

const BetLimit: React.FC<IBetLimitProps> = ({ min, max, onClick }) => {
  // 事件邏輯抽成具名 handler,不在 JSX 寫 inline arrow(簡單轉發例外)
  const handleClick = () => onClick?.();

  return (
    // 樣式一律 Tailwind class;文案一律 t()——JSX 裸字串會被 lint 擋
    <button type="button" onClick={handleClick} className="font-condensed text-[13px] text-white/70">
      {t({ id: 'room.betLimit.label', defaultMessage: 'Bet Limit' })} {min} - {max}
    </button>
  );
};

export default BetLimit;`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼不接 API 在元件裡</b>:元件只拿 props 或 selector 取值,資料來源換了(SDK 改版、測試假件)元件不用動。</li>
        <li><b>拆分門檻</b>:超過 80 行或同一 pattern 出現兩次就拆;平鋪 <code>.tsx</code>,不建 index.ts barrel、不建每元件一資料夾。</li>
      </ul>

      <h3>2. useState + useEffect:訂閱 SDK 事件、回純資料(這專案最常見的 hook 形狀)</h3>
      <Code>{`// game/hooks/useTableLimits.ts(節錄)——「單一畫面自用」的讀,寫 React local state
export function useTableLimits(tableCode: string): TableLimits {
  const [version, setVersion] = useState(0);            // 事件來了就 +1,逼下面 useMemo 重算
  const frozen = useTutorialStore((s) => s.frozen);      // 教學凍結期間不訂閱

  useEffect(() => {
    if (frozen) return;
    const table = SdkAdapter.instance.getTable(tableCode);
    if (!table) return;

    const handler = () => setVersion((v) => v + 1);
    table.on(Table.Event.RANGE_LIST_CHANGED, handler);
    handler();                     // 訂閱完立刻讀一次:render 到訂閱生效之間的事件會漏
    return () => table.off(Table.Event.RANGE_LIST_CHANGED, handler);   // cleanup 成對 off
  }, [tableCode, frozen]);         // 依賴要誠實:用到的變數都放進來

  return useMemo(() => readLimits(tableCode), [tableCode, version]);   // 回純資料,不外露 Table 實例
}`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼要「訂閱後立刻讀一次」</b>:進房時事件多半已經發過,只靠訂閱等不到;這是全專案 handler / hook 的共同契約。</li>
        <li><b>為什麼用 version 計數而不是直接存物件</b>:SDK 很多物件是就地 mutate、參照不變,React 靠參照比對看不出變化。把事件換成遞增數字當依賴,useMemo 就會重算(<code>useTableSummaryRevision</code> 是同一招)。</li>
        <li><b>StrictMode 下 effect 會跑兩次</b>(開發限定):訂閱→拆→再訂閱,所以 cleanup 一定要寫;也是「房間 handler 不放 React effect」的原因之一。</li>
      </ul>

      <h3>3. useRef:拿 DOM 容器給非 React 的東西用</h3>
      <Code>{`// views/room/VideoLayer.tsx——React 只給一個 div,video 元素由 framework 的 DomRenderer 收養進來
const VideoLayer: React.FC = () => {
  const setContainerElement = useVideoStore((s) => s.setContainerElement);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) setContainerElement(el);          // 登記到 store,VideoAdapter.join 時取用
    return () => setContainerElement(null);
  }, [setContainerElement]);

  return <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-black" />;
};`}</Code>

      <h3>4. lazy + Suspense:房間(含 pixi)進房才下載</h3>
      <Code>{`// App.tsx
const RoomView = lazy(loadRoomView);     // loadRoomView 先 await Spine 註冊,再回畫面 chunk

<Suspense fallback={<RoomFallback />}>
  <Routes>
    <Route path="/room/:tableCode" element={<RoomView />} />
  </Routes>
</Suspense>

// views/room/runtime/loadRoomView.ts
export async function loadRoomView() {
  const roomView = import('../../RoomView');           // 畫面 chunk 與 runtime 平行下載
  roomView.catch(() => undefined);
  const { setupRoomPixiRuntime } = await import('./pixiRuntime');
  await setupRoomPixiRuntime();                         // Spine pipe 註冊完才准掛 PixiCanvas
  return roomView;
}`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼首屏不能碰 pixi</b>:pixi + spine + framework 合成一個 300KB 的 chunk,弱網(東南亞 3G)下首屏會慢一倍。<code>check-dist-preload</code> 在 build 時掃產物,首屏 chunk 有 pixi 就紅。</li>
        <li><b>React Router 7 的 navigate 是 transition</b>:suspend 時會停在 LobbyView、不顯示 fallback,所以進房遮罩改由 <code>UIManager.setEntering(true)</code> 的前端菊花蓋到 RoomView 掛上。</li>
      </ul>

      <h3>5. 常見地雷(這專案特有)</h3>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>守衛讀活體 model,不讀 store 快照</b>:<code>Table.gameState</code> 是計算 getter(倒數會即時翻封盤),SDK 事件晚一個 tick,store 必然落後;確認下注前補查 <code>table.gameState</code>。</li>
        <li><b>凍住資料 ≠ 凍住畫面</b>:吃牆鐘的元件(<code>Date.now</code> + rAF 倒數環)、CSS 動畫、pixi 時間軸都不看 store,教學要停畫面得三道閘門各開一個。</li>
        <li><b>inline callback ref 每次 render 都變</b>:React 會在同一個 DOM 上先 null 再 el 重呼叫,不能在 null 分支做「卸載」動作(LobbyView 桌卡預覽踩過)。</li>
        <li><b>set-state-in-effect 規則刻意關閉</b>:專案大量「effect 內同步外部狀態」(SDK 回寫、量 DOM 後設尺寸)都是正當用法。</li>
      </ul>

      <h2>Zustand:這專案怎麼用</h2>
      <p className="max-w-[70ch]">通用用法看 <a href="#/zustand">Zustand</a> 頁;專案上的規矩是「一檔一 store、每個 set 帶 action 名、元件用 selector、非 React 用 getState()」。</p>
      <Code>{`// game/store/useWalletStore.ts——最小的一顆
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface WalletStoreState {
  balance: number;     // 目前餘額(唯一寫入者:UserHandler 收到 SYNC_MONEY)
  payout: number;      // 本局派彩(顯示後歸 0)
  setBalance: (balance: number) => void;
  setPayout: (amount: number) => void;
  clearPayout: () => void;
}

export const useWalletStore = create<WalletStoreState>()(
  devtools(
    (set) => ({
      balance: 0,
      payout: 0,
      setBalance: (balance) => set({ balance }, false, 'setBalance'),   // 第三參數 = devtools 顯示的 action 名
      setPayout: (amount) => set({ payout: amount }, false, 'setPayout'),
      clearPayout: () => set({ payout: 0 }, false, 'clearPayout'),
    }),
    { name: 'WalletStore', enabled: import.meta.env.DEV },
  ),
);

// 元件:selector 只訂自己要的欄位(整顆訂閱會讓每個 set 都重繪)
const balance = useWalletStore((s) => s.balance);

// handler / action(非 React):getState()
useWalletStore.getState().setBalance(user.money);

// 衍生判斷抽成純函式放 store 檔,元件與 handler 共用
export function shouldShowPayoutFx({ hasResult, payout, roundCode, playedRoundCode }) { ... }`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼選 Zustand 不是 Context / Redux</b>:SDK 事件、handler、Pixi 層都不在 React 樹內,需要一個 React 外也能讀寫的容器;Context 高頻更新會整棵重繪,Redux 樣板太多。</li>
        <li><b>什麼才進 store</b>(先問「SDK 讀不讀得回來」):SDK 沒這份資料(面板開關、盤面切換)→ 必放;SDK 只用一次性事件給(餘額、聊天、收禮)→ 必放;樂觀更新要能回滾(pendingBets)→ 必放;SDK 有 getter 隨時讀得回來(路書、限紅、冷熱)→ <b>不放</b>,hook 直讀。例外:讀得回來但 17 處消費、不一致有代價的 <code>gameState</code> 仍做鏡像。</li>
        <li><b>store 只放可序列化狀態</b>:不放 Application、Texture、Spine instance、MediaStream(這些由 adapter / framework 管生命週期)。</li>
        <li><b>值該放哪的三層</b>:啟動期唯讀的環境值 → <code>AppConfig</code>(<code>useAppConfig()</code>);跨 session 偏好(音量 / 畫質)→ <code>usePreferencesStore</code>(自己 write-through localStorage);runtime 狀態 → domain store。</li>
      </ul>

      <h2>handler / action / hook:三問定位</h2>
      <Code>{`沒有任何畫面開著時,這件事還要發生嗎?  → handler(server 驅動,常駐,寫權威狀態)
是玩家的一個動作嗎?                     → action (使用者驅動,呼完即結束,emit + 樂觀旗標)
只是某個畫面要顯示嗎?                   → hook   (畫面驅動,隨元件生死,寫 local state)
三者共用的規則 / 衍生計算                → domain/(純函式、可測)

// ── handler:game/handlers/room/GameHandler.ts(骨架)────────────────────────
export class GameHandler implements IRoomHandler {
  static readonly instance = new GameHandler();
  constructor(private _adapter = SdkAdapter.instance) {}   // DI 縫,測試注入假件
  private _table: Table | null = null;                      // 留存 model 參照給 teardown 用

  setup(tableCode: string) {
    if (this._isSetup) this.teardown();                     // 先自拆再重掛(換桌安全)
    this._table = this._adapter.getTable(tableCode);
    this._table.on(Table.Event.GAME_STATE_CHANGED, this._onGameStateChanged);
    this._table.on(Table.Event.PAYOUT, this._onPayout);
    this._syncInitialState();                               // 訂完立刻 pull 現值(事件多半已發過)
  }
  teardown() { this._table?.off(Table.Event.GAME_STATE_CHANGED, this._onGameStateChanged); ... }

  private _onGameStateChanged = () => {
    useGameStore.getState().setGameState(this._table!.gameState);   // 整批覆蓋,不逐筆 patch
  };
}
// roomHandlers.ts 名冊:[GameHandler.instance, BetHandler.instance, ChatHandler.instance]
// SceneHandler 收到 SDK POSITION_CHANGED 進房分支 → setupAll(tableCode);離房 → teardownAll() + resetRoomStores()

// ── action:game/actions/bet.ts(節錄)────────────────────────────────────────
export function selectChip(chipValue: number): void {
  const selector = SdkAdapter.instance.getChipSelector();
  reportChipSelect(chipValue, false);                       // elog 埋點
  const chip = selector.chipList.find((c) => c.value === chipValue && !c.isCustom);
  if (chip) SdkAdapter.instance.emit(GameEvent.SELECT_CHIP, chip);
  // 不直接寫 store:SDK 驗證後 emit SELECTED_CHANED → BetHandler → useBetStore.selectChip(),單向迴路
}

// ── hook:見上面 React 入門 §2 的 useTableLimits`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼房間 handler 不放 RoomView 的 useEffect</b>:掛在 SDK 的 <code>POSITION_CHANGED</code> 那一刻 Table / Round model 已灌好初始資料,派彩這種一次性事件不會落在「導航後、React mount 前」的窗口被漏;而且 StrictMode 的丟棄式重掛不會影響監聽。</li>
        <li><b>為什麼 action 不寫金錢</b>:餘額 / 派彩 / 開獎 / 注額真相只由 handler 從 SDK 事件回寫,下注失敗、重連、取消局都能靠 SDK 事件自動回滾,前端不用自己算。</li>
        <li><b>同一事件多 handler 訂閱</b>(LOGIN_SUCCESS → Scene 管流程、User 管個資):各訂閱者只讀 SDK model 真相、不讀彼此的 store,訂閱順序就不構成依賴。</li>
        <li><b>SdkAdapter 只傳遞</b>:init / emit / on / off / thin getter;跨 model 組裝、回退加工放 <code>queries/&lt;域&gt;Queries.ts</code>(betQueries、assetHistoryQueries…),禁止再往 adapter 加扁平 getter。</li>
      </ul>

      <h2>房間畫面:五層 z-stack + 兩張 canvas</h2>
      <Code>{`// views/room/layers/roomLayers.ts——z 序唯一真相
ROOM_LAYER = { Stage: 0, ChatFloat: 1, Play: 2, UI: 3, Overlay: 4, Tutorial: 5 }

// views/RoomView.tsx——framework 的 managed SceneStack,宣告 9 個平面,compositor 自動併 island
<SceneStack mode="managed">
  <RenderPlane id="stage-video"    backend="dom"  z={0}>   <StageLayer/>        黑底 + 視訊 + 底圖
  <RenderPlane id="stage-fx"       backend="pixi" z={0.1} pixiIsland={loadingFxIsland}>  載入動效 spine
  <RenderPlane id="chat-float"     backend="dom"  z={1}>   聊天飄字(被注盤蓋住,不擋操作)
  <RenderPlane id="play"           backend="dom"  z={2}>   注盤三明治(注格 / 籌碼 / 中獎卡)+ 功能列
  <RenderPlane id="ui"             backend="dom"  z={3}>   頂列 / 荷官 / 倒數 / 餘額 / 派彩壓黑
  <RenderPlane id="overlay-chat"   backend="dom"  z={4}>   聊天列
  <RenderPlane id="overlay-fx"     backend="pixi" z={4.1} pixiIsland={fxIsland}>  <PayoutFx/>  派彩 + 送禮共用
  <RenderPlane id="overlay-panels" backend="dom"  z={4.2}> 面板 / bottom-sheet / modal
  <RenderPlane id="tutorial"       backend="dom"  z={5}>   教學遮罩(必須最上,吃掉所有指標事件)
</SceneStack>
// 相鄰的 dom 平面併成同一個 DOM island,兩個 pixi 平面各自成島 → 全房恰好 2 張 canvas`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼只有 2 張 canvas</b>:每張 canvas 一個 WebGL context,低階機撐不了多個;新演出一律接既有的 <code>fx</code> 島(<code>&lt;CanvasScope target="fx"&gt;</code> 跨平面投影),不新增 canvas。</li>
        <li><b>RoomView 自己只做三件事</b>:視訊 join / leave(video 元素離不開 React 生命週期)、關進房遮罩、預載房內資源;handler 與 store 都不在這裡掛。</li>
      </ul>

      <h2>PixiJS + Spine:只經 pixi-game-framework</h2>
      <Code>{`// 宣告式(元件內):CanvasScope 指定畫進哪張 canvas,RenderLayer 給一個 design 座標系並管 DOM 對位、自適應、資源 refcount
// views/room/payout/PayoutFx.tsx
<CanvasScope target="fx">
  <div className="pointer-events-none absolute inset-x-0 top-[41.67%] aspect-[864/800] -translate-y-1/2">
    <PayoutEffect key={runId} number={result.number} color={result.color} amount={payout} onExit={handleExit} />
  </div>
</CanvasScope>

// 命令式(PayoutEffect 內):design 空間 864×800 = 2× 設計稿 px;spine 以 scale=1 放原點,骨頭座標 + 原點 = design 座標,零矩陣換算
const layer: IRenderLayer = ...;          // <RenderLayer design={{ width: 864, height: 800 }} onReady={...}>
await layer.load(urls);                    // 一律經 layer.load,禁裸 Assets.load(lint 擋)——繞過卸載閘門會偶發破圖
const spine = Spine.from({ skeleton, atlas });
spine.autoUpdate = false;                  // 本 canvas 用 app 自有 ticker,Ticker.shared 不可靠 → 自己 rAF update(dt)
layer.container.addChild(spine);
// 卸載複合資源(skel + atlas)一律 unloadSpineAssets(),自己 Assets.unload 會讓 spine 間歇黑掉且不報錯

// runtime 啟動點唯一:views/room/runtime/pixiRuntime.ts
export const setupRoomPixiRuntime = createRoomPixiRuntimeSetup({
  installDefaultAssetUnloader, configureAssetLifecycle,   // idle-TTL 60 秒卸載
  configureAssetScheduler, setupSpineRuntime,             // Spine pipe 註冊
});`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼要框架而不是裸 pixi</b>:Application 生命週期、單一載入入口、canvas 當 layer、DOM ↔ stage 座標、單一 pixi.js 實例——這些契約裸寫必踩;雙實例症狀是 <code>currentTarget.isInteractive is not a function</code>,由 vite 的 <code>dedupe</code> 唯一守住。</li>
        <li><b>Spine 版本鎖</b>:runtime 4.3 ↔ Editor 4.3,升降都要重匯出;Pixi 最低 8.16 是 spine-pixi-v8 的要求。</li>
        <li><b>裝置分級</b>:<code>getPixiResolution()</code> 依 DeviceChecker 等級降 resolution;WebGL context lost 經 <code>attachWebglLossReporting</code> 走框架崩潰日誌。</li>
      </ul>

      <h2>注盤:全 DOM/SVG,五層三明治</h2>
      <Code>{`// views/room/betarea/oval/OvalBetArea.tsx——矩形盤 rect/ 與橢圓盤 oval/ 是姊妹,共用 store / actions / betType
<AspectBox ratio={OVAL_DESIGN.aspectRatio} zoom={betZoom}
  rest={{ widthFill: 1, videoCover: 0.06 }} zoomed={{ widthFill: 1.25, videoCover: 0.8 }}>
  <OvalBaseLayer />        背景 svg(object-contain letterbox 置中,點擊穿透)
  <OvalHighlightLayer />   中獎高亮:inline SVG 描多邊形邊 + CSS 呼吸燈(只脈動 opacity,合成器層級)
  <OvalLabelLayer />       號碼 / 組名文字(DOM;底版 svg 已去字)
  <OvalChipLayer />        桌上籌碼(DOM,在文字之上、點擊之下)
  <OvalClickLayer onBet={(fx, fy, above) => setConfirmAnchor({ fx, fy, above })} />   最上、透明
  <BetConfirmPopup />      ✕ / ✓ 浮層,吃共用 store 的錨點
</AspectBox>

// OvalClickLayer:容器 → 實際盤面矩形(containRect)→ 0..1 正規化 → 多邊形命中索引 → addBet
const { offX, offY, width, height } = containRect(rect.width, rect.height, OVAL_DESIGN.aspectRatio);
const nx = (e.clientX - rect.left - offX) / width;
const region = ovalHitFirst(nx, ny);       // 矩形盤則是 CSS grid 矩形格
if (region) addBet(region.betType);        // SDK 同步加未確認注 → BetHandler 整批覆寫 store → 籌碼層重繪`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼顯示與點擊天生對齊</b>:背景、各層與點擊層都在同一個 scale 容器內,放大態只是改 transform。</li>
        <li><b>確認浮層錨點用正規化 0..1</b>:矩形盤下注後切橢圓盤,浮層仍貼在相對位置。</li>
        <li><b>dev 注入點</b>:<code>useBetSink()</code> / <code>useBoardOverlay()</code> 在 prod 為 null,dev 工具可以不經 SDK 直接寫 store 測命中。</li>
      </ul>

      <h2>Tailwind v4 + RWD 引擎:隨畫面變的值走哪一軸</h2>
      <Code>{`軸 0 固定        不隨畫面變                 直接 px
軸 1 框寬        隨橫向基準等比             layoutWidth()(版面幾何,無上限)/ uiScale()(元件等比,上限 1)/ widthLerp()
軸 2 比例        稿在四個長寬比逐格手調     roomRatioSpec 查表(16:9 / 20:9 / 21:9 / 4:3)或 resolveByRatio
軸 3 形態        手機 ↔ 4:3 寬框二選一      formFactor() / CSS 的 wide-frame: 前綴

// hook 版(訂引擎的單一廣播,不自己 addEventListener)
export function useLayoutWidth(): number {
  const [width, setWidth] = useState(layoutWidth);
  useEffect(() => subscribeViewport((v) => setWidth(v.frameW)), []);
  return width;
}

// CSS 版:index.css 只登記一個自訂 variant,Tailwind 內建斷點全專案用量 0(engineBypass.test 守著)
@custom-variant wide-frame (@media (min-width: 500px) and (min-aspect-ratio: 13/20) and (aspect-ratio < 1/1));
<div className="top-[-26px] wide-frame:top-[-46.8px]" />

// 房內是「縮放舞台」:一切由 --frame-w 換算;房外(大廳 / 登入)是流式版面、不引用框寬
// Figma 稿是 2×:每個 px ÷ 2 再進 CSS(letter-spacing、border、shadow 也要)`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼禁 matchMedia / 斷點</b>:形態判定散在 CSS 與 JS 兩邊(媒體查詢只有 CSS 知道、量測只有 JS 能做),集中在引擎才守得住一致;<code>formFactor.test</code> 釘住所有表述。</li>
        <li><b>為什麼軸 2 是查表不是公式</b>:設計師在四個比例逐格手調,公式對不上任何一格;不在表裡的比例用錨點內插。</li>
        <li><b>Tailwind v4 差異</b>:沒有 <code>tailwind.config.js</code>,主題在 <code>@theme</code> 定 CSS 變數;<code>source(none)</code> 關掉自動掃描,只登記 src 與 index.html。沒裝 clsx,動態 class 用 template literal。</li>
      </ul>

      <h2>i18n:react-intl + 遠端語言表</h2>
      <Code>{`// 唯一取字入口 platform/i18n/i18nBridge.ts:React 內外共用
t({ id: 'room.BottomInfo.noDealer', defaultMessage: 'no dealer' })      // id、defaultMessage 都必須字面值(lint)
t({ id: 'room.video.resume', defaultMessage: 'Resume video' })

// runtime 動態 key(SDK 訊息的 langCode)不可用 t(),就地查表
useI18nStore.getState().messages[payload.langCode] ?? fallback

// 供應鏈:LanguageManager 下載 CSV → useI18nStore.apply(lang, messages) → <I18nProvider> 訂閱 store → IntlProvider
//   下載前 / 失敗 / dev:messages 空 → 每個呼叫點的 defaultMessage(英文)保底,玩家無感降級
// Toast / Modal 文案同樣禁裸字串:UIManager.showToast(t({...}))`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>「文案應該是英文」= 改呼叫點的 defaultMessage</b>,不是改語言表(表是渠道擁有的)。</li>
        <li><b>t() 是模組單例、不訂閱 context</b>:語言表下載完成後已掛載的元件不會自動重繪,實際只影響 LoadingView(其餘畫面都在下載後才掛)。</li>
      </ul>

      <h2>視訊(RTC):framework VideoManager + 本專案 VideoAdapter</h2>
      <Code>{`// 分層
game-client-framework/video   VideoManager:PlayerFactory(TRTC / Agora / ARTC)、token、failover、品質監控、大廳預覽池
integrations/video/VideoAdapter   AppConfig → ManagerConfig;ManagerEvent → useVideoStore + Toast;視訊事件 → elog;join / leave / setQuality / setMuted
game/actions/video.ts            joinVideo(tableCode):取 VideoLayer 容器、回讀偏好、委派 adapter.join;syncVideoMuted() 是靜音的單一求值點
views/room/VideoLayer.tsx        只給 div(見 React 入門 §3)

// 靜音兩個來源任一成立就靜音:教學遮罩顯示中、玩家偏好(視訊開 且 音訊開才聞聲)
function shouldBeMuted() { if (isTutorialActive()) return true; return shouldMuteAudio(prefs.videoEnabled, prefs.audioEnabled); }
// 解除靜音不能無條件開(玩家可能早就關聲音),每次重新求值,不記「進教學前是什麼」`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼 RTC 下放 framework</b>:三家 provider 的播放器與 failover 跟輪盤無關,多款遊戲共用;本 repo 只留一層 facade 換算本遊戲的 scale / offset 校正常數。</li>
        <li><b>安全 no-op singleton</b>:設定不完整、未進房時所有方法都是 no-op,偏好 store 的副作用可以無腦直呼。</li>
      </ul>

      <h2>非 React 層要碰 UI 時:UIManager 與 SceneManager</h2>
      <Code>{`// platform/uiManager/UIManager.ts:靜態呼叫入口 + zustand store,LayerHost(App.tsx 掛一次)負責畫
UIManager.showToast(t({ id: 'bet.cancelled', defaultMessage: 'Bet cancelled' }), 'info');   // 單顆制
UIManager.showModal({ message, confirmText, onConfirm, tag: 'kick', isRepeat: false });   // 佇列制,tag 去重
UIManager.setEntering(true);                                   // 進房全屏菊花,RoomView 掛上時關
// Loading 類型由 SDK PLAY/STOP_JUHUA 經 LoadingHandler 驅動:none / huge(全屏阻斷)/ normal(右下小圈)

// platform/sceneManager.ts:handler 也能導航
SceneManager.register(navigate);    // RouterBridge 在 render 階段注入
SceneManager.goto(ScenePath.LOBBY); // SceneHandler 收到 SDK POSITION_CHANGED 時呼叫`}</Code>
      <p className="max-w-[70ch]">這兩個是從 Cocos 沿用、經複查判定「補上 React 覆蓋不到的位子」而保留的單例;<code>SceneManager</code> 與 <code>LanguageManager</code> 列為「不要再長大」,不要新增呼叫點。</p>

      <h2>設定與偏好:fields.ts 一列寫完一個欄位</h2>
      <Code>{`// integrations/config/fields.ts——AppConfig 型別由本表推導,引擎逐列執行;加一個設定只加一列
gwUrls: field({ default: [] as string[], jsonKey: 'url_gw', fromJson: commaSeparated, url: ['gwUrl'] }),
isXxxEnabled: field({ default: false, url: ['isXxxEnabled'], fromUrl: urlBoolean }),
// 來源:project.json / coreProject.json → URL 參數覆寫(白名單)→ derive.ts 具名 pass(跨欄位規則)

// 讀:views 只准經 hook(lint 擋 ConfigManager 直讀);非 React 用 ConfigManager.instance
const { studioId, hiddenRooms } = useAppConfig();      // Readonly<AppConfig>,載入後凍結、不需訂閱

// 偏好:platform/state/usePreferencesStore——唯一持久化 owner,每個 action = set → savePreference → 接線副作用
usePreferencesStore.getState().setSoundsEnabled(false);   // 延後 300ms 才靜音,讓那一聲按鍵音播完`}</Code>

      <h2>載入與分包:import 圖決定一切</h2>
      <Code>{`載入集合   首屏(Loading / Login / Lobby 共用)  →  房間 chunk(RoomView + pixi + spine + framework,一包)  →  面板
規則       首屏程式碼只能用 import() 碰到 pixi;check-dist-preload 掃產物,首屏 chunk 含 pixi 就 build 紅

// 面板總表 views/popup/panels.ts——唯一匯出口,每個面板一行宣告 sync 或 lazy
export { TrendPanel } from './panels.sync';          // 預設同步(lazy 化冷開約 300ms,體感不可接受)
export const HugePanel = lazyPanel('HugePanel');     // 只有進房很久才開、又重的才切 lazy;panels.test 抓兩邊不一致

// 可插拔 UI(檔期活動 campaigns/、換皮 skins/):一列一單位,呈現只經 import(),關著的 chunk 永遠不被請求
{ id: 'autumn', isOn: (s) => s.config.isLobbyAutumnEnable && s.live.autumnOpen,
  surfaces: { 'room.topBanner': () => import('./autumn/banner') } }
const banners = useCampaignSurfaces('room.topBanner');   // 疊加語意;換皮用 useSkinFor(slot) 取代語意
// 六道守門(testing/surfaceRegistryGates):載入器必須字面值、id = 目錄名、總表只准 import ./slots、頂層無副作用…

// 預抓永遠閒時 + 網路允許,不掛載即抓(弱網會擠掉該畫面自己的資源)
useEffect(() => scheduleWhenIdle(() => {
  if (isConstrainedNetwork()) return;
  void import('./RoomView').catch(() => undefined);
}), []);`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼 pixi 不再拆細</b>:程式庫的 barrel 是靜態 re-export 且宣告有副作用,拆不出用不到的 renderer;拆更細只多幾趟 RTT。</li>
        <li><b>收益門檻</b>:以 gzip 數決定,低於載入集合 2% 的改動視為 churn 不做;改載入一律先量再砍(<code>loading-performance-audit</code> skill)。</li>
        <li><b>一個布林 prop 不是一個單位</b>:showHome 這種按鈕幾百 bytes,做成 chunk 只是多一趟請求;有自己 chunk 或資料層的才走總表。換整個 RoomView 是路由的事。</li>
      </ul>

      <h2>新手教學:三層可攜設計</h2>
      <Code>{`tutorial/core/      可攜機制:TutorialSession(進出順序唯一權威)、狀態工廠、換頁工廠、擺拍工廠、中斷蹦床   不認識遊戲
tutorial/ui/        演出元件:遮罩、挖洞聚光燈、文字、SKIP、頁點 + useSpotlightGeometry 量測引擎        不認識遊戲
tutorial/roulette/  輪盤例項:scenes.ts 劇本(七頁)、rouletteGate(怎麼凍 / 怎麼還原)、stageDirector 擺拍、埋點   認識

兩個旗標刻意分開:frozen = 資料閘門(SDK 訊息不得寫 store);active = 顯示層(遮罩)
退出順序「先解凍、後撤遮罩(延後一格)」:store 重建到畫面揭開之間必須仍被遮住,否則看到中間態
凍結靠「退訂 handler」不是每個 handler 加 if;吃牆鐘的元件、CSS 動畫(data-tutorial-paused)、pixi 時間軸另需各自閘門
前兩層 eslint 禁 import store / handlers / integrations——這條規則就是「日後抽得出去」的唯一保證`}</Code>

      <h2>Vite 設定裡值得知道的幾行</h2>
      <Code>{`base: './'                                   同一份 build 放根目錄或 /new/roulette/ 都行(MemoryRouter 無 URL 副作用)
resolve.alias(只在 serve)                     兩個 framework 指到 ../<repo>/src → 改 framework 直接 HMR;SDK 與 shared-code 維持 dist watch
resolve.dedupe: ['pixi.js', spine, 'react', 'react-dom']   framework 以 symlink 連入且自帶 nested node_modules,少任一項就雙實例
preserveSymlinks: command === 'build'         dev 不保留 → Vite 把 root 外的 dist 逐檔加進 watch,上游 rebuild 自動 reload
define VITE_APP_VERSION                        package.json#version + git sha 8 碼,QA 回報可直接對到 release 目錄
stripCommentsFromBuild                         build 時剝 index.html 內聯 style / script 的中文說明註解(oxc minify);staging 只去註解不壓
tsconfig paths: pixi.js → ./node_modules/pixi.js   型別層也只認一份 pixi`}</Code>

      <h2>測試與驗證</h2>
      <Code>{`npm run typecheck                    秒級,必跑;CI 跑不了 tsc(quality lane 先剝掉 @toppath)
npx vitest run src/xxx.test.ts       先單檔;預設 node 環境,元件 / hook 測試檔頂端加 // @vitest-environment jsdom
npm run lint                         0 warning;JSX 裸字串、跨環 import、裸 svg、console 都在這被擋
npm run build                        含 check-dist-paths(子路徑資源)+ check-dist-preload(首屏不含 pixi)
UI 變更:dev-server 量 computed style / bounding box,改前重現 → 改後證明;房內要驗四個設計比例 + 兩個實機極端

結構性測試(不是測功能,是釘住規則):
  platform/rwd/engineBypass.test      全 src 沒有 matchMedia / Tailwind 斷點
  platform/rwd/formFactor.test        形態判定在 CSS 與 JS 多處表述一致
  views/popup/panels.test             同一面板不會同時在 sync 與 lazy 名單
  testing/surfaceRegistryGates        可插拔總表六道守門
  testing/moduleGraphScan             目錄頂層無不可丟棄的副作用
  handlers/*.test                     handler 注入假 adapter,驗 setup / teardown 成對、pull 現值`}</Code>

      <DataTable sections={DIRS} headers={['項目', '用途', '說明']} placeholder="搜尋指令、目錄、鐵則…" />

      <h2>要深讀時去哪</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><code>CLAUDE.md</code>(= AGENTS.md):工作契約與鐵則,最薄的一份、先讀。</li>
        <li><code>docs/開發規範與指引.md</code>:規範本體。§3 註解九原則、§8 分層與資料流、§9 store、§10 目錄樹、§11 Pixi、§14.1 分包、§15 驗證。</li>
        <li><code>docs/設計背景與決策.md</code>:所有「為什麼」——選型理由、保護順序、載入分段決定、可插拔 UI 設計、版本約束。</li>
        <li><code>docs/RWD架構.md</code>:四軸模型與決策樹、驗證尺寸、反例集。</li>
        <li><code>docs/遊戲規格與畫面流程.md</code>:畫面結構、遊戲狀態流程、下注互動、面板清單、store ↔ 畫面對應表。</li>
        <li><code>docs/tutorial-system.md</code>:教學系統手冊;<code>docs/資源規範與流程.md</code>:Figma → 切圖 → WebP → runtime 的全部資源規則。</li>
        <li><code>MEMORY.md</code>:跨任務通則(不看就會再犯的坑)、待辦缺口、延後的技術債。</li>
        <li><code>team-skills/README.md</code>:24 個專案 skill 的觸發情境索引;Pixi 的 26 個 skill 住在 <code>../pixi-game-framework/skills/</code>。</li>
        <li>鄰居 repo:<code>../roulette-client</code>(Cocos,行為真相源)、<code>../game-client-sdk</code>、<code>../game-client-framework</code>、<code>../pixi-game-framework</code>、<code>../shared-code</code>。</li>
      </ul>
    </div>
  )
}
