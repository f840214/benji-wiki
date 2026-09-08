import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

// nexus-colorgame-client 專案上手筆記。
// 資料來源:repo 的 CLAUDE.md / README.md / MEMORY.md / docs/開發規範與指引.md / team-skills/README.md(2026-09-08)。
// 版本號一律以 repo 的 package.json 為準,這裡不記。

const QUICK = [
['指令', [
  ['npm run setup', '首次建置', '檢查 Node 版本、驗五個鄰居 repo、build api-helper / SDK / 兩個 framework,最後裝主專案依賴並連結 skills 與 MCP。只在第一次或鄰居 repo 換分支後跑'],
  ['npm run dev', '日常開發', '同時起三個依賴 watcher(gcf / pixi / sdk 各自 build dist)加 Vite dev server,Ctrl+C 一起收掉'],
  ['npm run dev:app', '只起 Vite', '依賴 dist 已是最新時用,啟動比 dev 快'],
  ['npm run sync', '拉同事的 framework 改動', 'pull + rebuild + relink 兩個前端 framework 與本專案;不含 SDK / shared-code / api-helper(那些用 setup)'],
  ['npm run typecheck', '第一道驗證', 'tsc --noEmit。CI 跑不了 tsc(quality lane 會剝掉 @toppath),所以本地 + husky pre-commit 是唯一型別閘門'],
  ['npm run lint', '0 warning 閘門', 'eslint src dev --max-warnings 0,再檢查語言 key 與文件連結;commit 時 lint-staged 自動跑'],
  ['npm run test', '全量測試', 'vitest run;開發中改單檔用 npx vitest run <檔案>'],
  ['npm run build', '發佈前驗證', 'tsc → vite build → check-dist-paths → check-dist-preload(首屏 chunk 不得含 pixi)'],
  ['npm run base:diff -- ../nexus-baccarat-client', '量與鄰居的漂移', '對鄰居列 same / differs / missing;不帶參數是對自己驗 manifest 有沒有過期'],
  ['npm run base:manifest', '改了基底檔之後跑', '重寫 scripts/base-manifest.json 的雜湊,不跑會被 base:diff 標紅'],
  ['npm run skill:update', '重連 skills', '把 team-skills/ 與 pixi-game-framework/skills/ 連進 .claude / .cursor / .agents;postinstall 會自動跑'],
  ['npm run mcp:update', '重投影 MCP 設定', '從 .mcp.json 生成各 agent 工具的格式;改設定只改 .mcp.json'],
  ['npm run assets:compress', '圖檔進 repo 前', 'PNG 母檔 → WebP 的標準路徑;repo 內有 webp-only gate'],
  ['npm run deploy:dev', '觸發 Jenkins 部署 dev', 'Jenkins job 與 deploy key 尚未建立(見 deploy/README.md)'],
]],
['鐵則', [
  ['註解一律繁體中文', '§3', '註解 / JSDoc / TODO 都是自足的規格,第三者不用外部資料就看得懂;對外 export 必須有 JSDoc'],
  ['寫走 actions、讀走 hooks', '§8', 'SDK 只經 SdkAdapter 出入,adapter 零業務邏輯;server 驅動的共享鏡像才進 handler'],
  ['前端不算結果、不決定金錢', '安全', '下注結果 / 遊戲狀態以 server 為準;action 永不寫金錢欄位,只有 handler 從 SDK 事件回寫'],
  ['文案一律 t({ id, defaultMessage })', '§6', '遠端 CSV 語言表是唯一的表,本地不留語言檔;JSX 禁裸字串(lint 會擋);runtime 資料(金額、局號)不建 key'],
  ['樣式一律 Tailwind v4', '§5', '禁 inline style(動態值除外);螢幕相關值一律走 RWD 引擎,禁 matchMedia / 斷點'],
  ['Pixi 一律走 pixi-game-framework', '§11', '不自建 Application / ticker / renderer;雙實例症狀是 currentTarget.isInteractive is not a function'],
  ['interface 加 I 前綴', '§2', 'type 別名不加;與 pixi-game-framework 一致'],
  ['一個單位 = 一個目錄 + 總表一列', '多 owner', '玩法 / 子玩法 / 活動 / 換皮都是;錨點檔(總表、slots、fields、roomLayers、panels)append-only 一行一單位'],
  ['首屏由 import 圖決定', '§14.1', 'Loading / Login / Lobby 與它們共用的檔不得靜態 import 房間專用模組或 pixi;預抓走 scheduleWhenIdle + isConstrainedNetwork'],
  ['對照 cocos 再實作', 'porting', '行為真相源是 ../cg-client(不含 pulaputi / native);刻意不同要記錄理由,否則下一個人會改回去'],
  ['不自動 git add / commit / push', '流程', 'agent 只產生 commit 一行:conventional 前綴 + 繁中摘要'],
  ['版本只看 package.json', '§五', '不從文件引用版本號;動核心版本要跑完整測試(視訊 / 下注 / Pixi / Spine / 低階 Android)'],
]],
['目錄地圖', [
  ['src/platform/', '最內環', '零遊戲知識的機制:rwd / assetLoading / uiManager / state / i18n / sound / loading / sceneManager / log。整包自基底帶入'],
  ['src/integrations/', '外部系統', 'sdk/SdkAdapter(唯一出入口)、sdk/queries(讀取模組)、config/fields.ts(唯一欄位清單)、elog(傳輸核心 + gameBridge 接縫)、video、host'],
  ['src/game/domain/', '純函式', 'colorGame(六色 801–806)、betTypes、roomType(15 房型)、roomVariant(11 版面)、gameType(=31)、currency;不得碰 SDK 實例'],
  ['src/game/store/', 'Zustand', 'useGameStore(局狀態機)、useBetStore、useWalletStore、useUiStore;一檔一 store,每個 set 帶 action 名'],
  ['src/game/actions/', '玩家寫入', 'auth / bet / betAnalytics / deposit / navigation / video;emit + 樂觀旗標 + elog + toast'],
  ['src/game/handlers/global/', 'App 啟動掛', 'Scene / Message / User / Loading / PageVisibility / LogMgr;名冊 globalHandlers.ts'],
  ['src/game/handlers/room/', '進房掛、離房拆', 'Game / Bet;名冊 roomHandlers.ts;由 SceneHandler 的 POSITION_CHANGED 驅動,不綁 React'],
  ['src/game/hooks/', '畫面讀', 'useRoomVariant / useAppConfig / useCurrencySymbol;訂 SDK 事件寫 local state,回純資料'],
  ['src/views/RoomView.tsx', '玩法路由器', '判玩法、畫對應 lazy 畫面,沒有任何版面'],
  ['src/views/room/variants.ts', '玩法總表', 'Record<RoomVariant, () => import(...)>,11 列 8 目錄;守門 variants.test.ts'],
  ['src/views/room/<玩法>/', '★ 單位目錄', 'normal / classic / speed / superWheel / ultimate / bonus / superDouble / doubleChallenge;目前都渲染 RoomPlaceholder'],
  ['src/views/room/layers/roomLayers.ts', 'z 序真相', 'Stage 0 / ChatFloat 1 / Play 2 / UI 3 / Overlay 4 / Tutorial 5'],
  ['src/views/room/runtime/', '房間幾何', 'loadRoomView(進房唯一載入點)、roomGeometry、roomRatioSpec(TODO 佔位值,等 Figma)'],
  ['src/views/subgames/', '第三張總表', 'registry(空)/ slots(六格)/ activation / hooks / registry.test;機制在 pixi-game-framework/surfaces'],
  ['src/views/campaigns/ 、skins/', '活動 / 換皮', '同一個工廠、同樣形狀;campaigns 疊加、skins 取代'],
  ['src/views/popup/panels.ts', '面板總表', '唯一匯出口;sync 與 lazy 名單各一檔,目前皆空'],
  ['src/testing/', '只在測試用', 'surfaceRegistryGates(六道守門)、moduleGraphScan、@toppath 替身'],
  ['docs/plan/基底蒸餾與目錄規劃.md', '契約', 'Tier、目錄樹、每個 cocos 模組走哪條路、Phase 0–5、決定 D-1…D-8'],
  ['docs/開發規範與指引.md', '規範本體', '§0 鐵則、§8 分層、§9 store、§10 目錄樹、§14.1 分包、§15 驗證'],
  ['team-skills/README.md', 'skill 索引', '24 個專案 skill 的觸發情境表'],
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
  ['asset-import-policy', '加圖檔', 'SVG ?react / ?url 判準 + webp-only gate'],
]],
['流程與紀律', [
  ['cocos-parity-porting', '對照 cocos / 改了沒生效', '先找原生實作再寫;跨 repo dist 過期陷阱;SDK 分支要在 nexus_master'],
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
  ['game-devtools-panel', '面板沒資料', '🎮 Game DevTools 三層架構 + __GAME_DEVTOOLS__ 協定'],
  ['pixijs + pixijs-*', 'Pixi v8 API 正確用法', '26 個,住在 ../pixi-game-framework/skills/,link script 自動連入;模型訓練資料多是 v7'],
]],
]

export default function ColorGamePage() {
  return (
    <div>
      <h1>nexus-colorgame-client</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        H5 WebRTC 彩骰(Color Game)客戶端:React 19 + PixiJS 8 + Spine + Zustand,要取代 Cocos 的
        <code>cg-client</code>。這頁是「怎麼跑、怎麼改、改在哪」的上手筆記;規範細節回 repo 的
        <code>docs/</code> 看,這裡只留判準與路徑。
      </p>

      <DataTable sections={QUICK} headers={['項目', '用途', '說明']} placeholder="搜尋指令、鐵則、目錄…" />

      <h2>一分鐘認識</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>模板複製,不是 fork</b>:從 <code>nexus-baccarat-client</code> 複製、疊上 <code>nexus-roulette-client</code> 的首屏分包三件。三個 repo 沒有 git 血緣,漂移用 <code>npm run base:diff</code> 量。</li>
        <li><b>行為真相源是 <code>../cg-client</code></b>,但不含 <code>bundles/pulaputi</code>、<code>bundles/native</code>、PWA、Huawei IAP、原生視訊播放器,那些要分家。</li>
        <li><b>現在是骨架期(Phase 0 完成)</b>:工具鏈、platform / integrations 兩層、登入旅程、四張 lazy 總表與守門是真的;11 支玩法畫面全渲染 <code>RoomPlaceholder</code>,LobbyView 是文字殼,沒有美術、沒有面板、沒有 Pixi runtime。</li>
        <li><b>繼承的佔位數字</b>:房間幾何、RWD 基準值、<code>roomRatioSpec</code> 還是輪盤 / 百家樂的值,每處標了 <code>TODO(colorgame)</code>,等彩骰 Figma 定案再錨定。</li>
        <li><b>路線</b>:Phase 1 大廳 → 2 房間 normal 真實化 → 3 子玩法機制 + Match → 4 活動 EventCenter + 換皮 Christmas → 5 其餘玩法由各 owner 平行落地。</li>
      </ul>

      <h2>環境建置</h2>
      <p className="max-w-[70ch]">
        五個鄰居 repo 要跟本專案並排在同一個父目錄,<code>@toppath/*</code> 全是 <code>file:../</code> 連結:
      </p>
      <Code>{`nubi/
├─ nexus-colorgame-client/   # 本專案
├─ cg-client/                # Cocos 原生(只讀,對照用)
├─ shared-code/              # master;dist 有進 git,不用 build
├─ api-helper/               # SDK 的內部依賴
├─ game-client-sdk/          # 必須在 nexus_master!
├─ game-client-framework/    # master
└─ pixi-game-framework/      # master

cd nexus-colorgame-client
npm run setup      # 第一次;會逐一 build 鄰居、裝依賴、連 skills / MCP
npm run dev        # 之後每天`}</Code>
      <h3>踩過的坑</h3>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>SDK 分支不對就整個 setup 失敗</b>:<code>game-client-sdk</code> 在 <code>native_master_redo</code> 時 deploy 走 webpack 產 <code>main.js</code>,但 package.json 的入口是 <code>dist/main.mjs</code>(vite build 才會產)。先 <code>git -C ../game-client-sdk checkout nexus_master</code> 再重跑。</li>
        <li><b>typecheck 突然在你沒動的 adapter 檔報錯</b>:八成是上游 dist 過期或分支不對,先 rebuild 上游再懷疑自己。</li>
        <li><b>typecheck 說找不到 <code>@toppath/pixi-game-framework/surfaces</code></b>:鄰居 repo 落後遠端(setup 不會幫你 pull)。四個鄰居各跑 <code>git pull --ff-only</code>,pixi / gcf 再 <code>npm install</code>,然後重跑 setup。一次檢查的指令:
          <code>for r in game-client-sdk pixi-game-framework game-client-framework shared-code; do git -C ../$r status -sb | head -1; done</code></li>
        <li><b><code>.env.local</code></b>:setup 找不到時會自動從 <code>.env.example</code> 複製,裡面的 <code>FIGMA_API_KEY</code> 是假值,要用 Figma 再換成自己的 token。</li>
        <li><b>dev 與 build 吃的東西不同</b>:dev 時兩個 framework 直接 alias 到 src(改了即時生效),SDK 吃 dist(靠 watcher 重建);production build 一律吃 dist,改完 framework 沒 build 就看不到。</li>
        <li><b>skills 沒出現</b>:代表 postinstall 沒跑過(node_modules 不在)。<code>npm run skill:update</code> 後重開 agent session。</li>
        <li><b>Figma MCP</b>:<code>.mcp.json</code> 三個 entry;<code>figma</code>(OAuth)與 <code>figma-desktop</code> 都需要 Dev seat,沒 seat 用 <code>figma-framelink</code>:把 Personal Access Token 填進 <code>.env.local</code> 的 <code>FIGMA_API_KEY</code>。</li>
      </ul>

      <h2>啟動流程與路由</h2>
      <Code>{`main.tsx bootstrap(順序不可亂)
  ConfigManager.load()        → coreProject.json / project.json
  installElogGameBridge()     → 遊戲語意注入 elog 接縫
  initElog(config)
  SdkAdapter.instance.init()  → GameClient
  emit(INIT_CONFIG, config)   → 設定進 SDK Config model
  setupGlobalHandlers()       → 訂 LOGIN_SUCCESS / SYNC_MONEY …
  createRoot().render(<App/>)

路由(MemoryRouter,網址列不露頁面)
  /  LoadingView → /login LoginView → /lobby LobbyView → /room/:tableCode RoomView

RoomView 不是一種畫面,是玩法路由器:
  桌 subType + SuperWheel 新 UI 旗標
    → game/domain/roomVariant.resolveRoomVariant()   純函式,11 種 RoomVariant
    → game/hooks/useRoomVariant()                     綁 OPEN_ROUND 重算(局中不換版面)
    → views/room/variants.ts                          RoomVariant → () => import('./<玩法>/X')
    → <VariantView tableCode variant />               每玩法一個 chunk`}</Code>

      <h2>分層與資料流(改東西前先定位)</h2>
      <p className="max-w-[70ch]">
        <code>views → game → integrations → platform</code>,import 只准向內,eslint 強制無豁免。
        SDK 只經 <code>SdkAdapter</code> 出入,而且 adapter 只傳遞不決策。資料流就四條:
      </p>
      <Code>{`① 玩家寫入            action ──emit──▶ SDK ──▶ server
② 共享權威鏡像        SDK event ──▶ handler ──▶ Zustand store ──▶ hook ──▶ view
③ 單一畫面自用        SDK event / model ──▶ feature hook ──▶ local state ──▶ view
④ await 一個回應      view ──▶ queries ──▶ SDK ──▶ Promise ──▶ local state

三問定位:
  沒有任何畫面開著時,這件事還要發生嗎?  → handler
  是玩家的一個動作嗎?                     → action
  只是某個畫面要顯示嗎?                   → hook
共用的規則 / 衍生計算 → domain/(純函式、可測)`}</Code>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>三個假理由都不足以升級 handler</b>:SDK 會推事件、資料放在 store、prefetch 能改善首開。單一面板自用、關掉可以重 pull 的資料就是 hook。</li>
        <li><b>什麼才進 store</b>:SDK 沒這份資料(面板開關)、SDK 只用一次性事件給(餘額、聊天)、樂觀更新要能回滾(pendingBets)。SDK 有 getter 隨時讀得回來的不要放,例外是消費者多且不一致有代價(gameState)。</li>
        <li><b>一個 store 欄位只能當它自己資料的變更訊號</b>,拿 A 欄位觸發 B 重讀必有競態。SDK 就地 mutate 的物件要訂它自己的事件轉成版號。</li>
      </ul>

      <h2>食譜:常見改動怎麼做</h2>

      <h3>加一種玩法版面</h3>
      <Code>{`1. game/domain/roomVariant.ts   RoomVariant 加一個值、resolveRoomVariant 加 case
2. views/room/<玩法>/XRoomView.tsx   default export,props 是 IRoomVariantViewProps
3. views/room/variants.ts       加一列  x: () => import('./x/XRoomView')   ← 必須字面值
4. views/RoomView.tsx           VARIANT_COMPONENTS 加一列 lazy(...)  ← 少一列編譯就紅
   variants.test 四道守門:載入器字面值 / 目錄=總表 / 檔案存在 / 外部不得 import 玩法目錄
只改房內元件不換版面的(jackpotV2 三細分、bonus V1/V2)→ game/domain/roomType.ts,不是 variant`}</Code>

      <h3>加一個房間 handler(server 驅動的共享鏡像)</h3>
      <Code>{`// game/handlers/room/XHandler.ts
export class XHandler implements IRoomHandler {
  static readonly instance = new XHandler();
  constructor(private adapter = SdkAdapter.instance) {}   // DI 縫,測試注入假件
  setup(tableCode: string) {
    this.teardown();                 // 先自拆再重掛(換桌安全)
    this._table = this.adapter.getTable(tableCode);   // 留存 model 參照
    this._table.on(Table.Event.XXX, this._onXxx);
    this._sync();                    // 訂完立刻 pull 現值(事件多半已發過)
  }
  teardown() { this._table?.off(Table.Event.XXX, this._onXxx); this._table = null; }
  private _onXxx = () => useXStore.getState().setAll(fromSdk(this._table));  // 整批覆蓋,不逐筆 patch
}
// roomHandlers.ts 名冊陣列加一個,順序=掛載順序;全局類放 global/ + globalHandlers.ts`}</Code>

      <h3>加一個 action / hook / query</h3>
      <Code>{`// action:動詞命名,emit 為主軸;可寫 UI 旗標、送 elog、toast;不可寫金錢與結果
export function confirmBet() {
  SdkAdapter.instance.emit(GameEvent.CONFIRM_BET);
  useBetStore.getState().setConfirming(true);      // 樂觀旗標,handler 回寫後被 SDK 真相覆蓋
}

// hook:訂 SDK 事件寫 local state,mount/unmount 成對 on/off,回純資料
export function useTableLimits(tableCode: string) {
  const [limits, setLimits] = useState(() => readLimits(tableCode));
  useEffect(() => {
    const t = getTable(tableCode);
    const cb = () => setLimits(readLimits(tableCode));
    t.on(Table.Event.LIMIT_CHANGED, cb); cb();      // 訂完立刻同步一次
    return () => t.off(Table.Event.LIMIT_CHANGED, cb);
  }, [tableCode]);
  return limits;
}

// 要 await 回應的一次性讀取 → integrations/sdk/queries/<域>Queries.ts,不進 hook 也不經 handler
// store:每個 set 帶 action 名   set({ x }, false, 'setX');  元件用 selector 取值`}</Code>

      <h3>加一個子玩法 / 活動 / 換皮單位</h3>
      <Code>{`views/subgames/<name>/       ★ 一個目錄:各 slot 的呈現 tsx
views/subgames/registry.ts   加一列(這檔只准 import ./slots):
  { id: 'match',
    isOn: (s) => s.config.isLiveEnabled && s.live.matchOpen,
    surfaces: { 'room.topBanner': () => import('./match/banner'),
                'lobby.card.badge': () => import('./match/cardBadge') } }
views/subgames/activation.ts 開關要看的新來源 → SubgameSources 加欄位、useSubgameSources 多讀一個 store
integrations/config/fields.ts  第一層渠道旗標一列(寫法照 isLiveEnabled)
畫面端:const banners = useSubgameSurfaces('room.topBanner');
       <Suspense fallback={null}>{banners.map(({id, Surface}) => <Surface key={id} tableCode={tableCode}/>)}</Suspense>
前一個畫面閒時 useSubgamesPrefetch()
campaigns 同形狀(疊加);skins 用 useSkinFor(取代核心元件)
六道守門會擋:非字面值 import、id≠目錄名、總表 import 別的東西、目錄頂層副作用、外部 import 單位目錄`}</Code>

      <h3>加一個面板</h3>
      <Code>{`views/popup/panels.sync.ts   export { X } from './X';         // 預設同步
views/popup/panels.ts        export { X } from './panels.sync';  // 唯一匯出口,消費端只從這拿
要切 lazy(只給進房很久才開、又重的):sync 那行搬到 panels.lazy.ts,
panels.ts 改 export const X = lazyPanel('X');panels.test 會抓兩邊不一致`}</Code>

      <h3>加設定旗標、文案、隨畫面變的尺寸</h3>
      <Code>{`// 旗標:integrations/config/fields.ts 一列(唯一欄位清單),golden 夾具補預設值
isXxxEnabled: field({ default: false, url: ['isXxxEnabled'], fromUrl: urlBoolean }),
// 讀:const { isXxxEnabled } = useAppConfig();   非 React 用 ConfigManager.instance

// 文案:固定 UI 一律 t(),id 與 defaultMessage 都要字面值;新 key 用 domain.Component.element
t({ id: 'room.menu.settings', defaultMessage: 'Settings' })
// runtime 動態字串(SDK langCode)就地查 useI18nStore.getState().messages[code]

// 尺寸:先問「這個量隨什麼變」(docs/RWD架構.md 決策樹)
軸0 固定        直接 px
軸1 框寬        layoutWidth / uiScale / widthLerp
軸2 比例        roomRatioSpec 查表 或 resolveByRatio(四比例 16:9 / 20:9 / 21:9 / 4:3,稿 2×)
軸3 形態        formFactor() / Tailwind wide-frame: 前綴
禁 matchMedia、禁 Tailwind 斷點、禁手刻 viewport 判斷`}</Code>

      <h3>對照 cocos 移植</h3>
      <ol className="list-decimal pl-5 space-y-1 max-w-[70ch]">
        <li>先 grep <code>../cg-client/assets/bundles/colorgame/ColorGame*</code> 與 <code>GameCommon/</code> 找到原生實作,抽出真正的規則(過濾、排序鍵、事件順序、魔術數字)。</li>
        <li><b>對齊同一條使用者路徑</b>:cocos 常在不同入口用不同做法(URL 深連結才把桌號轉大寫,列表點擊不轉),抓錯路徑就是 bug。</li>
        <li>實作時在註解引用 cocos 檔案位置;刻意不同要寫下理由,不然會被「修」回去。</li>
        <li>模板複製過來的數值型註解(=1、五格、注型範例)逐條對 <code>shared-code</code> 核,字樣清掃抓不到。</li>
      </ol>

      <h2>驗證流程(每次功能完成)</h2>
      <Code>{`npm run typecheck                 # 秒級,必跑;CI 跑不了 tsc
npx vitest run src/xxx.test.ts    # 先單檔
npm run lint                      # 0 warnings
npm run build                     # 發佈前;含 check-dist-paths + check-dist-preload
UI 變更:dev-server 量 computed style / bounding box,320 / 375 / 460 三寬度;改前重現 → 改後證明
回報精簡:改了什麼、驗了什麼、剩餘風險
commit:type 前綴 + 繁中摘要,自己下 git 指令`}</Code>

      <h2>Agent skills(24 個專案 skill + 26 個 Pixi)</h2>
      <p className="text-muted max-w-[62ch]">
        住在 <code>team-skills/&lt;name&gt;/SKILL.md</code>,postinstall 連進 <code>.claude/skills</code>。agent 依 description 自動命中,也可以直接點名「用 <code>/rwd-layout</code>」。命中後仍要回查現碼與 cocos,skill 只給判準。
      </p>
      <DataTable sections={SKILLS} headers={['Skill', '什麼時候', '內容']} placeholder="搜尋 skill 或情境…" />

      <h2>目前狀態與缺口(2026-09-08)</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li>骨架落地時四綠:typecheck 0 錯、lint 0 warn、323 tests、首屏 5 檔 320K gz 不含 pixi;11 個玩法殼各自獨立 chunk。</li>
        <li>dev 頻道(<code>/h5/1e3109</code>)有沒有彩骰桌未實測;試玩登入是否落地大廳、初始列表 gameType 是否為 31 待驗。</li>
        <li>Figma 與 Lark 尚未建立(Color War 的稿只有 view 權限);Jenkins 三個 job 與 deploy key 未建。</li>
        <li><code>MessageHandler</code> 六色的 <code>betTypeLangCode</code> 鍵名是佔位,要對 SDK <code>ColorGameTable</code> 校訂。</li>
        <li>F-2 / F-3 / F-4 三件基底改善(守門解析絕對路徑、base-diff、elog 拆接縫)還沒 patch 回 roulette 與 baccarat。</li>
        <li>三套教學是否進 MVP 待 PM;<code>tutorial/colorgame/</code> 未建。</li>
      </ul>
    </div>
  )
}
