# Benji Wiki

私人前端查詢筆記。用它教的東西做的:React + Vite + Tailwind CSS v4 + react-router-dom + zustand。

## 開發

```bash
npm install
npm run dev      # http://localhost:5173
```

## 新增頁面

1. 在 `src/pages/` 複製一頁改內容(表格型用 `DataTable`,文章型參考 `ReactPage.jsx`)。
2. `src/nav.js` 加一行,側欄自動出現。
3. `src/App.jsx` 加對應的 `<Route>`。
4. `git push`,GitHub Actions 會自動 build 並部署到 GitHub Pages。

## 換密碼

程式碼裡只存加鹽後的 SHA-256 雜湊,不存明文:

```bash
printf 'benji-wiki::你的新密碼' | shasum -a 256
```

把結果貼到 `src/store.js` 的 `HASH`。

> 注意:這是前端密碼鎖,擋的是「打開網頁瀏覽」。repo 是公開的,懂技術的人
> 看原始碼還是能讀到筆記內容(但推不出密碼)。不要放真正的機密。
