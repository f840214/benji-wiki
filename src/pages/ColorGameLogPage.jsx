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
    date: '2026-09-10',
    title: '桌卡逐像素對稿:官方 Figma MCP 授權、room 偏移 1.47、標題改純文字逐字漸層、愛心照稿',
    branch: 'benji-dev(未 commit)',
    summary: [
      '官方 figma MCP 用 OAuth 授權成功(配額與 REST 分開),拿到 1:289 的 2× 截圖、metadata、整卡匯出與素材(愛心 on/idle SVG、桌號徽章底 SVG、觀看圖示 PNG);打到第 6 次就撞 View 席次上限。',
      '用 CDP 把 app 的 UJP 桌卡裁成 2× 圖,與 Figma 匯出圖做 50% 疊圖 + 左右拼接,逐像素比。',
      '找到系統性偏差:稿的元素都在 room 子框裡,room 相對卡片下移 2.95÷2=1.47px;之前全部掛在卡片根上,整批高 1.5px。改成 room 容器包住頂列/視訊/路書/底條。',
      '標題改成純文字:稿本來就是文字,ULTIMATE / SUPER / BONUS 逐字獨立漸層 + 描邊 + 落影(bg-clip-text),主句白漸層字,倍率紅字黃描邊;四變體座標各自照稿。文案走 t(),倍率是產品常數。',
      '愛心:on = 金色漸層圓 30 + 稿的心形 SVG(inset 20%/12.24%/10.55%/12%);idle = 稿整鈕 SVG 68(含陰影外溢)→ 34。',
      '限額改左錨 x=298.5、格式「5 - 100K」;觀看膠囊照稿:圖示 16.5 圓凸出膠囊上緣 1.65、文字 x 19.8。bonus 變體頂列藍底 #5DAAF1、限額 #2545B7。',
    ],
    decisions: [
      '使用者疊圖標了五處差異,我先前只比 bounding box 覺得「數字一樣」——差在座標基準(room 框)與字形來源(圖 vs 文字)。教訓:對稿要疊像素圖,不能只比框。',
      '標題從 Cocos 圖改回文字:稿是文字、可 i18n、字形跟稿一致;Cocos 的整條圖字形比稿大。底條字圖暫時保留。',
      'Tailwind 不會生成 runtime 拼出來的 class(text-[${fill}]、[text-shadow:…${shadow}]),100X 因此變黑字;動態顏色一律走 inline style(動態值是 inline style 的合法例外)。',
      '限額改成跟倍率同一列、靠右錨定(right 13):瀏覽器的 Luckiest Guy 比稿寬時,倍率變寬限額自動往左讓,不再壓到。',
      '觀看人數膠囊的 x 也是同一個基準錯(相對視訊框 11.38 當成相對卡片),修正後圖示與稿的重合。PLAY 鈕由 Cocos 圖換回稿的兩層圓 SVG(1:296 / 1:297)+ 文字;底條字描邊改金色(原棕色描邊讓字偏橘)。',
      '限額改成「稿的位置 + 被倍率推開」:限額以稿上倍率右緣到限額左緣的距離接在倍率後面(UJP 9.5 / 192x 39 / 108x 35.5 / bonus 8.5),字寬相同就落在稿的位置,倍率變寬才被推開。',
      '底條金字 SVG 版顏色最準,但使用者覺得 SVG 文字比 CSS 字軟(SVG 光柵化沒有字型 hinting),改回 CSS 三層:陰影層(透明字 + text-shadow)/ 後層(暗金漸層 + #E6930C 描邊 1.06 下移 1.15)/ 前層(亮金漸層 + #E6930C 描邊 0.47);描邊漸層 CSS 做不到,取主色。放大四倍看逐字彩字的 1.1px 硬陰影其實有畫出來,1× 螢幕上只有一個像素高。',
      '底條金字曾改成 inline SVG(LobbyStripText):使用者貼 Figma inspector 才看到描邊本身是漸層(#E6930C → #FEE9B4 → …),CSS text-stroke 只能單色所以一直對不上;SVG <text> 的 stroke 可以吃 gradient,兩層填色、描邊、y 位移全照稿值,漸層 id 用 useId 避免多卡互蓋。',
      '六色比例格：canvas 量到字的墨心比格中心高 1.8、水平 <0.1，pt-[4.6px] 推回正中；路書與比例面板的 x 改到稿值（100.27 / 275.0，欄距 4.18）；底條後層描邊回深棕（稿外框肉眼是深色，金色描邊會讓字偏橘）；Banner 鈕的輻射漸層範圍放大到 ellipse 90%×180%（Figma 的漸層 handle 比 CSS 預設 farthest-corner 大）。',
      '底條四種字(COLOR GAME SUPER WHEEL / JACKPOT / SUPER GAME WITH SPECIAL DICE / BONUS COLOR GAME)全部改成文字,與金額共用同一組雙層金色樣式(稿 1:697/1:698:後層暗金 + 棕描邊下移 1.15 當硬陰影,前層亮金 + 金描邊),Cocos 的底條字圖全部移除。',
    ],
    pitfalls: [
      'Figma 匯出的愛心 PNG 帶不透明底,壓縮腳本判成「不透明簡單圖」——匯 frame 要看有沒有背景填色,向量鈕直接拿 SVG。',
      'get_screenshot 的 original_width 含陰影外溢(838 vs 814),疊圖時要以外溢後的尺寸對齊,不然差 12px。',
      'MCP 授權後 whoami:自己的 team 是 Dev seat(Pro),但這份檔在公司 team 底下是 View seat,配額照檔案所屬 team 算,不是自己的席次。',
      'bg-clip-text 的漸層字不能用 text-shadow(Chrome 把陰影畫在漸層之上、字變暗),改 filter: drop-shadow 又把彩色字整個壓暗(使用者第二次截圖抓到)。最後解法:兩層文字——底層透明字只帶 text-shadow,上層漸層字不帶陰影。標題主句、ULTIMATE / SUPER / BONUS 字母、獎池金額全部改成這個做法。',
      '觀看人數膠囊的 y 我把「相對視訊框」的 102.25 當成相對卡片算,位置錯到徽章上面;稿是徽章在上、人數在視訊框最下面。metadata 的 locationRelativeToParent 是相對直接父層,不是相對卡片。',
      '用垂直分割線左右比對整頁時會覺得每列都差一點：稿的桌列是四張範例卡(UJP / bonus / 108x / 192x),其中 192x 那張高 337.33 不是 334,而 app 是 16 張真實桌照排序排,兩邊列與列本來就對不到同一張卡;要比只能一張卡對一張卡疊圖。',
      '逐字彩字的硬陰影(下移 1.1、無模糊)用透明字 + text-shadow 畫會被上層 0.75 描邊蓋掉幾乎看不見;底層改成陰影色實心字 + 同寬描邊再 translateY,陰影才露出來。',
      'SVGR 匯入的 SVG 有自己的 width/height 屬性,容器只給 inset 不給尺寸(size-auto)會用內建尺寸撐出去——愛心點下去變成佔半張卡;要給 size-full。',
    ],
    evidence: ['疊圖:標題四段文字、路書六欄、六色比例、時間條、底條、PLAY、觀看膠囊、桌號徽章與 Figma 匯出圖重合;剩視訊縮圖(預設圖 vs 稿的截圖)與底條字圖字形略異。typecheck / lint 0 warning / 404 tests / build 綠。'],
    todo: ['底條字改照稿文字(COLOR GAME SUPER WHEEL 等)、視訊預覽、BONUS 字母的高光遮罩層、108x / bonus 變體的疊圖驗證(dev 頻道有桌)。'],
    files: ['src/views/lobby/LobbyCardTitle.tsx', 'src/views/lobby/lobbyCardVariant.ts', 'src/views/lobby/LobbyTableCard.tsx', 'src/views/lobby/lobbyAssets.ts', 'src/assets/icons/icon_heart_on.svg', 'src/assets/icons/icon_favorite_idle.svg', 'public/assets/lobby/card/badge_room_id.svg', 'public/assets/lobby/card/icon_viewer.webp'],
  },
  {
    date: '2026-09-09',
    title: '桌卡對齊 Cocos 現版:愛心、玩法標題彩字、底條字圖、路書欄底與金框、視訊預設圖',
    branch: 'benji-dev(未 commit)',
    summary: [
      '使用者貼 Cocos 現版截圖:左上是愛心不是星星、標題是玩法名稱「SUPER WHEEL UP TO 192X」不是桌號、底條是「COLOR GAME SUPER WHEEL」、路書空格可見且最新一欄金框。',
      '素材來源改走 cg-client:ColorGameLobby/resources/room-list/ 本來就是 2× 正式圖(愛心 on/off、PLAY、四種玩法的標題彩字與底條字、路書欄底 ×2、預設視訊圖、桌號徽章底、觀看人數圖示、維護圖示),18 支母檔進 assets-raw/lobby/card/ 轉 WebP;Figma API 被鎖不再是阻礙。',
      'LobbyTableCard:標題與底條依 subType 換圖(doubleWheel / ultimateJackpotV4 / superDouble / bonusV2),沒對到的退回桌名文字;jackpot 桌 = JACKPOT 標籤圖 + 金額文字;限額格式改「5-100K」;維護時壓維護圖示。',
      'LobbyRoadStrip:六欄 = 最近五局 + 一欄留給下一局,最新一欄金框欄底(luzhu_bg_2),空格由欄底圖顯示。',
      'lobbyAssets 加 CARD_ASSET_URLS 十八支並登記進 LOBBY_ASSET_SETS,測試改成對照 Object.values。',
    ],
    decisions: [
      '標題與底條在舊版就是整條彩字圖(裝飾字),直接用圖、不走 i18n——這也是 figma-to-react skill 的「先確認是不是文字」原則:稿上看似文字的東西,產品裡是圖。',
      '同一份美術在 cg-client 已交付,就不從 Figma 重做:skill 的「稿與素材不一致先問誰的」第一條(美術已有匯出)。',
    ],
    pitfalls: [
      'eslint no-array-index-key 的 disable 註解放在 JSX 上一行,prettier 把 key 換行後註解就對不到行;改成把槽包成 { id, col } 物件用 id 當 key,不需要 disable。',
      'python 多段編輯腳本忘了 import re,前半段檔案已寫入、後半段沒跑——分段執行後要逐檔確認。',
    ],
    evidence: ['幾何與前一筆完全相同(卡 12.5,152.5 407×167 …);typecheck / lint 0 warning / 404 tests / build 綠。視訊預覽仍是預設圖,待接 VideoAdapter.previews。'],
    files: ['src/views/lobby/LobbyTableCard.tsx', 'src/views/lobby/LobbyRoadStrip.tsx', 'src/views/lobby/lobbyAssets.ts', 'src/views/lobby/lobbyAssets.test.ts', 'assets-raw/lobby/card/', 'public/assets/lobby/card/'],
  },
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
