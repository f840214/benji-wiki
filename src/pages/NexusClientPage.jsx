import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

// nexus client（nexus-roulette-client / nexus-colorgame-client）共用架構筆記。
// 兩個 repo 是同一套骨架:colorgame 由 baccarat / roulette 模板複製而來,分環、資料流、工具鏈、閘門全部相同,
// 只有「玩法」那一層不同。資料來源:兩個 repo 的 CLAUDE.md / README / MEMORY / docs / eslint.config / vite.config 與 src(2026-09-08)。
// 版本只寫大版,精確版看各 repo 的 package.json。範例程式碼以 roulette 為主(colorgame 的殼還是 placeholder)。

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
  ['@toppath/game-client-sdk', '後端協定', 'WebSocket + HTTP、所有 model(Table / Round / User / BetInfoCollection / ChipSelector / GameMap / MessageCenter…)與事件。只經 SdkAdapter 出入,其他層不得 import;走 games/<game> 子路徑入口,少 22K gz。分支必須在 nexus_master'],
  ['@toppath/shared-code', '共用型別', 'G.ITable / G.IRound / G.IBet 等 codegen 型別;dist 有進 git,不用 build'],
  ['@toppath/game-client-framework', '框架無關工具', 'ELog 埋點、DeviceChecker 裝置分級、storage、Video(RTC) VideoManager、scheduleWhenIdle 閒時排程、isConstrainedNetwork 網路提示、SoundManager'],
  ['@toppath/pixi-game-framework', 'React + Pixi 渲染層', 'PixiCanvas / SceneStack / RenderPlane / CanvasScope / RenderLayer / Layer / <Spine> 與資源生命週期;/surfaces 子路徑是可插拔 UI 的工廠(純 React、不碰 pixi);/geometry 有 containRect 這類幾何工具'],
  ['api-helper', 'SDK 的內部依賴', 'colorgame 的 setup 會一併 build;SDK 未宣告的 internal dep,setup 偵測後印 link 指引'],
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
  ['scripts/base-diff / base-manifest', '模板漂移量測(colorgame)', '對鄰居 repo 列 same / differs / missing;改了基底檔要重寫 manifest 雜湊'],
]],
]

const DIRS = [
['指令(兩個 repo 相同)', [
  ['npm run setup', '首次建置', '驗 Node 與鄰居 repo、build SDK 與兩個 framework(colorgame 多 api-helper)、裝依賴、連 skills 與 MCP;只在第一次或鄰居換分支後跑'],
  ['npm run dev', '日常開發', '三個依賴 watcher(gcf / pixi / sdk)+ Vite dev server 一起起'],
  ['npm run dev:app', '只起 Vite', '上游 dist 已是最新時用,比 dev 快'],
  ['npm run sync', '拉同事 framework 改動', 'pull + rebuild + relink 兩個前端 framework;不含 SDK / shared-code(那些用 setup)'],
  ['npm run typecheck', '第一道驗證', 'tsc --noEmit,秒級;CI 跑不了所以本地必跑'],
  ['npm run lint', '0 warning', 'eslint src dev --max-warnings 0 + 語言 key 檢查 + 文件連結檢查'],
  ['npm run test', '全量測試', 'vitest run;單檔 npx vitest run <檔>'],
  ['npm run build', '發佈前', 'tsc → vite build → check-dist-paths → check-dist-preload'],
  ['npm run build:staging', 'staging 包', '--mode staging:行內腳本只去註解不壓、會掛 devConsole'],
  ['npm run base:diff -- ../nexus-baccarat-client', '量模板漂移(colorgame)', '對鄰居列 same / differs / missing;不帶參數是驗 manifest 有沒有過期'],
  ['npm run assets:compress', '圖進 repo 前', 'PNG → WebP 標準路徑'],
  ['npm run skill:update / mcp:update', '重連 skills / 重投影 MCP', 'postinstall 會自動跑;改 MCP 只改 .mcp.json'],
  ['npm run commentsCheck', '註解用字檢查', 'grep 出「比照 Cocos / 原本 / 後來改成」這類不該進註解的字樣(report-only)'],
]],
['目錄地圖(環由內到外)', [
  ['src/platform/', '最內環', '零遊戲知識、零 SDK:rwd 引擎、i18n 橋、uiManager(Toast / Modal / Loading)、sceneManager、sound、loading 進度、state(偏好 / 視訊 / 聊天 / i18n store)、dom 工具。整包自基底帶入'],
  ['src/integrations/', '外部系統', 'sdk/SdkAdapter(SDK 唯一出入口)+ sdk/queries(讀取模組)、config(fields.ts 唯一欄位清單 + ConfigManager)、elog 埋點、video/VideoAdapter、host 宿主橋'],
  ['src/game/domain/', '純函式', 'roulette:rouletteWheel / rouletteBetTypes / tableLimitRange / roomListSort / tableCardData。colorgame:colorGame(六色 801–806)/ roomType(15 房型)/ roomVariant(11 版面)/ gameType(=31)。不碰 SDK 實例、全部有測試'],
  ['src/game/store/', 'Zustand', 'useGameStore(局態)/ useBetStore(注單)/ useWalletStore(餘額)/ useUiStore(面板開關、派彩窗)/ useTutorialStore;一檔一 store'],
  ['src/game/actions/', '玩家寫入', 'bet / auth / navigation / video / chat / gift / favoriteBet / customChips / deposit;emit + 樂觀旗標 + elog + toast,永不寫金錢'],
  ['src/game/handlers/global/', 'App 啟動掛', 'Loading / Message / Scene / User / PageVisibility / LogMgr;名冊 globalHandlers.ts;活到關頁'],
  ['src/game/handlers/room/', '進房掛、離房拆', 'Game / Bet / Chat;名冊 roomHandlers.ts;由 SceneHandler 的 POSITION_CHANGED 驅動,不綁 React'],
  ['src/game/hooks/', '畫面讀', 'useTableLimits / useTableRoadmap / useTableSummaryRevision / useLobbyTableList / useLobbyCardLive / useLayoutWidth / useAppConfig…;回純資料,不外露 SDK 實例'],
  ['src/views/', '畫面', 'LoadingView / LoginView / LobbyView / RoomView 四頁 + lobby/ room/ popup/ components/;campaigns/ skins/ 兩張可插拔總表'],
  ['src/views/RoomView.tsx', '房間', 'roulette:五層 z-stack 的房間本體。colorgame:玩法路由器,判玩法後 lazy 畫對應 views/room/<玩法>/,自己沒有版面'],
  ['src/views/room/layers/', '房間分層', 'roomLayers.ts 是 z 序唯一真相(Stage 0 / ChatFloat 1 / Play 2 / UI 3 / Overlay 4 / Tutorial 5);每層一個 XxxLayer 元件'],
  ['src/views/room/betarea/', '注盤(roulette)', 'rect/(矩形盤)與 oval/(racetrack)姊妹盤,各自 Base / Label / Chip / Highlight / Click 五層 DOM,共用 store 與 actions/bet'],
  ['src/views/room/variants.ts(colorgame)', '玩法總表', 'Record<RoomVariant, () => import(...)>,11 列 8 目錄;守門 variants.test.ts'],
  ['src/views/room/payout/', '派彩特效', 'PayoutFx(顯示窗狀態機)→ PayoutEffect(命令式 pixi + RenderLayer)→ payoutSpines / payoutTimeline(純函式時間軸)'],
  ['src/views/room/runtime/', '房間 runtime', 'loadRoomView(進房唯一載入點)、pixiRuntime(Spine 註冊)、roomGeometry / roomRatioSpec(RWD 查表)、roomAssets 預載清單'],
  ['src/views/popup/', '面板', 'panels.ts 唯一匯出口;panels.sync.ts / panels.lazy.ts 各一份名單,同一面板只能在其一'],
  ['src/views/subgames/(colorgame)', '第三張總表', 'registry(空)/ slots(六格)/ activation / hooks;機制在 pixi-game-framework/surfaces'],
  ['src/tutorial/', '新手教學', 'core/(可攜機制)ui/(可攜演出)roulette/(輪盤劇本與閘門);前兩層 lint 禁 import store / handlers'],
  ['src/assets/ vs public/assets/', '資源', 'bundled(import 的 svg / 小圖)vs served(runtime URL:籌碼系列、spine、字型、音效、大背景)'],
  ['src/testing/', '測試專用', '@toppath 替身 stub、toppathAbsentGuard、surfaceRegistryGates 六道守門、moduleGraphScan'],
  ['src/debug/ + dev/', '除錯', 'devConsole(window.__GAME_DEVTOOLS__,只在 DEV / staging 掛);dev/ 是元件檢視與測試工具框架'],
  ['docs/', '中文文件', '開發規範與指引(規範本體)/ 設計背景與決策(為什麼)/ RWD架構 / 遊戲規格與畫面流程 / 資源規範與流程 / tutorial-system;colorgame 另有 docs/plan/基底蒸餾與目錄規劃.md'],
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
  ['一個單位 = 一個目錄 + 總表一列', '多 owner', '玩法 / 子玩法 / 活動 / 換皮都是;總表 append-only 一行一單位'],
  ['註解一律繁中、當規格寫', '§3', '決定值與行為進註解;「比照 Cocos / 對 Figma / 原本…」這類來源與歷史進 commit message'],
  ['行為看 Cocos、外觀看 Figma', '真相源', 'roulette 對 ../roulette-client、colorgame 對 ../cg-client;衝突時行為 Cocos 贏、外觀 Figma(2× 稿,px ÷ 2)贏、票 vs 重現 → 重現贏'],
  ['不自動 git add / commit / push', '流程', 'agent 只產生 commit 一行:conventional 前綴 + 繁中摘要'],
]],
]

const SKILLS = [
['分層與資料', [
  ['hooks-vs-handlers', '該寫 hook 還是 handler', '寫 / 審 hooks、handlers、actions 下的程式;核心判準:server 驅動的共享鏡像 → handler,單一畫面自用 → hook'],
  ['state-config-layering', '這個值該放哪', 'AppConfig(啟動期唯讀)/ usePreferencesStore(跨 session 偏好)/ domain store(runtime)三層歸屬;加設定、加 URL 參數'],
  ['sdk-adapter-boundary', '想在 SdkAdapter 加方法', 'adapter 只傳遞、零業務邏輯;grandfathered 清單'],
  ['sdk-gotchas', 'payload 是 undefined', 'game-client-sdk 非直覺行為:錢包、登入事件、房間列表、籌碼'],
  ['room-lifecycle-loading', '卡在 loading / 被拉回房間', '進退房流程、loading 遮罩、handler 訂閱時序'],
]],
['版面與稿件', [
  ['rwd-layout', '隨畫面變的值走哪一軸', '引擎 API、CSS↔JS 接縫、兩道閘門;想用斷點或 matchMedia 時先看這個'],
  ['figma-2x-scale', '稿是 2×', 'px ÷ 2 換算與基準錨定,避免重複除以 2'],
  ['figma-to-react', '照稿切版', 'design-spec 紀律、CSS/JSON → Tailwind 對應、資產下載腳本、跨比例對齊、陰影 / 發光擬合'],
  ['preview-measurement', 'UI 變更要交量測證據', '同源 iframe 探針、灌 store 造狀態、像素取樣;320 / 375 / 460 三寬度驗'],
  ['ui-panels-roomsheet', '加面板 / 子頁', 'RoomSheet 架構 + 視窗 / 字體陷阱'],
]],
['載入與部署', [
  ['bundle-loading-optimization', '加 lazy 邊界 / 改分包', '載入集合模型、lazy 邊界契約、Rolldown 分組陷阱、預抓政策、先量再砍'],
  ['loading-performance-audit', '載入慢 / 弱網差', 'worktree 基準、gzip 伺服器、節流、瀑布圖;工具在 scripts/loading-audit/'],
  ['subpath-deploy-paths', '部署後 404 但 dev 正常', '子路徑部署的資源路徑規則 + 版號 / 打包契約'],
  ['asset-import-policy', '加圖檔', 'SVG ?react / ?url 判準 + webp-only gate + Spine / .fnt 交付檢查'],
]],
['流程與紀律', [
  ['cocos-parity-porting', '對照 cocos / 改了沒生效', '先找原生實作再寫;跨 repo dist 過期陷阱;SDK 分支要在 nexus_master'],
  ['bootstrap-game-client', '以 roulette 為藍本開新 client', '分階段檢查表、逐檔判定、登入旅程移植、字樣清掃、坑清單'],
  ['ci-lint-policy', 'CI 紅本地綠', 'CI strip-deps lane + 0-warn lint 紀律;eslint-disable 使用規則'],
  ['i18n-copy-policy', '這句沒翻到 / 想改 key', '識別字 / key / 文案三種權威分工;改 key 名前先確認在不在遠端表'],
  ['project-docs-maintenance', '這內容該寫哪', 'AGENTS / README / MEMORY / docs 職責分工 + 過期稽核'],
  ['comprehensive-review', '送出前最終把關', '六面向深度 review:邏輯、設計、註解、文檔、skill、測試'],
  ['conventional-commit', '產 commit message', '外部 skill;搭配專案規則:type 前綴 + 繁中摘要'],
]],
['子系統', [
  ['video-integration', '沒畫面 / 沒聲音 / 黑屏', 'RTC 視訊分層契約 + TRTC / Agora / ARTC 實機契約 + autoplay'],
  ['sfx-conventions', '沒點擊音效', 'data-sfx 委派 + 遊戲事件音'],
  ['elog-porting', '加埋點 / 事件沒送出', 'V1 / V2 雙系統、helper 接線範式、參數對齊 checklist'],
  ['game-devtools-panel', '面板沒資料', 'Game DevTools 三層架構 + __GAME_DEVTOOLS__ 協定'],
  ['pixijs + pixijs-*', 'Pixi v8 API 正確用法', '26 個,住在 ../pixi-game-framework/skills/,link script 自動連入;模型訓練資料多是 v7'],
]],
]

export default function NexusClientPage() {
  return (
    <div>
      <h1>nexus client</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        <code>nexus-roulette-client</code>(輪盤)與 <code>nexus-colorgame-client</code>(彩骰)是同一套骨架:React 19 + PixiJS 8 + Spine +
        Zustand 的 H5 WebRTC 真人遊戲客戶端,取代載入慢、低階 Android 跑不動的 Cocos 版,對標 Evolution。這頁講共用的架構與每項技術
        「怎麼用、為什麼」,附真實範例,再加一段「功能實作走讀」;兩個專案的差異集中在最後。規範原文回各 repo 的 <code>docs/</code>。
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
├─ game ─────────────────────────────────────────────────────────┤  遊戲領域
│  store/(Zustand) actions/(寫) hooks/(讀) handlers/(鏡像) domain/(純函式) │
├─ integrations ─────────────────────────────────────────────────┤  認識協定、不認識玩法
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
        <li><b>為什麼分環</b>:platform 零遊戲知識,整包搬去下一款遊戲(colorgame 就是這樣長出來的);integrations 換 SDK 只動一層;views 永遠不知道 WebSocket 長什麼樣。</li>
        <li><b>為什麼 Pixi 只畫 Spine</b>:注盤 / 籌碼 / 高亮原本打算用 Pixi,最後改 DOM/SVG——排版交給 Tailwind、點擊命中用 CSS grid / 多邊形索引,低階機更省,RWD 跟 DOM 一起縮不用算矩陣。Pixi 只留給真的需要 WebGL 的骨骼動畫。</li>
        <li><b>保護順序「視訊 &gt; 下注 &gt; 狀態同步 &gt; 盤面動畫 &gt; Spine」</b>:資源不足時由後往前砍,視訊永遠最後才動;低階機自動降 Pixi resolution(<code>platform/device.ts</code>)。</li>
      </ul>

      <h2>啟動流程與路由(main.tsx / App.tsx)</h2>
      <Code>{`bootstrap()(順序不可亂)
  defineLoadingMap + completeTask(APP_SHELL)   進度地圖(index.html 內聯進度條先接棒)
  initScrollbarWidth / installZoomLock / installViewportTracker   任何版面渲染前
  registerRoomPreload(loadRoomView)            進房 action(game 環)不認識 views 的 chunk,在此注入
  const appConfig = await ConfigManager.load() project.json + coreProject.json + URL 參數
  直進房 → 先 import('./views/RoomView') + 預抓視訊 vendor(用登入 RTT 的空檔)
  initElog(appConfig)                          埋點最早起,後面錯誤才抓得到
  SoundManager.instance.init()                 AudioContext + 首次手勢解鎖
  SdkAdapter.instance.init(appConfig)          GameClient(GameMap config 決定哪張桌列表先到)
  emit(INIT_CONFIG, appConfig)                 設定同步進 SDK Config model
  emit(LOAD_CHANNEL_INFO)                      渠道資訊,先掛監聽再 emit 避免 race
  setupGlobalHandlers()                        React render 前就訂閱 LOGIN_SUCCESS / SYNC_MONEY…
  useI18nStore.apply(lang, {})                 語言表還沒下載,先用 defaultMessage(英文)
  renderApp()                                  createRoot(...).render(<StrictMode><I18nProvider><App/>)
  之後才 await 渠道 → 下載語言表 → apply → 等字體 → 100%

路由:MemoryRouter,initialEntries ['/']
  /  LoadingView → /login LoginView → /lobby LobbyView → /room/:tableCode RoomView(lazy)
  <IntlBridge/>   把 intl 實例塞進 i18nBridge,非 React 層才能 t()
  <RouterBridge/> 把 navigate 塞進 SceneManager,handler 才能 goto()
  <LayerHost/>    Toast / Modal / Loading 三件套,UIManager 經 zustand 驅動`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼 handler 在 React render 之前就訂閱</b>:SDK 的 model 連線前就存在、事件連線後才發,提早訂閱無害;晚訂閱會漏掉登入回應。</li>
        <li><b>為什麼 MemoryRouter</b>:網址列不能露桌號與頁面,而且 base 設 <code>./</code> 後同一份 build 可放任意子路徑,沒有 URL 路由就沒有副作用。</li>
        <li><b>Bridge 模式</b>:<code>useNavigate</code>、<code>useIntl</code> 只能在元件裡拿,handler / action 不是元件。解法是在 Router / IntlProvider 子樹裡放一個不渲染任何東西的元件,render 時把實例存進模組單例。</li>
      </ul>

      <h2>功能實作走讀:列表、定位、跳轉、傳資料、收事件、打事件</h2>
      <p className="max-w-[70ch]">用大廳 → 進房這條最常走的路徑,把「一個功能在這套架構裡是怎麼拼起來的」逐段拆開。全部是 roulette 現碼,colorgame 骨架相同、畫面待實作。</p>

      <h3>① 房間列表:類 ScrollView 是怎麼做的</h3>
      <Code>{`// views/LobbyView.tsx——沒有 ScrollView 元件,就是一個 overflow-y-auto 的 flex 欄
<div className="relative flex h-full w-full flex-col overflow-hidden bg-[#0d5f72]">
  <LobbyHeader balance={balance} />                                  {/* 固定在上 */}
  <main ref={mainRef}
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-[18px] pt-2.5
                   [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:w-1 ...">
    {isLoading ? <p>Loading…</p>
     : tables.length === 0 ? <p>No tables</p>
     : tables.map((t) => (
         <TableCard key={t.tableCode} data={t}
                    onEnter={handleEnterRoom}
                    onCardMount={handleCardMount}                 // 卡片根 div → Map<tableCode, el>
                    onVideoContainerMount={handleVideoContainerMount} />   // 視訊容器 div → Map
       ))}
  </main>
  <Suspense fallback={<PanelFallback />}>{isMenuOpen && <MainMenuPanel scene="lobby" />}</Suspense>
</div>

// 資料從哪來:game/hooks/useLobbyTableList.ts(單一畫面自用 → hook,不進 store)
const { tables, isLoading } = useLobbyTableList();
//   SDK TableCollection.getTableList(gameType) → domain/roomListSort.buildRoomList(過濾 / 優先桌 / 五鍵排序)
//   → domain/tableCardData.mapTableToCardData → TableCardData[]
//   訂 LIST_INITIALIZED / FAVORITE_TABLES_CHANGED / TABLE_MAINTAIN / GOOD_ROAD_STATE_CHANGED / DELETE_TABLE
//   → 這些會改成員或排序,才重建整列

// 每張卡自己的即時更新:game/hooks/useLobbyCardLive.ts(卡內狀態 / 路書 / 人數 / 荷官 / 限紅 / 維護)
const live = useLobbyCardLive(data.tableCode, data);   // 訂該桌 10 個 Table 事件 + tableSummary REFRESH,in-place setState
//   刻意不動父層 tables 陣列 → 不重排、不跳卡;identity / ref 用 data.tableCode,顯示欄位用 live

// 捲動中要做的事:哪張卡播視訊預覽(同時只播一張、永遠靜音)
useEffect(() => {
  const observer = new IntersectionObserver(() => scheduleUpdate(), { root: mainEl, threshold: 0.01 });
  cardRefsRef.current.forEach((el) => observer.observe(el));
  mainEl.addEventListener('scroll', scheduleUpdate, { passive: true });   // 停穩 200ms 才評估
  const rafId = requestAnimationFrame(() => updateVideoPlayback());        // 首屏立刻評估一次
  return () => { observer.disconnect(); mainEl.removeEventListener('scroll', scheduleUpdate); ... };
}, [tables, updateVideoPlayback]);
// updateVideoPlayback:用 getBoundingClientRect 即時算每張卡「縱向可見比例」,最高者(平手取最上)= 聚焦卡
// → VideoAdapter.instance.previews.add(code, viewEl, adjust) / remove(code)`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼不用虛擬列表</b>:桌數只有十幾張,DOM 全掛最省事;真正貴的是視訊,所以「虛擬化」的是預覽播放而不是 DOM。</li>
        <li><b>為什麼 IntersectionObserver 只當觸發器</b>:它的 entry.intersectionRatio 是非同步的,首屏版面還沒定位時數值失準;改為「可見性變了 → 排程重算」,實際比例每次即時量。</li>
        <li><b>列表層與卡片層分工</b>:改成員 / 排序的事件重建整列(hook A),卡片內容變的事件只刷那張卡(hook B)。混在一起會整列重排、視訊預覽被殺掉重建。</li>
        <li><b>ref 回呼的坑</b>:inline callback ref 每次 render identity 都變,React 會在同一個 DOM 上先 null 再 el 重呼叫,所以 null 分支只能清索引、不能拆預覽。</li>
      </ul>

      <h3>② 東西怎麼定位:房外流式、房內縮放舞台</h3>
      <Code>{`房外(大廳 / 登入 / 載入):普通 flex / grid 流式版面,不引用框寬。桌卡 = 卡片自身 aspect-[800/383] + footer,
  高度跟著寬走;絕對定位只用在卡內小徽章(absolute left-2 top-2 z-[2])。

房內(RoomView):「縮放舞台」——一切由框寬 --frame-w 換算,四個 CSS 變數是所有錨點的基準:
  --frame-w        橫向基準寬(手機 = 視窗寬;桌面鎖框 432;index.html 定義)
  --video-band-h   視訊帶高 = --frame-w × 500/864(RoomView 根寫入;每層的「帶底」錨點都引用它)
  --upx            1 設計 px 換成幾個螢幕 px(隨框寬放大);寫死 px 的元素在寬框會被縮放的鄰居蓋到
  --safe-bottom    iOS home indicator 安全區
  --ui-scale       scale-to-frame 容器的縮放比(引擎廣播;寬框夾上限 1)
  --rail-top-offset / --countdown-gap   比例查表結果(useRoomRatioSpec 進房後寫進 :root;media query 值只是初值)

層 → 每層一個 <Layer z={ROOM_LAYER.x}>(absolute inset-0、pointer-events:none),裡面的東西各自 absolute 錨到某條邊:
  PlayLayer   右功能列  absolute right-0  top = CSS_SHORTCUT_RAIL_TOP(帶底 −26 設計 px,查表覆寫)
              左功能列  left-[calc(10*var(--upx))]  top-[calc(var(--video-band-h) + 35.5*var(--upx))]
              注盤帶    top-[var(--video-band-h)]  bottom-[calc(44*var(--upx)+var(--safe-bottom))]
                        left/right = RECT_BAND_X(框寬 × 0.1979 / 0.2569,= 稿的盤位;寬框右鏡射左 → 置中)
              盤面      <AspectBox ratio=… zoom=…>:在帶內按長寬比 contain、略高於正中;放大態原地放大、裝不下往上蓋視訊帶
  UILayer     視訊帶上的頂列 / 倒數:一個 scale-to-frame 容器(內層用設計 px 排,外層整塊 scale 到框寬),
              倒數環「下錨於帶底」bottom-[var(--countdown-gap)] right-[8px]——不可頂錨百分比,環是固定 60px 不隨帶高縮
              底部兩列:absolute bottom-[var(--safe-bottom)] h-[40px] wide-frame:h-[58.5px]

數字住哪:views/room/runtime/roomGeometry.ts(視訊帶 864×500、兩盤帶邊距、rail 錨點)——Tailwind class 只能寫字面值,
  所以同一組數字的 class 版與 JS 版「刻意放同一檔相鄰」,並有測試釘住不漂移。
比例不同時稿有各自的值 → roomRatioSpec 查表(16:9 / 20:9 / 21:9 / 4:3),不用公式。`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>先問「這個量隨什麼變」</b>再決定寫法:不變 → px;隨框寬 → 乘 <code>--upx</code> 或放進 scale-to-frame;隨比例 → 查表;隨形態 → <code>wide-frame:</code>。混用就會在某個比例對不上。</li>
        <li><b>錨在同一條邊的東西才會一起動</b>:倒數環、Bet Limit、右功能列都掛在視訊帶下緣;頂列掛帶頂;餘額列掛安全區。改一個錨點前先看它同組還有誰。</li>
        <li><b>整層穿透、元素 opt-in</b>:每層 <code>pointer-events-none</code>,只有注盤 / rail / 按鈕自己 <code>pointer-events-auto</code>,層再多也不會擋到底下的點擊。</li>
      </ul>

      <h3>③ 點桌卡進房:item 跳轉不是 navigate,是「emit 之後等 SDK 說你到了」</h3>
      <Code>{`TableCard  onClick={() => onEnter(data.tableCode)}          維護中的卡 onClick 拔掉 + 遮罩再封一道
  ↓ props 回呼
LobbyView  handleEnterRoom = (code) => enterRoom(code)         元件不碰 SDK,只呼叫 action
  ↓
game/actions/navigation.ts  enterRoom(tableCode)
  BetRoundTracker.enter()                                       埋點基準
  UIManager.setEntering(true)                                   前端全屏菊花,一路蓋到 RoomView 掛上
  roomPreload?.()                                               與 API 並行預載 RoomView chunk + pixi runtime
  SdkAdapter.instance.emit(GameEvent.MOVE_TO_GAME_ROOM, { gameType, gameId: tableCode })
  // 不在這裡換頁!畫面停在大廳,等 SDK 確認
  ↓ SDK:enterTable API → 灌好 Table / Round model → GameMap.addMoveHistory
SDK event  GameMap.Event.POSITION_CHANGED
  ↓
game/handlers/global/SceneHandler._onPositionChanged()
  const position = gameMap.currentPosition();                   { gameId, gameType } 有 gameId = 房間
  if (useGameStore.tableCode === position.gameId) return;       同桌重放(重連 resume)不重建
  roomHandlers.teardownAll(); resetRoomStores(); setupAll(tableCode);   房間 handler 在此掛(React 之外)
  useGameStore.getState().enterRoom(tableCode);
  SceneManager.goto(ScenePath.ROOM(tableCode));                 → navigate('/room/XXX')
  UIManager.clearJuhua();                                       清 SDK 菊花,保留 entering 遮罩
  ↓
App.tsx  <Route path="/room/:tableCode" element={<RoomView/>}>  lazy chunk(多半已預載完)
RoomView  const { tableCode } = useParams();                    桌號從路由參數拿
          useEffect(() => UIManager.setEntering(false), [tableCode]);   遮罩到這裡才關
          useEffect(() => { joinVideo(tableCode); return () => leaveVideo(); }, [tableCode]);

離房 exitTable():刻意雙驅動
  立即:teardownAll + resetRoomStores + goto(LOBBY)             體感即時
  稍後:POSITION_CHANGED 大廳分支再 _leaveRoomCleanup + goto    權威收斂(皆冪等)
  leavingRoom 旗標 + 10 秒保底:過渡期回前景不讓 resume 把人拉回舊房`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼 action 不直接 navigate</b>:進房可能失敗(維護、餘額、桌不存在),畫面先跳了就要再跳回來;而且房間 handler 需要在 model 灌好之後、React mount 之前掛上,那個時間點只有 SDK 知道。</li>
        <li><b>兩層 loading 的原因</b>:SDK 的菊花在 API 完成就停,但 RoomView chunk 與 pixi 資源還在載;React Router 7 的 navigate 是 transition、suspend 時不顯示 fallback,所以要一個前端旗標蓋到元件真的掛上。</li>
        <li><b>URL 深連結直進房</b>走同一條:LIST_INITIALIZED 時 SceneHandler 看 config.tableCode 存在且可顯示,就自己 emit MOVE_TO_GAME_ROOM,後面完全一樣。</li>
      </ul>

      <h3>④ 資料怎麼傳:五種管道,各有邊界</h3>
      <Code>{`1. 父 → 子 props(同一棵 UI 內)
   <TableCard data={t} onEnter={handleEnterRoom} onCardMount={…} />
   <UILayer tableCode={tableCode} />            RoomView 把路由參數往下傳
   規則:資料 props 傳入或 hook 取值;元件不接 API、不 import SDK

2. 路由參數(畫面之間)
   SceneManager.goto(ScenePath.ROOM(tableCode))  →  const { tableCode } = useParams()
   只傳識別碼(桌號),不塞物件;其他資料到了房間再從 SDK / store 拿

3. Zustand store(跨畫面、跨層、跨 React 邊界)
   handler 寫:useGameStore.getState().setGameState(state)
   元件讀:const gameState = useGameStore((s) => s.gameState)      selector 只訂一個欄位
   action 讀:const { tableCode } = useGameStore.getState()
   只放 SDK 讀不回來的、一次性事件給的、或多畫面必須一致的;其餘不進 store

4. hook 回純資料(單一畫面自用)
   const { tableName, totalRange } = useTableLimits(tableCode)   內部訂 SDK,對外不露 Table 實例
   const live = useLobbyCardLive(tableCode, initial)             initial 當種子,事件來了 in-place 覆寫

5. 啟動期常數(唯讀)
   const { studioId, hiddenRooms } = useAppConfig()              views 只准經這個 hook
   ConfigManager.instance.userLevel                             非 React 層直讀

跨層要拿 React 的東西:Bridge(RouterBridge / IntlBridge)把實例存進模組單例
跨層要拿 DOM:元件用 ref 把 div 登記進 store(useVideoStore.setContainerElement),adapter 再收養
game 環要用 views 的東西(進房預載 chunk):不 import,由 bootstrap 注入函式 registerRoomPreload(loadRoomView)`}</Code>

      <h3>⑤ 通知 / 事件怎麼收:一律 model.on(Event, cb),誰收看「有沒有畫面都要處理嗎」</h3>
      <Code>{`// A. 全局 handler(App 起就掛、永不拆):餘額、系統訊息、被踢、位置變更
// game/handlers/global/UserHandler.ts
setup() {
  const user = this._adapter.getUser();
  user.on(User.Event.LOGIN_SUCCESS, this._onLoginSuccess);
  user.on(User.Event.SYNC_MONEY, this._refreshBalance);        // SYNC_MONEY 不帶 payload,要主動讀 model
  this._refreshBalance();                                        // 訂完先讀一次
}
private _refreshBalance = () => {
  const balance = Number(this._adapter.getUser().getMoneyForLiveTable());
  useWalletStore.getState().setBalance(Number.isFinite(balance) ? balance : 0);   // 唯一寫入者
};

// B. 系統訊息總路由:一個事件、依 messageMode 分流到 UI 三件套
// game/handlers/global/MessageHandler.ts
msgCenter.on(MessageCenter.Event.GOT_NEW_MESSAGE, this._onMessage);
private _onMessage = (msg: ISdkMessage) => {
  // ALERT 模式(自動消失) → UIManager.showToast(text)
  // CONFIRM / OK 模式     → UIManager.showModal({ title, message, onConfirm: cbOf(msg), tag, isRepeat:false })
  // 文案:寫死的 key 用 t({id, defaultMessage});SDK 塞在 payload.langCode 的 runtime 字串用 tr() 查表、查無原樣透出
};

// C. 房間 handler(進房掛、離房拆):局態、注單、聊天——多畫面共享、沒畫面也要對
// game/handlers/room/GameHandler.ts
table.on(Table.Event.GAME_STATE_CHANGED, this._onGameStateChanged);
table.on(Table.Event.PAYOUT, this._onPayout);                    // 一次性事件,錯過就沒了
round.on(Round.Event.SRC_RESULTS_CHANGED, this._onResults);
teardown() { this._table?.off(Table.Event.GAME_STATE_CHANGED, this._onGameStateChanged); ... }   // 用留存的參照 off

// D. 元件自己訂(只有這個畫面要看、關掉可重讀):寫 local state
useEffect(() => {
  const t = SdkAdapter.instance.getTable(tableCode);
  const cb = () => setVersion((v) => v + 1);
  t.on(Table.Event.RANGE_LIST_CHANGED, cb); cb();
  return () => t.off(Table.Event.RANGE_LIST_CHANGED, cb);
}, [tableCode]);

// E. SDK 不發事件、要自己輪詢的(聊天一般池):handler 內 setInterval 200ms getShiftMessage(0) 逐筆 shift
// F. 一次性訊息池「取走」而不是「讀」:優先池由 SDK 每 200ms 反覆 emit ADD_PRIMARY_MESSAGE,直到被 shift 清空

三條契約(每個 on 都要遵守):
  · 訂閱後立刻 pull 現值——進房時事件多半已發過
  · 每個 on 有同參照的 off;場景類 handler 留存 setup 當下的 model 參照給 teardown 用(桌台可能已被移出集合)
  · 各訂閱者只讀 SDK model 真相、不讀彼此的 store 輸出——訂閱順序才不構成依賴`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>事件名從哪來</b>:SDK 匯出 <code>Table.Event.X</code> / <code>User.Event.X</code> 等靜態常數,經 SdkAdapter re-export;SDK 沒匯出的(BetInfoCollection 事件)在 handler 檔內宣告字面值。</li>
        <li><b>兩個信道同時來怎麼辦</b>:被踢同時有 <code>User.KICK_USER</code> 與 MessageCenter 訊息,Modal 用同一個 <code>tag</code> + <code>isRepeat:false</code> 去重,只彈一次。</li>
        <li><b>就地 mutate 的物件</b>(tableSummary 路書)React 看不出變化,一定要訂它自己的 REFRESH 事件轉版號,不能拿 gameState 之類別的欄位代打。</li>
      </ul>

      <h3>⑥ 事件怎麼打:只在 action 裡 emit,回程交給 handler</h3>
      <Code>{`// 唯一出口:SdkAdapter.instance.emit(GameEvent.X, ...args)——GameEvent 是 SDK 的命令名常數
// integrations/sdk/SdkAdapter.ts
emit(event: string, ...args: unknown[]): void { this.client.emit(event, ...args); }

// 場景:進房 / 離房
emit(GameEvent.MOVE_TO_GAME_ROOM, { gameType: ROULETTE_TABLE_TYPE, gameId: tableCode })
emit(GameEvent.MOVE_TO_GAME_LIST, { gameType, tableCode })          // 一條龍:停自動下注、exitTable、載列表、更新 position
emit(GameEvent.EXIT_TABLE, { tableCode }, false)                    // 直入單桌交還宿主才用

// 下注:action 只 emit,SDK 自己維護未確認注單,BetHandler 收事件整批覆寫 store
emit(GameEvent.SELECT_CHIP, chip)                                   // 傳 SDK Chip model 實例,不是 plain object
emit(GameEvent.ADD_BET, table, betType, amount)                     // 傳 Table model 實例
emit(GameEvent.CONFIRM_BET)                                         // 只在 OPEN_ROUND;roundCode 由 SDK 帶,server 冪等

// 聊天:帶 callback 的 emit(SDK 送完呼叫,拿來清輸入框)
adapter.emit(GameEvent.SEND_CHAT_MESSAGE, ChatMessageType.NORMAL, table, content, userLevel, '', () => onDone?.(), blockFlag)

// 其他常見
emit(GameEvent.USER_GET_MY_DATA)                                    // 登入後撈個人化資料(收藏 / 自訂籌碼 / 教學狀態)
emit(GameEvent.SWITCH_PAGE_VISIBILITY, true)                        // 回前景;SDK 內部自己跑 CHECK / RELOGIN
emit(GameEvent.INIT_CONFIG, appConfig)                              // 啟動期一次

// 一個 action 的完整形狀(game/actions/bet.ts)
export function selectChip(chipValue: number): void {
  try {
    const selector = SdkAdapter.instance.getChipSelector();
    reportChipSelect(chipValue, false);                              // ① elog 埋點
    const chip = selector.chipList.find((c) => c.value === chipValue && !c.isCustom);
    if (chip) SdkAdapter.instance.emit(GameEvent.SELECT_CHIP, chip); // ② emit
    // ③ 不寫 store:SDK 驗證後 emit SELECTED_CHANED → BetHandler → useBetStore.selectChip()
  } catch (err) { log.warn('SELECT_CHIP 失敗(SDK 尚未就緒)', err); }
}
// action 可以:emit、寫樂觀 / UI 旗標(setConfirming(true))、送 elog、toast
// action 不可以:寫餘額 / 派彩 / 開獎 / 注額真相;放渲染邏輯;await 回應(那是 queries 的事)`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>三個絕對不能自己 emit 的</b>:<code>LOGIN_TO_MSG</code>、<code>SYNC_TABLE_LIST</code>、<code>CHECK_CONNECTION_AND_RESUME_GAME</code>——都是 SDK 內部流程,重複發會造成 duplicate enter-table、把新的 pending bet 清掉。</li>
        <li><b>SDK / server 會擋的事前端不要搶著擋</b>:擋掉等於把伺服器的提示一起吃掉,玩家只看到「按了沒反應」。前端只做「明顯不可用」的視覺。</li>
        <li><b>要 await 回應的讀</b>(資產明細)走 <code>queries/</code>,自己序列化 + 逾時,不經 handler 也不寫共享 store。</li>
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
  const handleClick = () => onClick?.();   // 事件邏輯抽成具名 handler,不在 JSX 寫 inline arrow

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

      <h3>2. useState + useEffect:訂閱 SDK 事件、回純資料</h3>
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
        <li><b>為什麼用 version 計數而不是直接存物件</b>:SDK 很多物件是就地 mutate、參照不變,React 靠參照比對看不出變化。把事件換成遞增數字當依賴,useMemo 就會重算。</li>
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
  <Routes><Route path="/room/:tableCode" element={<RoomView />} /></Routes>
</Suspense>

// views/room/runtime/loadRoomView.ts
export async function loadRoomView() {
  const roomView = import('../../RoomView');           // 畫面 chunk 與 runtime 平行下載
  roomView.catch(() => undefined);
  const { setupRoomPixiRuntime } = await import('./pixiRuntime');
  await setupRoomPixiRuntime();                         // Spine pipe 註冊完才准掛 PixiCanvas
  return roomView;
}`}</Code>

      <h3>5. 常見地雷(這專案特有)</h3>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>守衛讀活體 model,不讀 store 快照</b>:<code>Table.gameState</code> 是計算 getter(倒數會即時翻封盤),SDK 事件晚一個 tick,store 必然落後;確認下注前補查 <code>table.gameState</code>。</li>
        <li><b>凍住資料 ≠ 凍住畫面</b>:吃牆鐘的元件(<code>Date.now</code> + rAF 倒數環)、CSS 動畫、pixi 時間軸都不看 store,教學要停畫面得三道閘門各開一個。</li>
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

const balance = useWalletStore((s) => s.balance);        // 元件:selector
useWalletStore.getState().setBalance(user.money);        // handler / action:getState()`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼選 Zustand 不是 Context / Redux</b>:SDK 事件、handler、Pixi 層都不在 React 樹內,需要一個 React 外也能讀寫的容器;Context 高頻更新會整棵重繪,Redux 樣板太多。</li>
        <li><b>什麼才進 store</b>(先問「SDK 讀不讀得回來」):SDK 沒這份資料(面板開關)→ 必放;SDK 只用一次性事件給(餘額、聊天)→ 必放;樂觀更新要能回滾(pendingBets)→ 必放;SDK 有 getter 隨時讀得回來(路書、限紅)→ <b>不放</b>。例外:讀得回來但 17 處消費、不一致有代價的 <code>gameState</code> 仍做鏡像。</li>
        <li><b>store 只放可序列化狀態</b>:不放 Application、Texture、Spine instance、MediaStream。</li>
        <li><b>值該放哪的三層</b>:啟動期唯讀 → <code>AppConfig</code>;跨 session 偏好 → <code>usePreferencesStore</code>(自己 write-through localStorage);runtime 狀態 → domain store。</li>
      </ul>

      <h2>handler / action / hook:三問定位</h2>
      <Code>{`沒有任何畫面開著時,這件事還要發生嗎?  → handler(server 驅動,常駐,寫權威狀態)
是玩家的一個動作嗎?                     → action (使用者驅動,呼完即結束,emit + 樂觀旗標)
只是某個畫面要顯示嗎?                   → hook   (畫面驅動,隨元件生死,寫 local state)
三者共用的規則 / 衍生計算                → domain/(純函式、可測)

// handler 骨架:game/handlers/room/GameHandler.ts
export class GameHandler implements IRoomHandler {
  static readonly instance = new GameHandler();
  constructor(private _adapter = SdkAdapter.instance) {}   // DI 縫,測試注入假件
  private _table: Table | null = null;                      // 留存 model 參照給 teardown 用

  setup(tableCode: string) {
    if (this._isSetup) this.teardown();                     // 先自拆再重掛(換桌安全)
    this._table = this._adapter.getTable(tableCode);
    this._table.on(Table.Event.GAME_STATE_CHANGED, this._onGameStateChanged);
    this._syncInitialState();                               // 訂完立刻 pull 現值
  }
  teardown() { this._table?.off(Table.Event.GAME_STATE_CHANGED, this._onGameStateChanged); ... }
  private _onGameStateChanged = () => useGameStore.getState().setGameState(this._table!.gameState);
}
// roomHandlers.ts 名冊:[GameHandler.instance, BetHandler.instance, ChatHandler.instance]
// 新 handler:implements IRoomHandler / IGlobalHandler 後加入名冊即可;名冊以接口型別收陣列,漏實作 = 編譯錯`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>三個假理由都不足以升級 handler</b>:SDK 會推事件、資料放在 store、prefetch 能改善首開。單一面板自用、關掉可以重 pull 的資料就是 hook。</li>
        <li><b>SdkAdapter 只傳遞</b>:init / emit / on / off / thin getter;跨 model 組裝放 <code>queries/&lt;域&gt;Queries.ts</code>,禁止再往 adapter 加扁平 getter。</li>
      </ul>

      <h2>房間畫面:五層 z-stack + 兩張 canvas</h2>
      <Code>{`// views/room/layers/roomLayers.ts——z 序唯一真相
ROOM_LAYER = { Stage: 0, ChatFloat: 1, Play: 2, UI: 3, Overlay: 4, Tutorial: 5 }

// views/RoomView.tsx——framework 的 managed SceneStack,宣告 9 個平面,compositor 自動併 island
<SceneStack mode="managed">
  <RenderPlane id="stage-video"    backend="dom"  z={0}>   <StageLayer/>        黑底 + 視訊 + 底圖
  <RenderPlane id="stage-fx"       backend="pixi" z={0.1} pixiIsland={loadingFxIsland}>  載入動效 spine
  <RenderPlane id="chat-float"     backend="dom"  z={1}>   聊天飄字(被注盤蓋住,不擋操作)
  <RenderPlane id="play"           backend="dom"  z={2}>   注盤三明治 + 功能列
  <RenderPlane id="ui"             backend="dom"  z={3}>   頂列 / 荷官 / 倒數 / 餘額 / 派彩壓黑
  <RenderPlane id="overlay-chat"   backend="dom"  z={4}>   聊天列
  <RenderPlane id="overlay-fx"     backend="pixi" z={4.1} pixiIsland={fxIsland}>  <PayoutFx/>  派彩 + 送禮共用
  <RenderPlane id="overlay-panels" backend="dom"  z={4.2}> 面板 / bottom-sheet / modal
  <RenderPlane id="tutorial"       backend="dom"  z={5}>   教學遮罩(必須最上,吃掉所有指標事件)
</SceneStack>
// 相鄰 dom 平面併成同一個 DOM island,兩個 pixi 平面各自成島 → 全房恰好 2 張 canvas
// RoomView 自己只做:視訊 join / leave、關進房遮罩、預載房內資源;handler 與 store 不在這裡掛`}</Code>

      <h2>PixiJS + Spine:只經 pixi-game-framework</h2>
      <p className="text-muted max-w-[62ch]">用到的 API、生命週期、命令式派彩的完整範例與踩過的坑,獨立成 <a href="#/pixi">Pixi / Spine</a> 一頁;這裡只留骨架。</p>
      <Code>{`// 宣告式:CanvasScope 指定畫進哪張 canvas,RenderLayer 給一個 design 座標系並管 DOM 對位、自適應、資源 refcount
<CanvasScope target="fx">
  <div className="pointer-events-none absolute inset-x-0 top-[41.67%] aspect-[864/800] -translate-y-1/2">
    <PayoutEffect key={runId} number={result.number} color={result.color} amount={payout} onExit={handleExit} />
  </div>
</CanvasScope>

// 命令式(PayoutEffect 內):design 空間 864×800 = 2× 設計稿 px;spine 以 scale=1 放原點,骨頭座標 + 原點 = design 座標
await layer.load(urls);                    // 一律經 layer.load,禁裸 Assets.load(lint 擋)——繞過卸載閘門會偶發破圖
const spine = Spine.from({ skeleton, atlas });
spine.autoUpdate = false;                  // 本 canvas 用 app 自有 ticker,Ticker.shared 不可靠 → 自己 rAF update(dt)
layer.container.addChild(spine);
// 卸載複合資源(skel + atlas)一律 unloadSpineAssets(),自己 Assets.unload 會讓 spine 間歇黑掉且不報錯

// runtime 啟動點唯一:views/room/runtime/pixiRuntime.ts(Spine pipe 註冊 + 資源 idle-TTL 60 秒)`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼要框架而不是裸 pixi</b>:Application 生命週期、單一載入入口、canvas 當 layer、DOM ↔ stage 座標、單一 pixi.js 實例——這些契約裸寫必踩;雙實例由 vite 的 <code>dedupe</code> 唯一守住。</li>
        <li><b>Spine 版本鎖</b>:runtime 4.3 ↔ Editor 4.3,升降都要重匯出;Pixi 最低 8.16 是 spine-pixi-v8 的要求。</li>
      </ul>

      <h2>注盤(roulette):全 DOM/SVG,五層三明治</h2>
      <Code>{`// views/room/betarea/oval/OvalBetArea.tsx——矩形盤 rect/ 與橢圓盤 oval/ 是姊妹,共用 store / actions / betType
<AspectBox ratio={OVAL_DESIGN.aspectRatio} zoom={betZoom}
  rest={{ widthFill: 1, videoCover: 0.06 }} zoomed={{ widthFill: 1.25, videoCover: 0.8 }}>
  <OvalBaseLayer />        背景 svg(object-contain letterbox 置中,點擊穿透)
  <OvalHighlightLayer />   中獎高亮:inline SVG 描多邊形邊 + CSS 呼吸燈(只脈動 opacity)
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

// Figma 稿是 2×:每個 px ÷ 2 再進 CSS(letter-spacing、border、shadow 也要)`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>為什麼禁 matchMedia / 斷點</b>:形態判定散在 CSS 與 JS 兩邊,集中在引擎才守得住一致;<code>formFactor.test</code> 釘住所有表述。</li>
        <li><b>Tailwind v4 差異</b>:沒有 <code>tailwind.config.js</code>,主題在 <code>@theme</code> 定 CSS 變數;沒裝 clsx,動態 class 用 template literal。</li>
      </ul>

      <h2>i18n:react-intl + 遠端語言表</h2>
      <Code>{`t({ id: 'room.BottomInfo.noDealer', defaultMessage: 'no dealer' })      // id、defaultMessage 都必須字面值(lint)
useI18nStore.getState().messages[payload.langCode] ?? fallback           // runtime 動態 key 不可用 t(),就地查表

// 供應鏈:LanguageManager 下載 CSV → useI18nStore.apply(lang, messages) → <I18nProvider> 訂閱 store → IntlProvider
//   下載前 / 失敗 / dev:messages 空 → 每個呼叫點的 defaultMessage(英文)保底
// 「文案應該是英文」= 改呼叫點的 defaultMessage,不是改語言表(表是渠道擁有的)`}</Code>

      <h2>視訊(RTC)、UIManager、SceneManager、設定</h2>
      <Code>{`// 視訊分層
game-client-framework/video   VideoManager:PlayerFactory(TRTC / Agora / ARTC)、token、failover、品質監控、大廳預覽池
integrations/video/VideoAdapter   AppConfig → ManagerConfig;ManagerEvent → useVideoStore + Toast;join / leave / setQuality / setMuted
game/actions/video.ts            joinVideo(tableCode);syncVideoMuted() 是靜音的單一求值點(教學遮罩 or 玩家偏好)
views/room/VideoLayer.tsx        只給 div(見 React 入門 §3)

// 非 React 層要碰 UI
UIManager.showToast(t({...}), 'info');                              // 單顆制
UIManager.showModal({ message, onConfirm, tag: 'kick', isRepeat: false });   // 佇列制,tag 去重
UIManager.setEntering(true);                                         // 進房全屏菊花
SceneManager.goto(ScenePath.LOBBY);                                  // handler 導航

// 設定:integrations/config/fields.ts 一列寫完一個欄位,AppConfig 型別由本表推導
isXxxEnabled: field({ default: false, url: ['isXxxEnabled'], fromUrl: urlBoolean }),
const { studioId } = useAppConfig();                                 // views 只准經 hook;非 React 用 ConfigManager.instance
usePreferencesStore.getState().setSoundsEnabled(false);              // 偏好:唯一持久化 owner`}</Code>
      <p className="max-w-[70ch]"><code>UIManager</code>、<code>ConfigManager</code>、<code>SoundManager</code> 是從 Cocos 沿用、經複查判定「補上 React 覆蓋不到的位子」而保留的單例;<code>SceneManager</code> 與 <code>LanguageManager</code> 列為「不要再長大」,不要新增呼叫點。</p>

      <h2>載入與分包:import 圖決定一切</h2>
      <Code>{`載入集合   首屏(Loading / Login / Lobby 共用)  →  房間 chunk(RoomView + pixi + spine + framework,一包)  →  面板
規則       首屏程式碼只能用 import() 碰到 pixi;check-dist-preload 掃產物,首屏 chunk 含 pixi 就 build 紅

// 面板總表 views/popup/panels.ts——唯一匯出口,每個面板一行宣告 sync 或 lazy
export { TrendPanel } from './panels.sync';          // 預設同步(lazy 化冷開約 300ms,體感不可接受)
export const HugePanel = lazyPanel('HugePanel');     // 只有進房很久才開、又重的才切 lazy;panels.test 抓兩邊不一致

// 可插拔 UI(campaigns/ skins/;colorgame 多 subgames/):一列一單位,呈現只經 import(),關著的 chunk 永遠不被請求
{ id: 'autumn', isOn: (s) => s.config.isLobbyAutumnEnable && s.live.autumnOpen,
  surfaces: { 'room.topBanner': () => import('./autumn/banner') } }
const banners = useCampaignSurfaces('room.topBanner');   // 疊加語意;換皮用 useSkinFor(slot) 取代語意
// 六道守門(testing/surfaceRegistryGates):載入器必須字面值、id = 目錄名、總表只准 import ./slots、頂層無副作用…

// 預抓永遠閒時 + 網路允許,不掛載即抓(弱網會擠掉該畫面自己的資源)
useEffect(() => scheduleWhenIdle(() => {
  if (isConstrainedNetwork()) return;
  void import('./RoomView').catch(() => undefined);
}), []);`}</Code>

      <h2>新手教學、Vite、測試</h2>
      <Code>{`教學三層:tutorial/core/(可攜機制)、tutorial/ui/(可攜演出)、tutorial/<game>/(劇本 + 閘門)
  frozen = 資料閘門(SDK 訊息不得寫 store);active = 顯示層;退出「先解凍、後撤遮罩(延後一格)」
  前兩層 eslint 禁 import store / handlers / integrations——這條規則就是「日後抽得出去」的唯一保證

Vite 值得知道的幾行
  base: './'                                   同一份 build 放根目錄或任意子路徑
  resolve.alias(只在 serve)                     兩個 framework 指到 ../<repo>/src → 改 framework 直接 HMR
  resolve.dedupe: ['pixi.js', spine, 'react', 'react-dom']   少任一項就雙實例
  define VITE_APP_VERSION                        package.json#version + git sha 8 碼

驗證順序
  npm run typecheck                    秒級,必跑;CI 跑不了 tsc
  npx vitest run src/xxx.test.ts       先單檔;元件 / hook 測試檔頂端加 // @vitest-environment jsdom
  npm run lint                         0 warning;JSX 裸字串、跨環 import、裸 svg、console 都在這被擋
  npm run build                        含 check-dist-paths + check-dist-preload
  UI 變更:dev-server 量 computed style / bounding box,改前重現 → 改後證明;房內驗四個設計比例 + 兩個實機極端

結構性測試(釘住規則,不是測功能)
  rwd/engineBypass.test   全 src 沒有 matchMedia / Tailwind 斷點      rwd/formFactor.test   形態判定 CSS / JS 一致
  popup/panels.test       同一面板不會同時在 sync 與 lazy 名單          surfaceRegistryGates  可插拔總表六道守門
  moduleGraphScan         目錄頂層無不可丟棄的副作用                     handlers/*.test       注入假 adapter,驗 setup / teardown 成對`}</Code>

      <h2>環境建置與踩過的坑(兩個 repo 通用)</h2>
      <Code>{`nubi/
├─ nexus-roulette-client/ 或 nexus-colorgame-client/   # 本專案
├─ roulette-client/ 或 cg-client/                      # Cocos 原生(只讀,行為真相源)
├─ shared-code/              # master;dist 有進 git,不用 build
├─ api-helper/               # SDK 的內部依賴(colorgame 的 setup 會 build)
├─ game-client-sdk/          # 必須在 nexus_master!
├─ game-client-framework/    # master
└─ pixi-game-framework/      # master

npm run setup      # 第一次;逐一 build 鄰居、裝依賴、連 skills / MCP
npm run dev        # 之後每天`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>SDK 分支不對就整個 setup 失敗</b>:<code>game-client-sdk</code> 在別的分支時入口 <code>dist/main.mjs</code> 不存在。先 <code>git -C ../game-client-sdk checkout nexus_master</code> 再重跑。</li>
        <li><b>typecheck 突然在你沒動的 adapter 檔報錯</b>:八成是上游 dist 過期或分支不對,先 rebuild 上游再懷疑自己。</li>
        <li><b>找不到 <code>@toppath/pixi-game-framework/surfaces</code></b>:鄰居 repo 落後遠端(setup 不會幫你 pull)。四個鄰居各 <code>git pull --ff-only</code>,pixi / gcf 再 <code>npm install</code>,重跑 setup。</li>
        <li><b>dev 與 build 吃的東西不同</b>:dev 時兩個 framework alias 到 src(改了即時生效),SDK 吃 dist(靠 watcher 重建);production build 一律吃 dist,改完 framework 沒 build 就看不到。</li>
        <li><b>skills 沒出現</b>:postinstall 沒跑過。<code>npm run skill:update</code> 後重開 agent session。</li>
        <li><b>Figma MCP</b>:<code>.mcp.json</code> 三個 entry;<code>figma</code>(OAuth)與 <code>figma-desktop</code> 要 Dev seat,沒 seat 用 <code>figma-framelink</code>,PAT 填 <code>.env.local</code> 的 <code>FIGMA_API_KEY</code>。</li>
      </ul>

      <h2>兩個專案差在哪</h2>
      <table className="w-full border-collapse text-sm bg-panel border border-line rounded-xl overflow-hidden mt-3 mb-6">
        <thead><tr>
          <th className="text-left px-3.5 py-2 text-[.7rem] font-semibold text-muted uppercase tracking-wider bg-panel2"></th>
          <th className="text-left px-3.5 py-2 text-[.7rem] font-semibold text-muted uppercase tracking-wider bg-panel2">nexus-roulette-client</th>
          <th className="text-left px-3.5 py-2 text-[.7rem] font-semibold text-muted uppercase tracking-wider bg-panel2">nexus-colorgame-client</th>
        </tr></thead>
        <tbody>
          {[
            ['狀態', '功能齊全上線中:大廳、兩盤注盤、派彩 Spine、聊天送禮、面板、教學', '骨架期(Phase 0):工具鏈、platform / integrations、登入旅程、四張 lazy 總表是真的;11 支玩法畫面都渲染 RoomPlaceholder,大廳是文字殼'],
            ['來源', '從零建、Cocos roulette-client 為行為真相', '模板複製(不是 fork)自 nexus-baccarat-client,再疊 roulette 的首屏分包三件;漂移用 npm run base:diff 量。行為真相 ../cg-client(不含 pulaputi / native / PWA / Huawei IAP)'],
            ['RoomView', '房間本體:五層 z-stack', '玩法路由器:桌 subType + 新 UI 旗標 → domain/roomVariant.resolveRoomVariant(11 種)→ hooks/useRoomVariant(綁 OPEN_ROUND 重算)→ views/room/variants.ts 總表 → lazy <VariantView>;每玩法一個 chunk'],
            ['domain', 'rouletteWheel / rouletteBetTypes / tableLimitRange', 'colorGame(六色 801–806)/ roomType(15 房型)/ roomVariant(11 版面)/ gameType(=31)/ currency'],
            ['可插拔總表', 'campaigns/、skins/ 兩張', '多一張 views/subgames/(六格 slot,registry 空);機制同一個工廠'],
            ['幾何常數', '已錨定 Figma Roulette_2026', '房間幾何、RWD 基準值、roomRatioSpec 仍是輪盤 / 百家樂的值,每處標 TODO(colorgame),等彩骰 Figma 定案'],
            ['路線', '維護 + Lark「輪盤 2.0」需求表', 'Phase 1 大廳 → 2 房間 normal 真實化 → 3 子玩法 + Match → 4 活動 + 換皮 Christmas → 5 其餘玩法由各 owner 平行落地'],
          ].map((r) => (
            <tr key={r[0]}>
              <td className="px-3.5 py-2 border-t border-line align-top font-medium whitespace-nowrap">{r[0]}</td>
              <td className="px-3.5 py-2 border-t border-line align-top">{r[1]}</td>
              <td className="px-3.5 py-2 border-t border-line align-top">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>colorgame 食譜:加一種玩法版面</h3>
      <Code>{`1. game/domain/roomVariant.ts   RoomVariant 加一個值、resolveRoomVariant 加 case
2. views/room/<玩法>/XRoomView.tsx   default export,props 是 IRoomVariantViewProps
3. views/room/variants.ts       加一列  x: () => import('./x/XRoomView')   ← 必須字面值
4. views/RoomView.tsx           VARIANT_COMPONENTS 加一列 lazy(...)  ← 少一列編譯就紅
   variants.test 四道守門:載入器字面值 / 目錄=總表 / 檔案存在 / 外部不得 import 玩法目錄
只改房內元件不換版面的(jackpotV2 三細分、bonus V1/V2)→ game/domain/roomType.ts,不是 variant

子玩法 / 活動 / 換皮單位:views/<管理域>/<name>/ 一個目錄 + registry.ts 一列
  { id: 'match', isOn: (s) => s.config.isLiveEnabled && s.live.matchOpen,
    surfaces: { 'room.topBanner': () => import('./match/banner') } }
  開關要看的新來源 → activation.ts 加欄位;渠道旗標 → integrations/config/fields.ts 一列`}</Code>

      <DataTable sections={DIRS} headers={['項目', '用途', '說明']} placeholder="搜尋指令、目錄、鐵則…" />

      <h2>Agent skills(24 個專案 skill + 26 個 Pixi)</h2>
      <p className="text-muted max-w-[62ch]">
        住在 <code>team-skills/&lt;name&gt;/SKILL.md</code>,postinstall 連進 <code>.claude/skills</code>。agent 依 description 自動命中,也可以直接點名「用 <code>/rwd-layout</code>」。命中後仍要回查現碼與 cocos,skill 只給判準。
      </p>
      <DataTable sections={SKILLS} headers={['Skill', '什麼時候', '內容']} placeholder="搜尋 skill 或情境…" />

      <h2>要深讀時去哪</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><code>CLAUDE.md</code>(= AGENTS.md):工作契約與鐵則,最薄的一份、先讀。</li>
        <li><code>docs/開發規範與指引.md</code>:規範本體。§3 註解九原則、§8 分層與資料流、§9 store、§10 目錄樹、§11 Pixi、§14.1 分包、§15 驗證。</li>
        <li><code>docs/設計背景與決策.md</code>:所有「為什麼」——選型理由、保護順序、載入分段決定、可插拔 UI 設計、版本約束。</li>
        <li><code>docs/RWD架構.md</code>:四軸模型與決策樹、驗證尺寸、反例集。</li>
        <li><code>docs/遊戲規格與畫面流程.md</code>:畫面結構、遊戲狀態流程、下注互動、面板清單、store ↔ 畫面對應表。</li>
        <li><code>docs/tutorial-system.md</code>、<code>docs/資源規範與流程.md</code>;colorgame 的 <code>docs/plan/基底蒸餾與目錄規劃.md</code>(Tier、每個 cocos 模組走哪條路、Phase 0–5、決定 D-1…D-8)。</li>
        <li><code>MEMORY.md</code>:跨任務通則(不看就會再犯的坑)、待辦缺口、延後的技術債。</li>
        <li><code>team-skills/README.md</code>:skill 觸發情境索引;Pixi 的 26 個 skill 住在 <code>../pixi-game-framework/skills/</code>。</li>
      </ul>
    </div>
  )
}
