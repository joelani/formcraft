import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar.jsx'

export default function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          'fixed inset-y-0 left-0 z-30 flex w-[--sidebar-width] transform flex-col border-r border-border bg-surface transition-transform duration-200 lg:static lg:translate-x-0',
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
            className="text-text-secondary transition hover:text-text-primary focus-visible:outline-none"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-text-primary">FormCraft</span>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  )
}
