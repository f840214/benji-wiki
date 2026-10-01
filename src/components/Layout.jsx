import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { NAV } from '../nav.js'

// 站台 icon:放在 public/,路徑要帶 base(GitHub Pages 是 /benji-wiki/)
const ICON = import.meta.env.BASE_URL + 'boxing.svg'

const linkClass = ({ isActive }) =>
  'block px-2.5 py-1.5 my-0.5 rounded-md text-sm transition-colors ' +
  (isActive
    ? 'bg-accent-soft text-accent font-medium'
    : 'text-muted hover:bg-panel2 hover:text-ink hover:no-underline')

function NavList() {
  let lastGroup = null
  return NAV.map((p) => {
    const showGroup = p.group && p.group !== lastGroup
    if (p.group) lastGroup = p.group
    return (
      <div key={p.path}>
        {showGroup && (
          <div className="text-[.68rem] font-semibold text-muted uppercase tracking-widest mx-1.5 mt-5 mb-1 max-md:mt-3">
            {p.group}
          </div>
        )}
        <NavLink className={linkClass} to={p.path} end={p.path === '/'}>
          {p.title}
        </NavLink>
      </div>
    )
  })
}

// 桌機:左側固定側欄。手機(< md):頂欄只放站名 + 目前頁名 + 「選單」鈕,點開才展開導覽(兩欄),換頁自動收起。
export default function Layout() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])
  const current = NAV.find((p) => p.path === pathname)?.title ?? ''
  return (
    <div className="flex min-h-screen max-md:flex-col">
      <aside className="w-[232px] shrink-0 bg-panel border-r border-line px-4 pt-6 pb-8 sticky top-0 h-screen overflow-y-auto max-md:hidden">
        <NavLink to="/" className="flex items-center gap-2 text-lg font-bold mx-1.5 mb-5 text-ink hover:no-underline">
          <img src={ICON} alt="" aria-hidden="true" className="w-7 h-7" />
          <span>Benji <span className="text-accent">Wiki</span></span>
        </NavLink>
        <NavList />
      </aside>

      <header className="md:hidden sticky top-0 z-40 bg-panel/95 backdrop-blur border-b border-line">
        <div className="flex items-center gap-2 px-3 h-12">
          <NavLink to="/" className="flex items-center gap-1.5 font-bold text-ink hover:no-underline shrink-0">
            <img src={ICON} alt="" aria-hidden="true" className="w-6 h-6" />
            <span className="text-[.95rem]">Benji <span className="text-accent">Wiki</span></span>
          </NavLink>
          <span className="flex-1 min-w-0 truncate text-[.8rem] text-muted">{current}</span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="shrink-0 px-2.5 py-1 rounded-md border border-line text-[.8rem] text-muted bg-panel active:bg-panel2"
          >
            {open ? '收起 ▲' : '選單 ▼'}
          </button>
        </div>
        {open && (
          <nav className="px-3 pb-3 border-t border-line grid grid-cols-2 gap-x-3">
            <NavList />
          </nav>
        )}
      </header>

      <main className="flex-1 min-w-0 max-w-[980px] px-5 md:px-12 pt-10 pb-20 max-md:px-4 max-md:pt-5 max-md:pb-14">
        <Outlet />
      </main>
    </div>
  )
}
