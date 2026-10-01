import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'
import { DIRS_GAME } from '../data/dirsGame.js'
import { DIRS_VIEWS } from '../data/dirsViews.js'

// nexus-colorgame-client 逐資料夾、逐檔案說明(2026-10-01 重整)。src/ 底下的逐檔列在 src/data/dirs*.js(從各檔檔頭 JSDoc 整理),
// 根目錄 / scripts / deploy / dev / docs / public 的列寫在本檔。檔名後標「+test」代表旁邊有同名 .test 檔。
// 架構與資料流不在這頁,看 #/colorgame-arch。

const FOLDERS = [
['根目錄與工具鏈', [
  ['/', '專案根', 'CLAUDE.md(= AGENTS.md,agent 工作契約)、README、MEMORY(專案歷史與待辦)、三個 html 入口、vite / vitest / eslint / tsconfig / svgo 設定'],
  ['scripts/', 'npm script 本體', 'setup / dev / sync 建構鏈、check gate、圖檔管線、fx/(spine → CSS 匯出)、Figma 匯出、skill 與 MCP 連結、載入排查'],
  ['deploy/', '部署', '三環境(DEV / 239 staging / product)的 Jenkinsfile 與 shell、Lark 通知;手冊在 deploy/README.md'],
  ['dev/', 'dev 工具殼(獨立 entry dev.html)', '零專案耦合的框架 + tools/ 註冊表:注區、面板、彈窗、fx 播放器各一個工具,?canvas=<id> 直開;production build 不含'],
  ['docs/', '中文文件', '規範本體、設計理由、RWD、多玩法架構、遊戲規格、資源流程、教學系統;plan/ 放有壽命的計畫書(各房間設計規格),archive/ 封存'],
  ['team-skills/', 'agent skills', '專案 skill,postinstall 連進 .claude / .cursor / .agents;game-client-sync 底下有 base-manifest 與 base-diff'],
  ['public/', '不經 bundle 的靜態檔', 'project.json / coreProject.json;assets/ 的 runtime 資源:audio/、chips/、room/<玩法>/、spine/、lobby/、loading'],
  ['assets-raw/', '圖檔與骨架母檔', 'PNG 母檔(assets:compress 轉 webp)、spine/(4.3 重匯出)、cocos-spine/(3.8 不重匯)、fx-parsed/(fx:gen 產物)'],
]],
['src/ 四個環(import 只准往內)', [
  ['src/platform/', '最內環:零遊戲知識、零 SDK', 'rwd 引擎、i18n 橋、uiManager、sceneManager、sound、loading、state、storage、dom、surfaces、assetLoading、redDot、video 取樣'],
  ['src/integrations/', '外部系統:認識協定、不認識玩法', 'config(設定管線)、elog(埋點)、sdk(SdkAdapter + queries)、video(VideoAdapter)、host(宿主 postMessage)、replayUrl'],
  ['src/game/', '遊戲領域', 'domain(純函式知識與判讀,全部有測試)、store(Zustand)、actions(玩家寫入)、handlers(server 鏡像)、hooks(畫面讀)、redDot;根層 loadingMap / routes / sfx / assetScheduler / subGameGates / tableProfile'],
  ['src/views/', '畫面(React + Tailwind)', 'Loading / Login / Lobby / Room 四頁;lobby/(大廳元件 + fx)、room/(RoomFrame、runtime、shared 共用件、rooms/<流程>、skins/)、popup/<domain>/(十一組面板)、components/(跨頁小件 + fx 產物)、campaigns/(活動總表 + tripleBonus/)、runtime/(Pixi 啟動點)、system-ui/(Toast / Modal / Loading)'],
]],
['src/ 環外的橫切關注', [
  ['src/testing/', '只給 vitest 用', '@toppath 替身 stub、toppathAbsentGuard、moduleGraphScan 與 surfaceRegistryGates 守門、classLength 類名換算'],
  ['src/tutorial/', '新手教學', 'core/ 可攜引擎(不認識遊戲);根層兩支是佔位'],
  ['src/debug/', 'DevTools 頁面端(DEV / staging 才載)', 'devConsole 薄 config、事件 log、各玩法與系統的測試指令(__GAME_DEVTOOLS__.run)、效能 overlay、資產抓漏'],
  ['src/assets/', 'bundled 資源', 'icons/(svg ?react / ?url)、images/emoji 圖集、fonts/(自託管 Luckiest Guy + 度量覆寫)'],
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
...DIRS_GAME,
...DIRS_VIEWS,
]

export default function ColorGameDirsPage() {
  return (
    <div>
      <h1>colorgame 目錄清單</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        <code>nexus-colorgame-client</code> 每個資料夾放什麼、每支檔案在做什麼(2026-10-01 從各檔檔頭重整)。
        架構與資料流看 <a href="#/colorgame-arch">colorgame 架構</a>。點第一欄可複製檔名;搜尋框能搜中文說明;籤片可只看一個資料夾。
      </p>

      <h2>先看全貌</h2>
      <Code>{`nexus-colorgame-client/
├─ CLAUDE.md(=AGENTS.md) README.md MEMORY.md          契約 / 上手 / 歷史與待辦
├─ index.html  dev.html  cp-host.html                  正式入口 / dev 工具入口 / 宿主模擬器
├─ scripts/     setup / dev / sync、check gate、圖檔管線、fx/(spine → CSS)、Figma 匯出
├─ deploy/      三環境 Jenkinsfile + sh、Lark 通知
├─ dev/         dev 工具殼(framework/ + tools/:注區、面板、彈窗、fx 播放器)
├─ docs/        規範 / 決策 / RWD / 多玩法架構 / 遊戲規格 / 資源;plan/ 各房間設計規格;archive/
├─ team-skills/ agent skill(含 game-client-sync 的 base-manifest)
├─ public/      project.json coreProject.json  assets/(audio chips room/<玩法> spine lobby loading)
├─ assets-raw/  PNG 母檔、spine/(4.3)、cocos-spine/(3.8)、fx-parsed/
└─ src/
   ├─ main.tsx App.tsx index.css                       bootstrap / 路由 / Tailwind 入口
   ├─ platform/      rwd i18n uiManager sceneManager sound loading state storage dom surfaces assetLoading redDot video
   ├─ integrations/  config elog sdk(+queries) video host replayUrl
   ├─ game/          domain(35 支) store(4 顆) actions handlers(global 6 / room 2) hooks(41 支) redDot
   ├─ views/         Loading Login Lobby Room;lobby/ room/(runtime shared rooms/* skins/*) popup/* components/(+fx) campaigns/ runtime/ system-ui/
   ├─ testing/       @toppath 替身、守門掃描
   ├─ tutorial/      core/ 可攜引擎 + 兩支佔位
   ├─ debug/         DevTools 頁面端(__GAME_DEVTOOLS__)
   └─ assets/        icons、emoji 圖集、fonts

環規則:views → game → integrations → platform,import 只准往內(eslint 擋);tutorial / debug / testing / assets 在環外。
現況:四支玩法房(192x / 108x / 500x / UJP)、大廳、十一組面板都是真的;活動層只有 Triple Bonus 的資料層;
     LushuStrip 路書列與 ChatBar 還是靜態殼;roomRatioSpec 的 dialogTop 仍是 Cocos 推算值。`}</Code>

      <h2>資料夾作用</h2>
      <DataTable sections={FOLDERS} headers={['資料夾', '角色', '放什麼']} placeholder="搜尋資料夾、角色…" />

      <h2>每支檔案在做什麼</h2>
      <DataTable sections={FILES} headers={['檔案', '一句話', '說明 / 注意']} placeholder="搜尋檔名、用途、關鍵字(例如 gate、佔位、slot)…" />

      <h2>怎麼用這張表</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>要改一個值先找它的單一真相</b>:設定欄位 → <code>integrations/config/fields.ts</code>;路徑 → <code>game/routes.ts</code>;房間幾何 → <code>views/room/runtime/roomGeometry.ts</code>(還有三個同步點);音效名單 → <code>game/sfx.ts</code>;籌碼階梯 → <code>views/room/runtime/chips.ts</code>;活動 → <code>views/campaigns/registry.ts</code>。</li>
        <li><b>要加東西先問它屬於哪一環</b>:認識玩法規則 → <code>game/domain</code>;認識 SDK 協定 → <code>integrations</code>;兩者都不認識 → <code>platform</code>;有畫面 → <code>views</code>。</li>
        <li><b>共用檔先問再改</b>:<code>views/room/RoomFrame.tsx</code>、<code>roomGeometry.ts</code>、<code>index.css</code>、store、handler、<code>views/room/shared/</code> 會動到每一桌;base-manifest 裡的檔(config、platform)改完要重產 manifest。</li>
        <li><b>閘門紅了先看是哪一道</b>:typecheck(本地唯一)→ eslint(分環 / 裸字串 / 裸 svg)→ vitest(替身、守門掃描、screenAnchorUnits 的裸 px)→ build(check-dist-paths / check-dist-preload)→ pre-commit(webp gate)。</li>
      </ul>
    </div>
  )
}
