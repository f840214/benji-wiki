import { useState } from 'react'
import Code from '../components/Code.jsx'

// nexus-colorgame-client 速查:Store 與 Hook 清單、疑難雜症、Console 指令。製作歷程(日誌)在 ColorGameLogPage。
// 加新的疑難雜症:GOTCHAS 最前面加一筆 { date, title, symptom, cause, fix, where };Console 指令:CONSOLE_TIPS 加 { title, code, note }。

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
        <div className="font-semibold mb-1">hook 跟 store 到底差在哪、什麼時候用哪個</div>
        <p className="text-muted mb-2"><b>store 是「資料放在哪」，hook 是「元件怎麼拿到資料」</b>，不是同一層、不是二選一。</p>
        <ul className="list-disc pl-5 text-muted mb-2">
          <li><b>store</b>（zustand）：活在 React 樹外的物件，保存狀態、能 setState、能被訂閱。存在的唯一理由：有東西要<b>被多處共享、或在元件掛卸之間活下來</b>。例：useGameStore 的相位與骰子——handler 從 SDK 收到寫進去，注區、倒數、派彩各自讀。</li>
          <li><b>hook</b>：render 期跑的函式，回「這個元件現在該看到的值」，負責訂閱、變了讓元件重畫；<b>本身不保存任何東西</b>，資料從別處來（store、SDK model、config、registry、DOM 量測）。useGameStore((s) =&gt; s.phase) 其實就是 store 自帶的 hook。</li>
        </ul>
        <p className="text-muted mb-1"><b>什麼時候要開 store</b>（CLAUDE.md：只存 SDK 拿不回來的）：</p>
        <ol className="list-decimal pl-5 text-muted mb-2">
          <li>一次性事件的 payload，過了就沒了（派彩結果、中獎通知）。</li>
          <li>純 UI 狀態，SDK 不知道（選單開不開、注區手動收起、roomSheet）。</li>
          <li>樂觀值（下注還沒被伺服器確認前先顯示）。</li>
          <li>很多畫面必須對同一份值一致、而且來源會變（gameState）。</li>
        </ol>
        <p className="text-muted mb-1"><b>只要 hook、不要 store</b>：</p>
        <ul className="list-disc pl-5 text-muted mb-2">
          <li>資料<b>隨時能從別處拿回來</b>：SDK model 有 getter（餘額、桌資訊）、config（部署期凍結）、registry（靜態總表 × 來源）。再抄一份進 store 只是多一個會過期的副本，「用 A 欄位當 B 的刷新訊號」那種 race 就是這樣來的。</li>
          <li>資料<b>只有一個元件用、跟它同生共死</b>：面板開著才查的榜單（useBonusRank，一次往返，useState 就夠）。</li>
        </ul>
        <p className="text-muted mb-1"><b>兩個例子</b>：useCampaignSurfaces 是 hook 沒有 store——回的值是「總表（靜態）× 來源（config，凍結）」算出來的，兩個輸入隨時在手、算一次很便宜，沒東西要保存或共享。useTripleBonusStore 是 store——檔期清單一次往返拿回來後，大廳 icon、房內鈕、歷史條、核心派彩都要讀同一份，而且我們決定不依賴 SDK 寫回 table 的那個欄位，落在「拿不回來／多處共享」那一邊。</p>
        <p className="text-muted"><b>快速判斷</b>：問「這個值我現在不存，等一下還拿得到嗎？」拿得到 → hook 就好；拿不到或要大家一致 → store，再用 hook 讀它。</p>
      </div>
      <div className="mb-6 rounded-lg border border-line bg-panel p-3 text-[.85rem]">
        <div className="font-semibold mb-1">我在大廳與 500x 加的</div>
        <ul className="list-disc pl-5 text-muted">
          <li><b>大廳新增的 hook</b>：lobbyCardData、useLobbyTableList、useLobbyCardLive、useTableCountdown、useAdBanners、useAdPopup、useMarqueeList、useTableSnapshot、useDirectGames；畫面工具 useFitToWidth 與 RollingText 元件。</li>
          <li><b>大廳沒有新開 store</b>，只在既有 store 加欄位：useUiStore 的 isAdBannerOpen／adBannerIntroDone／adPopupDone；useUserStore 的 isTourist。</li>
          <li><b>500x</b>：useGameStore 加 rateDetail（電子倍率明細）；房間自己的 hook useMascotPlay（小精靈名單與進度）、useBoardLowered（停注過渡）、useBoardMirror（hud 平面的注區鏡像）、useBonusRank（得獎榜一次往返）；元件在 views/room/rooms/bonus/。</li>
          <li><b>活動</b>：useTripleBonusStore（views/campaigns/tripleBonus/store.ts，檔期清單、最近中獎局號，隨呈現卸載清）；useCampaignSurfaces（views/campaigns/hooks.ts，總表 × 來源 → 某個 slot 有哪幾塊）。</li>
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
    date: '2026-09-24',
    title: '用會繼承的自訂屬性做過渡，整頁每幀都在重算樣式',
    symptom: 'banner 推開 400ms 期間 iPhone Safari 卡一下；把讀那個變數的元素從 height 改成 transform、拿掉圖片都沒用。',
    cause: '@property --ad-banner-h { inherits: true } 掛在舞台根節點上過渡，每一幀值變一次，瀏覽器就把整棵子樹（所有桌卡）的樣式重算一遍；成本來自「繼承的變數在動」，不是誰在讀它。',
    fix: '拿掉變數，需要同步的兩處各自寫 transform: translateY 並共用同一個 transition class 常數（bannerPush.BANNER_PUSH_TRANSITION）。',
    where: 'src/views/lobby/bannerPush.ts、LobbyView.tsx、LobbyBackdrop.tsx',
  },
  {
    date: '2026-09-24',
    title: '桌卡時間條用 width 過渡，桌數多時整列每幀重繪',
    symptom: '大廳捲動一直在重畫，一兩桌還好、桌多就卡。',
    cause: '每張卡的倒數時間條每 500ms 更新 width 加 500ms 過渡 → 每張倒數中的卡連續重排＋重繪；再加上每 500ms 的 setState 在卡片層，整張卡（路書、膠囊）跟著 reconciliation。',
    fix: 'width → transform: scaleX（origin-left）；倒數 hook 抽進 LobbyTimeBar 子元件；桌事件資料沒變不 setState、卡片 React.memo。',
    where: 'src/views/lobby/LobbyTableCard.tsx、src/game/hooks/useLobbyCardLive.ts',
  },
  {
    date: '2026-09-24',
    title: 'Pixi 投影跟著 DOM 過渡動，但固定慢一幀',
    symptom: '廣告 banner 展開時大廳標題（Spine，layout-shift 量測）跟著下移，但整段 400ms 都比 DOM 列表落後一點。',
    cause: 'ResizeObserver 回呼在每幀排版後、繪製前；continuous 模式的 ticker 在 rAF 開頭已經畫過這一幀，requestRender() 在 continuous 下是 no-op，新位置要等下一幀 ticker。DOM 在第 N 幀、canvas 在第 N−1 幀。',
    fix: '框架 stage 加 renderNow()（立刻 app.render），layout-shift 回呼量完版位就補畫一次。只有 layout-shift 節點走這條，靜止時 RO 不觸發零成本；render 不改 DOM 不會觸發 RO，不會迴圈。animation-frame 模式解不了：它在 rAF 量的是上一幀的排版，只會更慢。',
    where: 'pixi-game-framework src/core/pixi/stage.ts renderNow、src/core/hooks/usePixiNode.ts layout-shift effect',
  },
  {
    date: '2026-09-24',
    title: '鄰居 repo 落後，元件傳的 prop 值框架不認得卻不報錯',
    symptom: '標題不跟 banner 走。measurementMode="layout-shift" 寫得很篤定、typecheck 綠。',
    cause: '本機 pixi-game-framework 沒 pull 到「開放 measurementMode」那筆，型別只有兩個值；但合併後的 @toppath/* 解析讓字串型別放寬，未知值靜默退回預設 event-driven。',
    fix: '看到「寫得對卻沒效」先對鄰居 git log：cd ../pixi-game-framework && git fetch && git log HEAD..origin/main。node_modules/@toppath/* 是符號連結，pull 完 npm run build 就吃到，不用 npm run sync。',
    where: '../pixi-game-framework、../game-client-framework（DevCommand.visible 同一天同樣情況）',
  },
  {
    date: '2026-09-23',
    title: '文字對盒子在不同螢幕上下差 1px，固定頂距還是壓不掉',
    symptom: '注單摘要顆上的倍率字（四層描邊 Luckiest Guy）在兩台裝置相對顆的位置差 1px；改成整數頂距、邊框取整都沒用。賠率列與金額字（單層 Inter）同招卻有效。',
    cause: '瀏覽器把每個 HTML 文字盒的基線各自貼到整數像素，底圖盒停在小數位置反鋸齒；--upx 是小數時任何設計 px 乘出來都是小數，固定頂距只能減少「疊加的層數」。單層文字對一個盒子只剩一次捨入差，多層描邊字（四個 span）加底圖是五次。',
    fix: '階梯：① 固定整數頂距 ＋ leading-normal、不用 flex/grid 置中、不用 translate；② 邊框、位移取整；③ 還不行就把字和底圖畫進同一張 SVG（相對位置不再各自捨入）。注單摘要倍率字用 ③（WinRateTextSvg），賠率列與金額字用 ①。順帶量到 Luckiest Guy 的 line-height normal 剛好 1em，跟 leading-none 同位。',
    where: 'src/views/room/shared/WinRateTextSvg.tsx、SelfBetPill.tsx、OddsInfoBar.tsx',
  },
  {
    date: '2026-09-23',
    title: 'Figma REST 的圓角也是 2× 值',
    symptom: '路書欄框照稿 cornerRadius 8 畫出來圓到像膠囊。',
    cause: '稿是 2× 畫布，absoluteBoundingBox 之外 cornerRadius／strokeWeight／fontSize 全部都是 2× px。',
    fix: '所有從 REST 抄的長度一律 ÷2，圓角、描邊、字級都算。',
    where: 'src/views/components/RoadStrip.tsx GEO.room',
  },
  {
    date: '2026-09-22',
    title: '照稿畫出來的漸層多了一條斷層',
    symptom: '房內膠囊／路書點畫出來上半部有一塊較亮的區域、55% 處一條硬邊，稿上沒有。',
    cause: 'Figma REST 回傳的 fills 陣列含 visible=false 的圖層（設計師關掉但沒刪）。我第一次 dump 用 paint() 有濾掉，第二次為了看漸層方向另寫的 dump 沒濾，就把那層「上半內光」放射漸層（54%→55% 硬停）照抄進 CSS。',
    fix: '讀 fills／strokes／effects 一律先過 visible !== false；抄圖層前對一下兩次 dump 的層數。這次把該層整個拿掉，膠囊與點回到三層（角落白光、頂部高光帶、底色）。',
    where: 'src/views/room/shared/colorStyles.ts ROAD_DOT_LAYERS',
  },
  {
    date: '2026-09-21',
    title: '同一畫面上兩顆籌碼的金額字，一顆偏上一顆正常',
    symptom: '同一個元件、同一組 CSS，落在不同格子的籌碼，膠囊裡的數字上下差 1px。固定頂距那招沒解掉。',
    cause: 'Chrome 把 HTML 文字的基線貼到整數裝置像素，膠囊底圖（div 背景）卻停在小數位置反鋸齒。兩個格子的 y（84.1／159.8 × --upx）小數部分不同，字與底圖各自貼齊的方向就不同。固定頂距只能消掉「層層疊加」的漂，消不掉底圖與文字分開貼齊。',
    fix: '底圖與字放進同一張 SVG（rect + text 共用 viewBox），SVG 內的文字不另外貼齊像素，相對位置固定。凡是「小底圖上印一個數字」都適用；純文字對純文字（同一行）沒這問題。',
    where: 'src/views/room/rooms/bonus/BonusChipStack.tsx',
  },
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
    note: 'game.phase.* 現在會帶 rateDetail（2026-09-21 修）；500x 專用的四段在下一格。指令清單在 src/debug/*Commands.ts。',
  },
  {
    title: '500x 四段狀態（在 500x 桌內，逐段打）',
    code: `__GAME_DEVTOOLS__.run('game.bonus.betting')   // 開局：注區展開、清結果、換局號
__GAME_DEVTOOLS__.run('game.bonus.mascot')    // 小精靈：補自注→停注→2.5s 開綠二同（Double 100X），播完 7s 後換局再走黃三同（Triple 500X）；兩隻沒辦法同一局
__GAME_DEVTOOLS__.run('game.bonus.stop')      // 停注：注區直接跳到下面、翻電子倍率，1.4s 後自動縮小
__GAME_DEVTOOLS__.run('game.bonus.results')   // 開出綠二同：縮小態，Double 100X、綠 2X、黃 1X
__GAME_DEVTOOLS__.run('game.bonus.payout')    // 派彩相位（同上結果）`,
    note: '明細固定：807 100X 鎖綠、808 500X 鎖黃、白 5X 二同、綠 100X 三同。要看下注額先用 bet.add 或直接寫 useBetStore。真桌下一個 SDK 事件會覆蓋回去，用 dev 桌最穩。',
  },
  {
    title: '直接寫 store（模擬相位／結果／電子倍率）',
    code: `// 1. 找畫面實際載入的模組 URL（Vite dev 編輯過檔案後會帶 ?t=，直接 import 無 query 的路徑會拿到另一個實例）
const url = performance.getEntriesByType('resource').map(e => e.name).find(n => /useGameStore/.test(n))
const { useGameStore } = await import(url)
// 2. 停注 + 電子倍率
useGameStore.setState({ phase: 'dealing', gameState: 3, srcResults: [], roundCode: 'SIM-1',
  rateDetail: { 807: { rate: 100, matchColors: 2, bonusColor: 806 }, 808: { rate: 500, matchColors: 3, bonusColor: 801 }, 802: { rate: 5, matchColors: 2 } } })
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
          <Code className="mt-0 mb-2">{c.code}</Code>
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

export default function ColorGameRefPage() {
  const [tab, setTab] = useState('state')
  return (
    <div>
      <h1>{tab === 'gotchas' ? 'colorgame 疑難雜症' : tab === 'console' ? 'colorgame Console 速查' : 'colorgame Store 與 Hook'}</h1>
      <div className="flex gap-2 mb-4">
        {[['state', 'Store 與 Hook'], ['gotchas', '疑難雜症'], ['console', 'Console 速查']].map(([k, label]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`px-3 py-1 rounded-lg border text-[.85rem] cursor-pointer ${tab === k ? 'border-accent-deep text-accent' : 'border-line text-muted hover:text-accent'}`}>{label}</button>
        ))}
      </div>
      {tab === 'gotchas' ? <Gotchas /> : tab === 'console' ? <ConsoleTips /> : <StateInventory />}
    </div>
  )
}
