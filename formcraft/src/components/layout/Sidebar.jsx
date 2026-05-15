import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()
  const isDashboard = location.pathname === '/'

  return (
    <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">
            FC
          </div>
          <span className="text-lg font-semibold text-slate-950">FormCraft</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <Link
          to="/"
          className={[
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
            isDashboard
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
          ].join(' ')}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </nav>

      <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500">
        FormCraft v0.1
      </div>
    </aside>
  )
}
