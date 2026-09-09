import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

// Figma → React 完整流程筆記(nexus-colorgame-client 的 figma-to-react skill)。
// 資料來源:.claude/skills/figma-to-react/(SKILL.md + references/)、docs/資源規範與流程.md §二/§四/§七/§九、
// scripts/figma-export-assets.sh、.mcp.json。2026-09-09 以大廳稿 lobby_all-size node 1:153 實走一次整理。
// 相關頁:#/nexus-client(架構)、#/colorgame-dirs(逐檔)、#/pixi(Spine 邊界)。

const STAGES = [
['0 scope:先定範圍', [
  ['輸入來源優先序', 'Figma 連結(帶 node-id)> 截圖 + CSS/JSON > 只有截圖', '連結能讓 MCP 讀到 node 值;截圖只能目測,是最後手段。URL 的 node-id=1-153 要換成 1:153'],
  ['歸屬邊界', 'React+Tailwind / Spine / Pixi', '房間幾乎全是 DOM:按鈕、面板、注區、籌碼都是 React;荷官、派彩動畫走 Spine;Pixi 只承載 Spine,全房固定 2 張 canvas 不再加'],
  ['稿與素材不一致', '先問「誰的」再想修法', '三種主人:①美術已有新版匯出(最常見,先問有沒有新圖)②差異在 Spine 素材內部(退回美術或照收)③我們的(位置 / 縮放 / 文字 / timing)'],
  ['大面積漸層底板', '先試純 CSS 重繪', 'radial-gradient 疊 linear-gradient,一組參數吃多種寬度;擬合對 PNG 母檔(WebP 有損不能當基準)'],
  ['多區塊稿', '先列拆分計畫,問一次', '整頁稿要先切成元件級區塊、標 node、標誰先做,問「全做還是逐塊確認」一次就好'],
]],
['1 extract:取值', [
  ['MCP 呼叫紀律', '一個對話一次 get_figma_data', '只讀 URL 指的 node、不展開隱藏層、不倒 raw JSON、不用 comments / prototype 工具。回傳超 token 上限會落檔,用 grep / awk 抓需要的欄位'],
  ['原則 1 只有來源是值', '座標 / 尺寸 / 字型全從 node 值', '不從截圖目測,不從單一實例推規則'],
  ['原則 2 規則要解釋所有實例', '兄弟元素、各狀態、各比例都是實例', '16:9 / 20:9 / 21:9 / 4:3 每張都要對;有一個對不上就不是規則,可能是設計手調,那就交比較表'],
  ['原則 3 間距不均', '先假設固定欄位 / 固定錨點', '設計師常用固定欄對齊多行元素,看單行會誤判成 letter-spacing'],
  ['原則 4 字型樣式整組取', 'family / size / weight / color(含 alpha)/ letter-spacing / line-height', '缺 family 會靜默退回預設字;白色常是 90% 不是純白;沒 @fontsource import 的字重是假粗'],
  ['原則 5 換算基底', '每個 px ÷2(稿是 2×)', 'letter-spacing、border、shadow 也要除;em 對自己的 font-size 解析,縮小的元素要用自己的尺寸重算'],
  ['原則 6 節點層級', '取真正在畫的那層', '最外層 frame 可能是改版前的舊尺寸,或含選取發光的留白,都會捏造出差異'],
  ['原則 7 先確認是不是文字', '外框化向量 get_metadata 看不出來', '只有 get_design_context 會顯示成 <img src=…svg>;是圖就沒字型可對,幾何能轉、字形不能,一開始就講清楚'],
  ['例外:效果', '陰影 / 發光 / 半透明填色不套原則 1', 'SVG 匯出的大模糊 inner shadow 參數是錯的,CSS inset box-shadow 又是不同運算子,照抄必歪,要按 references/effects.md 擬合'],
]],
['2 design-spec:單一真相', [
  ['何時寫', '取值完立刻寫,建置前必須有', '之後的增量建置只讀這份檔,不再打 MCP'],
  ['必填表', '元件樹 / 間距表 / 字型樣式', '另有設計標記、互動狀態、色票、i18n key、資產清單、目標路徑'],
  ['內容規則', '沒有 TSX;全部是 ÷2 後的實際值', '推導出的版面規則寫成 spec(「數字置中在 0.431em 固定欄」),不寫推導過程;隱藏層不列;不列 Figma 資產 URL,只記落點與 placeholder'],
]],
['3 build:寫 TSX', [
  ['拆分', '>80 行或同樣式出現兩次就拆', 'XxxYyy.tsx(Layout / Header / Card / Button / Form / Table);大廳 views/lobby/、房間 views/room/、彈窗 views/popup/<domain>/、跨頁共用 components/;扁平檔,不做 barrel、不做每元件一資料夾'],
  ['i18n', 't({ id, defaultMessage })', 'key = <domain>.<ComponentName>.<element>,defaultMessage 英文字面值;runtime 資料(金額 / 倒數 / 局號)直接 render'],
  ['樣式', '無 inline style', '唯一例外是動態 CSS 變數 / runtime 值注入;動態 class 用樣板字串(沒裝 clsx);arbitrary value 直接 [..]'],
  ['寫入', '從 actions/ import use case', '元件不組 SDK 呼叫;onClick 抽成具名 handler'],
  ['disabled 三件套', 'disabled + aria-disabled + disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none', '缺一不可'],
  ['圖片 alt', '有意義的走 i18n;裝飾用 alt="" + aria-hidden', ''],
  ['絕不用 Tailwind 斷點', 'sm: / lg: 全 repo 0 使用,有測試守著', '房間幾何走 RWD 引擎(docs/RWD架構.md 決策樹);房外頁面是流式版面(flex / w-full / aspect-*)'],
  ['absolute', '只用在真的疊層', '要寫理由'],
  ['產出順序', '分析摘要 → 檔案結構 → i18n key 表 → 完整 .tsx → module.css(只在 §5 允許的情況)→ 整合說明', '整合說明:父層 import、props、store / actions 接線'],
]],
['4 verify:量測證據', [
  ['tsc', 'npx tsc --noEmit', '幾秒鐘,一定跑'],
  ['dev-server 量測', 'computed style / bounding box 逐項對回 design-spec', '不准看截圖目測;房間元件對 roomGeometry,其餘在 320 / 375 / 460;怎麼量是 preview-measurement skill'],
  ['先校準', 'document.fonts.check("<weight> <size> <family>")', '單獨 render 一個元件不會繼承整頁載的字型;字型 check 是 false 整場量測都無效'],
  ['字型抱怨比墨不比框', 'canvas measureText 的 actualBoundingBox*', 'align-items:center 對齊的是 line box 不是墨;letter-spacing 在最後一個字後多一單位,置中的負字距字串會偏半個字距,用等量 padding-inline-end 抵掉'],
  ['其他', '文字溢出 / 遮擋、三種互動狀態、缺 i18n key、Spine canvas 不擋 React 按鈕', ''],
  ['「對上了」的門檻', '元素 × 比例表,每格有數字(設計 / 量到 / 差值)', '沒量的寫「未量測」,不能省略;省略會讓「沒檢查」看起來像「檢查過沒問題」'],
]],
]

const ASSETS = [
['MCP 讀稿:三個 entry、兩套服務', [
  ['figma', '官方託管 HTTP,OAuth', '首選,功能最完整,不需桌面版;Claude Code /mcp → figma → Authenticate,一個 session 授權一次'],
  ['figma-desktop', '官方本機 127.0.0.1:3845', '讀「桌面版目前選取的節點」;要 App 開著 + Dev Mode(Shift+D)啟用 MCP server,App 關了就連不上'],
  ['figma-framelink', '第三方 stdio,Personal Access Token', '背景 / 自動化 agent 用,不需互動授權;token 填 .env.local 的 FIGMA_API_KEY(figd_ 開頭),server 自己讀檔,不進版控'],
  ['.mcp.json', '唯一該手改的名冊', 'Claude Code 直接讀;Cursor / Codex / Gemini / Antigravity 各自的格式由 npm run mcp:update(postinstall)生成,改生成物會被下次 install 蓋掉。工具只在啟動時讀一次,改完要重開 session'],
]],
['get_figma_data 拿到什麼', [
  ['節點樹', '座標 / 尺寸 / layout 模式 / 填色 / 描邊 / 效果 / 文字樣式', '不含圖片本體。2× 的稿回傳的就是 2× 數字'],
  ['點陣圖', '只給 imageRef 雜湊 + cropTransform', '要圖得另外下載;needsCropping=true 表示稿內有裁切'],
  ['向量圖', '標成 IMAGE-SVG 葉節點', '子層被摺疊,看不到 path;要圖也得另外下載'],
  ['GLOBAL_VARS / template', '重複的樣式抽成 fill_xxx / ts1 / EL-xxxx', '節點行只寫代號,要 grep 回定義段才知道值'],
  ['超 token 上限', '整段落檔到 tool-results/*.txt', '用 grep / awk 只印需要的欄位,不要整份讀進來(大廳一頁 2,574 行 / 135K 字元)'],
]],
['把圖抓下來:兩條路,同一顆 token', [
  ['download_figma_images(MCP)', 'framelink server 打 Figma images API,直接寫進 repo', '適合臨時看幾張;落點與命名即席,不可重現'],
  ['scripts/figma-export-assets.sh', 'curl 打同一支 REST API,節點與輸出路徑寫在 ASSETS 陣列', '專案標準路。副檔名決定格式:.svg / .png / .webp;跑一次整批重匯,換稿可重現。含 mask 的 SVG 在 simplify-stroke=true 會匯壞,該行尾加 |nosimplify'],
  ['Images API 沒有 WebP', 'PNG 母檔落 assets-raw/<area>/,再 npm run assets:compress 轉 WebP 到 public/assets/<area>/', 'PNG 落 public/ 會被 assets:check 擋'],
  ['落點判準(資源規範 §四 / §九)', '單色小 icon → src/assets/icons/ ?react;大型向量底板 → public/assets/<area>/ ?url;點陣 → WebP public/assets/<area>/', '單色 icon 下載後 fill/stroke 改 currentColor、viewBox 還原成設計上的固定格'],
  ['禁止', '把 Figma 資產 URL 或 base64 寫進程式碼', '文字節點一律 HTML 文字 + react-intl(裝飾字例外)'],
]],
]

const LESSONS = [
['實走大廳稿(node 1:153)學到的', [
  ['整頁稿先切五塊', '背景殼+頂欄+跑馬燈 / 標題+活動入口 / 桌卡四變體 / 頁尾切換列 / 捲軸', 'spec 先寫最底層那塊,其他掛在它上面;活動中心按鈕走 views/campaigns/ registry,不 import 進畫面'],
  ['字型先查有沒有', '稿用 Baloo / Baloo Bhaijaan / Luckiest Guy,專案只有 Inter + Barlow Condensed', 'npm view @fontsource/<name> version 確認有套件;Google Fonts 已把 Baloo 改版成 Baloo 2,字幅有差,要跟設計確認哪一版'],
  ['只量一張比例不算完成', '大廳檔另有 20:9 / 21:9 / 4:3 三張 frame', 'spec 明寫「其他比例未量測」,建置時再逐張對'],
  ['語意看不出來就對原生', '餘額膠囊右端的 icon、跑馬燈行為', '回 ../cg-client 的 bundle 看,不猜'],
  ['inner shadow 四層別照抄', '頭像的 inset 陰影', 'Figma inner shadow ≠ CSS inset box-shadow,按 effects.md 擬合'],
  ['稿是 2× 從頭到尾記得', '864×1536 → 432×768', '漸層 stop 的 % 不用除,px 全部除,包含 blur 半徑與 text-shadow'],
]],
]

export default function FigmaToReactPage() {
  return (
    <div>
      <h1>Figma → React</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        nexus client 把一份 Figma 稿變成 React 元件的標準流程(repo 裡的 <code>figma-to-react</code> skill)。
        核心是<b>先量、寫成 spec、再寫程式、最後拿數字驗證</b>,不是看著截圖直接刻。
        這頁記五個階段、MCP 與抓圖的兩條路,以及 2026-09-09 拿大廳稿實走一次的心得。
        架構全貌在 <a href="#/nexus-client">nexus client</a> 頁,資產格式與落點的權威是 repo 的 <code>docs/資源規範與流程.md</code>。
      </p>

      <h2>操作者視角:我要做一個元件,實際按什麼順序</h2>
      <Code>{`① 拿 node id
   Figma 選到那個 frame → 網址 ?node-id=1-153 → 貼整條連結給 agent(1-153 會被換成 1:153)
   前置:一次性的 .env.local FIGMA_API_KEY(或 /mcp 授權官方 figma)

② 讀稿 → design-spec.md(agent 做,你看)
   一次 get_figma_data;多區塊稿先給拆分計畫,你決定先做哪塊
   spec 出來先檢查:字型專案有沒有、哪些比例沒量、哪些語意要回 cg-client 對
   → 這一步結束後就不再碰 Figma,後面全部只看 spec

③ 抓圖(在寫 TSX 之前,因為 TSX 要 import 這些檔)
   spec 的 Asset list 每一行 → scripts/figma-export-assets.sh 的 ASSETS 陣列加一行
   bash scripts/figma-export-assets.sh → 圖落到指定路徑
   PNG 再 npm run assets:compress 轉 WebP;SVG icon 改 currentColor、還原 viewBox

④ 寫 TSX(agent 依 spec 寫)
   views/lobby/XxxYyy.tsx + i18n key + 接進父層;圖用 import x from '…svg?react' / '?url' 或 public URL

⑤ 驗證
   npm run typecheck → dev server 量 computed style 對回 spec → 元素 × 比例表
   npm run lint / test / build;assets:check 過`}</Code>

      <h2>匯入的圖去哪(資源規範 §九)</h2>
      <Code>{`圖的種類                    下載格式   落點                          程式裡怎麼用
單色小 icon(可換色)        .svg      src/assets/icons/<name>.svg    import Icon from '…/icon_x.svg?react' → <Icon className="text-[#F6E404]" />
多色 / 大型向量底板         .svg      public/assets/<area>/<name>.svg  URL 字串(經 subpath-deploy-paths 的 asset URL helper)
點陣(按鈕圖 / 背景 / 籌碼)  .png 母檔  assets-raw/<area>/<name>.png   不直接用;assets:compress 轉 →
  ↳ 轉出的 WebP             .webp     public/assets/<area>/<name>.webp  URL 字串;大廳登記進 views/lobby/lobbyAssets.ts 給 usePagePreload
Spine                       匯出檔    public/assets/spine/<name>/     <Spine skel atlas>(見 #/pixi)

規則:public/ 不准有 png(assets:check 擋);src/assets/ 只放走 bundler 的 svg;
     bare .svg / png / jpg import 被 lint 擋,一定帶 ?react 或 ?url;
     Figma 的 URL / base64 永遠不進程式碼。`}</Code>

      <h2>五個階段</h2>
      <Code>{`0 scope → 1 extract → 2 design-spec → 3 build → 4 verify

階段        產出                 過關條件
0 scope     歸屬 + 拆分計畫       React / Spine / Pixi 邊界標好;選定輸入來源
1 extract   一組帶出處的數值      七條取值原則都過;每個值指得到 node
2 spec      design-spec.md       必填表填滿、全是 ÷2 後的實際值;之後不再打 MCP
3 build     TSX(+ 資產)         只依 spec 寫;TSX 硬規則全過
4 verify    量測證據             tsc 綠 + dev-server computed style 逐項對回 spec`}</Code>

      <DataTable sections={STAGES} headers={['項目', '規則', '為什麼 / 怎麼做']} placeholder="搜尋階段、原則、規則…" />

      <h2>MCP 讀稿與抓圖</h2>
      <p className="text-muted mb-3 max-w-[62ch]">
        讀稿(節點資料)與抓圖(檔案本體)是兩件事:<code>get_figma_data</code> 只回節點樹,圖片只有參照;
        圖要另外經 Figma images API 下載,專案標準是走 <code>scripts/figma-export-assets.sh</code>。
      </p>
      <DataTable sections={ASSETS} headers={['東西', '是什麼', '注意']} placeholder="搜尋 MCP、腳本、落點…" />

      <h2>design-spec.md 的骨架</h2>
      <Code>{`# design-spec.md — <ComponentName>
來源:<file> node <id>;稿 2×,本文件數值已 ÷2;量了哪些比例、哪些未量測

## 拆分計畫(多區塊稿才有)     區塊 | node | 元件 | 狀態
## Component tree              縮排的偽 HTML,每行註 layout 模式與主要 Tailwind class
## Design marks                元素 | 尺寸/位置 | 背景 | 圓角 | 邊框 | 其他
## Spacing table               位置 | 值
## Text styles                 元素 | family | size | weight | color | letter-spacing | line-height | overflow
## Interaction states          元素 | hover | active | disabled
## Colour tokens               用途 | 值
## i18n keys                   key | defaultMessage(英文)| 備註(已在表裡的沿用舊名)
## Asset list                  name | figmaNodeId | format | placement | placeholder
## Target paths
## 備註 / 建置前必須解決        字型缺哪些、哪些比例沒量、哪些語意要對原生`}</Code>

      <h2>抓圖的實際指令</h2>
      <Code>{`# .env.local(gitignored)
FIGMA_API_KEY=figd_xxxxxxxx           # framelink MCP 與 export 腳本共用;沒有 VITE_ 前綴是故意的,帶前綴會被打進 bundle
VITE_FIGMA_FILE_KEY=GDKlKfyqIwbQUMguc26yci   # 大廳稿 lobby_all-size;房間 / 面板 / 注區稿待交付

# scripts/figma-export-assets.sh 的 ASSETS 陣列,一行一張
"1:200|src/assets/icons/icon_message.svg"          # 單色 icon → SVGR ?react,下載後 currentColor 化
"1:160|public/assets/lobby/lobby_header_ribbon.svg" # 大型向量底板 → URL
"1:176|assets-raw/lobby/btn_home.png"               # 點陣母檔 → 之後 assets:compress 轉 WebP
"71:9590|src/assets/icons/icon_change_bet.svg|nosimplify"   # 含 mask 的 SVG 匯壞時加第三欄

bash scripts/figma-export-assets.sh      # 整批重匯
npm run assets:compress                  # PNG → WebP 到 public/assets/<area>/
npm run assets:svgo                      # SVG 壓縮(commit 前)
npm run assets:check                     # 閘門:public/ 不准有 png、SVG 要壓過`}</Code>

      <DataTable sections={LESSONS} headers={['教訓', '情境', '做法']} placeholder="搜尋…" />

      <h2>相關 skill 分工</h2>
      <Code>{`figma-to-react        本頁:流程、取值原則、spec、TSX 硬規則、驗收門檻
figma-2x-scale        ÷2 規則與常漏的地方(letter-spacing / border / shadow / 字重)
rwd-layout            任何隨螢幕變的值該走哪個軸、引擎 API;禁 Tailwind 斷點
preview-measurement   怎麼量 dev-server 上的東西(iframe probe、背景分頁陷阱、pixel harness)
asset-import-policy   svg ?react / ?url、png → webp、Spine / .fnt 交付
cocos-parity-porting  行為對照 ../cg-client;稿看不出語意時回原生找`}</Code>
    </div>
  )
}
