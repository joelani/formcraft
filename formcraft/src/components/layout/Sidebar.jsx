import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()
  const isDashboard = location.pathname === '/'

  return (
    <aside className="sticky top-0 z-30 flex flex-col border-b border-slate-200 bg-white md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
      <div className="px-4 py-3 md:border-b md:border-slate-200 md:px-6 md:py-5">
        <Link
          to="/"
          className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">
            FC
          </div>
          <span className="text-lg font-semibold text-slate-950">FormCraft</span>
        </Link>
      </div>

      <nav className="px-3 pb-3 md:flex-1 md:py-4">
        <Link
          to="/"
          className={[
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
            isDashboard
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
          ].join(' ')}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </nav>

      <div className="hidden border-t border-slate-200 px-6 py-4 text-xs text-slate-500 md:block">
        FormCraft v0.1
      </div>
    </aside>
  )
}
