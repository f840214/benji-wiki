import { NavLink, Outlet } from 'react-router-dom'
import { NAV } from '../nav.js'

const linkClass = ({ isActive }) =>
  'block px-2.5 py-1.5 my-0.5 rounded-md text-sm transition-colors ' +
  (isActive
    ? 'bg-accent-soft text-accent font-medium'
    : 'text-muted hover:bg-panel2 hover:text-ink hover:no-underline')

export default function Layout() {
  let lastGroup = null
  return (
    <div className="flex min-h-screen max-md:flex-col">
      <aside className="w-[232px] shrink-0 bg-panel border-r border-line px-4 pt-6 pb-8 sticky top-0 h-screen overflow-y-auto max-md:w-full max-md:h-auto max-md:static max-md:border-r-0 max-md:border-b">
        <NavLink to="/" className="block text-lg font-bold mx-1.5 mb-5 text-ink hover:no-underline">
          <span className="text-accent">~</span> Benji Wiki
        </NavLink>
        {NAV.map((p) => {
          const showGroup = p.group && p.group !== lastGroup
          if (p.group) lastGroup = p.group
          return (
            <div key={p.path}>
              {showGroup && (
                <div className="text-[.68rem] font-semibold text-muted uppercase tracking-widest mx-1.5 mt-5 mb-1">
                  {p.group}
                </div>
              )}
              <NavLink className={linkClass} to={p.path} end={p.path === '/'}>
                {p.title}
              </NavLink>
            </div>
          )
        })}
      </aside>
      <main className="flex-1 min-w-0 max-w-[980px] px-5 md:px-12 pt-10 pb-20">
        <Outlet />
      </main>
    </div>
  )
}
