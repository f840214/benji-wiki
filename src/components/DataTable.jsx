import { useRef, useState } from 'react'

// 可搜尋的分類表格:sections = [[分類標題, [[名稱, 對應, 說明], ...]], ...]
// 點第一欄複製到剪貼簿。搜尋比對整列文字(中文、名稱都能搜)。
export default function DataTable({ sections, headers, placeholder = '搜尋…' }) {
  const [q, setQ] = useState('')
  const [toast, setToast] = useState('')
  const timer = useRef(null)
  const term = q.trim().toLowerCase()

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setToast(`已複製 ${text}`)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setToast(''), 1400)
    })
  }

  const filtered = sections
    .map(([title, rows]) => [
      title,
      term ? rows.filter((r) => r.join(' ').toLowerCase().includes(term)) : rows,
    ])
    .filter(([, rows]) => rows.length > 0)

  return (
    <div>
      <div className="my-5">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full max-w-[30rem] bg-panel border-[1.5px] border-line rounded-lg px-3.5 py-2 text-ink placeholder:text-muted focus:outline-none focus:border-accent-deep focus:ring-[3px] focus:ring-accent-soft"
        />
      </div>

      {filtered.length === 0 && (
        <p className="text-muted text-center mt-10">找不到符合的項目,換個關鍵字試試。</p>
      )}

      {filtered.map(([title, rows]) => (
        <section key={title}>
          <h2>{title}</h2>
          <div className="bg-panel border border-line rounded-xl overflow-x-auto mt-3 mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {headers.map((h) => (
                    <th
                      key={h}
                      className="text-left px-3.5 py-2 text-[.7rem] font-semibold text-muted uppercase tracking-wider bg-panel2"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r[0] + r[2]}>
                    <td
                      className="px-3.5 py-2 border-t border-line align-top font-mono text-[.8rem] text-accent whitespace-nowrap cursor-pointer hover:underline"
                      title="點擊複製"
                      onClick={() => copy(r[0])}
                    >
                      {r[0]}
                    </td>
                    <td className="px-3.5 py-2 border-t border-line align-top font-mono text-xs text-muted">
                      {r[1]}
                    </td>
                    <td className="px-3.5 py-2 border-t border-line align-top">{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      {toast && (
        <div className="fixed left-1/2 bottom-6 -translate-x-1/2 bg-accent-deep text-[#eaf5ff] text-sm px-4 py-1.5 rounded-lg pointer-events-none z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
