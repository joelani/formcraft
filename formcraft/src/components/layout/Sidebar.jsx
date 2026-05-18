import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Moon, Sun, User, X } from 'lucide-react'
import { useTheme } from '../../lib/useTheme.js'
import { useAuthStore } from '../../store/useAuthStore.js'

export default function Sidebar({ onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { isDark, toggleTheme } = useTheme()
  const user = useAuthStore((state) => state.user)
  const signOut = useAuthStore((state) => state.signOut)
  const isDashboard = location.pathname === '/'

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

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

      <div className="space-y-1 border-t border-border p-3">
        {user ? (
          <div className="flex items-center gap-2.5 rounded-md px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100">
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="avatar"
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <User size={14} className="text-brand-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-text-primary">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </p>
              <p className="truncate text-xs text-text-muted">{user.email}</p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-danger-light hover:text-danger focus-visible:outline-none"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-overlay hover:text-text-primary focus-visible:outline-none"
        >
          {isDark ? (
            <>
              <Sun size={16} className="text-warning" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} className="text-brand-400" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <p className="px-3 py-1 text-xs text-text-muted">FormCraft v0.1</p>
      </div>
    </div>
  )
}
