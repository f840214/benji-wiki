import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

// nexus-colorgame-client 逐資料夾、逐檔案說明。資料來源:repo 內每支檔案的檔頭 JSDoc 與 AGENTS / MEMORY(2026-09-08 aaca951)。
// 檔名後標「+test」代表旁邊有同名 .test 檔;「佔位」代表骨架期殼、內容待彩骰實作;「TODO(colorgame)」代表值是輪盤佔位。
// 共用架構與資料流不在這頁,看 #/nexus-client。

const FOLDERS = [
['根目錄與工具鏈', [
  ['/', '專案根', 'AGENTS.md(= CLAUDE.md,agent 工作契約)、README、MEMORY(專案歷史與待辦)、三個 html 入口、vite / vitest / eslint / tsconfig / svgo 設定'],
  ['scripts/', 'npm script 本體', 'setup / dev / sync 三支建構鏈腳本、五道 check gate、圖檔管線、Figma 匯出、skill 與 MCP 連結、載入排查工具'],
  ['deploy/', '部署', '三環境(DEV / 239 staging / product)的 Jenkinsfile 與下沉的 shell 腳本、Lark 通知、版本檔;手冊在 deploy/README.md'],
  ['dev/', 'dev 工具殼(獨立 entry dev.html)', '零專案耦合的框架(側欄 / iframe 裝置框 / 工具容器)+ 工具註冊表;production build 不含'],
  ['docs/', '中文文件', '規範本體、設計理由、RWD、遊戲規格、資源流程、教學系統;plan/ 放有壽命的計畫書,archive/ 放已落地的舊契約'],
  ['team-skills/', 'agent skills', '26 個專案 skill,postinstall 連進 .claude / .cursor / .agents;README.md 是索引'],
  ['public/', '不經 bundle 的靜態檔', 'project.json / coreProject.json 兩支設定、assets/ 的 runtime 資源:loading_bg.webp + lobby/(頂欄鈕、布幔、緞帶)+ lobby/card/(桌卡的 PLAY 圓、預設視訊、維護圖示、路書欄底、徽章底、觀看圖示);其餘目錄還是 .gitkeep'],
  ['assets-raw/', '圖檔母檔', 'PNG / JPG 母檔,assets:compress 鏡射轉成 public/assets/**.webp;目前全空目錄'],
  ['.husky/ .vscode/ .mcp.json .env.example', '本機工具設定', 'pre-commit(lint-staged + typecheck + webp gate)、post-merge(重連 skills)、編輯器建議、MCP 名冊、環境變數範例'],
  ['.claude/ .cursor/ .agents/ .codex/ .gemini/', 'postinstall 生成', '各 AI 平台的 skill symlink 與 MCP 投影,gitignored(只有 .cursor/rules 進 git)'],
]],
['src/ 四個環(import 只准往內)', [
  ['src/platform/', '最內環:零遊戲知識、零 SDK', 'rwd 引擎、i18n 橋、uiManager 三件套、sceneManager、sound、loading 進度、通用 state、storage、dom 工具、surfaces 機制、assetLoading 純邏輯'],
  ['src/integrations/', '外部系統:認識協定、不認識玩法', 'config(設定管線)、elog(埋點)、sdk(SdkAdapter + queries)、video(VideoAdapter)、host(宿主 postMessage)、replayUrl'],
  ['src/game/', '遊戲領域', 'domain(純函式知識與判讀)、store(Zustand)、actions(玩家寫入)、handlers(server 鏡像)、hooks(畫面讀)、根層的 loadingMap / routes / sfx / assetScheduler / subGameGates'],
  ['src/views/', '畫面(React + Tailwind)', 'Loading / Login 真的;Lobby 區塊 A(殼 / 頂欄 / 跑馬燈列)與 C(桌卡列表)真的、B(標題 + 活動入口)/ D(頁尾)佔位;Room 佔位殼(多玩法架構 09-10 定案於 docs/多玩法架構.md,spike/ 驗證,尚未落入 src);campaigns/ 活動總表;lobby/ 大廳元件;components/ 共用元件;room/runtime 房間幾何與載入點;runtime/ 預載接線'],
]],
['src/ 環外的橫切關注', [
  ['src/testing/', '只給 vitest 用', '@toppath 四個替身 stub、toppathAbsentGuard(碰到真件就炸)、moduleGraphScan 與 surfaceRegistryGates 兩組掃原始碼的守門'],
  ['src/tutorial/', '新手教學', 'core/ 是可攜引擎(不認識遊戲、不准 import store / handlers);根層兩支是骨架期 no-op 佔位'],
  ['src/debug/', 'DevTools 頁面端(DEV / staging 才載)', 'devConsole 薄 config、Live 事件 log、Fire 測試指令表(空)、資產抓漏接線'],
  ['src/assets/', 'bundled 資源(import 進來的)', 'icons/ 只有 icon_loading.svg;images/emoji 表情圖集'],
]],
]

const FILES = [
['根目錄', [
  ['AGENTS.md / CLAUDE.md', 'agent 工作契約', '定位、真假清單(什麼是 real / placeholder)、分環、路由、鐵則、文件索引。最薄的一份,先讀'],
  ['README.md', '人看的上手', '定位、鄰居 repo、指令、流程;第 11–12 行的 PulaPuti「未定案」已過時(已定案另開 repo)'],
  ['MEMORY.md', '專案歷史與狀態', '重大變更記錄(09-07 骨架、09-08 十則)+ 已知缺口待辦;每個非顯然判定的理由都在這'],
  ['index.html', 'production 入口', 'pre-splash 進度條(React 掛載前就會動)、:root 房間幾何 CSS 變數(TODO(colorgame) 輪盤佔位)、紅色基底 #120a0a'],
  ['dev.html', 'dev 工具入口', '掛 dev/main.tsx,production build 不含'],
  ['cp-host.html', 'CP 宿主模擬器', 'iframe 掛遊戲頁、記錄 hostBridge 三種 postMessage(LogoutEvent / gameDeposit / switchGame);dev-only、inline CSS'],
  ['package.json', '指令與依賴', 'scripts 唯一真相;@toppath/* 走 file:../;版本只從這裡讀'],
  ['vite.config.ts', 'dev + build', 'base ./、dev 時兩個 framework alias 到上游 src、dedupe pixi / react、版號 define、vendor-pixi 分組、mode 決定 dev.html 進不進 input'],
  ['vitest.config.ts', '測試', '預設 node 環境;@toppath/* 全部 alias 到 src/testing 的替身,沒替身的走 toppathAbsentGuard'],
  ['eslint.config.js', 'lint gate', '非 type-aware flat config;no-restricted-imports 實作分環方向與 banSdkDirect;formatjs 擋 JSX 裸字串;每個 disable 必附理由'],
  ['tsconfig.json / tsconfig.node.json', '型別', 'strict、bundler resolution;node 版只給 vite / vitest 設定檔'],
  ['svgo.config.mjs', 'SVG 壓縮設定', 'assets:svgo 用;Figma 匯出的精度遠超 25–50px icon 需要'],
  ['.gitlab-ci.yml', 'CI', 'quality lane 先剝掉 @toppath 再 install → lint + test;typecheck 在 CI 跑不了'],
  ['.lintstagedrc.json', 'pre-commit 範圍', 'ts/tsx 跑 eslint --fix --max-warnings 0,其餘 prettier'],
  ['.husky/pre-commit', 'commit 閘門', 'lint-staged → 把 index 匯出到暫存目錄跑 typecheck + webp gate(驗 staged 快照不驗工作樹)'],
  ['.husky/post-merge', 'merge 後', '重連 team-skills symlink'],
  ['.mcp.json', 'MCP 名冊', '三台 Figma server 的單一真相;mcp:update 投影到 Cursor / Codex / Gemini / Antigravity'],
  ['.env.example', '環境變數範例', 'FIGMA_API_KEY(Framelink 寫死的名字,不帶 VITE_ 前綴免得進 bundle)、Figma 檔 key(大廳稿已填)'],
  ['.gitignore', '忽略', '.env*、deploy/.jenkins.env、各 AI 平台目錄、public/__probe*.html(量測探針忘刪會上線)'],
  ['.editorconfig / .prettierrc / .prettierignore / .nvmrc / .gitattributes', '格式與版本', 'Prettier 單一格式權威;Node 版本釘在 .nvmrc'],
]],
['scripts/', [
  ['setup.mjs', 'npm run setup', '關聯 repo 建構鏈唯一真相:驗 Node 與鄰居、依序 build shared-code / api-helper / SDK / 兩個 framework、npm link、裝依賴、連 skills 與 MCP。不會幫你 git pull'],
  ['dev.mjs', 'npm run dev', '同時起三個依賴 watcher(gcf / pixi / sdk)+ Vite dev server,Ctrl+C 一併結束'],
  ['sync.mjs', 'npm run sync', 'pull + rebuild + relink 兩個前端 framework;不含 SDK / shared-code / api-helper'],
  ['test-ci.mjs', 'npm run test:ci', '本地重現 CI 剝掉 @toppath 後的模組解析環境再跑測試'],
  ['check-dist-preload.mjs', 'build gate', 'index.html 的 entry / modulepreload 不得含 pixi / spine / pixi-game-framework;新 lazy 家族要加 needle'],
  ['check-dist-paths.mjs', 'build gate', 'dist 不得殘留根目錄絕對路徑(子路徑部署會 404)'],
  ['check-assets.mjs', '資產 gate', '禁 webp 以外的點陣圖進 repo;同時掃 import 與 <img src> 字串'],
  ['check-comments.mjs', 'npm run commentsCheck', '掃註解裡的出處(比照 cocos / 對 Figma)與沿革(原本 / 後來改成)字樣,report-only'],
  ['check-doc-links.mjs', 'lint 的一部分', 'AGENTS / docs / team-skills 之間近兩百處純文字指路(路徑 / skill 名 / 章節號 / 標題)的存活檢查'],
  ['listLangKeys.mjs', 'npm run langList', '抽全 src 的 { id, defaultMessage } 列成表;同 key 不同 defaultMessage 報衝突'],
  ['compress-assets.mjs', 'npm run assets:compress', 'assets-raw/<area>/**.png|jpg → public/assets/<area>/**.webp 1:1 鏡射;--force / --lossless / 路徑過濾'],
  ['svgo-assets.mjs', 'npm run assets:svgo', '就地壓 src/ 與 public/ 全部 SVG,掃描範圍與 check-assets 一致'],
  ['figma-export-assets.sh / figma-export-svg.sh', 'Figma REST 批次匯出', 'icon 清單目前是空的(set -u 下不可執行),等彩骰稿定案再填'],
  ['inspect-spine.mjs', 'Spine 離線檢視', '不開瀏覽器直接讀 .skel:動畫長度、事件秒數、骨頭位置、slot alpha、atlas 墨跡'],
  ['link-team-skills.mjs', 'npm run skill:update', 'team-skills/ 與 pixi-game-framework/skills/ symlink 進各 AI 工具目錄;同名專案 skill 優先'],
  ['link-mcp-servers.mjs', 'npm run mcp:update', '.mcp.json 投影成 Cursor / Codex / Gemini / Antigravity 各自的格式與位置'],
  ['base-diff.mjs', 'npm run base:diff', '對鄰居 repo 列基底檔 same / differs / missing;不帶參數驗 manifest 過期沒'],
  ['base-manifest.json', '基底檔清單 + 雜湊', 'Tier 0/1 檔案;改了基底檔要 npm run base:manifest 重寫'],
  ['slow-asset-proxy.mjs', 'npm run assets:proxy', '只把 /assets/** 壓成窄頻寬的 dev 代理,模組與 HMR 不受影響'],
  ['sfx-probe.js', '瀏覽器 Console 探針', '攔 AudioBufferSourceNode.start 記錄這個分頁真正發出的每個音;不是 node 跑的'],
  ['loading-audit/serve-gzip.mjs', '載入排查', 'gzip + no-store 的靜態伺服器(vite preview 不壓縮,節流量測會放大三四倍)'],
  ['loading-audit/harness.html', '載入排查', '同源 iframe 探針,放進 dist 根目錄後 window.run(cfg) 量冷快取瀑布'],
  ['loading-audit/chunk-report.mjs', '載入排查', '首屏集合檔數與 gzip 位元組、全部 chunk 大小與靜態 import 關係'],
  ['loading-audit/vite.graph.config.ts', '載入排查', '沿用專案 vite.config,另 dump chunk→modules 與 import 圖 JSON(production 檔名是 hash,沒它對不出誰是誰)'],
]],
['deploy/', [
  ['README.md', '部署手冊', 'DEV / 239 Staging / Production 三環境對照、目標機佈局、手跑方式'],
  ['Jenkinsfile', 'NEXUS-H5-DEV', '部署內網 dev server;業務全下沉到 *.sh 讓每步可手跑'],
  ['Jenkinsfile.239', 'NEXUS-H5-239', 'staging 機 192.168.2.239,目標固定無 IP 參數,只走 Jenkins 網頁'],
  ['Jenkinsfile.product', 'NEXUS-H5-PRODUCT', 'production 建置 → tar.gz → commit 進 cp-product 的 cg/<版本>/h5/(目錄名 cg 待 SRE 確認)'],
  ['ci-build.sh', 'CI 建構鏈', '對 6 個 repo 破壞性 checkout 後依 setup.mjs 的順序建構;此樹只屬 CI'],
  ['deploy.sh', 'dev 覆蓋部署', 'dist 解壓到 nginx new/colorgame/(先清再解)+ smoke check'],
  ['package-product.sh', '正式打包', 'dist 打 tar.gz、commit 進 cp-product;不部署任何機器'],
  ['trigger-jenkins.sh', '本機 CLI 觸發', '用可撤銷的 Jenkins API token 觸發 job 並串流進度;ssh 私鑰只留在 Jenkins'],
  ['notify.sh / notify-card.mjs', 'Lark 通知', 'start / success / failure 三態 interactive 卡片;app 模式優先於 webhook'],
  ['version.mjs', 'dist/version.json', '構建中繼資料供 smoke check 比對;由 CI 顯式呼叫,不掛 npm run build'],
  ['.jenkins.env.example', '觸發憑證範例', '複製成 .jenkins.env(gitignored)填 token'],
]],
['dev/(工具殼)', [
  ['main.tsx', 'dev entry', '不跑 SDK bootstrap、不登入、不下載語言表,只掛 DevShell + 工具清單'],
  ['framework/DevShell.tsx', '殼層', '左側工具清單(依 group)+ 右側內容,hash 路由切換;只吃 tools / viewports 資料'],
  ['framework/ViewportFrame.tsx', '裝置框', '用 iframe 承載工具:媒體查詢、100dvh、safe-area 都看 viewport 不看容器,塞 div 尺寸就是假的'],
  ['framework/ToolHost.tsx', '工具容器', 'Suspense + 錯誤邊界,tool.id 當 key 切換時乾淨卸載'],
  ['framework/types.ts / index.ts', '工具定義', 'defineTool({ id, title, group, Component });index 是唯一對外 barrel'],
  ['tools/index.ts', '工具註冊表', '唯一收集點;每個工具一個子目錄 dev/tools/<toolId>/;骨架期只有清單沒有工具'],
  ['tools/viewports.ts', '裝置尺寸', '設計稿四格(432×768 / 432×960 / 432×1008 / 576×768)+ 實機極端;驗 RWD 兩組都要看'],
]],
['docs/', [
  ['開發規範與指引.md', '規範本體', '§3 註解九原則、§6 i18n、§8 分層與資料流(含 09-08 新增的「domain 是什麼」判準)、§9 store、§10 目錄樹(輪盤原版)、§11 Pixi、§14.1 分包、§15 驗證'],
  ['設計背景與決策.md', '所有「為什麼」', '選型、保護順序、載入分段、§三可插拔 UI(面板不建總表、佈景主題不走總表、09-08 實測的適用邊界)、版本約束、原生元件去留'],
  ['RWD架構.md', '四軸模型', '引擎通用;範例值是輪盤佔位。§一 09-09 補「大廳是例外」:大廳走 432 畫布 zoom 縮放舞台,登入 / 載入頁仍流式'],
  ['遊戲規格與畫面流程.md', '產品規格', '§一–§三、§六 還是章節骨架;§四 store↔畫面、§五 實作範圍逐項定案(四玩法四活動)已定稿'],
  ['資源規範與流程.md', '資源單一權威', 'Figma → 切圖 → 交付 → WebP 管線 → runtime 對映;§二有 MCP 存取步驟與大廳稿 key'],
  ['tutorial-system.md', '教學系統手冊', 'core 引擎在本 repo,輪盤劇本不在'],
  ['plan/大廳-design-spec.md', '大廳 design-spec(有壽命)', '拆分計畫、元件樹、幾何 / 字型 / 色票 / i18n / 資產表、區塊 C 桌卡幾何、cg-client 大廳逐功能對照表、量測章(掃邊界對稿法與每次的數字、刻意分歧)'],
  ['多玩法架構.md', '房間多玩法架構(09-10 定案)', 'profile / phase / RoomFrame / Room / Skin 五概念;以 spike/frame-rooms/ 驗證,尚未落入 src'],
  ['plan/資料流與Store設計.md', '實作期計畫書(有壽命)', '§0 落點表、§1 範圍與桌號判斷(§1.1 09-11 改版:顯示名單只剩 colorGameSupportedSubTypes,NewUI 兩列只切 UI)、§2 四條路徑、§3 房內共用(GameHandler / useGameStore / BetHandler)、§4 玩法層、§5 活動層、§6 佈景主題、§7 離房重置、§8 store 一覽;接線完就併回 JSDoc 封存'],
  ['archive/svg-1x-repull.md', '已封存', '2× SVG 改 1× 的執行記錄(輪盤時期)'],
  ['archive/tutorial-howtoplay.md', '已封存', '新手教學規劃期契約,已落地;不作實作依據'],
]],
['public/ 與 assets-raw/', [
  ['public/project.json', '渠道設定', 'gw / site_assets / infoUrl(/h5/1e3109 多遊戲共用 dev 頻道,不用換)/ 各旗標;a 欄位是編碼過的 GW 位址。09-11 起:colorGameSupportedSubTypes(子玩法代碼名單,桌在名單內才顯示;空 = 全部顯示;dev 是 [4, 9, 12, 13])+ 192x NewUI 兩列(只切 UI,不擋桌)'],
  ['public/coreProject.json', '核心設定', 'gw、studioIdTransferMap 等跨渠道共用值;與 project.json 由 ConfigManager 合併'],
  ['public/assets/loading_bg.webp', '唯一真資源', '中性佔位背景;pre-splash 與 LoadingView 畫同一張'],
  ['public/assets/**/.gitkeep', '目錄結構', 'audio / betarea / chips / icons/lobby / payout / popup(chat gift、message、statistics)/ room / spine/videoloading / tutorial;全是輪盤的形狀,等彩骰資源。lobby/ 與 lobby/card/ 已有真檔(母檔在 assets-raw/lobby/)'],
  ['assets-raw/**/.gitkeep', '母檔目錄結構', 'betarea / payout / popup/chat/message / room / spine/videoloading / tutorial;全空'],
]],
['src/ 根', [
  ['main.tsx', 'bootstrap', '嚴格順序:loadingMap → dom 工具 → registerRoomPreload → ConfigManager.load → initElog → SoundManager → SdkAdapter.init → INIT_CONFIG / LOAD_CHANNEL_INFO → setupGlobalHandlers → i18n apply → render → 等渠道與語言表 → 100%'],
  ['App.tsx', '路由表', 'MemoryRouter:/ Loading → /login → /lobby → /room/:tableCode(lazy);IntlBridge / RouterBridge / LayerHost'],
  ['index.css', 'Tailwind 入口', 'source(none) 只掃 src 與 index.html;@theme;wide-frame 區塊(TODO(colorgame));.nx-scrollbar 皮;@import rwd.css'],
  ['vite-env.d.ts', '型別宣告', 'vite/client + vite-plugin-svgr/client'],
  ['assets/icons/icon_loading.svg', '載入圖示', '中性佔位'],
  ['assets/images/emoji/emoji_atlas.webp', '表情圖集', '20 個表情 2× 合圖,platform/ui/chatEmoji 依編號裁切'],
]],
['src/platform/(最內環)', [
  ['rwd/index.ts', 'RWD 引擎入口', '四軸模型:0 固定 px / 1 框寬 / 2 比例查表 / 3 形態;本模組提供後三種機制'],
  ['rwd/formFactor.ts +test', '軸 3 形態', '手機 ↔ 4:3 寬框的單一來源;CSS 字面條件一併匯出,test 釘住 index.html / dev.html / index.css 一致'],
  ['rwd/viewport.ts', '單一量測點', '一份快照、一組監聽、一個廣播;寫 --ui-scale 等變數'],
  ['rwd/scale.ts', '軸 1 兩個尺度', 'layoutWidth()(版面幾何,無上限)vs uiScale()(元件等比,上限 1),選錯整片偏掉'],
  ['rwd/lerp.ts', '軸 1 內插', '面板值隨框寬在兩份稿之間過渡,內插只留這一份'],
  ['rwd/byRatio.ts +test', '軸 2 就地表達', '宣告式資料裡「同一稿值各比例不同」;與 roomRatioSpec 共用錨點軸'],
  ['rwd/anchorAspects.ts', '軸 2 錨點軸', '手機稿比例 16:9 / 20:9 / 21:9 升冪;增減錨點 byRatio 欄位數要跟'],
  ['rwd/rwd.css', '引擎 CSS 面', '軸 1 縮放公式的 CSS 端(JS 只寫 --ui-scale);index.css @import'],
  ['rwd/sourceScan.ts', '掃原始碼工具', '剝註解後掃全 src,給 engineBypass / wideFrameUsage 這類閘門用'],
  ['rwd/engineBypass.test.ts', '閘門', '全 src 不得出現 matchMedia / Tailwind 斷點'],
  ['rwd/wideFrameUsage.test.ts', '閘門', 'wide-frame: 前綴用法檢查'],
  ['i18n/i18nBridge.ts', '唯一取字入口 t()', 'React 與非 React 共用;遠端語言表 → defaultMessage 保底'],
  ['i18n/I18nProvider.tsx', 'react-intl 供應層', '訂 useI18nStore 的 locale / messages,語言表下載完重繪'],
  ['i18n/intlLocale.ts', '語系碼轉換', 'en_us → en(BCP-47),只影響數字日期格式'],
  ['uiManager/UIManager.ts', 'Alert / Toast / Loading 三件套', '靜態入口 + Zustand;Modal 佇列制 tag 去重、Toast 單顆、Loading type 制;凍結閘門註冊點'],
  ['uiManager/LayerHost.tsx', '三件套根元件', 'App.tsx 掛一次;層序 Toast < Modal < Loading,視覺規格寫在檔頭'],
  ['uiManager/DialogAlert.tsx', '中央對話卡', '新增彈窗一律用它,不再各寫一份卡片'],
  ['uiManager/Backdrop.tsx', '全屏黑遮罩', '鎖屏 / 調暗 / 演出襯底共用 primitive'],
  ['uiManager/dialogTopResolver.ts', '卡頂位置注入點', '四比例各停哪裡是 app 設計值,由 bootstrap 註冊解析器'],
  ['sceneManager.ts', '路由切換管理器', '封裝 navigate 讓 handler / action 也能 goto;列為「不要再長大」'],
  ['sound/SoundManager.ts', 're-export 縫', '實作與單例在 framework/sound;存在只為 eslint 邊界與單一 import 點'],
  ['loading/loadingTasks.ts +test', '進度機制', '分段權重地圖 → 百分比;skipTask / skipSegment 與 completeTask 數學等價'],
  ['loading/loadingProgress.ts', '進度單一真相', 'rAF 平滑逼近目標,同時驅動 pre-splash 與 LoadingView'],
  ['state/useAuthStore.ts', '登入流程狀態', '不存 raw token;auth action 與 SceneHandler 寫'],
  ['state/useUserStore.ts', '玩家身分', 'userId / 暱稱 / 頭像 / 貨幣;SceneHandler 寫'],
  ['state/useI18nStore.ts', 'locale / messages', '初始空,缺 key 用 defaultMessage'],
  ['state/usePreferencesStore.ts +test', '玩家偏好', 'RoomPreferences 四欄位;localStorage 持久化由它獨佔'],
  ['state/useVideoStore.ts', '視訊狀態鏡像', 'VideoAdapter 寫,React 只讀'],
  ['state/useChatStore.ts / useChatMessages.ts / useGiftStore.ts', '聊天 / 飄字 / 收禮', '自基底帶入,等 ChatHandler 實作才有寫入者'],
  ['storage/storage.ts', 'localStorage 單例', '不可用時退記憶體;key 為 userId / lastAccount / userLang'],
  ['storage/preferencesStorage.ts +test', 'userData JSON 唯一存取層', 'read-merge-write 保留未知欄位,壞資料復原'],
  ['assetLoading/types.ts', '預載清單型別', '要預載什麼是宣告不是發現'],
  ['assetLoading/createPreloadRunner.ts +test', '預載執行核心', '依賴注入,不認識 pixi / DOM / 音效'],
  ['assetLoading/createAssetAudit.ts +test', '抓漏純邏輯', '拿實際載入對清單,回答「清單漏了什麼」'],
  ['assetLoading/auditSink.ts +test', '抓漏掛載孔', '正式版只剩幾行,debug 端回填'],
  ['surfaces/index.ts', '可插拔 UI 機制(暫存地)', '原本在 pixi-game-framework/surfaces,三個 client 都沒消費過,內聯到這裡由 colorgame 先驗證'],
  ['surfaces/createSurfaceRegistry.ts +test', '工廠', '一張總表 + 來源組裝 → useSurfaces / useSurfaceFor / usePrefetch 三個 hook'],
  ['surfaces/selectSurfaces.ts +test', '純函式篩選', '這一列開著 && 在這個 slot 有登記;不填 key 就是不出現'],
  ['surfaces/types.ts', '形狀', 'slot 契約、呈現載入器、總表列;開關來源由消費端決定'],
  ['dom/zoomLock.ts', '整頁縮放四類入口各自鎖', '房間幾何算死,被縮放後沒 UI 可還原'],
  ['dom/pointerShield.ts +test', '吞殘留事件', '觸控上 mousedown / click 在 touchend 之後才到,關面板時會誤點到底下'],
  ['dom/scrollbarWidth.ts', '量捲軸寬 → --sbw', '桌機 6px、行動 0px,面板負 margin 補回要用'],
  ['dom/scrollbarAutoHide.ts', '捲軸滑動才顯示', '全域委派掛 is-scrolling,皮在 index.css'],
  ['ui/glyphs.ts', '非文案字元豁免', 'glyph(←) 表示已審視、不是 i18n 文案'],
  ['ui/chatEmoji.ts', '表情圖集對照', '20 個表情合一張 2× 圖,依編號裁切'],
  ['ui/iconColor.test.ts', '閘門', 'icon 顏色用法檢查'],
  ['video/offsetRef.ts', 'server 視訊 offset 基準', '828×560 校正基準,與 roomGeometry 刻意分開'],
  ['device.ts', '裝置降級', 'DeviceChecker 分級快取;低階機降 Pixi DPR'],
  ['format.ts +test', '金額數字格式化', '純函式'],
  ['log.ts', 'logger', 'clientLog.child(模組名) → [Client][模組名]'],
  ['urlParams.ts +test', '進場網址參數', 'key 比對規則全站一致,不自行 new URLSearchParams'],
  ['networkHint.ts / scheduleWhenIdle.ts', 'framework 轉出縫', 'isConstrainedNetwork / scheduleWhenIdle;views 不得直接 import framework'],
]],
['src/integrations/(外部系統)', [
  ['sdk/SdkAdapter.ts', 'SDK 唯一出入口', 'init / emit / on / off / thin getter;零業務邏輯;註冊 COLORGAME_GAME_MAP_CONFIG(mapId colorGame、tableType 31)、走 games/colorgame 子路徑'],
  ['sdk/queries/betQueries.ts +test', '注單快照讀', '跨 model 取值與回退加工放 queries 不回流 adapter'],
  ['sdk/queries/assetHistoryQueries.ts +test', '資產明細往返讀', 'emit → REFRESH_* → Promise;等回應、回純資料、不改真相'],
  ['sdk/queries/favoriteBetQueries.ts +test', '收藏投注方案讀', '基底帶入'],
  ['sdk/queries/giftQueries.ts', '禮物資料讀', '基底帶入'],
  ['config/fields.ts', '設定欄位唯一清單', '一列寫完一個欄位;AppConfig 型別由此推導;彩骰十列玩法開關 + Triple Bonus 五列在這'],
  ['config/engine.ts', '取值引擎', 'JSON 層 → derive afterJson → URL 層逐列執行'],
  ['config/derive.ts', '跨欄位規則', '進不了 FIELDS 那張表的邏輯,每條有名字'],
  ['config/converters.ts', '取值轉換器', 'JSON 與 URL 共用;回 undefined 代表不採用'],
  ['config/types.ts', '巢狀型別與列舉', 'JSON → runtime 改名一律在 fields 的 fromJson'],
  ['config/index.ts', '純函式組建入口', '不 fetch 不讀全域不 import SDK;測試可載'],
  ['config/ConfigManager.ts', 'IO shell', 'fetch 兩支 JSON、讀網址與協定、a 欄位解碼、存單例'],
  ['config/LanguageManager.ts', '語言表下載', '遠端 CSV → languageMap;本地零語言檔;列為「不要再長大」'],
  ['config/initUserLang.ts', '渠道語系比對', 'userLang 不在清單 → 切渠道預設並送埋點'],
  ['config/__fixtures__/golden.json + configPipeline.test / configRules.test', '設定管線測試', 'golden 檔釘住整條管線輸出'],
  ['elog/index.ts', '埋點入口 barrel', 'sendLog / recordTime / … 都掛 getElog()'],
  ['elog/elog.ts', 'sink 組裝', 'getter 全是惰性回呼,bootstrap 極早期 initElog 即可'],
  ['elog/eLogEvent.ts', '本遊戲事件常數', '繼承 framework 的 eLogBaseEvent'],
  ['elog/eLogBehavior.ts', '玩家行為埋點定義', 'client.user.behavior 靠 event_name + function_name 分流;宣告合併進 UserBehaviorRegistry'],
  ['elog/ELogConfig.ts / ELogUtil.ts', '常數與純函式', '注單轉換、熱冷號、餘額不足暫存參數'],
  ['elog/GameBehaviorRecord.ts', '停留計時', 'recordTime / getDiffSec'],
  ['elog/betRoundTracker.ts', '本次進房下注情況', 'enterRoom 進、BetHandler 記、離房算停留與注額'],
  ['elog/elogSession.ts', 'session 產生', '32 碼 hex,每次啟動不同'],
  ['video/VideoAdapter.ts', 'framework VideoManager 接線', 'AppConfig → ManagerConfig;ManagerEvent → useVideoStore + Toast;join / leave / setQuality / setMuted'],
  ['host/hostBridge.ts', '宿主 postMessage', 'CP 容器契約不可改:LogoutEvent 裸字串、gameDeposit / switchGame 物件'],
  ['replayUrl.ts', '影片回放 URL', 'TRTCVideoPath 有值直接用,否則 startTime / endTime 套模板'],
]],
['src/game/domain/(純函式,全部有 test)', [
  ['gameType.ts', 'COLORGAME_TABLE_TYPE = 31', '字面值不 import @toppath(測試載入路徑);所有要遊戲類別的 SDK 呼叫都帶它,不由設定決定'],
  ['colorGame.ts', '六色三組識別', '畫面順序 / 色碼 801–806 / 色鍵 color1–color6,不能互相代用'],
  ['betTypes.ts', '八種注型', '六色 + anyDouble 807 / anyTriple 808(只在 bonusV1 / V2 桌);三種 SDK 鍵形轉換;BET_TYPE_ODDS 數值'],
  ['subType.ts', '15 種子玩法鍵↔碼', '本層一律傳鍵名,數值只在此檔出現一次;switch 漏一支型別會擋'],
  ['roomVariant.ts', '開哪一種房間畫面', '11 種版面;與 roomType 刻意分兩層(四種 jackpot 桌與倍率桌共用經典版面)'],
  ['roomType.ts', '房內用哪一套配置', '15 種房型 + 規則說明頁;jackpotV2 靠兩個桌台欄位再分三種;jackpotV3 套 V1 但不列規則頁'],
  ['subGameGate.ts +test', '大廳顯示名單與 192x 換皮', '09-11 改版:isSubTypeSupported(subType 代碼 ∈ colorGameSupportedSubTypes 才顯示;名單空 = 全部顯示)+ isSuperWheelNewUi(NewUI 總開關 && 桌號名單 → 走新版 UI,不擋桌)。原本的逐支玩法開關 isSubGameOpen 已移除'],
  ['roundResult.ts', '開獎判讀', '三同 / 二同 / 全異 / 未開完 + 電子倍率命中;二同的重複色是出現兩次那色'],
  ['odds.ts', '一注的結果', '{ isWinning, rate, jackpot };基礎 1 / 2 / 3 倍,三同色才進各玩法加成;倍率是數值不是 100X 字串'],
  ['lushu.ts', '路書一欄判讀', '四筆不是三筆;第四筆:UJP 幸運物、108x 倍率、192x / 500x 小遊戲結果;回報事實(bonusKind / jackpotType / rate)不回樣式'],
  ['bonusActivity.ts', 'LuckyTriple 檔期判定', '五條件;看 round.startTime 不看現在;預算歸零但已拿獎仍生效;只驗第一筆'],
  ['tableStatus.ts', '桌台三態', 'suspended > maintenance > open;呈現不了某態就把輸入傳 false'],
  ['tableLimits.ts', '限額聚合', '多注型收成一個範圍;tableSummary.betLimit 整個 SDK 沒人寫入,別讀'],
  ['tableSort.ts', '桌列排序', '維護 > 渠道權重 > 最愛 > 好路 > 桌號;要在轉卡片資料之前做'],
  ['currency.ts', '幣別 → 符號', '未知一律 $;Google Play 渠道與試玩整個不顯示是執行期條件'],
]],
['src/game/ 其餘', [
  ['subGameGates.ts +test', '設定 → domain 形狀的接縫', 'supportedSubTypesOf(config)/ superWheelNewUiGateOf(config);純函式不是 hook'],
  ['store/useGameStore.ts', '局態 store(最小化)', '只剩 tableCode 等登入旅程需要的欄位;彩骰局態模型見 docs/plan §3.2'],
  ['store/useUiStore.ts', 'UI overlay 開關(最小化)', '保留 resetRoomUI 接縫;09-09 加 isMenuOpen / openMenu / closeMenu(主選單面板本體未做)'],
  ['store/useWalletStore.ts', '餘額 / 派彩', 'UserHandler 是唯一寫入者'],
  ['actions/auth.ts', '登入', 'token / 試玩 / 帳密,emit LOGIN_TO_GW;成功由 SceneHandler 跳頁'],
  ['actions/navigation.ts', '進房 / 離房 / 大廳 / 重連', 'enterRoom 只 emit MOVE_TO_GAME_ROOM 不 navigate,等 POSITION_CHANGED;exitTable 雙驅動'],
  ['actions/video.ts', '視訊 join / leave', '取容器、回讀偏好、委派 VideoAdapter'],
  ['actions/deposit.ts', '儲值', '埋點 → 遊客擋 → hostBridge.deposit(iframe postMessage 或開新視窗)'],
  ['actions/favorite.ts', '收藏 / 取消收藏桌台', 'emit USER_SAVE_MY_DATA,不改本地狀態;FAVORITE_TABLES_CHANGED 回來才重排'],
  ['handlers/handlerContract.ts', 'IGlobalHandler / IRoomHandler', '新 handler implements 後加名冊,漏實作編譯錯'],
  ['handlers/global/globalHandlers.ts', '全局名冊', 'App 起就掛、不 teardown;門檻:任何畫面都可能到且錯過有害'],
  ['handlers/global/SceneHandler.ts +test', '路由中樞', '登入推進、列表確認、POSITION_CHANGED 驅動路由、被踢跳登入;保留外遊戲型別的安全網分支(改成 return 會死鎖)'],
  ['handlers/global/UserHandler.ts +test', '身分與錢包', 'LOGIN_SUCCESS → useUserStore;SYNC_MONEY → useWalletStore'],
  ['handlers/global/MessageHandler.ts +test', '系統訊息總路由', 'ALERT → Toast、CONFIRM / OK → Modal;BET_TYPE_MSG 八個 langCode 已填,FULL_KEY_BET_TYPE_IDS 該是空的'],
  ['handlers/global/LoadingHandler.ts', 'SDK 菊花橋接', 'PLAY_JUHUA / STOP_JUHUA → UIManager loading 依類型分流'],
  ['handlers/global/PageVisibilityHandler.ts +test', '前後台切換', 'visibilitychange → SWITCH_PAGE_VISIBILITY;不自己 emit CHECK_CONNECTION'],
  ['handlers/global/LogMgrHandler.ts', '連線生命週期埋點', 'GTS connect / connecting / 登入成功 → V1 具名事件'],
  ['handlers/room/roomHandlers.ts', '房間名冊(空殼)', 'setupAll / teardownAll / resetRoomStores 三個簽名保留;GameHandler / BetHandler / ChatHandler 待建'],
  ['hooks/useAppConfig.ts', 'AppConfig 唯讀綁定', 'views 只准經這個拿設定;無 zustand'],
  ['hooks/useRetryableImage.ts +test', '圖片載入交排程器 + 失敗重試', '斷線期間掛的 img 瀏覽器不會自己重試'],
  ['hooks/lobbyCardData.ts', 'Table → 桌卡純資料', '唯一讀 SDK 的轉換點:subType 正規化、狀態、限額聚合、路書六欄、六色百分比、jackpot 金額、isSuperWheelNewUi'],
  ['hooks/useLobbyTableList.ts', '大廳桌台列表', 'hiddenRooms → isSubTypeSupported → sortTables;訂 LIST_INITIALIZED / 收藏變更 / 維護 / 好路 / 刪桌整列重讀'],
  ['hooks/useLobbyCardLive.ts', '逐卡即時資料', '訂該桌事件 + tableSummary REFRESH,in-place 重讀'],
  ['hooks/useTableCountdown.ts', '下注倒數與進度比', '給桌卡時間條;分母取第一次讀到的剩餘毫秒'],
  ['loadingMap.ts', '首屏三段進度地圖', 'shell 0–40 / bootstrap 40–70 / entry 70–100;main.tsx defineLoadingMap 註冊'],
  ['routes.ts', '路徑常數', '零依賴檔,handler / action 都引用'],
  ['sfx.ts', '音效名單', '只有 btnclick(音檔缺,點擊時良性 warn)'],
  ['assetScheduler.ts +test', '唯一載入排程器實例', '策略值是這個遊戲的;機制在 framework/asset-loading'],
]],
['src/views/', [
  ['LoadingView.tsx', '首屏(真的)', '進度來源 loadingProgress,與 pre-splash 同一真相'],
  ['LoginView.tsx', '登入(真的)', '試玩 / 帳密 / token 自動登入;紅色配色是對藍本金色的刻意分歧,token 集中檔頭常數'],
  ['LobbyView.tsx', '大廳(區塊 A + C 真的)', '根節點 zoom: var(--ui-scale) 整頁以 432 畫布縮放;背景 / 頂欄 / 跑馬燈列 / 桌卡列表;區塊 B(標題 + 活動入口)55px 佔位、D(頁尾)未做;跑馬燈訊息暫為固定公告'],
  ['lobby/LobbyBackdrop.tsx', '四層背景', '輻射底色、布幔圖 ×2、房間底板純 CSS 四層漸層'],
  ['lobby/LobbyHeader.tsx', '頂欄', 'Home(shouldShowHomeButton)/ 頭像 / 暱稱 / 餘額 / 儲值(requestDeposit)/ Menu(openMenu);行為對照 cg-client ColorGameLobbyTopBar'],
  ['lobby/LobbyMessageBar.tsx', '跑馬燈列 + Banner 切換', '40 px/s 等速捲動,時長由量測注入 inline CSS 變數;MarqueeList 接線待做'],
  ['lobby/LobbyTableCard.tsx', '桌卡', 'room 容器下移 1.47 且下緣超出卡框 1.47(稿 room 子框沒被裁);頂列 / 視訊 / 路書 / 六色比例 / 時間條 / 底條 + PLAY / 愛心;半像素微調一律 transform'],
  ['lobby/LobbyCardTitle.tsx', '頂列玩法標題(純文字)', 'ULTIMATE / SUPER / BONUS 逐字漸層(兩層畫陰影)、主句、倍率 + 限額同列;四段共用一個 NUDGE 位移'],
  ['lobby/LobbyStripText.tsx', '底條金字(純 CSS 三層)', 'Figma 的 darken 疊色算成實色停止點、漸層鋪在 cap-height(em 定位);symbol prop 畫 ₱(Baloo 2 500)'],
  ['components/RoadStrip.tsx', '路書六欄(共用元件,09-11 自 lobby 搬入)', '最近五局 + 一欄留給下一局;三顆同色那一局用特別欄底;欄底圖由 props 傳入;加成標籤在欄上方'],
  ['lobby/LobbyBetPercent.tsx', '六色比例 3×2', '來源 tableSummary.getWinnerPercent;pt 補 Luckiest Guy 墨心偏高'],
  ['lobby/lobbyAssets.ts +test', '大廳資源清單', 'CARD_ASSET_URLS + LOBBY_ASSET_SETS;測試驗清單 = 元件用的且檔案存在'],
  ['lobby/lobbyCardVariant.ts', '變體配色', '獨立成檔是為了 Fast Refresh'],
  ['components/diceColors.ts', '六色骰格底漸層(共用)', '路書與六色比例格共用;09-11 自 lobby 搬入'],
  ['lobby/homeButtonVisibility.ts +test', 'Home 鈕顯示規則', '自 roulette 複製:showHome / roomBack / tableCode / embedded'],
  ['RoomView.tsx', '房間(佔位)', '只履行 mount 時 setEntering(false) 的契約;版面路由待建'],
  ['entryAssets.ts +test', '進場兩頁資源清單', '兩頁都沒東西值得預載,清單分開是為了逐頁抓漏'],
  ['campaigns/registry.ts +test', '檔期活動總表(空)', '每檔活動一列;全專案唯一認識 views/campaigns/<name>/ 的地方'],
  ['campaigns/slots.ts', 'slot 契約', '掛載點名字 + 畫面傳給該格的 props;不是 DOM 位置'],
  ['campaigns/activation.ts', '開關來源組裝', '設定布林、伺服器檔期、使用者狀態收成一個物件'],
  ['campaigns/hooks.ts', 'useCampaignSurfaces', '把總表與來源綁進工廠,只綁這一次'],
  ['components/RetryableImage.tsx +test', '會重試的 img', 'useRetryableImage 的元件包裝,清單渲染可用'],
  ['room/runtime/loadRoomView.ts', '進房唯一載入點(佔位版)', '完整版要先 import pixiRuntime 註冊 Spine 再回畫面'],
  ['room/runtime/roomGeometry.ts', '房間幾何單一真相', 'TODO(colorgame):輪盤值;與 index.html / dev.html / index.css 四同步點'],
  ['room/runtime/roomRatioSpec.ts +test', '比例查表', 'TODO(colorgame):輪盤稿值錨點;dialogTop 已被 main.tsx 消費'],
  ['runtime/pagePreload.ts +test', '預載 runner 接線', '在 views 而非 platform:只有這層能 import pixi;pixi 載入器內才 import()'],
]],
['src/testing/ src/tutorial/ src/debug/', [
  ['testing/toppathAbsentGuard.ts', '@toppath 真件攔截閘', 'vitest catch-all alias;載入即拋,把 CI 紅提前到本地'],
  ['testing/gameClientFramework*Stub.ts(4 支)', 'framework 替身', 'asset-loading(直通)/ logger / scheduling / sound;CI 剝掉 @toppath 後才 install'],
  ['testing/pixiGameFrameworkCoreStub.ts', 'pixi framework 替身', '字面量動態 import 在 transform 期就解析,不執行也紅'],
  ['testing/moduleGraphScan.ts +test', '模組依賴與頂層副作用掃描', '「這個目錄可宣告無副作用」只有掃原始碼測得到'],
  ['testing/surfaceRegistryGates.ts', '可插拔總表守門', '載入器字面值、id = 目錄名、只准 import ./slots、頂層無副作用;一個管理域一張總表共用'],
  ['tutorial/core/TutorialSession.ts +test', '教學進出流程', '只管順序與診斷,凍什麼由 ITutorialGate 決定;可整包搬 framework'],
  ['tutorial/core/createTutorialFlow.ts', '換頁流程工廠', '三個出口的順序是規格;埋點與回寫由 policy 注入'],
  ['tutorial/core/stageKit.ts', '擺拍機制', 'baseline 生命週期、省略欄位 = 回 baseline'],
  ['tutorial/core/tutorialState.ts', '旗標與頁碼', 'TStage 由遊戲端代入'],
  ['tutorial/core/interrupt.ts', '中斷蹦床', '註冊而非 import,避免內環 → 教學 → store 的循環'],
  ['tutorial/core/diagnostics.ts / types.ts', '診斷與介面', '暫停是否成立要用數值比對;core 不得 import store / handlers'],
  ['tutorial/tutorialFlags.ts', '佔位', '永遠「沒有教學進行中」;彩骰教學場景未建'],
  ['tutorial/uiFreezeGate.ts', '佔位 no-op', '完整版向 UIManager 註冊凍結閘門'],
  ['debug/devConsole.ts', 'DevTools 薄 config', 'stores / panels / labels;核心在 framework/devtools'],
  ['debug/eventLog.ts', 'Live 事件 log', '有界 ring buffer,首次 poll 訂全域 model'],
  ['debug/gameCommands.ts', 'Fire 測試指令表(空)', '藍本分 game / … 四組,移植期落位'],
  ['debug/assetAudit.ts', '資產抓漏接線', 'PerformanceObserver 觀測,不監聽自家載入器'],
]],
]

export default function ColorGameDirsPage() {
  return (
    <div>
      <h1>colorgame 目錄清單</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        <code>nexus-colorgame-client</code> 每個資料夾放什麼、每支檔案在做什麼。內容取自各檔檔頭 JSDoc 與 MEMORY(對到 2026-09-08 晚間),
        共用架構與資料流看 <a href="#/nexus-client">nexus client</a>。點第一欄可複製檔名;搜尋框能搜中文說明。
      </p>

      <h2>先看全貌</h2>
      <Code>{`nexus-colorgame-client/
├─ AGENTS.md(=CLAUDE.md) README.md MEMORY.md          契約 / 上手 / 歷史與待辦
├─ index.html  dev.html  cp-host.html                  正式入口 / dev 工具入口 / 宿主模擬器
├─ vite.config.ts vitest.config.ts eslint.config.js    工具鏈(base ./、@toppath 替身、分環 lint)
├─ scripts/     setup / dev / sync、五道 gate、圖檔管線、Figma 匯出、載入排查
├─ deploy/      三環境 Jenkinsfile + 下沉的 sh、Lark 通知
├─ dev/         dev 工具殼(framework/ + tools/,零專案耦合)
├─ docs/        規範 / 決策 / RWD / 遊戲規格 / 資源 / 教學;plan/ 有壽命計畫;archive/ 封存
├─ team-skills/ 26 個 agent skill
├─ public/      project.json coreProject.json  assets/(runtime URL 資源:loading_bg + lobby/ + lobby/card/)
├─ assets-raw/  PNG 母檔(空)
└─ src/
   ├─ main.tsx App.tsx index.css                       bootstrap / 路由 / Tailwind 入口
   ├─ platform/      最內環:rwd i18n uiManager sceneManager sound loading state storage dom surfaces assetLoading
   ├─ integrations/  config elog sdk(+queries) video host replayUrl
   ├─ game/          domain(15 支) store(3 顆) actions handlers(global 6 / room 空) hooks + loadingMap routes sfx
   ├─ views/         Loading Login Lobby(A+C 真) Room(殼) lobby/ campaigns/ components/ room/runtime runtime/
   ├─ testing/       @toppath 替身、守門掃描
   ├─ tutorial/      core/ 可攜引擎 + 兩支佔位
   ├─ debug/         DevTools 頁面端
   └─ assets/        icon_loading.svg、emoji 圖集

環規則:views → game → integrations → platform,import 只准往內(eslint 擋);tutorial / debug / testing / assets 在環外。
真 vs 殼:工具鏈、platform、integrations、testing、登入旅程、domain、設定層、campaigns 總表是真的;
        Lobby 區塊 A + C 已落地(09-09 / 09-10);Room 畫面、房間 handler、bet store、注區、開獎演出、面板未建;幾何值標 TODO(colorgame)。`}</Code>

      <h2>資料夾作用</h2>
      <DataTable sections={FOLDERS} headers={['資料夾', '角色', '放什麼']} placeholder="搜尋資料夾、角色…" />

      <h2>每支檔案在做什麼</h2>
      <DataTable sections={FILES} headers={['檔案', '一句話', '說明 / 注意']} placeholder="搜尋檔名、用途、關鍵字(例如 gate、佔位、TODO)…" />

      <h2>怎麼用這張表</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>要改一個值先找它的單一真相</b>:設定欄位 → <code>integrations/config/fields.ts</code>;路徑 → <code>game/routes.ts</code>;房間幾何 → <code>views/room/runtime/roomGeometry.ts</code>(還有三個同步點);音效名單 → <code>game/sfx.ts</code>;載入分段 → <code>game/loadingMap.ts</code>。</li>
        <li><b>要加東西先問它屬於哪一環</b>:認識玩法規則 → <code>game/domain</code>;認識 SDK 協定 → <code>integrations</code>;兩者都不認識 → <code>platform</code>;有畫面 → <code>views</code>。跨環拿東西走接縫檔(<code>game/subGameGates.ts</code>、<code>platform/sound</code>、<code>platform/scheduleWhenIdle</code> 都是這種)。</li>
        <li><b>標「佔位」的檔不要當參考實作</b>:它們保留的是簽名與契約(<code>roomHandlers</code> 三個匯出、<code>RoomView</code> 的 setEntering),內容要照 <code>docs/plan/資料流與Store設計.md</code> 與 <code>../cg-client</code> 重做。</li>
        <li><b>閘門紅了先看是哪一道</b>:typecheck(本地唯一)→ eslint(分環 / 裸字串 / 裸 svg)→ vitest(替身、守門掃描)→ build(check-dist-paths / check-dist-preload)→ pre-commit(webp gate)。</li>
      </ul>
    </div>
  )
}
