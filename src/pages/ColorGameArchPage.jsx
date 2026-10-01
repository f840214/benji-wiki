import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

// nexus-colorgame-client 架構筆記(只講這個專案;roulette 藍本的對照已拿掉)。
// 來源:CLAUDE.md、docs/開發規範與指引、docs/多玩法架構、docs/RWD架構、docs/plan/資料流與Store設計、docs/設計背景與決策。
// 版本只寫大版,精確版看 package.json。逐檔清單在 #/colorgame-dirs,製作歷程在 #/colorgame-log,Store/疑難雜症/Console 在 #/colorgame-ref。

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
  ['@fontsource/inter、barlow-condensed', '字體自託管', '只載用到的字重(400 / 500 / 600 / 700);沒 import 的字重會靜默假粗。大廳與 500x 的美術字用 Luckiest Guy(自託管 + ascent/descent-override 鎖度量,Windows 才不會偏低)'],
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
  ['@toppath/pixi-game-framework', 'React + Pixi 渲染層', 'PixiCanvas / SceneStack / RenderPlane / CanvasScope / RenderLayer / Layer / <Spine> 與資源生命週期;/geometry 有 containRect 這類幾何工具。可插拔 UI 的機制內聯在本專案 src/platform/surfaces/ame 的 src/platform/surfaces/ 暫存,等實作驗證後再定落點'],
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
  ['scripts/base-diff / base-manifest', '基底檔漂移量測', '對鄰居 repo 列 same / differs / missing;改了基底檔要重寫 manifest 雜湊'],
]],
]


const COMMANDS = [
['指令', [
  ['npm run setup', '首次建置', '驗 Node 與鄰居 repo、build shared-code / api-helper / SDK / 兩個 framework、裝依賴、連 skills 與 MCP;只在第一次或鄰居換分支後跑。setup 不會幫你 git pull,鄰居先 pull'],
  ['npm run dev', '日常開發', '三個依賴 watcher(gcf / pixi / sdk)+ Vite dev server 一起起;dev.html 是 dev 工具入口(?canvas=<tool id>)'],
  ['npm run dev:app', '只起 Vite', '上游 dist 已是最新時用,比 dev 快'],
  ['npm run sync', '拉同事 framework 改動', 'pull + rebuild + relink 兩個前端 framework;不含 SDK / shared-code(那些用 setup)'],
  ['npm run typecheck', '第一道驗證', 'tsc --noEmit,秒級;CI 跑不了所以本地必跑'],
  ['npm run lint', '0 warning', 'eslint src dev --max-warnings 0 + 語言 key 檢查 + 文件連結檢查 + 動畫名檢查'],
  ['npm run test / npx vitest run <檔或目錄>', '測試', '房間 npx vitest run src/views/room;活動 src/views/campaigns;設定 src/integrations/config'],
  ['npm run build', '發佈前', 'tsc → vite build → check-dist-paths → check-dist-preload(首屏 chunk 不得含 pixi / 房間流程包)'],
  ['npm run fx:gen / fx:export', 'spine → CSS 管線', 'gen 解析骨架到 assets-raw/fx-parsed;export 把評估器定案的群組產成 views/components/fx/generated/ 的產品'],
  ['npm run assets:compress / assets:check', '圖進 repo 前', 'PNG → WebP 標準路徑;webp-only gate'],
  ['node team-skills/game-client-sync/scripts/base-diff.mjs --write-manifest', '改了 base 檔之後', '重產 base-manifest(fields.ts、ConfigManager、platform/* 這些跟 roulette 同步的檔);不帶參數是驗 manifest 有沒有過期'],
  ['npm run commentsCheck', '註解用字檢查', 'grep 出「比照 Cocos / 原本 / 後來改成」這類不該進註解的字樣(report-only)'],
]],
]

const RINGS = [
['四個環(import 只准往內:views → game → integrations → platform;eslint 擋)', [
  ['src/platform/', '最內環:零遊戲知識、零 SDK', 'rwd 引擎(uiScale / --upx / 形態)、i18n 橋、uiManager(Toast / Modal / Loading)、sceneManager、sound、loading 進度、state、storage、dom、surfaces(可插拔 UI 機制)、assetLoading、redDot 狀態機'],
  ['src/integrations/', '外部系統:認識協定、不認識玩法', 'sdk/SdkAdapter(SDK 唯一出入口,只傳遞)+ sdk/queries(一次往返的查詢:bet / payout / tableRank / bonusRank / bonusActivity…)、config(fields.ts 唯一欄位清單 + ConfigManager,load 後凍結)、elog、video/VideoAdapter、host 宿主橋'],
  ['src/game/domain/', '純函式:遊戲知識與資料判讀', '彩骰規則的單一來源,零 SDK import、全部有測試:colorGame(六色)/ betTypes(八注型)/ subType / subTypeProfile(flow × skin)/ roundFlow / roundResult / odds / superWheel / superDouble / lushu / bonusActivity(LuckyTriple 檔期判定)/ bonusRank / history / jackpot* / payout / tableStatus / tableLimits / tableSort…。判準:輸出換一套視覺會變的就不是 domain'],
  ['src/game/store/', 'Zustand', 'useGameStore(局態:相位、局號、骰子、電子倍率 rateDetail)/ useBetStore(注單、已確認注、籌碼)/ useWalletStore / useUiStore(選單、注區覆寫、roomSheet)/ useUserStore…。只存 SDK 拿不回來或多畫面要一致的東西'],
  ['src/game/actions/', '玩家寫入', 'bet / auth / navigation / menu / replay / favorite / directGame / superDouble / winnerHistory…;emit + 樂觀旗標 + elog + toast,永不寫金錢'],
  ['src/game/handlers/', 'server 鏡射', 'global/(App 啟動掛、活到關頁:Loading / Message / Scene / User / PageVisibility / LogMgr)與 room/(POSITION_CHANGED 進房掛、離房拆:GameHandler 相位與結果鏡像、BetHandler)'],
  ['src/game/hooks/', '畫面讀', '訂 SDK / store、回一個畫面要的值:useLobbyTableList / useLobbyCardLive / useBetAmounts / useBonusRank / useAppConfig / useRoadSummary…'],
  ['src/views/', '畫面', 'LoadingView / LoginView / LobbyView / RoomView;lobby/ room/ popup/ components/ campaigns/ runtime/ system-ui/'],
  ['環外', 'tutorial / debug / testing / assets', 'tutorial/core 可攜引擎;debug/ DevTools 頁面端(__GAME_DEVTOOLS__,DEV/staging 才掛);testing/ @toppath 替身與守門掃描;assets/ bundled 資源(svg ?react / ?url、字型)'],
]],
['資料流三問', [
  ['要寫 → actions', '玩家做了什麼', 'emit 給 SDK、寫樂觀值 / UI 旗標、送 elog、出 toast;永不寫結果與金錢'],
  ['要讀 → hooks', '一個畫面要看什麼', '訂 SDK model 或 store,回值;資料本來拿得到就不另存'],
  ['server 推來、很多畫面要一致 → handler', '鏡射', 'GameHandler 把 round 鏡進 useGameStore;一次性事件(派彩結果)也在這;一個 store 欄位只能當自己資料的訊號,拿 A 當 B 的刷新訊號必競態'],
]],
]

const ROOM = [
['房間架構(docs/多玩法架構.md)', [
  ['subType → profile', '誰決定版面', 'domain/subTypeProfile:flow(superWheel / superDouble / bonus / ultimateJackpot)× skin;RoomView 依 profile lazy 載房間包,不認識的 subType 進 NotSupportedRoom'],
  ['RoomFrame', '一張外殼,六個洞', 'header / topBanner / board / stage / sheet / overlay,各流程填自己的洞;data-board(open / hidden / lowered / shrunk)、data-layout(standard / bonus)、data-sheet 是版面狀態,幾何在 runtime/roomGeometry(四比例量過)'],
  ['roomPlanes', '五個平面、兩張 canvas', 'base(DOM:帶與注區)→ baseFx(pixi:帶上的 spine,流程填 bandCenter / stage 或標 boardFx 才開)→ hud(DOM:頂列、底列、面板)→ hudFx(pixi:開局、派彩 spine)→ overlay → menu。spine 畫在哪張 canvas由它的 canvas id 決定,不用 z-index 跨平面'],
  ['要蓋在 spine 上的 DOM', '500x 的教訓', '注區在 base、spine 在 baseFx,DOM 一定被壓住;portal 到 hud 平面裡的「注區鏡像」(useBoardMirror:class 抄注區洞,縮小過渡同一條 CSS)。hud 的 DOM 島沒有 id,靠 Layer z-index 找'],
  ['runtime/loadRoom', '進房載入', '房間 chunk ∥ 皮 ∥ 阻塞資產平行抓;Spine runtime 由 views/runtime/pixiRuntime 單一啟動點註冊,PixiCanvas 掛前必 await setupPixiRuntime()'],
  ['rooms/<flow>/', '各玩法', 'superWheel(192x:橫幅、倍率揭示)/ superDouble(108x:Super Round 面板)/ ultimateJackpot(UJP:三池橫幅)/ bonus(500x:八格注區、電子倍率三支骨架、小精靈、得獎歷史面板)'],
  ['shared/', '所有房共用', 'WinRateText、BottomInfoBar、LushuStrip、ChipRow、BandButtons、RoundCountdown、PayoutPanel…;改這裡會動到每一桌,改之前先問'],
  ['視訊', 'VideoBand 五層', '底色 → 氛圍背景 → 視訊盒(432×768 的 9:16,順時針轉 90°)→ 暈影 → 淡出遮罩;寬框左右用 AmbientBackdrop 取樣、手機下方用 VideoFadeOverlay 逐欄取色;零額外 video 元素'],
]],
['大廳', [
  ['區塊 A / B / C / D', '殼 / 標題 / 桌卡 / 頁尾', 'A:backdrop / LobbyHeader / LobbyMessageBar;B:cg_lobby_title_top spine 投影到大廳 Pixi canvas(lobby-fx)+ 右側活動入口 slot;C:useLobbyTableList → LobbyTableCard(一份版面四種變體,一張活視訊預覽);D:直達遊戲面板'],
  ['縮放', 'transform: scale(uiScale)', '大廳是固定 432/576 畫布整層 scale,房間是 --upx 乘設計 px,載入頁是純 CSS 的 --loading-px;三者分母同一張表(platform/rwd)'],
  ['文字位置', '固定整數頂 + leading-normal/none', '不用 top:50% / translateY / items-center(換螢幕各自吸附會上下漂);連固定頂都漂時,把字畫進跟底圖同一盒的 SVG(桌號徽章、BANNER 鈕)'],
]],
]

const CAMPAIGNS = [
['營銷活動(views/campaigns/)', [
  ['總表 registry.ts', '一檔一列', '{ id, isOn(sources), surfaces: { \'<slot>\': () => import(\'./<name>/<檔>\') } };下架就刪一列加一個目錄,核心畫面不動;六道守門(registry.test)'],
  ['slot(slots.ts)', '畫面願意放活動 UI 的位置', '名字 + 畫面會給的 props;疊加語意(useCampaignSurfaces 回陣列,一個 slot 可以同時長出多塊);lobby.titleIcon 已接(LobbyGameTitle),room.* 待房內稿'],
  ['isOn vs 檔期', '兩層開關', 'isOn 只看旗標(渠道有沒有買這個模組,config 凍結);活動現在跑不跑是伺服器檔期,歸活動自己的 store(呈現掛上就拉、沒檔期 return null)。檔期不併進 isOn:它隨局變、還分桌'],
  ['四檔', '誰是活動、誰不是', 'Triple Bonus(LuckyTriple:殼走總表,派彩換版歸核心 domain/bonusActivity)/ Lucky Draw V4 / Color War V2(SDK 都還沒進)/ Free Bet 不是活動,是第二條下注通道'],
  ['dev 開法', 'URL 參數', '?isLobbyEventCenterLuckyTripleEnabled=1&isRoomEventCenterLuckyTripleEnabled=1;config 凍結所以要重載;只開旗標、沒檔期畫面還是空的'],
]],
]

const PIPELINES = [
['資源與 FX', [
  ['spine → CSS', 'fx:gen / 評估器 / fx:export', '能用 CSS 重現的 spine 做成完整 UI 元件(LobbyPlayButton、BetCellSurface、SelfBetPill…),art 與 motion 一起;做不到的才上 Pixi Spine'],
  ['Spine 版本', '4.3 與 3.8 並存', 'assets-raw/spine/ 是 4.3 重匯出,assets-raw/cocos-spine/ 是不會重匯的 3.8;兩個 runtime 各自 compat 層;4.3 把合併骨架拆成小檔(500x 三支就是)'],
  ['圖檔', 'webp-only', 'PNG 母檔放 assets-raw,assets:compress 鏡射成 public/assets/**.webp;svg 走 ?react(可換色)或 ?url'],
  ['Figma', '2× 稿,px ÷ 2', 'REST 用 .env.local 的 FIGMA_API_KEY,很容易 429;MCP get_screenshot 抓圖取樣是備案。fileKey 隨美術副本換,節點 id 跨副本不變'],
  ['字型', '自託管 + 度量覆寫', 'Luckiest Guy 的 hhea 與 OS/2 win 不一致,Windows 會偏低 0.16em;@font-face 加 ascent/descent/line-gap-override 鎖住,不在版面補位移'],
]],
['驗證流程', [
  ['順序', 'typecheck → vitest → lint → build', 'typecheck 是本地唯一型別閘門(CI 剝掉 @toppath);lint 0 warning;build 的 check-dist-preload 守首屏'],
  ['UI 改動', '量測不是看 code', 'dev 工具(dev.html?canvas=…)截圖 / inspect;overlay app 的 pane 疊 Figma 圖 curtain 對稿;數字給使用者看,驗收是使用者的'],
  ['共用檔', '先問', 'RoomFrame / roomGeometry / index.css / store / handler / shared/ 會動到每一桌;base-manifest 裡的檔改完要重產 manifest'],
  ['git', '不自動 add / commit / push', 'agent 產 commit 內容;使用者自己 add'],
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
  ['figma-to-react', '照稿切版 / 對稿', 'design-spec 紀律、CSS/JSON → Tailwind 對應、資產下載腳本、跨比例對齊、陰影 / 發光擬合;09-08 補上對稿三條教訓'],
  ['preview-measurement', 'UI 變更要交量測證據', '同源 iframe 探針、灌 store 造狀態、像素取樣;320 / 375 / 460 三寬度驗;09-08 補上對稿教訓'],
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
  ['bootstrap-game-client', '從既有 client 長出新遊戲骨架', '不寫死來源:Phase 0 先量再選(byte-level diff、哪個 sibling 帶哪個機制),再分階段檢查表、逐檔判定、登入旅程移植、遊戲側接縫、字樣清掃 + 數值註解稽核、驗收三道、坑清單'],
  ['game-client-sync', '基底同步 / 跟鄰居對齊 / 產升級包', '原 base-sync。Tier 模型(什麼算基底)、base-manifest 雜湊、逐檔判定(機制→框架 / 基底修正→兩邊都補 / 遊戲參數→預期分歧)、compare-and-sync 與 review-to-upgrade-kit 兩種模式'],
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


export default function ColorGameArchPage() {
  return (
    <div>
      <h1>nexus-colorgame-client 架構</h1>
      <p className="text-muted mb-5 max-w-[70ch]">
        H5 WebRTC Color Game(彩骰)客戶端:React 19 + PixiJS 8 + Spine + Zustand,取代 Cocos 的 <code>../cg-client</code>。
        範圍:四支玩法(192x superWheel / 108x superDouble / 500x bonus / UJP ultimateJackpot)+ 四檔活動(Triple Bonus / Lucky Draw V4 / Free Bet / Color War V2),
        tableType 永遠是 31。行為真相在 cg-client、外觀真相在 Figma(2× 稿),衝突時行為 Cocos 贏、外觀 Figma 贏。
        逐檔清單在 <a href="#/colorgame-dirs">目錄清單</a>,日誌在 <a href="#/colorgame-log">製作歷程</a>,Store / 疑難雜症 / Console 在 <a href="#/colorgame-ref">速查</a>。
      </p>

      <h2>一分鐘看懂</h2>
      <Code>{`登入旅程   LoadingView(三段固定進度)→ LoginView(trial / account / token)→ /lobby → /room/:tableCode(MemoryRouter)
分環       views → game → integrations → platform(import 只准往內);tutorial / debug / testing / assets 在環外
寫 / 讀    玩家寫 → game/actions;畫面讀 → game/hooks;server 鏡射 → handlers(global 常駐、room 進房掛離房拆)
store      只存 SDK 拿不回來、或多畫面要一致的東西;一個欄位只當自己資料的訊號
房間       subType → profile(flow × skin)→ RoomFrame 六個洞 → roomPlanes 五層兩張 canvas(base / baseFx / hud / hudFx / overlay / menu)
RWD        大廳整層 scale(uiScale);房間設計 px × --upx + 橫向框寬百分比;禁 matchMedia / Tailwind 斷點
活動       views/campaigns 總表一列一檔;slot 疊加;isOn 看旗標、檔期看活動自己的 store
驗證       typecheck → vitest → lint → build;UI 要量測截圖;共用檔先問;不自動 git`}</Code>

      <h2>技術棧</h2>
      <DataTable sections={TECH} headers={['套件', '角色', '為什麼 / 怎麼用']} placeholder="搜尋套件、用途…" />

      <h2>指令</h2>
      <DataTable sections={COMMANDS} headers={['指令', '什麼時候', '做什麼']} placeholder="搜尋指令…" />

      <h2>分環與資料流</h2>
      <DataTable sections={RINGS} headers={['層', '角色', '放什麼 / 規則']} placeholder="搜尋層、規則…" />

      <h2>房間與大廳</h2>
      <DataTable sections={ROOM} headers={['項目', '一句話', '說明']} placeholder="搜尋房間、大廳…" />

      <h2>營銷活動</h2>
      <DataTable sections={CAMPAIGNS} headers={['項目', '一句話', '說明']} placeholder="搜尋活動…" />

      <h2>資源、FX 與驗證</h2>
      <DataTable sections={PIPELINES} headers={['項目', '一句話', '說明']} placeholder="搜尋資源、驗證…" />

      <h2>鐵則</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>前端不算結果、不決定派彩</b>:開獎、派彩、餘額全來自 server;action 永不寫金錢欄位。</li>
        <li><b>下注開關跟 Table.GameState</b>,不用本地計時器;每筆注帶 roundCode。</li>
        <li><b>重連是 SDK 的事</b>:app 只在回前景 emit SWITCH_PAGE_VISIBILITY(true)。</li>
        <li><b>SDK 只經 SdkAdapter</b>,adapter 零業務邏輯;config 只經 fields.ts。</li>
        <li><b>螢幕相關值一律走 RWD 引擎</b>;Pixi 一律走 pixi-game-framework;文案一律 t({'{'} id, defaultMessage {'}'})。</li>
        <li><b>首屏由 import 圖決定</b>:pixi 與房間包只准從首屏 import() 到;預抓走 scheduleWhenIdle。</li>
        <li><b>註解繁中、當規格寫</b>:決定值進註解,來源與歷史進 commit message;只留「這是什麼」加禁止事項。</li>
      </ul>

      <h2>Agent skills</h2>
      <DataTable sections={SKILLS} headers={['skill', '什麼時候用', '內容']} placeholder="搜尋 skill…" />

      <h2>要深讀時去哪</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><code>CLAUDE.md</code>:真假清單、分環、路由、鐵則、文件索引,最薄的一份先讀。</li>
        <li><code>docs/開發規範與指引.md</code>(規範本體)/ <code>docs/設計背景與決策.md</code>(為什麼)/ <code>docs/多玩法架構.md</code> / <code>docs/RWD架構.md</code> / <code>docs/資源規範與流程.md</code>。</li>
        <li><code>docs/plan/</code>:有壽命的實作計畫(資料流與Store設計、500x房間設計規格、108x、UJP…),落地後折進註解封存。</li>
        <li><code>MEMORY.md</code>:重大變更記錄與待辦。</li>
      </ul>
    </div>
  )
}
