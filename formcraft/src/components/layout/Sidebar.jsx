import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, X } from 'lucide-react'

export default function Sidebar({ onClose }) {
  const location = useLocation()
  const isDashboard = location.pathname === '/'

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <Link
          to="/"
          onClick={onClose}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline-none"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-text-inverse">
            FC
          </div>
          <span className="truncate text-lg font-bold text-text-primary">
            FormCraft
          </span>
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-text-muted transition hover:bg-surface-overlay hover:text-text-primary focus-visible:outline-none lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <Link
          to="/"
          onClick={onClose}
          className={[
            'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none',
            isDashboard
              ? 'bg-brand-50 text-brand-600'
              : 'text-text-secondary hover:bg-surface-overlay hover:text-text-primary',
          ].join(' ')}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      </nav>

      <div className="border-t border-border px-4 py-4 text-xs text-text-muted">
        FormCraft v0.1
      </div>
    </div>
  )
}
