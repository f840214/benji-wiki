import DataTable from '../components/DataTable.jsx'
import Code from '../components/Code.jsx'

// nexus client 的 PixiJS / Spine 專頁:用到什麼、怎麼用、遇過什麼問題。
// 資料來源:nexus-roulette-client 的 src/views/room/{payout,layers,runtime}、docs/開發規範與指引 §11、
// docs/資源規範與流程 §六、MEMORY.md + MEMORY-archive.md 的 pixi 相關條目、docs/archive/pixi-connected-asset-scheduling.md、
// pixi-game-framework README「必須知道的契約」(2026-09-08)。版本只寫大版,精確版看 package.json。

const USED = [
['pixi.js 直接用到的(只有五個符號)', [
  ['Text', '中獎號碼', '向量字 Barlow Condensed 90px + dropShadow;resolution 2 讓進場放大仍銳利。建立前必等 document.fonts.load'],
  ['BitmapText', '派彩金額', '.fnt 位圖字 roulette_result_font;fontSize=16 = bmf 原生大小,縮放全交給 rAF'],
  ['Assets.cache.has(url)', '判 spine 檔是否已下載', '唯讀查詢,派彩三檔拍板用;Assets.load / get / add / unload 全部被 lint 擋'],
  ['type Application', '型別', 'onApp 回呼拿到 Application 掛 WebGL context lost 監聽;不自己 new Application'],
  ['type Container', '型別', 'ISpineLike extends Container,只為操控動畫 / skin / 骨頭'],
]],
['spine-pixi-v8(不直接 import)', [
  ['createSpineInstance({ skel, atlas })', '命令式建 Spine', '框架 helper,經 import() 延後取得(測試載入路徑上 CI 會剝 @toppath);繼承 runtime lazy 載入、待卸載 settle 閘門、in-flight 回報'],
  ['<Spine>', '宣告式', '框架元件,skel / atlas / animation / skin / loop / objectFit / sourceSize / canvas / onInstance'],
  ['spine.state.setAnimation / addAnimation', '播動畫', 'in → out;徽章 result_light_w_in → loop'],
  ['skeleton.setSkinByName + setupPoseSlots', '換 skin', '三色徽章各只覆寫 result_skin 一個 slot;4.3 改名 setupPoseSlots,舊名 setSlotsToSetupPose 並列相容'],
  ['getBonePosition(bone) / findBone', '骨頭錨定', '號碼錨 Roulette_win_wheel、金額錨 Roulette_win_Ribbon;讀不到骨頭用 setup-pose 實測值 fallback'],
  ['skeleton.data.findAnimation(name).duration', '讀動畫時長', 'GiftVisual 用來把橫幅停留對齊動畫輪次'],
]],
['@toppath/pixi-game-framework/core', [
  ['SceneStack + RenderPlane', '房間 9 平面', 'RoomView 宣告 topology,compositor 依 island 分組自動建 canvas;backend="pixi" 的平面各自成島 → 全房 2 張 canvas'],
  ['IManagedPixiIslandOptions', 'island 參數', '{ id, resolution, onApp };id 註冊進 registry 供跨平面投影;由 useFxIslandOptions 產生'],
  ['CanvasScope target="fx"', '指定畫進哪張 canvas', 'PayoutFx 包住 PayoutEffect;沒包時 <Spine> 走最近祖先 context'],
  ['RenderLayer', '命令式投影面', 'designWidth / designHeight / fit="contain" / onLayerCreated;給一個 design 座標系,包辦 DOM 對位、自適應、資源 refcount;layer.container 加物件、layer.load / release 管資源'],
  ['Layer z={n}', '整頁疊層', '每個 XxxLayer 用一次;z 集中在 roomLayers.ts;interactive prop 控整層 pointer-events'],
  ['Label', '雙後端文字', 'BalanceBar / GameStateHint / GameStateHintLabel 用,backend="react"(其實是 DOM,只為與框架其他元件同一套量測)'],
  ['PixiCanvas', '獨立 canvas', '只剩 FxCanvas 包裝給 dev/tools 用;房間本體不再直接 render'],
  ['setupSpineRuntime / configureAssetLifecycle / configureAssetScheduler / installDefaultAssetUnloader', 'runtime 啟動四件', 'pixiRuntime.ts 唯一呼叫點;Spine pipe 註冊、idle-TTL 60s、注入 app 的單一佇列、預設卸載器'],
  ['preloadAssets(urls, { priority })', '預載', 'pagePreload 的 pixi 載入器;回 IAssetPreloadHandle(ready / release);框架以 import() 延後取得,首屏才不碰 pixi'],
  ['isRenderLayerDisposedError', '分辨卸載中止', '卸載中止不算失敗、不重試、不推熔斷'],
  ['textShadowSafePadding / applyTextShadowAnchorFix', 'Text 投影補正', 'dropShadow 的 distance 只往右下擴,anchor 0.5 對的是含留白的框;框架算 padding + 寫一次 pivot'],
]],
['@toppath/pixi-game-framework/geometry(純幾何,不碰 pixi)', [
  ['containRect(w, h, ratio)', 'letterbox 矩形', 'AspectBox 算盤面框、OvalClickLayer 把點擊換算成 0..1'],
  ['PolygonHitIndex / IPolygonRegion', '多邊形命中索引', 'ovalHit.ts:橢圓盤注區的點擊判定(矩形盤用 CSS grid)'],
]],
['本專案自己的 Pixi 相關模組', [
  ['views/room/runtime/pixiRuntime.ts', 'runtime 啟動', 'createRoomPixiRuntimeSetup 注入四個框架函式,單例 Promise,重複呼叫共用'],
  ['views/room/runtime/loadRoomView.ts', '進房唯一載入點', '畫面 chunk 與 runtime 平行下載,await setupRoomPixiRuntime() 後才 resolve → PixiCanvas 掛載時 pipe 必已備妥'],
  ['views/room/runtime/fxIslandOptions.ts', 'island 設定', 'useFxIslandOptions(id):裝置分級 resolution + WebGL lost/restored 回報 elog;attachWebglLossReporting'],
  ['views/room/FxCanvas.tsx', '獨立 canvas 版', '同一套設定包 PixiCanvas;只有 dev/tools 在用'],
  ['views/room/layers/StageFxLayer + LoadingSpine', '載入動效', 'stage-fx 島;串流未就緒時掛 <Spine>,播放時卸載 → 場景空 → 框架 pauseWhenEmpty 停 ticker'],
  ['views/room/payout/PayoutFx.tsx', '派彩顯示窗狀態機', '讀 store 決定開窗 / 關窗,<CanvasScope target="fx"> 包 PayoutEffect'],
  ['views/room/payout/PayoutEffect.tsx', '派彩命令式演出', 'RenderLayer 864×800 + 兩支 spine + Text + BitmapText + 單一 rAF 時間軸'],
  ['views/room/payout/payoutSpines.ts', 'spine 載入組裝', 'usePayoutSpines:layer.load → createSpineInstance ×2 → skin / 動畫 / 掛載;ready / settled 兩訊號;失敗重試一次'],
  ['views/room/payout/payoutTimeline.ts', '純函式時間軸', 'T 常數(骨架事件決定)、numberPose / amountPose / wheelAlpha、payoutCast 三檔拍板'],
  ['views/popup/gift/GiftVisual.tsx', '禮物 spine', 'giftType 4~7 用 Gift_All 骨架同名 skin + animation,canvas="fx" 跨平面投影;其餘靜態圖'],
  ['platform/device.ts getPixiResolution()', '裝置分級', 'DeviceChecker 等級 → resolution 上限,低階機自動降'],
  ['game/assetScheduler.ts', '全 app 單一佇列', '策略值 8/2/400/30s/4/8s/60s;runWithRetry 引擎;注入框架讓 pixi 載入與 DOM 圖 / 音效共用在途預算'],
  ['scripts/inspect-spine.mjs', '離線讀 .skel', '動畫長度、事件時點、setup-pose 骨頭位置、skin 覆寫哪些 slot、atlas 區域;寫任何版位 / 時序常數前先跑'],
]],
]

const ISSUES = [
['runtime / 實例', [
  ['currentTarget.isInteractive is not a function', 'pixi.js 雙實例', 'framework 以 symlink 連入且自帶 nested node_modules,app 與 framework 各解析到一份 pixi,extensions 註冊表兩份、instanceof 跨實例失效。修:vite resolve.dedupe 列 pixi.js / spine-pixi-v8 / react / react-dom;tsconfig paths 釘 pixi.js 型別。少任一項即重現'],
  ['spine autoUpdate 忽快忽慢 / 不動', 'autoUpdate 依賴 Ticker.shared', '本 canvas 用 app 自有 ticker,Ticker.shared 不可靠。修:兩支 spine 都 autoUpdate=false,由 PayoutEffect 單一 rAF 手動 update(dt)'],
  ['進房 PixiCanvas 掛上時 Spine 畫不出來', 'Spine pipe 未註冊', 'loadRoomView 先 await setupRoomPixiRuntime()(內含 setupSpineRuntime)才回畫面 chunk;runtime 啟動點唯一,不要在別處自行 configure'],
  ['低階機卡、WebGL context lost', '解析度與 context 壓力', 'getPixiResolution 依裝置分級降 resolution;attachWebglLossReporting 把 lost / restored 送 elog(純被動記錄,是否還原交框架)。保護順序:Spine 演出最先被砍'],
]],
['資源生命週期', [
  ['禮物 spine 播一播間歇黑掉,不報錯', 'spine-pixi 骨架資料快取未隨 atlas 卸載作廢', 'Spine.from 會把解析好的 SkeletonData 存進 Pixi 全域 Cache(key skel-atlas-scale),不隨 Assets.unload 清,卻指著 atlas 的 page 紋理。idle-TTL 卸掉 atlas 後下一則禮物命中殘留快取 → 算繪讀 null 的 addressModeU → 全黑。間歇是因為要等 TTL 真的觸發(兩則禮物間隔 > 30s)。修在框架:spineSkeletonCache 登記簿,atlas 卸載成功時連帶作廢。通則:卸載一份資源不等於它的衍生物也作廢;第三方在框架視線外寫的全域快取,存活期要顯式綁回它依據的資源'],
  ['自己 Assets.unload(x.atlas) 後 spine 黑掉', '繞過框架沒有保護', 'Pixi parser 連子圖檔一起砍且不看 refcount,還留下上面那筆骨架殘骸。一律走框架:TTL 卸載或 unloadSpineAssets()(後者對 skel/atlas 不看 refcount,只能在確定沒人用時呼叫)'],
  ['直呼 Assets.load 偶發破圖、極難重現', '繞過持有記帳與卸載閘門', 'idle-TTL 卸載進行中有一個 microtask 寬的空窗,同步進去的載入會撈到正被銷毀的物件。修:lint no-restricted-syntax 擋 Assets.load/get/add/unload/backgroundLoad;元件內 layer.load / useManagedAssets,命令式 preloadAssets'],
  ['TTL 卸載後派彩字型「還在」但畫不出', '跨掛載保存 resolved promise', 'payoutAssets 曾快取 load promise,TTL 卸載後誤判仍就緒。修:每次掛載重新 layer.load,由 Pixi cache 判斷命中或重載;測試釘住「不得跨掛載重用 resolved promise」'],
  ['派彩 BitmapFont 被持有兩次', 'RenderLayer.assets 與 effect 內 load 並存', '單一持有點:bmf 的 load / release 只在 PayoutEffect 的字體 effect 成對,不另掛 RenderLayer assets'],
  ['同一段演出重複掛卸、局間空檔重新解碼卡頓', 'TTL 太短', '派彩那組解碼後約 6.7MB,低階機看得見卡頓。idle-TTL 30s → 60s;寬限逐資源獨立計時,從 refcount 歸零起算;卸載只丟 Pixi 側紋理,檔案仍在瀏覽器快取'],
]],
['派彩演出', [
  ['派彩 spine 整局不演,任何網速都一樣', '起跑拍板競速(毫秒級)', '弱網改造把「演哪些部位」定為金額字就緒那一刻拍板,但金額字鏈(快取 bmf)9ms、spine 鏈(layer.load + 動態 import + 兩支骨架解析)16ms,spine 必輸,明明已掛上場景(alpha=1)卻每局被拍成「沒到」。修:三檔拍板——已下載只剩 GPU / 組裝(Assets.cache.has 全命中)→ 等毫秒級收尾;還在網路上抓 → 不等,數字準時開演、spine 這局缺席;確定失敗(含重試)→ 同數字降級。起跑後 spine settle 觸發 effect 重跑走「續跑」(castRef + startAtRef,時間軸不歸零、onStart 不重發)'],
  ['一度懷疑 RenderLayer 0 像素', '截圖落在 4.9 秒窗口外', '金額其實有演,觀察錯誤。教訓:對「有沒有畫出來」下結論前,先用場景圖探針(patch addChild 記 alpha / 時刻)取證,截圖時機不可靠'],
  ['spine 載入失敗整段靜默消失', 'spine 4.3 改名 setupPoseSlots', '舊名 setSlotsToSetupPose 呼叫 throw,又沒 .catch,整段特效無聲消失。修:兩名並列相容;載入失敗一律記 log 不靜默——本檔就是靠會吵才抓到這件事'],
  ['弱網下派彩資源沒到就整局沒特效', '派彩當下才載,一次失敗沒有補救點', '進房預載並持有派彩資源(usePagePreload 的 ROOM_ASSET_SETS,有持有語意的資源持有到離房);失敗重試一次(runWithRetry,卸載中止不重試);資源到哪裡就演到哪裡——spine 沒到只演號碼 + 金額,號碼錨徽章骨靜止位、無底板也演'],
  ['向量字沒到連金額都不演', '兩條載入鏈綁在一起', '金額 bmf 與號碼向量字各自獨立 withRetry;金額是最低門檻,號碼是加分'],
  ['中獎號碼字用了錯的字型、之後不會自己修', '字型未就緒就建 Text', 'Pixi 建 Text 時以替代字型測量並把結果烤進紋理。修:建立前 await document.fonts.load(spec);document.fonts.check() 判不出假粗,不能用'],
  ['號碼整體偏左上各半個 distance', 'Text dropShadow 的 anchor 陷阱', 'distance 一律加在文字邊界的右與下(不看 angle),anchor 0.5 對齊的是含影子留白的框;模糊往左暈的邊緣還會被貼圖裁掉。修:textShadowSafePadding 產 padding、applyTextShadowAnchorFix 寫一次 pivot;元件不得再自己寫 pivot 或在位置上補半個 distance(並存會多補一整個)'],
  ['金額字位圖格高 ≠ 字墨高,置中偏下', '.fnt lineHeight 16 但字形實高 100', 'BitmapText 的 height / getLocalBounds 只反映行高。視覺縮放用字形實高算,垂直置中做 (glyphH − lineHeight)/2 × scale 校正'],
  ['BitmapFont 註冊撞名', '交付 .fnt 的 face="Arial"', 'Pixi 拿 face 當註冊名,泛用名必撞。進 repo 改成 roulette_result_font;披索符改掛 U+20B1(舊字型是把字形掛在 P 碼位的權宜)'],
  ['金額字圖 172KB 拖慢派彩', '字圖過大', '640 → 320 減半,172KB → 60KB;bmf 走 assets:compress 無損 webp,.fnt page 指向改 .webp'],
  ['換新版 win_result 後光暈 / 號碼時序不對', '骨架換版是靜默失敗', '動畫 / skin / slot 名是未型別化的依賴:新版 result_light_y 整層消失、number 事件在 0.6s。修:每次換版先跑 inspect-spine 列 inventory 對 diff;時序常數對齊骨架事件,不憑感覺縮'],
  ['spine 動畫自帶的表現跟稿不同', '界線問題', 'spine 以外的東西(號碼、金額字型、舞台版位、時間軸)才調;spine 內的(面板骨位置、飛出的籌碼)一律不動,要改請美術重出'],
]],
['載入與分包', [
  ['pixi 整包進首屏(13 個小 chunk 一起 modulepreload)', 'pagePreload 靜態 import 框架', 'pagePreload 被 loading / login / lobby 共用;進房前根本沒有 pixi 資產集。修:框架改在 pixi 載入器內 import();加 scripts/check-dist-preload.mjs 掃首屏 chunk 的 needle,typecheck 與測試看不出這類回歸'],
  ['想把 pixi 拆更細省首屏', '拆不掉', 'manualChunks 硬指定 vendor-pixi 會變 entry 的靜態依賴而 eager(實測 642K);把 WebGPU / Canvas renderer 排除做不到——pixi 的 barrel 靜態 re-export 且宣告有副作用。pixi + spine + framework 合成單一 async chunk,拆更細只多幾趟 RTT'],
  ['pgf 改 pixi 自訂入口', '評估不做', 'vendor-pixi 1599K rendered 中 spine-core 386K 動不了、spine-pixi 自己用 Graphics / Mesh / Text 264K;能搖的只剩 filters / tiling / nine-slice 約 20~25K gz,代價是框架自維護 extension 清單、pixi 升版重驗'],
  ['atlas 圖頁 / .fnt 圖頁不在佇列在途預算內', 'Pixi parser 在 Assets.load 內部發的請求', '「同時在途 6 個」實際可能 9 個。想用 DOMAdapter 攔不成立:loadTextures 預設 preferWorkers,圖片在 Web Worker 裸 fetch,主執行緒攔不到;關 worker 換帳面準確不划算(低階 Android)。決定不做,本專案連帶檔只有 4 支、扇出 1:1'],
  ['兩個 pixi 資產集同時 afterPaint 把 low 配額佔滿', '兩層都排隊', '持有名額的人在等自己內層的名額。修:排隊粒度改 URL,預載 runner 不自己排隊;框架 loadAssetUrl 收斂成單一入口並 configureAssetScheduler 注入 app 那條佇列(是注入不是自建,自建會分裂成兩條各算各的)'],
  ['同房進兩次第二次還在排隊', '快取命中仍進佇列', '框架 loadAssetUrl 加快取快速通道:本輪載過的 URL 不再排隊(檔案在瀏覽器快取,網路成本零);只跳過排隊,卸載閘門與 in-flight 回報照走'],
]],
['版面與量測', [
  ['高解析度(864×1536)下 loading spine 顯得特別小', '定位框寫死 px 落在縮放層外', 'spine 的量測框在螢幕空間(視訊帶定位框),115×80.31 要乘 --upx 才跟框寬走'],
  ['LoadingSpine 在 dev 工具裡 top 算成 0', '百分比對到 0 高容器', '要比照 StageFxLayer 包一層 h-[var(--video-band-h)] 定位框'],
  ['收禮橫幅 spine 不播、後續所有禮物都不顯示', 'CSS keyframes 被剪,不是 spine 壞', 'gift-banner-in/out 定義在 @theme 內,唯一引用是 inline style.animation 字串,Tailwind 掃描器看不到 → 從未輸出。動畫名對不到 → 不發 animationend → started 恆 false → play={started} 讓 spine 永不掛載 → 停留計時不啟動 → 佇列頭卡死。修:keyframes 移出 @theme;加 5s 保底退場,骨架載不到永遠只停在外觀層'],
  ['dev 工具量到 spine「不會畫」', '分頁在背景', '分頁切到背景時 CSS 動畫與 Pixi ticker 一起凍結,animationend 不發、計時被節流。量測要讓分頁維持前景,觀測結果寫進 DOM 再截圖讀'],
  ['三張合成圖相減量版位被汙染', 'JPEG 與重繪差異', '量徽章版位時把徽章 spine 暫時 re-parent 到 layer、隱藏主 spine,各自單獨截圖後分割像素;離線 mesh 盒與畫面量測兩條路互證'],
  ['rAF 驅動的特效沒法截圖對稿', '每幀都在動', '把 iframe 的 requestAnimationFrame 包一層、時間戳夾在固定經過時間,整段凍在指定那一幀;其他 plane visibility:hidden 得到純特效畫面(preview-measurement skill)'],
  ['教學凍結後派彩 spine 還在動', '凍住資料 ≠ 凍住畫面', 'pixi 時間軸、CSS 動畫、吃牆鐘的元件都不看 store,各需一道獨立閘門'],
]],
]

export default function PixiPage() {
  return (
    <div>
      <h1>Pixi / Spine</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        nexus client 裡 PixiJS 8 的定位很窄:<b>只畫 Spine 骨骼動畫</b>,全房兩張 canvas,一律經 <code>@toppath/pixi-game-framework</code>,
        不自建 Application / ticker / renderer。注盤、籌碼、高亮、面板全是 DOM/SVG。這頁記用到的東西、兩種用法、資源生命週期,
        以及一路踩過的坑。架構全貌在 <a href="#/nexus-client">nexus client</a> 頁。
      </p>

      <DataTable sections={USED} headers={['東西', '用在哪', '怎麼用 / 注意']} placeholder="搜尋 API、模組…" />

      <h2>Pixi 在畫面上只出現在三個地方</h2>
      <Code>{`RoomView(managed SceneStack,9 平面 → compositor 併成 2 張 canvas)
  stage-fx     island id "global-fx"   StageFxLayer → LoadingSpine     串流未就緒時的載入動效(videoloading/ingame_loading)
  overlay-fx   island id "fx"          PayoutFx → PayoutEffect         派彩:主 spine + 徽章 spine + 號碼 Text + 金額 BitmapText
                                       GiftVisual canvas="fx"          禮物:Gift_All 骨架,錨在聊天層、畫進 fx canvas(跨平面投影)

為什麼只有兩張:一張 canvas 一個 WebGL context,低階機撐不了多個。新演出接既有的 fx 島,不新增 canvas。
為什麼不是 Pixi 畫注盤:排版交給 Tailwind、命中用 CSS grid / 多邊形索引,低階機更省,RWD 跟 DOM 一起縮不用算矩陣。
保護順序:視訊 > 下注 > 狀態同步 > 盤面動畫 > Spine——資源不足時 Spine 第一個被砍。`}</Code>

      <h2>生命週期:從進房到離房</h2>
      <Code>{`① runtime 啟動(進房前,唯一入口)
   App.tsx  const RoomView = lazy(loadRoomView)
   loadRoomView():畫面 chunk 與 runtime 平行 import → await setupRoomPixiRuntime() → 回畫面
   pixiRuntime.ts(單例 Promise,重複呼叫共用):
     installDefaultAssetUnloader()                        預設卸載器
     configureAssetLifecycle({ enabled: true, ttlMs: 60_000 })   idle-TTL 60 秒(refcount 歸零起算,逐資源獨立)
     configureAssetScheduler(loadScheduler)               注入 app 的單一佇列(pixi 載入與 DOM 圖 / 音效共用在途預算)
     await setupSpineRuntime()                            Spine pipe 註冊,之後才准掛 PixiCanvas

② canvas 建立(RoomView 掛載)
   const fxIsland = useFxIslandOptions('fx')            { id, resolution: getPixiResolution(), onApp }
   <RenderPlane id="overlay-fx" backend="pixi" z={4.1} pixiIsland={fxIsland}>
   onApp(app) → attachWebglLossReporting(app, id)       webglcontextlost / restored → elog

③ 資源載入(三條路,全部經框架的 loadAssetUrl)
   宣告式 <Spine skel atlas>                            元件自動持有,unmount 自動釋放
   命令式 await layer.load(urls) … layer.release(urls)  RenderLayer 的持有點,成對
   預載 preloadAssets(urls, { priority })               pagePreload 的 pixi 載入器;進房後 usePagePreload(ROOM_ASSET_SETS) 閒時抓並持有到離房
   → 不准 Assets.load(lint 擋):繞過卸載閘門會在 TTL 空窗撈到正被銷毀的物件

④ 卸載
   refcount 歸零 → 60s 後框架卸載(丟 Pixi 側紋理,檔案留在瀏覽器快取)
   spine 複合資源 → 框架連帶清 page 圖與骨架快取;自己 Assets.unload 會留殘骸、下次建 Spine 全黑
   場景空 → 框架 pauseWhenEmpty 自動停 ticker + 清畫面(LoadingSpine 卸載後就是這樣)`}</Code>

      <h2>用法 A:宣告式 &lt;Spine&gt;(載入動效、禮物)</h2>
      <Code>{`// views/room/layers/LoadingSpine.tsx——最簡單的用法
<Spine
  skel={LOADING_SPINE.skel}
  atlas={LOADING_SPINE.atlas}
  animation="Loop"
  loop
  objectFit="contain"                 // 置中並等比縮進外框,框中心即視覺中心
  className="pointer-events-none absolute left-1/2 top-[45.4%]
             h-[calc(80.31*var(--upx,1px))] w-[calc(115*var(--upx,1px))] -translate-x-1/2 -translate-y-1/2"
/>
// 外框在螢幕空間,尺寸要乘 --upx 才跟框寬走;canvas 由最近祖先(stage-fx 平面)的 context 取得

// views/popup/gift/GiftVisual.tsx——跨平面投影 + 固定參考框 + 讀動畫時長
<Spine
  skel={GIFT_SPINE.skel} atlas={GIFT_SPINE.atlas}
  animation={spec.anim} skin={spec.anim} loop
  objectFit="contain"
  sourceSize={{ width: spec.source.w, height: spec.source.h }}   // 固定參考框:動態 bounds 會讓 fit 抖動、每次大小不一
  canvas="fx"                                                     // 錨在聊天層,畫進 overlay-fx 的 canvas(靠 island registry id)
  className="absolute inset-0"
  onInstance={(instance) => {
    const seconds = instance?.skeleton?.data?.findAnimation?.(spec.anim)?.duration;
    if (seconds > 0) onDuration(seconds);                         // 橫幅停留 = 兩輪動畫
  }}
/>
// play={false} 時保留同尺寸空槽不掛 spine;滑入完才 play → 從第 0 幀播、且一次量到定位`}</Code>

      <h2>用法 B:命令式(派彩)</h2>
      <Code>{`// views/room/payout/PayoutFx.tsx——狀態機在 store,元件不持有觸發狀態
<CanvasScope target="fx">
  <div className="pointer-events-none absolute inset-x-0 top-[41.67%] aspect-[864/800] -translate-y-1/2">
    <PayoutEffect key={runId} number={…} color={…} amount={…} onExit={handleExit} onStart={markPlaying} />
  </div>
</CanvasScope>

// views/room/payout/PayoutEffect.tsx——唯一的框架投影面
<RenderLayer designWidth={864} designHeight={800} fit="contain" className="absolute inset-0" onLayerCreated={handleReady} />
// design 空間 864×800 = 2× 設計稿 px;這支骨架的單位就是 2× 設計 px,所以 spine scale=1 放 origin (432, 370),
// 骨頭座標 + 原點 = design 座標,零矩陣換算;框寬 432 時 1 design px = 0.5 CSS px

// payoutSpines.ts——載入組裝(failure 重試一次,卸載中止不算失敗)
const [m, w] = await withRetry(async () => {
  await layerRef.current?.load(urls);                       // 持有 + 等進行中卸載 settle + Assets.load
  return Promise.all([spineFactory.create(PAYOUT_SPINE), spineFactory.create(WIN_RESULT_SPINE)]);
});
m.autoUpdate = false; w.autoUpdate = false;                 // Ticker.shared 不可靠,rAF 手動推進
w.skeleton?.setSkinByName(WHEEL_SKIN[color]);              // result_red / result_dark / result_green
(sk?.setupPoseSlots ?? sk?.setSlotsToSetupPose)?.call(sk); // 4.3 改名,兩名相容
w.state.setAnimation(0, 'result_light_w_in', false);
w.state.addAnimation(0, 'result_light_w_loop', true, 0);
m.addChild(w);                                             // 徽章是主 spine 子物件
m.state.setAnimation(0, 'in', false);
m.position.set(origin.x, origin.y);
layerRef.current?.container.addChildAt(m, 0);              // 墊底,文字壓其上
// cleanup:main.destroy({ children: true }); layerRef.current?.release(urls)

// 文字:字型就緒才建
await document.fonts.load('600 90px "Barlow Condensed"');   // 沒備妥就建 Text 會以替代字型烤進紋理
const num = new Text({ text: String(number), style: NUMBER_STYLE, resolution: 2 });
num.anchor.set(0.5);
applyTextShadowAnchorFix(num);                              // 投影補正,之後不得再寫 pivot
const amt = new BitmapText({ text: formatAmount(amount), style: { fontFamily: 'roulette_result_font', fontSize: 16 } });

// 單一 rAF 時間軸
const frame = (now) => {
  const dt = (now - last) / 1000; const e = (now - startAt) / 1000;
  main.update(dt); wheel.update(dt);                        // 推進 spine
  const bw = bonePos(main, ANCHOR.badge);                    // 每幀讀骨頭 → 號碼 / 徽章位置
  wheel.position.set(bw.x + offset.x, bw.y + offset.y);
  num.position.set(badge.x, badge.y + ANCHOR.number.offsetY); num.scale.set(numberPose(e).pulse);
  amt.scale.set(Math.min(pose.pulse * (101 / glyphH), 460 / amtNatW)); // 金額不超出面板內緣 460
  if (e >= T.spineOutAt) main.state.setAnimation(0, 'out', false);
  if (e >= T.total) { onExit(); return; }
  raf = requestAnimationFrame(frame);
};`}</Code>

      <h3>派彩三檔拍板(payoutCast):資源到哪裡就演到哪裡</h3>
      <Code>{`起跑門檻只有一個:金額 bmf 就緒(沒有金額就沒有可演的資訊)
spine 的狀態分三檔決定等不等:
  已下載、只剩 GPU 上傳 / 組裝(Assets.cache.has 全命中)  → 等這段毫秒級收尾,換完整演出
  還在網路上抓                                            → 不等,號碼 + 金額準時開演;這局 spine 缺席,下一局檔案已在快取
  確定失敗(含重試一次)                                    → 同數字降級
起跑後整段不再改變:中途才到的部位會從自己的 0 秒開始播,畫面會壞 → 續跑不重拍
放棄的界線是新局(OPEN_ROUND 清 payout → 顯示窗自然關),不是碼表
降級時號碼錨在徽章骨的靜止位、金額錨在面板骨靜止位——fallback 本來就是骨頭的 setup-pose 座標,不另立版位`}</Code>

      <h2>Spine 資源交付與換版</h2>
      <Code>{`版本鎖:runtime spine-pixi-v8 4.3 ↔ 美術 Spine Editor 4.3.x,major.minor 必須相同;3.8 資源不可直接用、不可直接升降版,要重匯出
Pixi 最低 8.16(spine-pixi-v8 的要求)

交付:<name>.skel + <name>.atlas + <name>.png(母檔)
進 repo:母檔進 assets-raw/spine/<name>/ → npm run assets:compress -- spine → 無損 webp(spine 紋理雙線性取樣,lossy 必破圖)
        → 手動把 .atlas 內頁名改 .webp;直接把 png 丟進 public 會被 assets:check 擋
runtime:public/assets/spine/<name>/{skel, atlas, webp} 同目錄(載入器要 URL + 相對路徑)
.fnt:face 改成唯一名(Pixi 拿 face 當註冊名)、page → .webp、確認字形碼位、lineHeight ≠ 字形實高

換版前必做:node scripts/inspect-spine.mjs <skel> …
  列 animations(長度、events 時點)、skins(覆寫哪些 slot)、setup-pose 骨頭位置、atlas 區域
  跟舊版 diff——動畫 / skin / slot 名是未型別化的依賴,少一個是靜默失敗
  時序常數(T.numberDelay 0.6、amountDelay 1.333、total 4.9)全部來自骨架事件與長度,不憑感覺縮
限制:一般 UI 小動畫不做 Spine、不放大量文字、避免過大單張貼圖、動畫命名固定、多 skin 列名稱與用途`}</Code>

      <h2>首屏分包:pixi 只屬於房間</h2>
      <Code>{`規則   首屏(Loading / Login / Lobby)程式碼只能用 import() 碰到 pixi / pixi-game-framework
       pixi + spine + framework 合成單一 async chunk(vendor-pixi),隨 RoomView 一起下載
守門   scripts/check-dist-preload.mjs:build 後掃首屏 chunk 有沒有 pixi 的 needle,有就紅(typecheck 與測試看不出這類回歸)
接縫   views/runtime/pagePreload.ts 的 pixi 載入器:import('@toppath/pixi-game-framework/core').then(({ preloadAssets }) => …)
       進房前沒有任何 kind: 'pixi' 資產集,這條路徑只在房間內走到;房間 chunk 靜態依賴框架 chunk,屆時 import() 立即 resolve
預抓   直進房:登入 RTT 空檔 import('./views/RoomView');大廳:scheduleWhenIdle + !isConstrainedNetwork 才抓;永不掛載即抓`}</Code>

      <h2>遇到的問題</h2>
      <p className="text-muted max-w-[62ch]">按層分類;每條寫症狀、真因、處置。多數已進框架或 lint 閘門,列在這裡是為了下次看到同樣症狀能直接對號。</p>
      <DataTable sections={ISSUES} headers={['症狀', '真因', '處置 / 教訓']} placeholder="搜尋症狀、關鍵字…" />

      <h2>除錯與量測工法</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li><b>不用進房就能測特效</b>:<code>dev.html#payout</code> / <code>#gift</code> 會先跑 <code>setupRoomPixiRuntime()</code> 再動態掛 FxCanvas;要量 LoadingSpine 記得包一層 <code>h-[var(--video-band-h)]</code> 定位框。</li>
        <li><b>可靠的派彩觸發器</b>:devtools 的 <code>game.result</code> + <code>game.payout</code>,與真實 handler 寫同三個 store 值;重複觸發要蓋 roundCode 才不會被防重播對當擋掉。</li>
        <li><b>「有沒有畫出來」先用場景圖探針</b>:patch <code>addChild</code> 記 alpha 與時刻,不要靠截圖時機。</li>
        <li><b>凍幀截圖</b>:包住 iframe 的 requestAnimationFrame、時間戳夾在固定經過時間,其他 plane <code>visibility:hidden</code>,就能慢慢對稿(preview-measurement skill)。</li>
        <li><b>分頁必須在前景</b>:背景分頁 Pixi ticker 與 CSS 動畫一起凍結,量到的全是假象;把觀測結果寫進 DOM 再讀。</li>
        <li><b>骨架版位用離線 + 畫面兩條路互證</b>:<code>inspect-spine.mjs</code> 算 mesh 盒,畫面單獨截各 spine 分割像素;三張合成圖相減會被汙染。</li>
        <li><b>跨 repo 順序會咬人</b>:dev 走 <code>devSrcAlias</code> 直接吃框架 src,build 走 dist。用到框架新 API 的 commit,要等框架那批進 master 且 dist 重建之後才能進 master。</li>
      </ul>

      <h2>要深讀時去哪</h2>
      <ul className="list-disc pl-5 space-y-1.5 max-w-[70ch]">
        <li>框架契約(多 canvas、pin、卸載保護、雙實例):<code>../pixi-game-framework/README.md</code>「必須知道的契約」;用法與 API 選擇 <code>docs/整合與使用指南.md</code>;內部不變量 <code>docs/架構與設計決策.md</code>。</li>
        <li>本專案的自訂決策(2 canvas、runtime 唯一啟動點、layer.load、unloadSpineAssets):<code>docs/開發規範與指引.md</code> §11。</li>
        <li>Spine 交付規則:<code>docs/資源規範與流程.md</code> §六;.fnt / 換版 / inspect-spine:<code>asset-import-policy</code> skill。</li>
        <li>載入排程與連帶檔評估:<code>docs/archive/pixi-connected-asset-scheduling.md</code>;首屏分包:<code>bundle-loading-optimization</code> skill。</li>
        <li>事故來龍去脈:<code>MEMORY-archive.md</code> 07-15 / 07-31 / 08-06 / 08-07 / 08-14 / 08-17 / 08-18,<code>MEMORY.md</code> 08-21 / 08-25。</li>
        <li>Pixi v8 API 本身:26 個 <code>pixijs*</code> skill(住在 <code>../pixi-game-framework/skills/</code>),先載 <code>pixi-framework-integrate</code> 再載分科;模型訓練資料多是 v7。</li>
      </ul>
    </div>
  )
}
