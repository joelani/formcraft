import { useState } from 'react'
import { Menu, Moon, Sun } from 'lucide-react'
import Sidebar from './Sidebar.jsx'
import { useTheme } from '../../lib/useTheme.js'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden bg-surface-raised">
      {sidebarOpen ? (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          role="presentation"
        />
      ) : null}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 flex w-[var(--sidebar-width)] transform flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="shrink-0 text-text-secondary transition hover:text-text-primary focus-visible:outline-none"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <span className="flex-1 truncate font-semibold text-text-primary">
            FormCraft
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="shrink-0 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
