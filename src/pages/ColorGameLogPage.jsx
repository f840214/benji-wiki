import { useState } from 'react'
import Code from '../components/Code.jsx'

// nexus-colorgame-client 製作歷程:一筆一個工作段落,最新在最上面。
// 加新紀錄:在 ENTRIES 最前面加一個物件就好,欄位都可省略(空的不會畫出來)。
//   topic    分頁：'500x'＝500x 房間 tab；省略＝大廳／共用（歷程 tab）
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
    date: '2026-09-17',
    topic: '500x',
    title: '500x 停注後：注區只縮不藏（shrunk 三態）、電子倍率翻牌、命中高亮與壓暗',
    branch: 'benji-dev(未 commit)',
    summary: [
      '使用者要求「只要會動到其他桌的都先問我」；先讀多玩法架構 md §6.1／§6.5——boardClosed: shrunk 本來就寫著「500x 給 shrunk、落地時再開」，確認後才動四個共用檔（全是加法）：types.ts 的 BoardClosedMode／BoardState 加 shrunk；boardState.ts 只改註解；index.css 加 @custom-variant board-shrunk（做法同 board-hidden）與 bonus-tag-pop keyframe；roomGeometry 共用表的賠率列／籌碼列／路書加 board-shrunk:hidden，bonus 專屬表加 BONUS_STACK 資料版 + 字面版的 shrunk 位置（按鈕列 bottom 463 → 281、視訊帶下緣洞 448 → 266、注區洞 bottom 215.6 → 35.1 並 scale 0.84 origin-top：縮完 350×196、頂 499.9、底 695.6 對稿 696）。標準版面永遠不進 shrunk，192x／108x／UJP 行為不變，測試釘住。',
      '稿：CG_RWD 105:184193（電子抽取加乘倍率）、105:185987（面板縮小）、105:187785（縮小中獎）。cg-client 三支規則合成純函式 rooms/bonus/bonusCellView：betting／closed／cancelled 不畫；停注未開：有 rateDetail[注型] 翻一般樣式標（組合注顆數固定 2／3、色＝bonusColor；六色顆數＝matchColors、色＝自己）、沒下注壓暗、組合注格點亮 bonusColor 那一框其餘壓暗；開完三顆：evaluateBetType.hasRateBonus 的格留派彩樣式標、其餘收掉，壓暗＝不是「有下注且中獎」，組合注型態符合就點亮開獎重複色。+7 測試。',
      'BonusRateTag：一般樣式金框膠囊（radial #7D7747→#191407、內陰影、金邊用兩層 box-shadow 擬合、上緣白高光、示意骰 + Luckiest Guy 漸層字）兩個尺寸 lg 120×35.4／sm 79.8×23.5；派彩樣式只有漸層字 + 描邊（兩層字疊）。BonusBoard 讀 useGameStore 的 phase／srcResults／rateDetail／roundCode 與 useBetStore.confirmedBets，每格套 bonusCellView：標的位置（組合注格左 +22.6／頂 −18.5、六色置中／頂 −1.1）、黑 40% 壓暗層、示意骰框改成各色深底漸層、點亮框 1.18 倍亮邊 #67F66B 其餘 0.55；翻牌 0 → 1.15 → 0.95 → 1（0.4s）依 807 → 808（+0.2s）→ 六色（各 +0.1s）延遲，以局號 key 每局重播。',
      '使用者看實機後三條修正：(1) 得獎歷史鈕先拿掉（BonusBandTop 只留倒數圈）；(2) 500x 沒有收合鈕與 BET 膠囊——共用件 BandButtons 兩顆加 [[data-layout=bonus]_&]:hidden，只認 token；(3) 組合注格顏色：重讀稿 105:180123，開局就是彩虹角度漸層 95%（之前記成藍底是量錯），停注後沒下注換暗版 60% 疊亮版 40%（105:184330），黑 40% 壓暗只留六色格。',
      '停注後改成兩段收合（使用者：時間到先跳到底下沒籌碼的位置、翻完倍率再縮一次；cg-client prefab CGBonusBetAreaStateController 三態 CLOSE/OPEN/BETSTOP：注區 y −420/−87.5/−390、scale .85/1/1，按鈕列 tween 0.5 linear）：BoardState 加第四個值 lowered（只能由房間經 RoomFrame.boardState 覆寫給，resolveBoardState 不算它）、index.css 加 board-lowered variant、BONUS_STACK 加 bottomLowered（注區 71.5＝頂 463.5、按鈕列 322.5、下緣洞 307.5）、共用表三帶加 board-lowered:hidden；只有 shrunk 態的 class 帶 0.5s linear 的 transition（使用者再修正：停注是直接跳到下面，翻完才縮過去；開局也直接跳）。useBoardLowered：只有掛著時看到 betting → dealing 才進，明細到了 1.4s（最後一格延遲 800 + 翻出 400 + 收尾 200）、等不到最多 1.5s，換局或離開 dealing 立刻退。BonusRoom 測試用假時鐘驗 lowered → shrunk → open。',
      '再換一份副本 aeKB2bpsQ0XqPaUDZXZGBR（設計把面板縮小 226:60146／縮小中獎 252:42790／資訊清空 252:80871／you win 等狀態重畫）：逐一對過——縮小態 0.84 置中頂 501、標 485.5、按鈕 457、得獎歷史 426；資訊清空態六色 info 全 HIDDEN、組合注沒有標題列（跟我停注藏資訊的做法一致）；縮小中獎 3X 在格頂置中；4:3 的縮小／翻倍率態（226:59590／105:185536）用「洞寬百分比 + 0.84 以頂邊中央縮」算出來相符。唯一補的：壓暗格上的籌碼 70%（chip op 0.70，cg-client _setBetChipOpacity 150/255），BonusChipStack 加 dim。稿的縮小中獎態組合注格沒畫基本賠率字，仍照 cg-client OddLabelGroup 出 1X／25X（使用者給的實機參考圖有）。',
      '4:3（2026-09-21，使用者：注區沒跟著變寬；新副本 iQPk0OXbLthIpssK9ZjrrF，4:3 基本畫面 226:46337）：洞在寬框變寬（555.3），稿上八格橫向等比拉寬、高度不變（六色寬 181.7、組合注 274.7／273.3）。BonusBoard 橫向幾何改成洞寬百分比（P()，分母 416.5），六色籌碼置中、組合注籌碼與派彩字改貼右（right 定位）；用百分比算 4:3 逐一相符（<0.5）。順手修：bonus 表的按鈕列內距 5.382% → 2.894%（500x 稿 12.5／432，4:3 16.7／576 同值），之前抄了 192x 的值。',
      '500x 籌碼（使用者：不飛、直接顯示、金額在籌碼上）：cg-client 是 ChipStackCompFlat + ChipForStackIconFlat——一顆正圓籌碼、圖依總額挑階梯、金額印在籌碼中央深色膠囊、加注 0.1s 上 5 → 0.2s bounce 回（不飛）；稿 105:184364 同。新 rooms/bonus/BonusChipStack（用 runtime/chips 的 chipTierOfTotal／chipTierImage、formatAmount 千分位、WAAPI 彈跳），換掉共用 BetCellSelfBet；位置：組合注格 (178, 46)、六色格 (68, 36.6)。倍率標一連串修正：SIZES 改名 combo／color、寬度貼內容（minW + padX）、字兩層陰影（#610014 模糊 + #B6721E 硬影）、拿掉 text-box-trim 改用行框頂≈大寫字頂（bg-clip 會切到探出行框的「3」）、字身層上下補 0.12em 畫布、示意骰去白邊、點亮框改該色亮邊 + 1.1 倍、六色欄距取整 2.5。',
      '下注接線（使用者：「現在好像無法下注」——master 已把 192x 的注區接上，500x 不能再是靜態殼）：BonusBoard 改成逐格元件（hook 不能在 map 裡叫），照 shared/BetBoard 的接法——點格 actions/bet.addBet（八格同一條通道）、useTableBet／useBetUserCount 讀全桌注額人數、共用 BetCellSelfBet 畫自注籌碼堆與飛行（組合注格放在格右側 106 寬的框裡讓籌碼落在稿的 x 153；飛行起點借 3×2 格序 0／2）、BetDecisionPopover 掛在注區根上、locked 只管外觀。沒動任何共用檔。',
      '派彩字（使用者：「1x 跟上面兩個任同的倍數沒出來」，貼了 cg-client 參考圖）：掃 cg-client——500x 注區也走 ColorGameBetArea，派彩時 OddLabelGroup 對每格出基本賠率字（六色＝同色顆數 1X／2X／3X、Any Double 1X、Any Triple 25X），電子倍率命中的格 childNode.active=false 改由 BonusRateItem 的 Payout 節點出電子倍率；prefab 量到兩者是同一個點（六色格置中、大寫中心距格頂 7；組合注格右上 x 176／179、y 9.1）。實作：bonusCellView 加 odds（沿用 master 的 domain/odds.resolveBetOutcome，bonusV2 分支本來就對），BonusBoard 在派彩字位用共用 WinRateText 畫電子倍率或基本賠率，BonusRateTag 只剩停注膠囊。字級取稿 105:187999 的 21.25（prefab 是 10.8，外觀以稿為準）。',
      '拉 master 後（2026-09-18）：唯一衝突 RoomFrame——取 master 的 isBoardLocked(phase, boardState) 加我的 ROOM_POS_BY_LAYOUT 查表；master 新增「測試不得觸達 @toppath 真件」閘門與 PayoutPanel，BonusRoom.test 補 usePayoutResult 替身。master 也加了共用倒數 RoundCountdown（RoomFrame 固定掛、位置在 STACK.countdown），500x 因此出現兩個倒數圈（使用者截圖）：拿掉 BonusBandTop 自己畫的那顆，bonus 表加 countdown 位置（稿 105:180426 頂 259.5、直徑 61 → bottom 447.5；標準版 475.5），BonusBandTop 現在是空洞留給得獎歷史鈕。',
      '實機（dev 渠道 CGD19A 是 500x 桌）：payout 相位 data-board=shrunk、注區 349.4×195.7、距底 72.4、視訊帶下緣洞距底 266，全對稿；該局結果紅二同、rateDetail 只有白三同 10X → 沒有標、全格壓暗、Double 的紅框點亮，符合規則。',
    ],
    decisions: [
      '先前「停注直接 shrunk」的分歧已被使用者否決，改回兩段（見 summary）；多玩法架構 §6.1 註記第四態。',
      '翻牌音效 bonus500xFlipCard 與 frame_dice_in Spine 未接（名單／4.3 重匯未到）。',
      'lint 的 check-doc-links 紅是 MEMORY.md 裡別人的 8 條 design-spec-*.md 失效路徑，不是這次的。',
    ],
    evidence: ['typecheck 0、eslint 0 warning、全量 1094 tests 綠；瀏覽器實量見 summary。'],
    todo: ['等實桌走到 dealing 看翻牌動畫與標的位置', '派彩層：YOU WIN／未中獎、Top3 高倍率中獎榜（V2 欄位對調）', '下注接線等別人那條完成後把 BonusBoard 的八格接 addBet、籌碼堆', '20:9／21:9／4:3 對稿', 'Spine（開彩氛圍、小怪物、翻牌）等美術 4.3 重匯'],
    files: ['src/views/room/types.ts', 'src/views/room/boardState.ts', 'src/views/room/boardState.test.ts', 'src/index.css', 'src/views/room/runtime/roomGeometry.ts', 'src/views/room/runtime/roomGeometry.test.ts', 'src/views/room/rooms/bonus/BonusRoom.tsx', 'src/views/room/rooms/bonus/BonusBoard.tsx', 'src/views/room/rooms/bonus/BonusRateTag.tsx', 'src/views/room/rooms/bonus/bonusCellView.ts', 'src/views/room/rooms/bonus/bonusCellView.test.ts', 'src/views/room/rooms/bonus/BonusRoom.test.tsx', 'docs/plan/500x房間設計規格.md'],
  },
  {
    date: '2026-09-17',
    topic: '500x',
    title: '500x 房間骨架：bonus 流程、八格注區、倒數圈與得獎歷史鈕（靜態殼，不碰下注線）',
    branch: 'benji-dev(未 commit)',
    summary: [
      '掃 cg-client：bonusV1／bonusV2 共用 ColorGameBonusRoomView（多處註解「兩個僅出現的倍率不同」），差異只有倍率數字、高倍中獎榜 V2 三欄對調、規則頁。500x 專屬：8 格注區（六色 + 807 anyDouble / 808 anyTriple 走一般下注通道）、BonusRateGroup 停注後依 round.rateDetail 逐格翻電子倍率（807→808 間隔 0.2s）、ColorGameBonusUtil.getBonusDetail 判中獎（matchColors 2/3 同 + bonusColor）、派彩 PayoutBonusV1 / PayoutRank。',
      '本專案房間現況：RoomFrame 六個洞、四比例幾何、進房載入鏈、GameHandler、192x 橫幅與倍率揭示都通；shared 十一件是靜態殼，BetBoard 六格 disabled 不送 ADD_BET；profile 只有 doubleWheel。下注 pipeline 的 game 層（actions/bet、BetHandler、useBetStore、ChipRow）其實已在，缺的是 BetBoard／SelfBetSummary／確認鈕接線——使用者說那條別人在做、不碰。',
      '拿到 500x 稿 CG_RWD (Copy) ud0q7CoQ3LAkmqTXq5i00P：13 個狀態 × 4 比例；16:9 基本畫面 105:179853。量出與 192x 的差異只有三個洞：沒有橫幅（洞改放倒數圈 + 得獎歷史鈕，y 244–320）、按鈕列 top 275、注區 233 高八格；賠率列／籌碼列／路書／聊天／底列同位。',
      '實作：subTypeProfile 加 bonusV2 → { flow: bonus, skin: wheelClassic, board: sixColorPlusPairs }；roundFlow 加 bonus（COMMON）；useGameStore 加 rateDetail（IRoundSnapshot 可省略，其他人的 debug 指令不用改）、GameHandler 整份重讀順手帶；types LayoutVariant 加 bonus；roomGeometry 加 ROOM_POS_BY_LAYOUT（bonus 只覆寫 bandButtons / banner / board 三格，標準版原表不動、既有幾何測試照過）；RoomFrame 依 layout 查表。rooms/bonus：BonusRoom（layout bonus、topBanner 洞放 BonusBandTop、board 放 BonusBoard）、BonusBoard（兩格組合注：conic 彩虹邊 + 藍漸層底 + 標題／金額人數／兩列示意骰；六色沿用 BET_CELL，全部 disabled 靜態殼）、BonusBandTop（倒數圈 conic 環吃 useTableCountdown、得獎歷史鈕圖示匯出 winner_history.webp + 字）、assets、測試 3 條。',
    ],
    decisions: [
      '注區非 betting 相位先沿用「藏起來」；稿與架構文件的 shrunk（只縮不藏、上面翻倍率）留下一輪，要連 roomGeometry 的 shrunk 字面 class 一起做。',
      '共用檔只碰了三處加法：useGameStore / GameHandler 的 rateDetail、roomGeometry 的第二張洞表、RoomFrame 查表；BetBoard、bet actions、BetHandler、ChipRow 都沒動。',
    ],
    evidence: ['typecheck 0、lint 綠、全量 1071 tests、build 首屏預載閘門綠（rooms 仍 lazy）。實機未看（要有 bonusV2 桌的渠道）。'],
    todo: ['注區 shrunk 態與電子倍率翻牌（rateDetail）、命中高亮', '派彩層：YOU WIN／未中獎、Top3 高倍率中獎榜（V2 欄位對調）', '下注接線等別人那條完成後把 BonusBoard 的八格接 addBet', '20:9／21:9／4:3 對稿', 'Spine（開彩氛圍、小怪物、翻牌）等美術 4.3 重匯'],
    files: ['docs/plan/500x房間設計規格.md', 'src/game/domain/subTypeProfile.ts', 'src/game/domain/roundFlow.ts', 'src/game/store/useGameStore.ts', 'src/game/handlers/room/GameHandler.ts', 'src/views/room/types.ts', 'src/views/room/runtime/roomGeometry.ts', 'src/views/room/RoomFrame.tsx', 'src/views/room/rooms/index.ts', 'src/views/room/rooms/bonus/BonusRoom.tsx', 'src/views/room/rooms/bonus/BonusBoard.tsx', 'src/views/room/rooms/bonus/BonusBandTop.tsx', 'src/views/room/rooms/bonus/assets.ts', 'src/views/room/rooms/bonus/BonusRoom.test.tsx', 'public/assets/room/bonus/winner_history.webp'],
  },
  {
    date: '2026-09-16',
    title: '跑馬燈接 SDK、廣告彈窗、UJP 獎池與滾輪、維護桌對稿、大廳雜修',
    branch: 'benji-dev(未 commit)',
    summary: [
      '跑馬燈（對照 cg-client ColorGameMarquee）：useMarqueeList 訂 SDK MarqueeList.REFRESH_LIST 讀 displayDatas（SDK 已依大廳／房內、tableType、時間窗過濾並依 weight 排序；未來 24h 內會開的由 SDK 排 timeout）。輪播規則抽成純函式 marqueeQueue（未讀優先、插回已讀表時照清單位次、後台更新不打斷正在捲的那一則、目前那則被撤就退到已讀表尾）+4 測試。LobbyMessageBar 改成「捲一次、animationend 回報」，速度＝後台 scrollSpeed（整段捲過視窗的毫秒）→ 視窗寬 ÷ 秒，沒填 40 px/s；一則捲完 LobbyView 停 2s 換下一則；整條膠囊可點，actions/marquee.openMarquee：埋點 Lobby.Marquee（外連帶 url、進桌帶桌號／局號／主注型最小注、其餘只 name+balance），預設公告不跳轉，enableRedirect 才看 targetTable → url，兩者皆空跳活動中心 News（未接，先記錄）。',
      '廣告彈窗（對照 cg-client LobbyAdPopup + NavigationHandler.openLobbyAdPopup）：useAdPopup 每工作階段第一次進大廳 emit GET_H5_POP_UP（GTS specInfo.getH5PopUp，callback 回清單），挑「時間窗內、tableType 31、id 最大」一則；useUiStore.adPopupDone 記已彈過，從房間回來不再彈。LobbyAdPopup：圖載好才連遮罩一起出現，停 popUpDuration 秒（沒填 5）後 0.5s 淡出縮小收掉，收掉送 Lobby.LuckyTriplePopup { time }（名字沿用舊版）。舊版沒有點擊關閉／點圖跳轉，這裡也不加；舊版收掉時飛向 BANNER 鈕，這裡用縮小代替。稿上沒畫這個彈窗，尺寸先取舞台寬 90% 置中，等設計補稿。',
    ],
    decisions: [
      'UJP 桌卡獎池金額抓錯（使用者）：cg-client TableJackpotUltimateAmount 是 ultimate + major + mini 三段相加、各段先無條件捨去到小數 2 位，PAYOUT 中若該局有預扣（round.getWithholdingJackpotAmount）該段先用預扣值鎖住；我們原本只取 grand／ultimate 第一個有值的。lobbyCardData.readJackpot 依 subType 分：UJP 三段相加、其餘 grand；useLobbyCardLive 多訂 JACKPOT_BALL_PAYOUT。',
      '金額變動要有滾輪（使用者：「齒輪效果」，cg-client LabelRollerComponent）：新元件 components/RollingText——每個數字位是 1.2em 高的 overflow-hidden 盒，裡面 0–9 兩輪 20 列直條，translateY 定位；變動時 WAAPI 從舊列滾到新列（變大往上、變小往下，往下從 old+10 起算不露底），每列 120ms、每往左一位多 8%（cg-client speed/8/位數 的位差）。LobbyStripText 加 roll prop，三層同字各一份滾輪同時動；父層 background-clip: text 漸層照常有效。位數變了直接換內容不滾。',
      '跑馬燈：去按鈕音（data-no-sfx）、字 700、真資料到時不先播預設字、文字 top 80% → 90%、換則間隔 2s → 0.5s（下一則從右緣外捲進來本身就要 6s）。banner：多張時 setPointerCapture 讓 click 落不到圖片按鈕，改在 pointerup 沒滑動就當點擊；頁點疊進圖片內距下緣 4；回大廳不重播展開（useAdBanners 初值同步讀 SDK）；進桌前 canEnterTargetTable 守衛（桌存在且不維護，cg-client moveToTargetGameRoom 同）。頂欄：膠囊描邊改 inset shadow、列頂 6.8 → 7、opacity 0.9 烤進顏色 alpha（去鋸齒三步）、暱稱不轉大寫（稿 UPPER，Cocos 顯示 Tourist）。',
      '時間條中途進大廳會從滿的開始快跑（使用者回報）：useTableCountdown 的分母原本是「第一次讀到的剩餘毫秒」，改成本局 round.betSec + applyOverTotalSec（cg-client CircularTimer totalTime、SDK getBetLastTime 同一公式），betSec 缺值才退回舊法。',
      'banner 開時位置與推移量（使用者拿 cg-client 並排：廣告太低、列表推太下；沒有 BANNER 鈕時跑馬燈要滿列）：量截圖——cg-client banner 頂 86.6、底板下移 72、桌列下移 81；我們 banner 90.5、兩者都推 94。新稿 bMwBlLxrJyhvBJA2mMMeMw 的 banner 節點（隱藏）在 88.5 = 訊息列底 78.5 + 9 + 1，推移量稿沒畫、照 cg-client：--ad-banner-h 85 → 72（佔位）、列表多一個 9 的間距 = 81、底板 139 + var；banner 圖頂 3 → 1。跑馬燈膠囊沒有 BANNER 鈕時手機 407 滿列、4:3 flex-1。舊的大廳稿三個副本都 404 了；使用者又給新副本 AehtNlT2mR3D1ROZ4VW7Cb（原稿 GDKl… REST 429、MCP 額度用盡）。新副本多了幾組稿：「lobby_設置廣告」410:35423 是 banner 開的狀態——banner 12.5,88.5、bg_room 139 → 219（+80）、ui_game room 88.5 → 167.5（+79）；「lobby_無廣告」408:18906 沒有 BANNER 鈕、跑馬燈膠囊 350 寬 @41（另有 Freeplay 的 FREE PLAY 桌卡變體 421×180，是活動變體不是改版）。改成 --ad-banner-h 80、桌列多收 1、底板 139 + var；膠囊無鈕時 350。4:3 也對稿（使用者：「4:3 的也要調整」）：「lobby_設置廣告 4:3」410:37837 banner 84.8,88.5、底板 +80、桌列 +79 與 16:9 同，推移不用分支；訊息列 413:4068 整列 490 寬置中（膠囊 411 + 鈕 69，原本 463.5 是舊稿 1:3283）；「lobby_無廣告 4:3」408:22674 沒 BANNER 鈕時膠囊 489.5 @42 = 撐滿整列（w-full）。瀏覽器實量 572×763 與 433×763：列 43/490、膠囊 411、鈕 464、桌列 152.5→231.5、底板 139→219 全對；順手抓到 banner 圖兩個比例都在 89.5（列高 23 不是 22），視窗 top 1 → 0、指示點 16 → 17 保持與圖底距離。',
      '路書新一欄閃爍（使用者要求）：cg-client `_renderLuShuList(blink)` 對最後一筆非 null 的欄 `UTIL.playBlinkTween`（opacity 先設 0，四段各 0.5s →0 →255 →0 →255，cubicIn）；blink 只有在 SDK 本機局末把該局推進路書時（`Table.syncResults(list, true)` → TableSummary REFRESH({blink:true})）才 true，伺服器整份同步為 false。實作：useLobbyCardLive 的 REFRESH handler 收到 blink 就把 ref 序號 +1、回傳的卡片資料帶 roadBlinkSeq；RoadStrip 把最新一欄的 key 帶上序號，seq 變動 React 重掛該欄、animate-bead-blink 從頭播（keyframes 改成對照 Cocos 起手不可見）。掛載、重排、整份同步 seq 為 0 不閃。',
      'Review 大廳（使用者要求）：修了快照一局抓兩次（refreshOn 改上升沿）與三處過期註解；建議未動——LobbyView 四套狀態機可抽 useMarqueePlayer / useCardPreview、廣告彈窗離開大廳後補彈的邊界、useLobbyCardLive 每次重排多一次 render、ROAD_COLUMNS 兩處同名、快照一次抓全部桌。',
      '桌卡快照接上（使用者要求，測試網址 https://snapshot.dcolorgame.com/DOUBLE2.webp）：對過 cg-client UTIL.loadVideoScreenshot，網址不是 round 資料、全由 project.json 組——第一層 TRTC `https://{trtcScreenshotHosts_https[i]}/{桌號}.{trtcScreenshotFormats[i]}?v={伺服器時間}`（hosts／formats 同索引、隨機抽一組、永遠 https），失敗退第二層 video-replay `https://{videoReplayUrls_https 隨機}/screenshot/{桌號}?v=`（jpg），都失敗用預設圖。config 加三個欄位（golden fixture 同步）、dev project.json 填測試主機與 webp；useTableSnapshot 先用 Image 預載確認抓得到才交給畫面（不閃破圖），掛載與每次進入倒數各抓一次、維護桌不抓。實測快照已是直式 504×896，不用像串流轉 90°。SRE 要在各環境 project.json 填這三個值。',
      '維護桌卡對稿（使用者：「維護的桌怪怪的 對一下設計稿」）：稿 298:2292 維護裝態——整卡不壓透明度、頂列單色 #E9AB53、限額字 #8D483C，路書／六色比例／時間條／底條／PLAY／觀看人數全部不畫，中間吉祥物 108.6×86.1 @(187.1,47.1)（與舊版 icon_maintenance 同一張）+ MAINTENANCE 字（Baloo Bhaijaan 19.9、#B8362F，中心 x 241.8）；縮圖、徽章、愛心照常，仍不可點。原本是整卡 60% 透明再蓋一張圖。',
      '維護桌要能收藏（使用者）：愛心本來沒被擋，卡在 SDK UserSaveMyDataCommand 對 isMaintain 走 setMyDataWithoutChangeEmitter（存但不發 FAVORITE_TABLES_CHANGED，註解說 maintain 情況下列表不動），列表收不到事件愛心不亮。actions/favorite 對維護桌補發同一個事件讓 useLobbyTableList 重讀。',
      '桌號徽章跨螢幕上下偏 1px 的根因與解法（使用者問「改 SVG 會不會好一點」）：不是字型或 SVG，是三個小數疊在一起——容器 top 120.6、行框半行距 (17−11.5)/2=2.75、字只有 11.5px；Mac 2× 貼到 0.5 格、Dell 1× 貼到整數格，各自取整就差 1。改用 CSS text-box-trim（trim-both cap alphabetic，Chrome 133+）把行框裁到字身，flex 置中就是幾何置中，translateY 從 2.1 降到 0.5 當微調；不支援的瀏覽器退回原行為。build 確認 Tailwind 有輸出。SVG 之前試過字會變軟，不採。',
      '4:3 對稿微調：桌列整體下 1（標題區佔位 wide 55）、桌號徽章與人數膠囊各下 1（121.6 / 102）。稿的 4:3 桌卡 472 本來就比底板 450 寬、左右各露約 10，不是偏差。',
      '跑馬燈輪播狀態放 LobbyView 的 ref（不進 store）：只有大廳這一個畫面用，離開即丟；SDK 才是清單真相。',
      '廣告彈窗只做「每工作階段一次」：cg-client 是看 gameMap 上一個位置有沒有 tableCode，語意就是「第一次進大廳」，用 store 旗標更直接。',
    ],
    evidence: ['typecheck / lint / views+game 777 tests / build 首屏預載閘門皆綠。實機要看：後台有跑馬燈與彈窗資料的渠道。'],
    todo: ['大廳剩餘：區塊 B（遊戲標題 + 活動中心／Color War 入口，走 campaigns registry）、活動中心 News 落點（跑馬燈／banner 共用）、免費投注狀態、新手教學觸發、GameLobby elog。'],
    files: ['src/game/hooks/useTableCountdown.ts', 'src/game/hooks/useLobbyCardLive.ts', 'src/views/components/RoadStrip.tsx', 'src/game/hooks/useTableSnapshot.ts', 'src/integrations/config/fields.ts', 'public/project.json', 'src/game/actions/favorite.ts', 'src/views/components/RollingText.tsx', 'src/views/lobby/LobbyStripText.tsx', 'src/game/hooks/lobbyCardData.ts', 'src/game/hooks/useLobbyCardLive.ts', 'src/views/lobby/LobbyAdBanner.tsx', 'src/views/lobby/LobbyHeader.tsx', 'src/game/actions/navigation.ts', 'src/game/hooks/useMarqueeList.ts', 'src/game/hooks/useAdPopup.ts', 'src/game/actions/marquee.ts', 'src/views/lobby/marqueeQueue.ts', 'src/views/lobby/marqueeQueue.test.ts', 'src/views/lobby/LobbyMessageBar.tsx', 'src/views/lobby/LobbyAdPopup.tsx', 'src/views/LobbyView.tsx', 'src/game/store/useUiStore.ts', 'src/integrations/sdk/SdkAdapter.ts', 'src/integrations/elog/eLogBehavior.ts', 'src/index.css'],
  },
  {
    date: '2026-09-15',
    title: '背景收尾：用 Figma 整幀（只留背景三層）匯圖當底圖；廣告 banner 與底板同步、跑馬燈淡出',
    branch: 'master(未 commit)',
    summary: [
      '布幔亮度之謎解開：同一個節點群組單獨匯出（REST / MCP / app 都一樣）會把 luminosity、plus-lighter 對著透明底算，整片變暗、lighter 變灰霧；但把**整個 frame** 交給算圖器就和畫布一致。做法：用 MCP use_figma 暫時隱藏 frame 1:153 的 ui_header / scroll bar / content / footer / bg_room，開著三層背景，REST 匯出 1:153 2×（1728×3072 → webp 152KB）當底圖；之後把可見性全部恢復。CSS 只留：稿高 768 以下的輻射底色、底板（隨 --ad-banner-h 下移）。lighter 的 CSS 層與資源拿掉。',
      '使用者複製了一份 Figma 檔到自己團隊（TF8BrGiB9wnYuffmczChV1），REST 節點／匯圖與 MCP use_figma 都可用、不限流；原檔仍是 View seat 限流。',
    ],
    decisions: ['設計稿換新檔（tN2lcc2UbeCv5ElMExkGQD，結構同舊檔，大廳 16:9 仍是 1:153）：路書欄底不再有暗底圖，欄是純色 #E2B99C 圓角 5（270:934）。三同色的框依玩法不同（使用者指出，並要我查 cg-client）：cg-client `ColorGameRoomListItemLuShuItem.setLuShuData` 先對所有玩法做 `_setBackground(三個 winner 相同)`，只有 superDouble 分支再 `_setBackground(false)` 取消；bonusV2 另有 `updateBonusEffect`（要 SDK `rateDetail`，即電子骰加成才亮兩同／三同框）。稿上：UJP／192x 是欄本身 2.5 橘金內描邊 + #FFCC00 外光（270:950），500x 是格外 20×55 的 1.5 #FFE100 細框（270:1065），108x 沒框。RoadStrip 改 `tripleFrame: glow | ring | none` 由 LobbyTableCard 依 subType 決定；luzhu_bg / luzhu_bg_active 連 assets-raw 一起刪。500x 的兩同框（rateDetail）稿上沒畫、未做。', '路書格子對稿：格 15（原 15.5）、頂 5.4，水平改 flex 置中（欄距 4.18 讓各欄落在不同小數 x，固定 left 會讓格子各欄貼齊到不同像素、看起來歪；使用者兩次說「歪」）。第三次仍歪：量截圖，欄 24px、格子左 4 右 5——欄寬 24.4 置中時格子兩側 4.7，光柵化各自貼齊不同像素。改成欄 25、格子左 5、細框 21 @2（全取整，格子邊與欄邊的小數部分相同就會往同一邊貼齊），欄距 3.58 維持每欄 28.58 的節距。', '108x／500x 倍率沒出來（使用者回報）：SDK `ColorGameSummary` 對 superDouble 的第四筆設 `isCGBonus = true` 且 `winner` 是**數字**，domain `resolveLuShuColumn` 先判 isCGBonus 就把它當小遊戲結果；500x 根本沒有第四筆，倍率在前三格的 `rateDetail.rate`（SDK `_findHighestRate` 已算好）。修法：`ILuZhuCell.winner: string | number` + `rateDetail`；bonusV2 先於一切用 rateDetail 出 rate 與 `bonusMatch`（triple / topPair / bottomPair / outerPair，對 cg-client `updateBonusEffect`），superDouble 先於 isCGBonus 判倍率。RoadStrip 的 ring 依 bonusMatch 框對應格子（三同 55 高、相鄰兩同 37.5、首尾各 20）。測試 +6。', 'UJP 路書框（使用者截圖：框要對應結果的顏色，JP 局要 JP 圖示與倍率兩種切換）：cg-client UJP 分支 `_setLightBorder(data[0])` 用第一顆骰色的 `luzhu_light_<色>.png`（70×143 @2×：內描邊 2.5 + 外光 5，六色描邊／光暈像素取樣成 COLOR_FRAME_CLASS），`_setUltimateJackpotSprite` 在 ultimate / major / mini 時顯示 JP 圖示並 `_runRotateShowAnimation`：createColorOpacityBlink 停 2s → 1s 淡出 → 停 2s → 1s 淡入，圖示先亮、倍率反相（index.css road-swap-a / -b 6s）。稿上 UJP 框畫成橘金、沒有 JP 圖示，依 CLAUDE.md 行為以 Cocos 為準；圖示取 Cocos `luzhu_icon_jackpot`（紅底黃字 JP，59×30 → 29.5×15）轉 webp，與倍率字同位 top −15（第一版用了 48×48 的皇冠 JP、位置也偏高，使用者退回）。另一個 bug：hook 的 tag 只在 bonusKind 為 rate 時印，UJP 頂獎局是 luckyBall + rate 100 → 沒印，改成有 rate 就印。RoadStrip 新增 `colored` 框型與 `jpIconUrl`，hook 多 `hasBonus` / `isLuckyBall`。', '路書不足五局時空欄補錯邊（使用者截圖：新桌一局，左邊空一排）：cg-client `_renderLuShuList` 是 `[...luShu, null]` 再 `_fillNull` 往尾端推，資料靠左、空欄在右；RoadStrip 改成一樣。JP 字樣再上移到 top −19.5 與倍率字底邊齊。', '暱稱字型：稿 1:180 是原版 Baloo 400（已下架）。依資源規範 §三 跑了 font:fetch 抓到 Baloo v1，使用者裁定「字型用 baloo-2/400」，抓下來的三個檔已刪、index.css 還原；暱稱本來就是 font-baloo（Baloo 2）400，不動。', '預設頭像（使用者截圖：頭像圈是空的）：稿 1:195 `hangina 1 3` 62×62 @2× 由 REST 匯出 → avatar_default.webp（3KB），LobbyHeader 沒有頭像網址時用它，不再只畫圓形底。', '廣告 banner 又變成直接跳位：改舞台縮放（useLobbyStageScale）時把 stage style 的 transition: --ad-banner-h 400ms ease-in-out 200ms 漏掉了，補回並在註解標明必須留在這裡。', '捲軸太貼邊：兩形態各往內 4.5（手機右緣 427、4:3 571.5），design-spec 標明比稿內縮是使用者指定。', '遊客暱稱（使用者：isTourist 顯示 Tourist，否則資料的 nick）：useUserStore 加 isTourist（UserHandler LOGIN_SUCCESS 寫 SDK user.isTourist），LobbyHeader 遊客時顯示 t(lobby.LobbyHeader.tourist, Tourist)。cg-client 的第二順位 fpmsUserData.nickname 本專案沒有這個來源，直接用 nick。', '自訂捲軸（使用者：滑動時要有稿上那條）：稿 1:196 / 4:3 1:3281 只畫滑塊 4×184、全圓角、白 80%，貼框右緣（431.5 / 576）。原生捲軸已隱藏，LobbyView 加覆蓋層滑塊：長度＝clientHeight²÷scrollHeight（最短 24）、top＝offsetTop + 進度×(視窗−滑塊)，捲動時顯示、停 800ms 淡出，ResizeObserver 跟列表尺寸；style 直接寫節點不走 state。', '預覽影片把桌號徽章與觀看人數蓋掉：影片容器帶了 z-[1]，在卡片堆疊裡壓過後面的兄弟；拿掉 z-index、人數膠囊 z-[1]。', '大廳桌卡視訊預覽接上（使用者：「我大廳也需要接上了」）：cg-client `VirtualRoomListComp` 一個共用播放器只播 `getCurrentTopVideoIndex`——由上往下第一張底邊還在捲動視窗內的卡，捲動 debounce 100ms 才切；`RoomListVideoComp` 預設圖墊底、video 疊上。實作：LobbyTableCard 加 `onCardMount` / `onVideoContainerMount` 兩個 ref 回呼與視訊容器 div；LobbyView `updatePreview` 用 getBoundingClientRect 找最上面可見卡（舞台 transform: scale 下 rect 已是畫面座標），IntersectionObserver + scroll 都走 100ms 停穩排程，換卡就 `previews.remove` 舊的、`previews.add` 新的（校正走 `getLobbyAdjust`：轉 90°、cover），離開大廳收掉。與 roulette 的差異：roulette 取「可見比例最高」的卡，彩骰依 Cocos 取最上面那張。build 的首屏預載閘門仍綠（RTC vendor 仍 lazy）。未接：未播時的截圖（ROOM_LIST_IMAGE_DOWNLOAD SCREENSHOT_FROM_VIDEO）、大廳 offset 校正常數（VideoAdapter 的 TODO）仍待實機校。', '預設渠道 1e3109 進不了大廳、?infoUrl=acc2af 可以（使用者回報，log 只有 SDK `enter table failed`）：SDK `MoveToGameListCommand` 的 catch 把錯誤吃掉，先補 `logger.debug(\'enter table failed\', error)` 印出堆疊 → `DirectGameInfo._hasRedDot` 對 `entryGameType.startTime.getTime()` 炸 TypeError：共用渠道的 `enterTableList` 回傳帶了有 hasRedDot 的直達遊戲，日期欄位是 ISO 字串不是 Date（與 Advertisement 同一類 bug），整個進大廳流程中斷。使用者裁定是 api helper（回應解碼那層）的問題、不改 SDK，三個 SDK 檔案已 git checkout 還原；shared-code encodeID 對兩個型別都標了 :Date，該由解碼層轉。', '非 4:3 的寬形態視窗（使用者拉到 777×797）頂欄與底板撐滿、桌卡停在 472：大廳舞台原本直接用引擎的 --ui-scale，而 uiScaleOf 在寬形態夾 1（房內元件不放大的規則），框寬 777 時舞台就是 777 寬。大廳寬形態是一張 576 寬的固定稿，改成 LobbyView 自己訂閱 viewport 快照算 scale ＝ frameW ÷（wide ? 576 : 432）（useLobbyStageScale），舞台永遠是 432 或 576 邏輯寬。docs/RWD架構.md §一 大廳例外補上。', '500x 黃框三輪：加粗（1.5 → 2）與外光；量截圖發現 2.5 線在 2× 被切成 2、左距 1.5 造成左右差 1px → 全取整（寬 23 @1 線 2）；再依使用者「更貼一點」收成寬 21 @2、內留 1。', 'Figma 再更新（LhsHVgFCvSTcoIoBbKuteL）：用 REST 抓 1:153 與前一版逐節點比對（忽略 Frame 流水號），只有兩處：UJP 路書欄 298:1912 / 298:1924 加了骰色框（內描邊 5 的深→中→深漸層 + 同色系外光 blur 8 spread 2，綠 #78ED41 / #8AF359、紅 #FF655C / #FF7870）；UJP 與 108x 的最後一欄改成空欄（下一局）。與前一輪依 Cocos 做的一致，只把外光改為不透明色、blur 4 spread 1。', '列表尾端留白改為「捲動視窗高 − 167 − 10」：最後一張卡可捲到第一張卡的位置（使用者要求，cg-client 同）。', '開局路書第四筆消失：使用者回報後又說「現在看起來沒問題」，__cgLuShu 除錯入口（DEV only）留著。', '最後一張桌卡被頁尾蓋住捲不上來（使用者截圖對照 cg-client）：內容區 main 是 bottom-0，頁尾面板 130.5 高絕對定位貼底疊在上面。改 main bottom-[106.5px]（130.5 減頁尾頂 24px 透明外溢區）。', 'UJP 倍率：SDK 只在 `r.jackpotTime`（進了獎池轉盤，即三同局）才推第四筆，winner 是吉祥物種類或 `jackpotWheelRate`；cg-client 同樣要有第四筆才 `_setRateLabel`。所以 UJP 只有三同局有倍率標籤，與稿（100X / 20X 都在發光框欄上）一致；非三同局沒有是對的。', '大廳背景改延後載入：第一幀只有 CSS 輻射底色，布幔圖 loading=lazy + decoding=async，onLoad 後 300ms 淡入（src 換比例時重新淡入）。', '4:3 頂欄玩家資訊（使用者截圖：暱稱與金額擠在一起）：稿 1:3260 群組 440 @68，兩顆膠囊各 178 貼群組兩端、儲值鈕右緣齊群組；LobbyHeader wide 時資訊群 w-[440px] justify-between、膠囊 basis-[178px]、儲值鈕 right-0。', '4:3 緞帶（第二輪，使用者說 16:9 與 4:3 位置都跑掉）：headless 把新舊 SVG 各在 432 / 576 寬渲染並量側摺與本體列——4:3 原件 1:3243（1296×205，648 CSS）在 576 寬側摺剛好貼 0–575、本體 0–46.5，與 4:3 稿一致；但在 432 寬完全看不到側摺，而原本 16:9 的 1:160（1011×205，505.5 CSS）側摺貼 0–431。結論：兩稿的緞帶幾何不同、不是同一件置中裁切，改成兩支資產：16:9 還原 header_ribbon.svg（w-[505.5px]）、4:3 新增 header_ribbon_wide.svg（w-[648px]），LobbyHeader 依 wide 切換，top 皆 −9.64。', '4:3 寬框版面（使用者指出緞帶區、底板太寬、桌卡尺寸、路書 6→8 欄）：從 copy 檔 REST 讀 frame 1:3224 的節點樹（含四種變體桌卡 157:7564 / 7705 / 7822 / 7935 的內部座標），用 MCP 暫時隱藏非背景層匯出整幀背景（bg_img + lobby_bg 9-slice，576×768 → webp 57KB）再恢復。實作：LobbyView 以 useFormFactor()===\'wide\' 傳 wide 旗標——LobbyBackdrop 換圖 + 底板 10.94%；LobbyHeader Home/Menu justify-between px-18；LobbyMessageBar 463.5 justify-between；桌卡 472：頂列 445.5、路書 8 欄（RoadStrip 加 columnCount、lobbyCardData 多留到 8 欄）、比例格 gap 14.5、時間條 318、底條 358.5、PLAY 335.3；LobbyCardTitle 四變體各段座標。全部走 JS 旗標不混 wide-frame: 類名（閘門測試綠）。design-spec 加「4:3 寬框」章。未做：區塊 B、頁尾寬框內部、20:9 / 21:9 背景。', '使用者要 CSS 疊層版（不要整張烤圖）：布幔圖層用原圖依先前 IoU 擬合的裁切（0.400 / 置中 / 頂切 459）重建成透明底 864×1052（lossless webp 277KB）；LobbyBackdrop 改成 bg_img 橢圓輻射（CSS）→ 布幔 img → 上蓋 #0B0019 9.7%→透明 63.64% 以 mix-blend-mode: luminosity 疊在圖與底色上 → 30% 群組（同圖 50% + 黑 luminosity 13.3–28.3%）以 plus-lighter 相加。這樣混合都在 CSS、圖只當素材，四個比例也能共用一張布幔圖。與整幀匯圖的像素比對見下一輪（headless 後端不穩）。', '整幀底圖換上後使用者說布幔被壓扁：我把容器比例寫成 864/768，但整幀匯圖是 864×1536（稿 432×768），圖被壓成一半高；改 aspect-[864/1536]。另外我前幾次的並排比對圖把設計截圖橫向縮一半（216 寬對 432 寬），才會誤判布幔長短——並排比對務必同比例。', '使用者問能不能用 CSS 做 plus-lighter：可以（mix-blend-mode: plus-lighter / luminosity 瀏覽器都支援），卡的是原圖裁切位置；以整幀匯圖為基準對原圖做紋理相關擬合，相關性仍只有 0.14、縮放在 0.16–0.17 間搖擺，不可採信，維持整幀烤圖。', '之前一整天試的做法（REST imageTransform 重建裁切、CSS mix-blend 重現、alpha 剪影 IoU 匹配、回推透明度、逐節點 app 匯出、bg_texture 群組匯出）全部作廢。教訓：含混合模式的背景，隱藏其他圖層後匯整個 frame，不要匯群組或節點。', 'REST 讀到的 imageTransform 與四個 frame 相同，但照字面重建的裁切與算圖不符，且 4:3 frame 用的是另一張 lobby_bg 9-slice——四個比例的背景不能共用一張圖，之後要分別匯。'],
    pitfalls: ['MCP use_figma exportAsync 回傳 base64 會被截在 20KB，抓大圖要走 REST images 或 download_assets 給 URL。', '在別人的檔案改可見性等於動到設計稿，只在使用者自己的 copy 檔做，做完立刻恢復。'],
    evidence: ['整幀匯圖與使用者設計截圖並排（framebg-vs-design.png）：布幔、流蘇、上方紫、中央紅光一致。typecheck（僅框架版本錯）/ lint / lobby 23 tests / 資產檢查綠。'],
    todo: ['20:9 / 21:9 / 4:3 的背景各自匯一次（4:3 是 lobby_bg 9-slice）。', '區塊 B（標題／吉祥物／EVENT CENTER，1:209）：節點樹已抓，等使用者要做時開工。'],
    files: ['public/assets/lobby/avatar_default.webp', 'src/platform/state/useUserStore.ts', 'src/game/handlers/global/UserHandler.ts', 'src/views/lobby/LobbyHeader.tsx', 'src/views/lobby/LobbyTableCard.tsx', 'src/integrations/video/VideoAdapter.ts', 'src/game/hooks/useAdBanners.ts', 'src/views/LobbyView.tsx', 'public/assets/lobby/card/road_icon_ujp.webp', 'src/index.css', 'src/game/domain/lushu.ts', 'src/game/hooks/lobbyCardData.ts', 'src/views/components/RoadStrip.tsx', 'src/views/lobby/LobbyBackdrop.tsx', 'src/views/lobby/LobbyHeader.tsx', 'public/assets/lobby/header_ribbon_wide.svg', 'src/views/lobby/LobbyHeader.tsx', 'assets-raw/lobby/bg_curtain.png', 'public/assets/lobby/bg_curtain.webp', 'src/views/lobby/LobbyBackdrop.tsx', 'src/views/lobby/lobbyAssets.ts', 'src/views/lobby/lobbyAssets.test.ts'],
  },
  {
    date: '2026-09-14',
    title: '底條金字超寬時等比縮小（108x 被裁）；收藏愛心換成使用者提供的 CSS 動效',
    branch: 'master(未 commit)',
    summary: [
      '108x「SUPER GAME WITH SPECIAL DICE」在底條被裁掉。LobbyStripText 改為量自然寬（inline-block offsetWidth）對外框 clientWidth，比例 <1 就 transform: scale（cg-client TableJackpotUltimateAmount 同法）；字型載入完成與外框 ResizeObserver 時重算。108x 量到 288 / 252 → scale 0.875，截圖完整顯示。',
      '第一版縮放原點用中心，結果左緣往右跑 18px：字比框寬時 inline-block 靠左貼齊，以中心縮放會往內收；改 transform-origin 左緣，縮到等於框寬即自然置中。',
      '愛心：使用者提供一套 .favorite-button / .favorite-pop / .favorite-art 的 CSS（is-selected 時外層回彈 560ms、內層呼吸 1.8s、::before 白金閃光 380ms、::after 金色光圈 520ms、:active 縮 0.9、reduced-motion 關閉），原樣放進 index.css 頂層；markup 改成 button.favorite-button(34×34) > .favorite-pop > .favorite-art > 金圓 + 心形 / idle 圖。舊的 fav-pop / fav-burst / shine-sweep keyframes、favJustOn 狀態、心形遮罩掃光一併移除。點擊後連拍：閃光 + 光圈擴散 → 呼吸。',
    ],
    decisions: ['背景最終版：使用者複製了一份 Figma 檔到自己的團隊（TF8BrGiB9wnYuffmczChV1），REST 節點與匯圖都不再限流；請他關掉 bg_room 後用 REST 匯出 bg_texture（1:154）整組 2×（1733×3074，裁回 1728×3072）當整個背景底層（webp 152KB），輻射底色、兩層布幔與各自混合全由 Figma 算好；CSS 只留一層輻射底色接稿高 768 以下、底板照舊隨 --ad-banner-h 下移。', '背景再定案：逐層匯出的 image_curtain 是暗的（Figma 對單一節點算圖時 luminosity 只和該節點自己的圖混），但整組 bg_texture（1:154）匯出就是使用者要的亮度——組內混合是和下面的 bg_img 一起算的。改用整組匯出圖裁到底板頂 y=139 以上（864×278 → webp 16KB）當背景，底板以下接 CSS 輻射底色（因底板要隨 banner 下移，不能烤進圖）。接縫 y=139 兩側顏色不同（匯出 (144,8,42) vs CSS 輻射 ≈ (116,0,0)），banner 展開時只露 9px；要完全一致需請設計把 bg_room 關掉再匯一次整組。', '背景定案：使用者把 image_curtain / image_curtain_lighter 兩個節點各自匯出 PNG（Figma 自己算好：裁切、luminosity 上蓋都烤在圖裡；lighter 的 alpha 最大 77 = 30% 已烤進）。改直接用這兩張：主層純 img、lighter 純 img + mix-blend-mode: plus-lighter（節點層級混合匯出烤不進）；CSS 不再疊任何漸層。母檔 assets-raw/lobby/bg_curtain.png 替換、新增 bg_curtain_lighter.png → webp；lobbyAssets 加 BG_CURTAIN_LIGHTER_URL 與預載清單。之前 REST imageTransform / 剪影 IoU / 回推透明度那一串全部作廢——教訓：多層填色與混合的節點，直接請設計匯出每一層，比重現填色便宜且準。', '使用者截 Figma 屬性面板：image_curtain_lighter 的圖層混合是 **Plus lighter**（相加）、圖片 50%、圖層 30%、上蓋黑→#481C7E 0% luminosity。這層把布幔加亮，正是稿比單層亮一倍、我之前得把上蓋降到 50% 才對得上的原因。改 mix-blend-mode: plus-lighter，主層上蓋恢復稿的不透明 #0B0019。教訓：REST 的 fill blendMode 只給填色層，節點自己的 blendMode 要另外看（或直接看 Figma 面板）。headless 這時 dev 後端連線失敗，未能量測。', '布幔幾何真正對上：REST imageTransform 照字面算出的裁切（0.4114 × 0.3787 非均勻、頂切 415）與 Figma 實際算圖不符（舊母檔的布幔寬一倍）。改用 Figma 匯出的舊母檔 alpha 剪影（不受烤暗影響、>250 為布幔實體）對原圖 alpha 做 IoU 搜尋：均勻縮 0.400（寬 1002）、水平置中（x0 68）、頂切 459，IoU 0.856。重建後左側布幔 y=100 設計 (104,10,11) vs 現況 (106,32,32)，流蘇位置一致。上蓋 luminosity 漸層取 50% 透明度是回推值（CSS 全不透明時比稿暗一倍）。教訓：Figma REST 的 imageTransform 語意不可靠，以 Figma 自己算圖的匯出 alpha 當幾何基準。', 'BANNER 鈕：漸層照使用者貼的 Figma CSS radial-gradient(397.98% 191.03% at 50% 15.22%)；拿掉 hover/active 的透明效果，改 active 縮 0.95。', '使用者貼 Figma CSS 匯出：上蓋 `linear-gradient(180deg, #0B0019 9.7%, rgba(72,28,126,0) 63.64%)` + `background-blend-mode: luminosity`、底層 `radial-gradient(50% 57.71% at 50% 42.29%, #FF0000 0%, #380000 62.79%)`。改成圖與漸層放同一元素的 background 用 background-blend-mode（只和圖混、圖透明處顯示漸層本色）；先前的 mix-blend-mode 會連底層輻射一起混，中央會偏紅不是稿的深紫。', '背景框與列表仍不同步的真因：banner 佔位在 flex 欄裡，高度 0 仍佔一格 9px 列間距——掛載瞬間列表先跳 9 再動 85，底板卻平滑動 94。改成單一來源：index.css 用 @property 註冊可過渡的 --ad-banner-h，LobbyView 舞台根節點設 0 ↔ 85px 並帶 0.2s 延遲 + 0.4s 過渡；佔位 height = 變數、margin-bottom = 變數×9/85 − 9（0 時剛好抵銷 gap）、底板 top = 139 + 變數×94/85。三者同一條時間軸，不可能再錯開。', 'banner 推開動畫沒跑、列表直接跳：掛載（h-0）與切成 h-85 在同一幀，瀏覽器只看到終值沒有過渡；底板另有自己的過渡所以兩者不同步。改成掛載後用兩層 rAF 等 0 高那幀 commit 再切 shown，佔位、本體 opacity、底板 top 三者同為 0.2s 延遲 + 0.4s。', '廣告 banner 第三輪：使用者要看到「內容被往下推」的演示、但 banner 本體不能被壓扁 → 外層佔位 div 高度 0 ↔ 85 做過渡（推開標題區與桌列），本體 absolute 固定 85 高只淡入淡出，兩者與底板 top 同為 0.2s 延遲 + 0.4s；拿掉上一輪的瞬切 plateOffsetOpen。', '廣告 banner 第二輪（使用者看過實機）：拿掉白色邊框；底板 bg_room 隨展開下移 94（85 + 列間距 9），位移不做動畫、只對齊 banner 佔／讓版面的時機（開立即、關等淡出 0.6s）；展開／收合改純淡入淡出——展開先佔版面下一幀淡入，收合先淡出、0.2+0.4s 後才讓出版面（cg-client _showNodeVisible 同序），不再用 max-height 往上縮；isAdBannerOpen 預設關，登入後第一次有廣告延遲 400ms 演示打開（adBannerIntroDone 只做一次）；滑不動：拖曳改用 ref 追蹤起點、pointerup 直接用事件座標算比例、門檻 20% → 12%、圖片 draggable=false + pointer-events-none，切頁加 transitionend 備援計時。', '背景終於有真值：REST files/:key/nodes 端點解除限流，讀到 1:155–1:158 的填色。bg_img 是橢圓輻射（rx 50% w、ry 57.7% h、圓心 42.3% h，#FF0000 → #380000 62.8%）；image_curtain 是同節點兩層填色——IMAGE STRETCH 帶 imageTransform [[0.8406,0,0.0797],[0,1.1094,0.4374]]（原圖 x 8–92%、y 43.7% 起往下超出）+ 線性漸層 #0B0019 9.9% → 透明 65% 且 blend = LUMINOSITY（只壓亮度、保留紅）；lighter 副本圖片填色 50%、群組 30%、黑漸層 13.3–28.3% 也是 LUMINOSITY。母檔依 imageTransform 重建（縮放 1030×948、偏移 -82/-415），CSS 上蓋改 mix-blend-mode: luminosity。之前所有回推（頂切 532、45% alpha）作廢。', '廣告清單筆數 0 的真因是 SDK：GetAdBannerCommand 進 setAdBanner 時 _isValidDisplayTime 對 startTime 呼叫 .getTime()，但 JSON 來的是 ISO 字串 → TypeError，整批廣告丟掉。修在 game-client-sdk（鄰居 repo，未 commit）：加 toTimestamp(Date | string | number) 換掉六處 .getTime()。', '廣告 banner 接上（cg-client 行為對照）：SdkAdapter.getAdvertisement()；hooks/useAdBanners（進大廳 emit GET_AD_BANNER、訂 UPDATE_AD_BANNER、site_assets 前綴、slideDuration 秒→毫秒預設 6s、點擊目標欄位）；actions/advertisement（openAdBanner：埋點 Lobby.Banner → 進桌 → 開外連 → 活動名／活動中心 News 先 TODO；toggleAdBanner：useUiStore.isAdBannerOpen + Lobby.BannerCollapse、250ms 連點鎖）；views/lobby/LobbyAdBanner（432×85 / 407×70 三槽輪播、每頁自己的停留秒數、拖曳翻頁、切頁 1s、指示點、展開收合 0.2s 延遲 + 0.4s 淡入淡出並以 max-height 把桌列推開）；LobbyMessageBar 沒廣告時藏鈕；hostBridge.openExternalUrl；elog LobbyFn.Banner / BannerCollapse。稿只有 no banner 變體，開啟態幾何取 cg-client ÷2 待設計補圖。hook 測試 2 條。headless 這時連不上 dev 後端（GetChannelInfo timeout、Login 失敗），畫面驗證交使用者。', '背景第二輪：用舊母檔驗證過的裁切（整幅寬縮 866、頂切 532，內容高 651 與舊母檔吻合）重建母檔，上蓋漸層改 CSS；使用者說還是黑 → 用設計圖回推布幔在 y 70–130 只被壓暗約四成，spec 的「#0B0019 10% 起」等於近乎不透明，改起點 rgba(11,0,25,.45)；淺色副本層維持。Figma 限流讀不到那層的圖層透明度，數值為回推值。', '使用者合併 origin/master（47 commits：房間視訊層、選單、自帶原版 Baloo Bhaijaan 字型 assets/fonts/baloo-bhaijaan.css 給跳轉面板用…）時 index.css / AGENTS.md / main.tsx 衝突。index.css 取對方（albert / khand token）、我們的 bhaijaan token 不再需要；AGENTS.md 取對方再套回「scale stage, not zoom」一句；main.tsx 拿掉 bhaijaan-2 import。合併把 LobbyView 根節點退回 zoom（STAGE_STYLE 變未使用、lint 紅）→ 重新接回 transform 舞台。幣別符號依使用者要求改 Baloo 2 的 800（font-baloo font-extrabold）——注意 master 現在自帶原版 Baloo Bhaijaan 400（--font-display），那才是稿的字型，可考慮直接用。合併後 typecheck 11 個錯全在 master 新來的 video / preferences 程式（VideoAdjust.rotate、VideoQuality）與本地 @toppath 框架版本不合，要 pull 鄰居 repo 後 npm run sync，不是大廳的問題。', 'cg-client 廣告（banner）行為整理（使用者要求）：資料 = SDK Advertisement 模型 getAdBanner()（IAdBanner：id / imgUrl（site_assets + imgUrl）/ slideDuration / startTime-endTime / tableType / sortWeight / enableRedirectTable+tableCode / enableRedirect+url / activityName），進大廳 emit GET_AD_BANNER、訂 UPDATE_AD_BANNER；SDK 端過濾 tableType（NaN = 全部）+ 時間窗（未到期的排 timeout 到期重算）、依 sortWeight 降冪。UI：864×170（÷2 432×85）容器、每頁 814×140（407×70）圖，PageView 無限輪播（2 頁時複製成 4 頁）、每頁自動輪播秒數 = slideDuration（預設 6s）、滑動時停、放開續；BANNER 鈕切 gameClientState.isAdvertisementSwitchEnabled（預設 true、不持久化），展開／收合 0.2s 延遲 + 0.4s 淡入淡出並把標題區與桌列往下／上推 banner 高度；沒有廣告時鈕與容器都藏。點圖：eLog Banner → PWA 特例（id 1）→ enableRedirectTable 進桌 → url 開外連 → activityName（colorWar）→ 否則開 EventCenter News。id 9 在 installPwaEnabled 關閉時濾掉。', '大廳背景比設計暗：逐點比色左側布幔設計 (104,10,11) vs 現況 (32,3,0)，母檔本身 (40,4,0)——當初匯出的 bg_curtain 把稿上獨立的上蓋漸層（#0B0019 10%→透明 64%）烤進圖裡，再疊淺色副本又暗一次。REST 的 files/:key/images 可拿到 imageRef 原圖（2504² 完整布幔含幔帳），但 Figma 節點的 cropTransform 不在手上，用紋理相關搜裁切區失敗（相關 0.22，不可靠）。請使用者在 Figma 把 image_curtain 的漸層填色隱藏後匯出 2× PNG。使用者改給了 imageRef 原圖（同一張），試以紋理相關反推裁切：對舊母檔搜得「整幅寬縮 866、頂切 532」峰值，但設計圖左緣 x=4 是紅布幔而原圖左緣 53px 內透明 → 稿的裁切比整幅寬窄；改以設計圖左半當基準搜縮放／位移，結果多峰不穩定（0.14 / 0.16 / 0.30 各一組），不可採信。已把母檔與 LobbyBackdrop 還原，等正確匯出（node 1:156 隱藏漸層填色後 2× PNG）。', '列表能左右滑：transform 縮字後 inline-block 版面寬仍是自然寬，撐出卡片；另 .play-shine（使用者 inset 外擴）右緣超出卡 5.9。LobbyStripText / 徽章加 overflow-x-clip，列表容器改 w-419 + px-6（給光環空間）+ overflow-x-hidden；scrollWidth = clientWidth 驗證。', '回彈拉到 900ms；「彈跳最後突然變大」的真因：回彈結束拿掉 is-fresh 時呼吸的 animation-delay 從 900 變 0，CSS 重算相位、瞬間跳到呼吸最大格（量到 850ms 時 .93 → 950ms 時 1.02）。拿掉延遲，呼吸從選取起就跑（與回彈相乘），量到 .93 → .98 → 1.02 → 1.01 連續。', '愛心點下去「壓下去後突然彈回原大小」：收藏成功 → 列表依收藏重排 → React 重新插入這張卡的節點 → CSS animation 從頭重播（is-fresh 閘只擋了別張卡，自己這張正在播的一樣被重播）。改成一次性動效走 Web Animations API：LobbyTableCard 在 favFresh && isFavorite 時對 .favorite-heart-pop / .favorite-bg 呼叫 element.animate（keyframes 搬進 TS 常數），onfinish 清 favFresh；WAAPI 的 Animation 掛在元素上，重新插入照樣接續。CSS 只留呼吸。驗證：點擊後 133ms 把節點搬走再插回，動畫 currentTime 133 → 133 → 233 持續 running。', '純 CSS 徽章改完後使用者在 Dell 上看字還是偏，判斷不是 SVG 縮放的問題 → 改回 SVG 底圖（roomIdBadgeStyle 移除、資源回 public、spec 回寫）。真因仍未定位：headless 模擬不到實體非 Retina 螢幕的字型 hinting；候選方案（1）@media resolution 1dppx 補位移（要過 RWD 閘門）（2）徽章升合成層 will-change: transform 讓字不做 hinting（3）大廳 ui-scale 上限設 1 避開非整數放大。等 Dell 截圖量數據再選。', '（撤回）桌號徽章 Dell / Mac 偏移的推測：使用者說拿掉字型也一樣、只有這塊會——因為只有它的底是圖：127×33 的 SVG（含 inset 陰影 filter）拉成 62×17（比例 0.488），瀏覽器先光柵化再縮放，DPR 1 與 2 對圖邊的吸附方向不同，底圖相對文字偏半個到一個像素；其他元素都是純 CSS。改成純 CSS 膠囊（radial 漸層圓心／半徑、內陰影 7.3 / 6.25、1px 描邊、頂部白色高光，數值 = SVG 座標 × 0.488；紅 / bonus 藍各一組，放 lobbyCardVariant.roomIdBadgeStyle），兩個 SVG 移到 assets-raw 留底、CARD_ASSET_URLS 拿掉。460×803 驗證 DPR 1 / 2 留白 4.50/4.75 與 4.50/4.62。', '頂列圓角定案：使用者拿 Figma 的 bonus 卡截圖當「應該」，量圓弧 26 個 2× 像素 ≈ 13、右邊距 3.5；改 rounded 0/15/2.5/0、寬 380 → 383。我先前從 UJP 匯出圖量到 10 / 0.5，與使用者的 Figma 截圖不符，以使用者為準（匯出圖的邊有抗鋸齒與 bleed，量小圓角不可靠）。', 'Dell vs Mac 底條字：拿使用者兩張截圖算，Dell 上留白 4.79 / 下 6.70，Mac 5.98 / 5.48——Mac 上字低 1.2px；headless DPR1 / DPR2 都量到 4.8 / 6.3（＝Dell）。尚未找到 Mac 視窗多出這 1.2 的來源，已請使用者在兩台各回 devicePixelRatio / innerWidth / --ui-scale。', '桌卡邊緣對稿（使用者說「邊邊沒畫好」）：從 2× 匯出圖逐列量——頂列右上圓角 ≈ 20 個 2× 像素（÷2 = 10，原記 15 錯）、右下 ≈ 1（0.5，原記 2.5 錯）；卡底四角 ≈ 20/10 與 spec 一致；卡邊有一圈約 2px 的暗色內暈（254→205 再接背景）四邊都有、底邊更重，試補 inset 0 0 2px rgba(137,87,69,.45) → 使用者並排比對後說變髒、原本的才對，拿掉；稿匯出圖那圈漸變其實是 Figma 對外陰影與圓角的抗鋸齒，不是設計上的內暈。教訓：邊緣像素漸變不能直接當成一層效果。桌號徽章與人數膠囊依使用者要求上移 1；徽章字位移 1.5 → 2.6（8× 截圖算墨跡上下留白 3.19 / 3.19，DPR 1 與 2 都置中）。', '大廳縮放舞台 zoom → transform: scale（根因修復）：使用者截圖路書格一個 13 一個 14、底條字在不同螢幕高度不同——都是 zoom 讓版面在縮放後座標系排版、每個盒子的邊各自吸附裝置像素（getBoundingClientRect 全是 13.53，只有光柵不同）。LobbyView 根節點改寬高 = 100% ÷ --ui-scale 再 transform: scale（同 rwd.css scale-to-frame）；Tailwind 任意屬性 [height:calc(…)] 沒生效（寬有），改 inline style。390×844 驗證：根 390×844 填滿、捲動容器正常、六欄格子光柵一致；之前 SUPER 相位差、PLAY 文字偏低同因一併解。docs/RWD架構.md §一 補「大廳是例外」段、§三 zoom 條補代價；AGENTS 一句同步。', 'cg-client 路書底色規則再查：setLuShuData 只有「data.length >= 3 且三個 winner 相同」一條，沒有別的；現況一致。', 'BONUS 內側淡線有鋸齒（使用者放大截圖）：-webkit-text-stroke 在 Chrome 不走字型抗鋸齒（與主句當初拿掉描邊同因）。改成「淡色實心字 19px」上蓋「同漸層實心字 17.3px」，兩者相減就是那條線，全走字型抗鋸齒；高光再降到 22%。', 'BONUS 對稿再修：使用者並排稿與現況，現況整個字被洗白、內框像空心字。高光橢圓從 96×13.2 / 45% / 圓心 y 4.8 收到 96×8 / 30% / 圓心 y 2（只蓋字的上四成）；內框空心字 17.3px / 0.79 → 18.6px / 0.6（稿的淡線貼近字緣且很細）；硬影 0.75/1 → 1/1.25。', '已收藏的卡在別張收藏後「再跳一次」：列表依收藏重排時 React 用 insertBefore 搬節點，瀏覽器對重新插入的元素會從頭重播 CSS animation。修法：一次性的圓變暗 + 心跳只綁 is-fresh（點擊那次打開、favorite-heart-pop animationend 清掉），呼吸綁 is-selected 但 600ms 延遲只在 is-fresh。headless 驗證：點擊後有 pop + breathe，把節點 appendChild / insertBefore 搬一次後只剩 breathe 從 0 重跑、沒有 pop。', '愛心第二版（使用者提供）：金圓 .favorite-bg 與心形 .favorite-heart 分兩層——選取時圓 brightness 0.68 變暗再亮回、心形跳一下（translate / scale / rotate）再 2s 呼吸 + ±2° 擺動；拿掉光圈與閃光。金圓用稿的 180deg 漸層取代使用者的 145deg；心形由 flex 置中比稿高 1.4，用 margin-top 2.8 補（transform 被動畫佔用）。再調兩次定案：心形呼吸 1.5s、both（下壓前就停在第一格左傾姿勢）、origin 50% 65%；0/100% rotate(-4°) scaleX .98 scaleY .97 + 光暈 1px，50% 回正 scaleX 1.025 scaleY 1.045 + 光暈 2px；reduced-motion 時 transform 歸零、保留 1px 光暈。兩次貼 keyframes 都差點多留一個 }，改 CSS 後一定跑 prettier --check。切換 CSS 時多留了一個 } 讓 prettier 紅、Vite 也載不到新樣式，修掉後連拍：圓變暗心不變暗、心跳起再擺動。', '桌號徽章名稱太長（GPETERUJP）也要縮：把等比縮字抽成 views/components/useFitToWidth（outerRef / innerRef / key 字串；deps 不能傳動態陣列，eslint 會紅）給 LobbyStripText 與徽章共用；徽章是 flex 置中、溢出兩邊對稱，縮放原點在中心，左右各留 5 內距。', 'bonus 桌號徽章：使用者從 Figma 匯出藍色版 SVG（125×31，radial #54AFEC→#1C66ED 90%）→ public/assets/lobby/card/badge_room_id_bonus.svg，跑 assets:svgo；CARD_ASSET_URLS 加 roomIdBadgeBonus，LobbyTableCard 依 subType === bonusV2 切換。紅版是 127×33 含 1px 內陰影外溢、藍版沒有，同一個 62×17 框內藍版會略大一點點，先照原檔不補白邊。svgo 順手改寫了 src/assets/icons/icon_loading.svg（1 行），還原不帶進這次改動。', 'jackpot 底條：稿是「JACKPOT + 金額」一組置中、金額變長時 JACKPOT 往左讓。原本 JACKPOT 固定 83.5 寬 + 金額 flex-1 → 改容器 justify-center，標籤自然寬不縮、金額 flex 0 1 auto 可縮（吃 LobbyStripText 的等比縮字），gap 8。幣別符號字型：使用者貼稿的 CSS 是「Baloo Bhaijaan」——2017 原版，不是 Baloo Bhaijaan 2；原版已從 Google Fonts 下架、fontsource / cg-client / 系統都沒有，這就是稿上 ₱ 看起來比較粗的原因。定案用 Bhaijaan 2 的 500 對重量（刻意分歧）；頂欄餘額的 ₱ 也一併改 font-bhaijaan 500，baloo-2/500 不再載。JACKPOT（19px）與金額（17.5px）不在同一水平線：容器 items-center 讓小字基線偏低 → 改 items-baseline，截圖確認底線齊：main.tsx 載 @fontsource/baloo-bhaijaan-2/400、@theme 加 --font-bhaijaan、SYMBOL_CLASS 改 font-bhaijaan font-normal；document.fonts 確認 latin-ext 子集（含 ₱ U+20B1）loaded。', 'is-selected 綁 isFavorite：已收藏的桌在列表初次渲染時也會播一次回彈 + 光圈（cg-client 的 in 只在點擊時播）；先照使用者的版本，看過再決定要不要加 is-fresh 之類的閘。'],
    pitfalls: ['index.css 新增 @media (prefers-reduced-motion) 時要跑 src/platform/rwd 的繞道測試（只擋 matchMedia / 斷點，reduced-motion 沒被擋）。', 'scratchpad 的 measure.mjs 不見了（可能被清），從 fxprobe.mjs 的開頭重建 measure-head.mjs 當底。'],
    evidence: ['typecheck / lint / lobby 7 tests / rwd 23 tests 綠；strip-108.png、fx-heart2.png。'],
    todo: ['若不要初次渲染就播回彈，加一個只在點擊後打開的 class。'],
    files: ['src/views/lobby/LobbyStripText.tsx', 'src/views/lobby/LobbyTableCard.tsx', 'src/index.css', 'src/main.tsx', 'src/views/lobby/LobbyHeader.tsx', 'src/views/lobby/lobbyAssets.ts', 'public/assets/lobby/card/badge_room_id_bonus.svg', 'src/views/components/useFitToWidth.ts', 'src/views/LobbyView.tsx', 'docs/RWD架構.md', 'AGENTS.md', 'src/views/lobby/lobbyCardVariant.ts', 'assets-raw/lobby/card/badge_room_id*.svg（自 public 移入）'],
  },
  {
    date: '2026-09-11',
    title: '桌卡動效:愛心進場、收藏中與 PLAY 待機的斜光掃過 + 呼吸縮放(對照 cg-client Spine);路書三同色欄底並抽成共用 RoadStrip',
    branch: 'master(未 commit)',
    summary: [
      '使用者錄影指出 cg-client 左上愛心點下去有動效、右下 PLAY 也有常駐效果。查 cg-client:FavoriteRoomToggleButton 用 Spine cg_lobby_resources 的 in(點擊時播一次)+ Loop(收藏中持續);PlayButton 整顆是 sp.Skeleton,defaultAnimation play_btn_loop 常駐循環。Spine 檔是 3.8.99 二進位,本 repo 的 spine-core 4.3 讀不出 keyframe,改從 atlas 圖塊(金圓、Roombutton_Light 白光暈、UI_favorite_plus 白心、btn_play_add 亮面、btn_play_star_2 四角星)推結構,用 CSS 重現。',
      'index.css @theme 加五組:fav-pop(圓與心 0.4→1.18→1 彈跳 0.45s)、fav-burst(白光暈 0.5→2 擴散淡出 0.55s)、fav-glow(收藏中金色光暈呼吸 1.6s)、star-twinkle(四角星 1.4s,第二顆 delay 0.7s 交替)、play-sheen(亮面 opacity 呼吸 2.4s)。',
      'LobbyTableCard:favJustOn 狀態只在點擊後打開(cg-client 的 in 只在點擊時播,列表重建不播),burst 播完清掉;PLAY 鈕加 TwinkleStar 純 SVG 兩顆 + 亮面層。headless 截圖:PLAY 兩顆星交替、愛心 0.12s 時放大、0.7s 落定帶光暈。',
      '倍率字(500X 等)字內暗影:描邊字直接掛 text-shadow 會被畫在描邊之上、填色之下 → 底層透明字畫陰影。BONUS 補上 1:538 高光層(整字 bg-clip-text 鋪白色橢圓)。',

      '第二支錄影(17:26)使用者說動效不對,追問後定案:PLAY 待機與愛心收藏中都要「斜光掃過」(cg-client White_line1–3 圖塊),PLAY 文字與愛心本體要呼吸縮放。改成 shine-sweep(35% 寬白色斜光條在 overflow-hidden 圓內 translateX 掃過,2.2s 一輪、掃 45% 時間後停在外面)+ breathe-scale(scale 1→1.1→1,1.2s);拿掉 fav-glow / play-sheen;星光 9→12px。連拍畫格確認掃光經過、星光交替、文字與愛心大小在變。',
      '第三輪修正(使用者說「掃光不是一樣的」):PLAY 是一道白光沿粉色圓周旋轉、沒有星星 → conic-gradient 環 + radial mask 裁成 3px 環帶,ring-spin 2s 線性轉一圈;愛心只有心形本身有掃光與彈跳、金圓不動 → 心形 SVG 當 mask-image,掃光條只在心形內掃,fav-pop / breathe-scale 掛在心形容器。星光元件與 ShineSweep 元件移除。連拍畫格確認。',
      '第四輪:使用者說原版 PLAY 是「兩條旋渦」→ 改成兩道對稱的彎曲光尾繞鈕面轉:conic-gradient 兩個漸弱扇區(頭亮尾淡、相隔 180°)+ radial 遮罩(中心 38% 透明、70–88% 亮、邊緣淡出)+ ring-spin 2s。連拍四格確認兩道光尾位置在轉。',
      '第五輪(使用者連降兩次亮度後給了原版近拍錄影):原版的光是貼著粉圓外緣的細長弧、亮度低、圓面內側幾乎沒有 → 遮罩改只留外緣 76–100% 細環帶,兩道光尾各拉到約 1/3 圈、峰值 0.6。',
      '第六輪(使用者說光尾不見了):兩個原因。(1) 使用者把光層 markup 改成 class play-shine 但 CSS 沒有規則 → 改為在 index.css 頂層定義 .play-shine(conic + mask + ring-spin);(2) 我上一版遮罩用 radial-gradient(circle, …) 百分比是以 farthest-corner 為 100%(半徑 ×1.41),76% 以外的環帶整個落到圓外被遮掉 → 改 circle closest-side 讓 100% = 半徑,環帶 64–100%。連拍確認兩道光尾貼邊旋轉。',
      '定案:使用者自己調完 .play-shine(兩道光尾各約 1/3 圈、峰值 0.4 / 0.3、環帶 61–95%、1.5s 逆時針、translate -1px)並把 ring-spin keyframes 放到頂層;我把 @theme 內重複的 --animate-ring-spin 與 keyframes 移除,只留使用者那份。',
      'bonus 桌號徽章框色應不同(稿用另一個元件 1:8,其他三變體用 1:2):已抓的兩個 127×33 SVG 都是紅色版,Figma REST / MCP 都還在限流;依 AGENTS「三通道都不通時不目測估值」先不做,請使用者從 Figma 桌面版匯出 1:551 的 SVG。',
      '路書欄底:使用者指出特別欄底(luzhu_bg_active)是「三顆同色那一局」才有,不是最新一欄;cg-client LuShuItem.setLuShuData 確認 data.length>=3 且三個 winner 相同 → isAllSameColor。',
      '路書抽成共用元件:views/lobby/LobbyRoadStrip → views/components/RoadStrip(欄底圖改由 props columnBg / columnBgTriple 傳入,不綁 lobbyAssets),diceColors.ts 一起搬到 components;LobbyBetPercent 改路徑。房內路書之後可直接接。',
    ],
    decisions: ['動效時長與曲線是推定值,不是 Spine 原 keyframe;之後若拿到 Spine JSON 匯出可再對。星光用 inline SVG 免新增資源。', 'origin/master 又多三個 commit(8f5edc5 舊皮 192x 房間第一輪、8e542ca 移除 roomVariant 相關邏輯)——後者可能碰到 lobbyCardData 的 isSuperWheelNewUi 用法,merge 時要看。team-skills 沒有內容更新,只有 base-manifest.json。'],
    pitfalls: ['兩張 192x 的 SUPER 一大一小:DOM 幾何逐項相同、headless 2× 截圖逐像素相同,是使用者視窗 zoom(--ui-scale)非整數造成 0.75px 描邊落在不同半像素相位。根本解是引擎把 ui-scale 取整到 1/DPR,待使用者決定。', 'PLAY 文字量測其實和稿一致(墨心比外圓心高 1.9,稿本來就偏高);使用者看到的偏低同樣疑似相位或瀏覽器差異。'],
    evidence: ['typecheck / lint / lobby 7 tests 綠;fx-all.png、fx-heart.png 兩張驗證圖在 scratchpad。'],
    todo: ['--ui-scale 取整。', 'merge origin/master 後確認 isSuperWheelNewUi 消費端還在。', 'bonus 桌號徽章藍色版:等 1:551 SVG,加 CARD_ASSET_URLS.roomIdBadgeBonus 並依 subType 切換。'],
    files: ['src/index.css', 'src/views/lobby/LobbyTableCard.tsx', 'src/views/lobby/LobbyCardTitle.tsx', 'src/views/components/RoadStrip.tsx(自 lobby/LobbyRoadStrip 搬入)', 'src/views/components/diceColors.ts(自 lobby 搬入)', 'src/views/lobby/LobbyBetPercent.tsx', 'docs/plan/大廳-design-spec.md', 'MEMORY.md'],
  },
  {
    date: '2026-09-11',
    title: 'BONUS 彩字改成兩層重建對稿;兩張 192x 的 SUPER 看起來不同高是光柵化相位,不是版面',
    branch: 'master(使用者已把 benji-dev 併回;本段未 commit)',
    summary: [
      '使用者截圖:兩張 192x 卡的 SUPER 一大一小。CDP 量測兩張卡 DOM 幾何完全相同(字級 20.7、五個字母寬高一致、只差卡距 177),headless 2× 截圖逐像素相同 → 差異來自使用者視窗的 zoom: var(--ui-scale) 非整數,讓 0.75px 描邊落在不同半像素相位被吸附。根本解是 RWD 引擎算 --ui-scale 時把 432 畫布取整到 1/DPR;治標是描邊加粗到 1px。尚未動手,等使用者選。',
      'BONUS:稿(1:529)是兩層——底層 1:530 是 21px 逐字漸層字 + 藍色柔影/硬影,上層 1:533–537 是 17.3px、字距 .13em 的淡色描邊空心字疊在每個字母中央。原實作只取了上層的 17.3px 尺寸卻套底層漸層,字太小、描邊過重。改成 BonusLetters 三層(影 / 漸層字 / 內框空心字),群組寬量到 64.92 對稿 65。',
      '倍率字(500X 等)字內透出一圈暗影:描邊字上直接掛 text-shadow 時 Chrome 把陰影畫在描邊之上、填色之下。改成底層透明字畫陰影、上層只留描邊 + 填色(與主句 / 彩字同一招)。',
    ],
    decisions: ['使用者貼稿圖比對後補上 1:538 的高光:整字「BONUS」bg-clip-text 鋪一顆白色 radial-gradient 橢圓(稿 74×12.8 / 60%,CSS 取 96×13.2 / 45%,邊字才不會被弧度壓低);底層字母無字距,整字與逐字排版剛好對齊。硬影改 0.75/1。稿的 inset 暗邊仍不做(CSS 無 inset text-shadow)。'],
    pitfalls: ['（教訓）radial-gradient 預設 farthest-corner,遮罩百分比要用 closest-side 才是半徑。Figma 與 REST 今天都還在限流,這次靠之前抓下來的節點文字檔(card-bonus.txt + globals.txt 的 ts7–ts11 / style_ce143fbb)重建,沒有稿的截圖可疊圖;只驗了寬度與目視。'],
    evidence: ['typecheck / lint / lobby 7 tests 綠;bonus 頂列 4× 截圖目視符合稿的結構。'],
    todo: ['--ui-scale 取整(RWD 引擎)或描邊加粗,擇一處理 SUPER 相位差。', 'Figma 解限流後把 1:529 截圖疊上去對一次。'],
    files: ['src/views/lobby/LobbyCardTitle.tsx'],
  },
  {
    date: '2026-09-11',
    title: '大廳顯示名單改版:拿掉逐支玩法開關,改成 colorGameSupportedSubTypes;192x NewUI 回到「切換 UI」本意',
    branch: 'benji-dev(未 commit;同時解了 merge origin/master 的 AGENTS.md 衝突)',
    summary: [
      '使用者指出昨天的理解錯了:cocos 的 isColorGameSuperWheelNewUIEnabled + colorGameSuperWheelNewUIEnabledTables 只是 192x 的 UI 切換(命中的桌在大廳標成 newUi、進房帶去決定版面),不是閘門;其他四組「總開關 + 桌號名單」不該擋桌;改成一個 colorGameSupportedSubTypes 欄位,桌的 subType 代碼在名單內才顯示;空陣列＝不限制、全部顯示(使用者補充,不是 fail-closed)。',
      'domain/subGameGate.ts:isSubGameOpen → isSubTypeSupported(subType, codes);isSuperWheelNewUi 只看 NewUI 那一組。game/subGameGates.ts:supportedSubTypesOf / superWheelNewUiGateOf。',
      'config/fields.ts 八列 → supportedSubTypes(number[],jsonKey colorGameSupportedSubTypes);golden fixture 兩個 case 同步;public/project.json dev 值 [4, 9, 12, 13],NewUI 兩列保留。',
      'useLobbyTableList 改用支援名單過濾;lobbyCardData 多 isSuperWheelNewUi 欄位(也決定 isSuspend 算不算狀態);useLobbyCardLive 沿用它。資料流計畫 §1.1、design-spec、AGENTS.md、MEMORY 同步改。',
    ],
    decisions: [
      '這是專案負責人對 09-08 設計的裁定,不是 bug 修正:逐支玩法的 rollout 開關不是產品需求。domain 的 isGateOpen 保留給 NewUI 用。',
      'merge origin/master(Kaden 09-11,含 docs/多玩法架構.md 定案與 spike/frame-rooms/ 驗證——房間尚未落入 src,RoomView 仍是殼;我昨天說「已有 192x 第一個房間」講過頭)只有 AGENTS.md 衝突:以對方新版為底、把大廳現況三句塞回去。使用者問能不能不留 merge 紀錄 → 可以改走 rebase,benji-dev 未推,等他決定。',
    ],
    pitfalls: [
      '閘門機制(domain + fields)在大廳之前就進了 master(dd02ef4 / c712d45),但沒有消費者;我做桌卡列表時是第一個消費者,照文件接了 isSubGameOpen 並補 project.json 八個 key——文件寫得很篤定,但產品意圖跟文件不同。教訓:設定層的「規則」在第一次被消費前,要跟負責人確認一次,不能只信計畫文件。',
      '同一批 python 多段取代第 N 段失敗時前面的檔案已寫入、後面沒跑;之後改成逐檔獨立 assert、失敗就印出實際段落再重試。',
    ],
    evidence: ['typecheck / lint 0 warning / 411 tests / build 綠;大廳仍顯示 dev 頻道 16 桌(4 / 9 / 12 / 13 四種 subType)。'],
    todo: ['進房時把 isSuperWheelNewUi 餵給 resolveRoomVariant(enterRoom 目前只帶 tableCode;Kaden 的 RoomView 尚未消費 resolveRoomVariant);大廳桌卡對 newUi 的桌要不要有標示,等設計。', 'colorGameSupportedSubTypes 一列要請 SRE 進三環境 project.json。'],
    files: ['src/game/domain/subGameGate.ts', 'src/game/domain/subGameGate.test.ts', 'src/game/subGameGates.ts', 'src/game/subGameGates.test.ts', 'src/integrations/config/fields.ts', 'src/integrations/config/__fixtures__/golden.json', 'src/game/hooks/useLobbyTableList.ts', 'src/game/hooks/lobbyCardData.ts', 'src/game/hooks/useLobbyCardLive.ts', 'public/project.json', 'docs/plan/資料流與Store設計.md', 'docs/plan/大廳-design-spec.md', 'AGENTS.md', 'MEMORY.md'],
  },
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
      'bonus 卡的 BONUS 字母跑到下面:改共用 NUDGE 時 BONUS 容器那一行被 prettier 換行、字串取代沒對到,它還留著舊的 style={{ left }}、沒有 translateY(-50%),整組低了 10px。教訓:同一個規則要套在多處時,改完要 grep 確認每一處,不能只看最後一次 assert。',
      '標題四段字不在同一條線上:檔案裡有幾處手動試出來的位移(BASE -translate-y-[7px]、倍率/限額各 translate-y-[2px]、倍率描邊 2px),各段被推不同距離。改成四段共用一個 NUDGE(translateY(calc(-50% + 1px))),不要各自加 translate;逐字容器另給 h-[20px] items-center,不然 flex 容器被字母的陰影層撐到 21.7、跟主句的 20 差 0.85。觀看人數的「0」改在圖示右側區域置中(left 19.8 / right 4 / text-center)。',
      '幣別符號 ₱ 要粗:頂欄的用真字重(載 @fontsource/baloo-2/500 + font-medium,不用假粗或描邊);底條金額的 ₱ 稿本來就是另一套字(Baloo Bhaijaan 22.5 vs 數字 Luckiest Guy 18),Luckiest Guy 沒有 ₱ 字形會退回 Inter 變細 → LobbyStripText 加 symbol prop,三層各自畫符號。符號 1.25 倍字級會撐高行框、把數字擠出漸層帶(下半截變暗);改 transform 縮放又讓三層各自從不同起點縮、疊出鬼影;最後是 1.25 倍字級 + line-height 0(inline-block 高度為 0 不撐行框)+ 漸層帶起點改 0 蓋住符號頂端。',
      '底條字「鋸齒」:前層 0.5px 的 -webkit-text-stroke 沒有字型抗鋸齒(專案字型平滑又是 grayscale),2× 上有階梯;前層改不描邊,外框由後層 1px 描邊提供;隨之外框與陰影變淡,後層描邊改深金 #C96F08、填色加深、陰影層 0 1.5 2 35%。',
      '底條字頂被切成平頭:Luckiest Guy 大寫頂端比 leading-none 行框高 0.014em,超出盒子的部分沒有背景可裁;行框放大到 1.2、漸層改 em 定位到字身(0.086em–0.80em)。「很糊」:後層 1.15 的小數位移與 0.47 / 1.06 的小數描邊讓兩層邊緣疊出半透明帶;全部對齊 0.5 的像素格(1 / 1 / 0.5)。',
      '底條金字終於對上的關鍵是使用者貼的 Figma CSS:填色漸層是 darken 疊在 50% #FFD900 上(照抄漸層必偏淡),且 leading-trim: CAP_HEIGHT 代表漸層鋪在大寫字高、不是行框。做法:每個停止點算成 mix(stop, min(stop, #FFD900)) 的實色、停止點百分比照抄(含 −0.41% 與 146%),background-size 100% 70%(canvas 量 Luckiest Guy 18.9px 基線 13、cap 13.27 → 字身占行框 70%)貼上緣。',
      '愛心 on 圓的陰影:稿值 0 2 2 25% 在 1× 上幾乎看不見,把 Figma 匯出圖放大四倍看是偏移 2、模糊約 4 的柔陰影,擬合為 0 2 4 35%(刻意分歧)。',
      '愛心 on 狀態第一次真的看到(probe 點收藏截 4× 再取消):心形比金圓還大——absolute 的 SVG 給 size-full,100% 是相對圓(30)不是 inset 內框;改成明確 22.73×20.83 在 (3.6,6)。底條字用 truncate 會把字頂裁掉(leading-none 行框比 Luckiest Guy 字高矮,下移 2 後更明顯),改 whitespace-nowrap + 外層 overflow-x-clip 只裁水平。底條字顏色試了更暗、更黃兩個方向都不對,定回稿值;整組 transform 下移 2(使用者指定)。',
      '「整個外框大小不一樣」:逐列印像素才看到 Figma 卡底色延伸到 336(2×)才進陰影、app 在 334 結束——稿的 room 子框下移 2.95 且父框沒裁,可見卡高是 337 不是 334。修法是 room 容器 -bottom-[1.47px] 超出卡框,列距維持 177;使用者提議把卡高改 335,試過:內容全是從卡頂算的絕對座標,加高只讓列距漂 0.5,改回。',
      '對稿改用「掃顏色邊界」:兩張 2× 圖同一欄由上而下列出顏色類別變化列、逐列相減。發現 Figma 匯出圖的卡頂在 y=1(陰影外溢只有 1px,不是 4),之前的疊圖整張偏 1.5 CSS px(結論是相對比較,不受影響)。校正後各邊界與稿差 ≤1 個 2× 像素(0.5 CSS)。用 top / padding 補 0.5 會被版面貼齊吃掉(誤差只是搬到別的邊);改用 transform 把頂列以外內容整組 translate-y 0.5,transform 不參與版面、小數位移真的會畫出來——補後路書底、底條上下緣與稿完全同列,只剩時間條差 1 個 2× 像素。規則:半像素微調一律用 transform(桌號徽章的字也是用它調 0.75);方法寫進 design-spec。',
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
      '四變體頂列彩字(逐字漸層 ULTIMATE / BONUS)、108x / 192x 的 UP TO 標語、jackpot 預扣與滾動數字、免費投注狀態、視訊預覽、路書新欄閃爍、語言表桌名。',
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


// ─── Store 與 Hook 清單（第二個 tab）：每支的作用、誰寫、誰讀 ───────────────────────
// 規則（AGENTS.md）：寫 → actions；讀 → hooks；伺服器鏡射／一次性事件 → handler；
// store 只存 SDK 拿不回來、或多個畫面必須一致的東西，有 SDK getter 的一律用 hook 讀。
const STATE_INVENTORY = [
  {
    group: 'game/store（遊戲層 Zustand）',
    items: [
      { origin: '500x+', name: 'useGameStore', path: 'src/game/store/useGameStore.ts', role: '一張桌的局狀態鏡像：桌台身分（tableCode）、相位、開獎結果、轉盤結果、500x 電子倍率 rateDetail。', writer: 'GameHandler（room handler，POSITION_CHANGED 掛、離房拆）', reader: 'RoomFrame / 房內各殼、useSuperWheelRate、useBetControlSlots' },
      { name: 'useBetStore', path: 'src/game/store/useBetStore.ts', role: '注單與籌碼列的鏡射：已確認注、待確認注、選中籌碼、可下注旗標。', writer: 'BetHandler（唯一寫入者，訂 BetInfoCollection / ChipSelector）', reader: '只准經 useBetAmounts / useBetControlSlots 讀，不准直接讀 confirmedBets' },
      { origin: 'lobby+', name: 'useUiStore', path: 'src/game/store/useUiStore.ts', role: 'UI 開關：系統選單本體與其彈窗、注區手動開闔覆寫（boardOverride）、自訂籌碼面額彈窗、回放層；大廳廣告 banner 展開與首次演示旗標（isAdBannerOpen / adBannerIntroDone）、廣告彈窗本工作階段出過沒（adPopupDone）。', writer: 'actions/menu、actions/advertisement（toggleAdBanner）、房內按鈕 actions', reader: 'MenuLayer、LobbyView / LobbyMessageBar / LobbyAdBanner、RoomFrame' },
      { name: 'useWalletStore', path: 'src/game/store/useWalletStore.ts', role: '餘額與本局派彩金額。餘額一律來自 SYNC_MONEY。', writer: 'UserHandler（SYNC_MONEY）、派彩 handler', reader: 'LobbyHeader 餘額膠囊、房內餘額列' },
    ],
  },
  {
    group: 'platform/state（平台層，零遊戲知識）',
    items: [
      { name: 'useAuthStore', path: 'src/platform/state/useAuthStore.ts', role: '初次登入流程狀態（AUTHENTICATING → 成功／失敗），不存 token。', writer: 'actions/auth、SceneHandler（LOGIN_FAILED 只在初次登入寫）', reader: 'LoginView、LoadingView' },
      { origin: 'lobby+', name: 'useUserStore', path: 'src/platform/state/useUserStore.ts', role: '玩家身分：userId（GW 數字 ID）、userName（user.nick）、avatar、currency、isTourist、myDataReady（myData 撈回來沒，未就緒一律不動）。', writer: 'UserHandler（LOGIN_SUCCESS、NICK_NAME_CHANGED、GET_MY_DATA）', reader: 'LobbyView → LobbyHeader（暱稱／Tourist／頭像／幣別）、教學狀態、個人資料彈窗' },
      { name: 'useVideoStore', path: 'src/platform/state/useVideoStore.ts', role: '視訊連線狀態鏡像（framework VideoManager 的 UI 面）：status、畫質、靜音、容器元素（setContainerElement 要登記視訊框本身）。', writer: 'VideoAdapter', reader: 'VideoBand、AmbientBackdrop、VideoFadeOverlay、useStreamPending' },
      { name: 'useChatStore', path: 'src/platform/state/useChatStore.ts', role: '聊天列 UI：輸入列開關、可否輸入、遊客旗標、冷卻倒數。', writer: 'ChatHandler、聊天 actions', reader: '聊天列元件' },
      { name: 'useChatMessages', path: 'src/platform/state/useChatMessages.ts', role: '聊天飄字訊息佇列（Tier 2）。', writer: 'ChatHandler（消費 SDK 兩個訊息池）', reader: '飄字層' },
      { name: 'useGiftStore', path: 'src/platform/state/useGiftStore.ts', role: '收禮浮動橫幅佇列。', writer: 'ChatHandler（GIFT 型訊息轉發）', reader: 'GiftReceivedBanner' },
      { name: 'useI18nStore', path: 'src/platform/state/useI18nStore.ts', role: 'react-intl 的 locale / messages 單一來源（遠端 CSV 語言表）；runtime 動態鍵（桌名、注型名）直接讀它，固定文案走 t()。', writer: 'LanguageManager 下載完成', reader: 'IntlProvider、MessageHandler.tr、useTableInfo' },
      { name: 'usePreferencesStore', path: 'src/platform/state/usePreferencesStore.ts', role: '玩家偏好（RoomPreferences 四欄）的運行時真相，與 storage 同步。', writer: '偏好 actions / 選單彈窗', reader: '房內對應設定' },
    ],
  },
  {
    group: 'game/hooks（讀：訂閱 SDK／store，餵一個畫面）',
    items: [
      { origin: 'lobby', name: 'lobbyCardData（toLobbyCardData）', path: 'src/game/hooks/lobbyCardData.ts', role: '不是 hook 而是轉換函式：SDK Table → 桌卡純資料（狀態、相位、人數、限額、路書欄含 tag / bonusMatch / hasBonus / isLuckyBall、六色比例、jackpot、isSuperWheelNewUi）。唯一讀 SDK 的轉換點，路書判讀交 domain/lushu。', writer: '—', reader: 'useLobbyTableList、useLobbyCardLive' },
      { origin: 'lobby', name: 'useLobbyTableList', path: 'src/game/hooks/useLobbyTableList.ts', role: '大廳桌台列表：hiddenRooms 過濾 → colorGameSupportedSubTypes 名單 → sortTables；訂列表層事件（初始化、收藏變更）。DEV 下掛 window.__cgLuShu 除錯入口。', writer: '—', reader: 'LobbyView' },
      { origin: 'lobby', name: 'useLobbyCardLive', path: 'src/game/hooks/useLobbyCardLive.ts', role: '一張桌卡的即時資料：訂該桌事件、變更時重讀 toLobbyCardData；列表帶來的新快照以 initial 覆蓋。', writer: '—', reader: 'LobbyTableCard' },
      { origin: 'lobby', name: 'useTableCountdown', path: 'src/game/hooks/useTableCountdown.ts', role: '一張桌的下注倒數秒數與進度比例（時間條）；不在倒數相位不起 timer。', writer: '—', reader: 'LobbyTableCard' },
      { origin: 'lobby', name: 'useAdBanners', path: 'src/game/hooks/useAdBanners.ts', role: '大廳廣告清單：進大廳 emit GET_AD_BANNER、訂 UPDATE_AD_BANNER；轉成畫面用的圖片網址／停留毫秒／點擊目標；清單簽名沒變就不 setState、不記 log。', writer: '—', reader: 'LobbyView → LobbyAdBanner / LobbyMessageBar' },
      { origin: 'lobby', name: 'useMarqueeList', path: 'src/game/hooks/useMarqueeList.ts', role: '大廳跑馬燈清單：訂 SDK MarqueeList.REFRESH_LIST 讀 displayDatas（SDK 已過濾排序），轉成 text / scrollMs / 落點；簽名沒變不 setState。', writer: '—', reader: 'LobbyView（marqueeQueue 輪播 → LobbyMessageBar）' },
      { origin: 'lobby', name: 'useAdPopup', path: 'src/game/hooks/useAdPopup.ts', role: '大廳廣告彈窗要顯示哪一則：每工作階段第一次進大廳 emit GET_H5_POP_UP，挑時間窗內、本遊戲、id 最大；沒有就標記已處理。', writer: '—', reader: 'LobbyView → LobbyAdPopup' },
      { origin: 'lobby', name: 'useTableSnapshot', path: 'src/game/hooks/useTableSnapshot.ts（網址規則在 integrations/video/snapshotUrl.ts）', role: '桌卡未播預覽時的快照網址：TRTC 快照 → video-replay → null（預設圖），Image 預載確認後才回；掛載與 refreshKey 變動時重抓，維護桌不抓。', writer: '—', reader: 'LobbyTableCard 縮圖區' },
      { origin: 'lobby', name: 'useDirectGames', path: 'src/game/hooks/useDirectGames.ts', role: '頁尾跳轉面板的 Live / E-Game 清單（SDK DirectGameInfo），imgUrl 接上 site_assets。', writer: '—', reader: 'DirectGamePanel' },
      { name: 'useFormFactor', path: 'src/game/hooks/useFormFactor.ts', role: 'RWD 軸 3：版面形態 phone / wide，訂 viewport 單一廣播。JS 端「掛不掛」用它，CSS 端走 wide-frame: 前綴，同一處只能擇一。', writer: '—', reader: 'LobbyView（wide 旗標）、房內留白填補' },
      { name: 'useLayoutWidth', path: 'src/game/hooks/useLayoutWidth.ts', role: 'RWD 軸 1：版面基準寬（不是 uiScale，寬框時 uiScale 夾 1）。', writer: '—', reader: '房內幾何' },
      { name: 'useAppConfig', path: 'src/game/hooks/useAppConfig.ts', role: '部署設定 AppConfig 的唯讀綁定（config 載入後凍結）。', writer: '—', reader: 'LobbyHeader（showHome / roomBack / tableCode）、useLobbyTableList 等' },
      { name: 'useIsTourist', path: 'src/game/hooks/useIsTourist.ts', role: '是不是遊客（SDK User.isTourist，登入後固定）。', writer: '—', reader: '選單、儲值擋' },
      { name: 'useUserProfile', path: 'src/game/hooks/useUserProfile.ts', role: '個人資料彈窗的玩家資料：掛載時 emit GET_USER_PERSONAL_INFO，訂更新。', writer: '—', reader: 'ProfilePanel' },
      { name: 'useTableInfo', path: 'src/game/hooks/useTableInfo.ts', role: '底列桌名與荷官名：桌名查遠端語言表（table_<桌號>），沒有就顯示桌號。', writer: '—', reader: '房內底列' },
      { name: 'useTableLimits', path: 'src/game/hooks/useTableLimits.ts', role: '桌台各注型限額表與子玩法，訂 RANGE_LIST_CHANGED。', writer: '—', reader: '限額彈窗、注區' },
      { name: 'useBetAmounts', path: 'src/game/hooks/useBetAmounts.ts', role: '注額的通道無關選擇器（現金／免費投注一致介面）；注區、注單摘要、籌碼列只准讀這裡。', writer: '—', reader: '注區、注單摘要、籌碼列' },
      { name: 'useBetControlSlots', path: 'src/game/hooks/useBetControlSlots.ts', role: '籌碼列 UNDO／重下／加倍與確認／取消的 enable 條件，純衍生。', writer: '—', reader: '籌碼列' },
      { name: 'useEditChipList', path: 'src/game/hooks/useEditChipList.ts', role: '可編輯籌碼列表（EDITCHIP）：SDK 取得、排序、可選常用籌碼。', writer: '—', reader: 'Custom Chips 子面板' },
      { name: 'useSuperWheelRate', path: 'src/game/hooks/useSuperWheelRate.ts', role: '192x 倍率揭示要不要出現、目前跳到幾倍（從 useGameStore 本局結果現算，domain/superWheel）。', writer: '—', reader: 'superWheel 房的倍率揭示' },
      { name: 'useHistoryList', path: 'src/game/hooks/useHistoryList.ts', role: '歷史紀錄頁：依頁籤打一次 GTS，回列與總計。', writer: '—', reader: 'HistoryPanel' },
      { name: 'useFreePlayRecords', path: 'src/game/hooks/useFreePlayRecords.ts', role: '免費投注紀錄（近兩週）。', writer: '—', reader: 'FreePlayRecord 面板' },
      { name: 'useHasFreePlay', path: 'src/game/hooks/useHasFreePlay.ts', role: '系統選單「Free Play Record」列要不要顯示（domain/freeBetRecord 規則）。', writer: '—', reader: 'MenuLayer' },
      { name: 'useGameRulePages', path: 'src/game/hooks/useGameRulePages.ts', role: '規則頁要列的分頁（讀 TableCollection 一次，餵 domain/gameRules）。', writer: '—', reader: 'GameRulesPanel' },
      { name: 'useShareButtonVisible', path: 'src/game/hooks/useShareButtonVisible.ts', role: '房內分享鈕：canShareInfo ＋ 嵌在宿主 ＋ 手機 UA 三條件。', writer: '—', reader: '房內頂列' },
      { name: 'useStreamPending', path: 'src/game/hooks/useStreamPending.ts', role: '串流是否尚未 playing：留白環境背景與載入動效共用同一時機。', writer: '—', reader: 'VideoBand、AmbientBackdrop' },
      { name: 'useRetryableImage', path: 'src/game/hooks/useRetryableImage.ts', role: '圖片載入排隊與失敗重試（斷線期間掛的 img 在「情況變好」時再抓）；RetryableImage 元件包它。', writer: '—', reader: '所有 RetryableImage' },
    ],
  },
  {
    group: 'views/components（純畫面工具 hook 與共用元件）',
    items: [
      { origin: 'lobby', name: 'RollingText（元件）', path: 'src/views/components/RollingText.tsx', role: '數字滾輪（cg-client LabelRollerComponent）：吃一段排好版的字串，數字位各自上下滾到新值（變大往上、變小往下，每列 120ms、越左越慢 8%），逗號／小數點／符號不動；WAAPI 動畫，列表重排不重跑。父層字型、顏色、描邊、text-shadow 直接繼承；background-clip: text 的漸層字要把漸層經 glyphClassName 套到每個字元盒。rowEm 要等於父層 line-height。', writer: '—', reader: '目前只有 LobbyStripText（roll）→ UJP 桌卡獎池金額；房內餘額／派彩／獎池要滾直接掛它' },
      { origin: 'lobby', name: 'useFitToWidth', path: 'src/views/components/useFitToWidth.ts', role: '文字比框寬時等比縮小（transform: scale）而不裁切：量 inner 自然寬對 outer 的 clientWidth 扣掉左右 padding；字型 ready 與 ResizeObserver 時重算。', writer: '—', reader: 'LobbyStripText（底條）、LobbyTableCard 桌號徽章' },
      { name: 'useShrinkToFit', path: 'src/views/components/useShrinkToFit.ts', role: '一行字超出容器時整串等比縮小（量 Range 墨跡寬）。', writer: '—', reader: '房內窄欄位' },
    ],
  },
]

const ORIGIN_LABEL = { lobby: '大廳新增', 'lobby+': '大廳加欄位', '500x+': '500x 加欄位', other: '藍本／同事' }

function StateInventory() {
  return (
    <div>
      <p className="text-muted mb-4 max-w-[62ch]">
        目前專案裡的 Zustand store 與 React hook，各自負責什麼、誰寫、誰讀。分層規則：寫走 <code>game/actions</code>、讀走 <code>game/hooks</code>、伺服器鏡射走 handler；
        store 只存 SDK 拿不回來或多個畫面要一致的東西。
      </p>
      <div className="mb-6 rounded-lg border border-line bg-panel p-3 text-[.85rem]">
        <div className="font-semibold mb-1">我在大廳與 500x 加的</div>
        <ul className="list-disc pl-5 text-muted">
          <li><b>大廳新增的 hook</b>：lobbyCardData、useLobbyTableList、useLobbyCardLive、useTableCountdown、useAdBanners、useAdPopup、useMarqueeList、useTableSnapshot、useDirectGames；畫面工具 useFitToWidth 與 RollingText 元件。</li>
          <li><b>大廳沒有新開 store</b>，只在既有 store 加欄位：useUiStore 的 isAdBannerOpen／adBannerIntroDone／adPopupDone；useUserStore 的 isTourist。</li>
          <li><b>500x 目前沒有新 hook／store</b>，只在 useGameStore 加 rateDetail（電子倍率明細）；房間元件在 views/room/rooms/bonus/。</li>
          <li>其餘（useBetStore、BetHandler 相關 hook、房內與彈窗的 hook、platform/state 各 store）是 roulette 藍本或同事的工作。</li>
        </ul>
      </div>
      {STATE_INVENTORY.map((g) => (
        <section key={g.group} className="mb-6">
          <h2>{g.group}</h2>
          <div className="overflow-x-auto">
            <table className="text-[.85rem] w-full table-fixed">
              <colgroup><col className="w-[24%]" /><col className="w-[8%]" /><col className="w-[40%]" /><col className="w-[14%]" /><col className="w-[14%]" /></colgroup>
              <thead><tr className="text-muted text-left"><th className="pr-3 py-1">名稱</th><th className="pr-3 py-1">來源</th><th className="pr-3 py-1">作用</th><th className="pr-3 py-1">誰寫</th><th className="py-1">誰讀</th></tr></thead>
              <tbody>
                {g.items.map((it) => (
                  <tr key={it.name} className="border-t border-line align-top">
                    <td className="pr-3 py-1.5 align-top break-words"><code className="break-all">{it.name}</code><div className="text-[.7rem] text-muted break-all">{it.path}</div></td>
                    <td className="pr-3 py-1.5 align-top text-[.75rem]">{ORIGIN_LABEL[it.origin ?? 'other']}</td>
                    <td className="pr-3 py-1.5 align-top">{it.role}</td>
                    <td className="pr-3 py-1.5 align-top">{it.writer}</td>
                    <td className="py-1.5 align-top">{it.reader}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}

// 疑難雜症：跨螢幕漂移、次像素、動畫原點這類「不是 bug 卻很難看出原因」的題目；每題寫症狀 → 原因 → 解法 → 落點
const GOTCHAS = [
  {
    date: '2026-09-21',
    title: '用模板字串拼出來的 Tailwind class 完全沒生效',
    symptom: '組合注格的派彩字該貼右上，卻跑到左上；改 left／right 數字都沒反應。',
    cause: 'class 是執行期用模板字串拼的（`right-[calc(${n}*var(--upx))]`），Tailwind 掃描原始碼時看不到完整字面，不會產生那條 CSS；元素沒有 right/left 就落在靜態位置（左邊）。之前寫 left-[…] 版本「看起來對」只是剛好落在左邊。',
    fix: '位置要動態就用 inline style；Tailwind 任意值 class 必須是完整的字面字串（roomGeometry 的字面版／資料版並存也是同一個原因）。',
    where: 'src/views/room/rooms/bonus/BonusBoard.tsx PairPayoutSlot',
  },
  {
    date: '2026-09-18',
    title: 'WAAPI 動 transform，元素卻整顆跑到格子頂',
    symptom: '籌碼加注彈跳做完後不在格中心，跑到格頂（往左上各偏半顆）。',
    cause: 'Tailwind v4 的 -translate-x-1/2 / -translate-y-1/2 寫的是 CSS `translate` 屬性，不是 `transform`；WAAPI 關鍵影格寫 `transform: translate(-50%, …)` 是另一條軸，兩者相加就多平移了半顆。',
    fix: '關鍵影格改動 `translate` 屬性（`translate: "-50% calc(-50% + dy)"`），跟 Tailwind 同一條軸；或把動畫掛在沒有 Tailwind 位移的內層元素上。',
    where: 'src/views/room/rooms/bonus/BonusChipStack.tsx',
  },
  {
    date: '2026-09-18',
    title: '明明沒掛 transition，停注那一刻注區還是先動一下才跳',
    symptom: 'lowered 態刻意沒有 transition，但 betting → dealing 時注區仍先滑一小段再跳到下面。',
    cause: 'lowered 是在 useEffect 裡依相位邊沿 setState 的：相位變成 dealing 的第一幀，effect 還沒跑，data-board 先落在 resolveBoardState 算出的 shrunk（帶 0.5s transition）畫了一幀，下一幀才變 lowered。那一幀的過渡已經啟動。',
    fix: '相位邊沿改在 render 期推導（React「render 期 setState 推導狀態」：useState 存上一個相位，不同就同步 setState），第一幀就是 lowered，沒有中間態被畫出來。凡是「切換態要瞬間、不能被帶動畫」的推導都不能放 effect。',
    where: 'src/views/room/rooms/bonus/useBoardLowered.ts',
  },
  {
    date: '2026-09-18',
    title: '同一段字在不同螢幕上下差 0.5–1px',
    symptom: '房內底列桌名／局號、大廳桌卡徽章的字，在兩台機器（或不同 DPR）上下位置不一樣，量 computed style 都一樣。',
    cause: '位置是「多層小數運算」疊出來的：top-1/2 + -translate-y-1/2 兩個一半、items-center 置中行框、leading-none 把行框壓成字級後墨跡靠字型 ascent／descent 決定落點。每一層都是小數，瀏覽器在不同 DPR 各自貼齊像素、方向不一定相同。',
    fix: '把置中／位移換成單一固定頂距：top-[calc(5*var(--upx))] + items-start + leading-[normal]（baseline＝行框頂 + ascent，字型內建關係），只剩一個乘 --upx 的值要貼齊。大廳桌號徽章與 500x 籌碼金額膠囊（2026-09-21）也改成同一招：字 absolute 從容器頂量固定距離，Luckiest Guy 用 leading-none（行框頂≈大寫字頂）、Inter 用 leading-[normal]；先前徽章用的 text-box-trim 已拿掉（裁到大寫字高後 bg-clip／溢出會切字）。',
    where: 'src/views/room/shared/BottomInfoBar.tsx（Kaden 05ac022）、src/views/lobby/LobbyTableCard.tsx 徽章',
  },
  {
    date: '2026-09-15',
    title: '路書格子看起來歪（各欄骰子貼齊到不同像素）',
    symptom: '六欄路書每欄的小方塊左右偏移不一致，放大看有的貼左有的貼右；使用者連說三次「歪」。',
    cause: '欄寬 24.4、格子 15.5 置中 → 每欄的格子 x 落在不同小數（4.7、5.1、5.4…），光柵化各自貼齊到不同像素。固定 left 也一樣，只要欄距不是整數就會逐欄漂。',
    fix: '全取整：欄 25、格子 15 靠左 5、細框 21 @2；欄距 3.58 維持節距 28.58。格子邊與欄邊的小數部分相同就會往同一邊貼齊。',
    where: 'src/views/components/RoadStrip.tsx',
  },
  {
    date: '2026-09-18',
    title: '注區縮小看起來「先往中間縮再往下移」',
    symptom: '500x 停注後注區從原尺寸縮到 0.84，動畫像兩段：先縮、再掉下去。',
    cause: 'transform-origin 在頂邊中央、同時又改 bottom：scale 把內容往頂邊收，bottom 讓整個框往下走，兩條路徑疊起來就是先縮後移。cg-client 的節點錨點在中心、位置與縮放同一條 tween。',
    fix: '洞留在原位不改 bottom，只動 transform：以中心為原點 translateY(18) scale(0.84)，一條 transition 就是「整塊往下縮」。',
    where: 'src/views/room/runtime/roomGeometry.ts BONUS_POS.board',
  },
  {
    date: '2026-09-18',
    title: '要「進去有動畫、出來直接跳」：transition 看的是切換後的樣式',
    symptom: '停注進 lowered 要直接跳、翻完進 shrunk 要 0.5s 移動、開局回 open 要直接跳。',
    cause: 'CSS transition 由「切換後」元素身上的 transition 屬性決定要不要過渡，不是切換前的。',
    fix: 'transition 只掛在 shrunk 態的 class（board-shrunk:transition-[bottom,transform]），open／lowered 態沒有，於是只有進 shrunk 那一段會動。',
    where: 'src/views/room/runtime/roomGeometry.ts CLOSING_MOTION',
  },
  {
    date: '2026-09-17',
    title: '在瀏覽器 console 用 import() 拿到的 store 不是畫面用的那一個',
    symptom: 'await import("/src/game/store/useGameStore.ts") 後 setState，DOM 沒反應。',
    cause: 'Vite dev 只要編輯過檔案，HMR 會讓後續模組請求帶 ?t=時間戳，畫面用的是 /src/…/useGameStore.ts?t=xxx 這個 URL 的實例；沒帶 query 的 import 會再建一份。',
    fix: '從 performance.getEntriesByType("resource") 找出實際載入的 URL（含 ?t=）再 import 那個；或重整頁面後再 import 無 query 的路徑。',
    where: '模擬相位／rateDetail 時用；debug 指令 setPhase 不帶 rateDetail 會把它清掉，別用它。',
  },
  {
    date: '2026-09-18',
    title: '自動化 Chrome 的載入頁卡在 43% 不動',
    symptom: '載入任務 log 全部完成、已送 move2login，畫面卻停在 LOADING…43%，JS 評估還會逾時。',
    cause: '那個 Chrome 視窗被擋在後面，document.visibilityState 是 hidden，Chrome 把 requestAnimationFrame 停掉；載入頁的進度條是 rAF 補間，永遠跑不到 100%。',
    fix: '把視窗拉到前面（或別在後台開自動化視窗）；程式面不用改，正常使用不會遇到。',
    where: '只影響 Claude in Chrome 的驗證流程',
  },
  {
    date: '2026-09-16',
    title: '廣告 banner 多張時點了不會跳轉',
    symptom: '單張廣告點得到，兩張以上點不動。',
    cause: '多張時容器 setPointerCapture 做拖曳，指標被擷取後 pointerup 的目標是容器，圖片按鈕收不到 click。',
    fix: '在 onPointerUp 判斷「沒滑動且不是 pointercancel」就當作點擊中間那張；單張沒擷取，走原生 click。',
    where: 'src/views/lobby/LobbyAdBanner.tsx',
  },
  {
    date: '2026-09-18',
    title: '測試本地綠、CI 紅：載入鏈觸達 @toppath 真件',
    symptom: 'vitest 拋「測試載入鏈觸達了 @toppath/* 真件」，錯誤只說被撞、不說誰撞。',
    cause: 'CI 剝掉 @toppath 後才 install；共用件新加的 hook（例：PayoutPanel → usePayoutResult）在載入期 import SDK，房間測試沒替身就整條鏈拉進來。',
    fix: '從 FAIL 那支測試往下追 import；帶業務值的 SDK 依賴在測試裡 vi.mock 那支 hook（照 192x 房測試的替身清單抄）。',
    where: 'src/views/room/rooms/*/*.test.tsx、vitest.config.ts alias、src/testing/toppathAbsentGuard.ts',
  },
]

// Console 速查：在瀏覽器 console 拿當下狀態、打指令、直接寫 store 的做法（DEV／staging 才有 __GAME_DEVTOOLS__）
const CONSOLE_TIPS = [
  {
    title: '看當下這一局（相位、局號、骰子、電子倍率）',
    code: `JSON.parse(__GAME_DEVTOOLS__.snapshotJSON()).stores.GameStore`,
    note: '常用欄位：phase（betting／dealing／payout／closed／cancelled）、roundCode、srcResults（三顆色碼 801–806）、rateDetail（500x 電子倍率：注型 → { rate, matchColors?, bonusColor? }）、gameState（SDK 原值）。函式欄位會印成 "[Function …]"，忽略。',
  },
  {
    title: '其他 store',
    code: `const snap = JSON.parse(__GAME_DEVTOOLS__.snapshotJSON()).stores
snap.BetStore        // pendingBets / confirmedBets / lastRoundBets / chipList / selectedChipValue
snap.UserStore       // userId / userName / currency / isTourist
snap.UiStore         // boardOverride / adPopupDone …
snap.VideoStore      // status / provider / quality / signal
snap.AuthStore snap.ChatStore snap.GiftStore snap.PreferencesStore snap.I18nStore`,
    note: 'snapshotJSON 是一次性快照，不會自動更新；要看變化就再叫一次。',
  },
  {
    title: '打 dev 指令（灰色只改前端、紅色會送 Server）',
    code: `__GAME_DEVTOOLS__.run('game.phase.dealing')   // 也有 game.phase.betting / game.phase.payout
__GAME_DEVTOOLS__.run('game.wheel.triple')    // 開三同色(黃)、轉盤歸零
__GAME_DEVTOOLS__.run('game.wheel.spin')      // 轉盤翻倍 +1
__GAME_DEVTOOLS__.run('bet.add')              // 下注（黃）；bet.confirm / bet.cancel / bet.undo / bet.double / bet.rebet
__GAME_DEVTOOLS__.run('menu.toggle')          // menu.profile / roomPopup.customChipAmount / menu.freePlay
__GAME_DEVTOOLS__.run('assets.audit')         // 資產抓漏`,
    note: '⚠ game.phase.* 是整份 syncRound 但沒帶 rateDetail，切完 500x 的電子倍率會被清成 {}；要保留 rateDetail 用下面「直接寫 store」。指令清單在 src/debug/*Commands.ts。',
  },
  {
    title: '直接寫 store（模擬相位／結果／電子倍率）',
    code: `// 1. 找畫面實際載入的模組 URL（Vite dev 編輯過檔案後會帶 ?t=，直接 import 無 query 的路徑會拿到另一個實例）
const url = performance.getEntriesByType('resource').map(e => e.name).find(n => /useGameStore/.test(n))
const { useGameStore } = await import(url)
// 2. 停注 + 電子倍率
useGameStore.setState({ phase: 'dealing', gameState: 3, srcResults: [], roundCode: 'SIM-1',
  rateDetail: { 807: { rate: 15, matchColors: 2, bonusColor: 806 }, 808: { rate: 500, matchColors: 3, bonusColor: 801 }, 802: { rate: 5, matchColors: 2 } } })
// 3. 派彩（綠二同 → 807 命中）
useGameStore.setState({ phase: 'payout', gameState: 5, srcResults: [806, 801, 806] })
// 下注額：同法 import useBetStore，setState({ confirmedBets: { anyTriple: 10 } })`,
    note: '下一個 SDK 事件會把 store 整份覆蓋回真值，模擬只撐到那時；用 dev 桌（沒荷官、局不動）最穩。',
  },
  {
    title: '看外殼現在的狀態（不用 store）',
    code: `const f = document.querySelector('[data-testid="room-frame"]')
f.dataset.phase   // 相位
f.dataset.board   // open / hidden / shrunk / lowered
f.dataset.layout  // standard / bonus`,
    note: '注區格：button[data-bet-type]（801–806 六色、807 anyDouble、808 anyTriple），data-dim 壓暗、[data-lit] 點亮的示意骰框、[data-testid=bonus-rate-tag][data-style=normal|payout] 倍率標。',
  },
  {
    title: '大廳：路書原始資料',
    code: `window.__cgLuShu   // useLobbyTableList 在 DEV 掛的，每張桌的 SDK 路書`,
    note: '只有 DEV 有；用來對 108x／500x 倍率與 UJP JP 局。',
  },
]

function ConsoleTips() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted max-w-[62ch]">瀏覽器 console 拿當下狀態、打指令、直接寫 store 的做法。<code>__GAME_DEVTOOLS__</code> 只在 DEV／staging 注入（<code>src/debug/devConsole.ts</code>）。</p>
      {CONSOLE_TIPS.map((c) => (
        <section key={c.title} className="bg-panel border border-line rounded-xl p-4">
          <h3 className="m-0 mb-2 text-[1rem]">{c.title}</h3>
          <pre className="m-0 mb-2 p-3 rounded-lg bg-black/30 text-[.78rem] overflow-x-auto whitespace-pre"><code>{c.code}</code></pre>
          <p className="m-0 text-[.85rem] text-muted">{c.note}</p>
        </section>
      ))}
    </div>
  )
}

function Gotchas() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted max-w-[62ch]">不是功能、也不算 bug，但下次再遇到會再花半天的題目：症狀 → 原因 → 解法 → 落點。新的放最上面。</p>
      {GOTCHAS.map((g) => (
        <section key={g.title} className="bg-panel border border-line rounded-xl p-4">
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-[.75rem] text-muted font-mono">{g.date}</span>
            <h3 className="m-0 text-[1rem]">{g.title}</h3>
          </div>
          <dl className="grid grid-cols-[4.5em_1fr] gap-x-3 gap-y-1.5 text-[.85rem] m-0">
            <dt className="text-muted">症狀</dt><dd className="m-0">{g.symptom}</dd>
            <dt className="text-muted">原因</dt><dd className="m-0">{g.cause}</dd>
            <dt className="text-muted">解法</dt><dd className="m-0">{g.fix}</dd>
            <dt className="text-muted">落點</dt><dd className="m-0 font-mono text-[.75rem]">{g.where}</dd>
          </dl>
        </section>
      ))}
    </div>
  )
}

export default function ColorGameLogPage() {
  const [tab, setTab] = useState('log')
  const [q, setQ] = useState('')
  const [openSet, setOpenSet] = useState(() => new Set([0]))
  const term = q.trim().toLowerCase()
  const flat = (e) => [e.date, e.title, e.branch, ...(e.summary || []), ...(e.decisions || []), ...(e.pitfalls || []), ...(e.evidence || []), ...(e.todo || []), ...(e.files || [])].join(' ').toLowerCase()
  const topicOf = (e) => e.topic ?? 'log'
  const shown = ENTRIES.map((e, i) => [e, i]).filter(([e]) => topicOf(e) === (tab === 'b500' ? '500x' : 'log')).filter(([e]) => !term || flat(e).includes(term))
  const toggle = (i) => setOpenSet((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })

  return (
    <div>
      <h1>{tab === 'b500' ? 'colorgame 500x 房間製作歷程' : tab === 'gotchas' ? 'colorgame 疑難雜症' : tab === 'console' ? 'colorgame Console 速查' : 'colorgame 製作歷程'}</h1>
      <div className="flex gap-2 mb-4">
        {[['log', '大廳歷程'], ['b500', '500x 房間'], ['state', 'Store 與 Hook'], ['gotchas', '疑難雜症'], ['console', 'Console 速查']].map(([k, label]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`px-3 py-1 rounded-lg border text-[.85rem] cursor-pointer ${tab === k ? 'border-accent-deep text-accent' : 'border-line text-muted hover:text-accent'}`}>{label}</button>
        ))}
      </div>
      {tab === 'state' ? <StateInventory /> : tab === 'gotchas' ? <Gotchas /> : tab === 'console' ? <ConsoleTips /> : (<>
      <p className="text-muted mb-5 max-w-[62ch]">
        {tab === 'b500'
          ? <>500x（bonusV2）房間的每個工作段落。稿 <code>CG_RWD (Copy)</code>、量測值在 <code>docs/plan/500x房間設計規格.md</code>；行為對照 cg-client <code>ColorGameBonusRoomView</code>。</>
          : <><code>nexus-colorgame-client</code> 每個工作段落的紀錄:做了什麼、做了哪些決定、踩到什麼坑、拿什麼證據說做完了、留下什麼。
        最新在最上面。repo 內的正式紀錄是 <code>MEMORY.md</code> 的重大變更記錄,這頁是自己看的、可以更囉嗦。</>}
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
  topic: '500x',        // 500x 房間 tab 用；大廳／共用省略
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
      </>)}
    </div>
  )
}
