import Sidebar from './Sidebar.jsx'

export default function AppShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Sidebar />
      <main className="min-h-screen md:pl-64">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
