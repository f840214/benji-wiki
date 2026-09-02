import DataTable from '../components/DataTable.jsx'
import { TAILWIND } from '../data/tailwind.js'

export default function Tailwind() {
  return (
    <div>
      <h1>Tailwind CSS 中文速查</h1>
      <p className="text-muted mb-5 max-w-[62ch]">
        Tailwind CSS v4 常用 class 對照。搜尋支援中文(「圓角」「置中」)、class 名或 CSS 屬性,點 class 名可複製。
      </p>

      <div className="bg-accent-soft border border-line border-l-[3px] border-l-accent-deep rounded-lg px-4 py-3 text-[.87rem] max-w-[70ch]">
        <b>三個記不住就回來看的規則</b><br />
        間距刻度:數字 × 4px(<code>p-4</code> = 16px)。
        顏色:顏色名-深淺 50~950(<code>bg-blue-500</code>),加 <code>/50</code> 是透明度。
        任意值:方括號(<code>w-[137px]</code>、<code>bg-[#1da1f2]</code>)。
      </div>

      <DataTable
        sections={TAILWIND}
        headers={['Class', 'CSS 對應', '說明']}
        placeholder="搜尋:例如「陰影」、hover、grid、圓角…"
      />
    </div>
  )
}
