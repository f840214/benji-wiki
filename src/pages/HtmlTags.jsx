import DataTable from '../components/DataTable.jsx'
import { HTML_TAGS } from '../data/htmlTags.js'

export default function HtmlTags() {
  return (
    <div>
      <h1>HTML 標籤速查</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        常用 HTML 標籤按用途分類。優先用有語意的標籤(header、nav、main…),排版容器才用 div。
      </p>
      <DataTable
        sections={HTML_TAGS}
        headers={['標籤', '名稱', '說明']}
        placeholder="搜尋:例如「表單」、input、影片、清單…"
      />
    </div>
  )
}
