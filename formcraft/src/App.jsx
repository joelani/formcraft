import { Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Builder from './pages/Builder.jsx'
import Analytics from './pages/Analytics.jsx'
import PublicForm from './pages/PublicForm.jsx'

function ShellRoute({ children }) {
  return <AppShell>{children}</AppShell>
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ShellRoute>
            <Dashboard />
          </ShellRoute>
        }
      />
      <Route
        path="/builder/:formId"
        element={
          <ShellRoute>
            <Builder />
          </ShellRoute>
        }
      />
      <Route
        path="/analytics/:formId"
        element={
          <ShellRoute>
            <Analytics />
          </ShellRoute>
        }
      />
      <Route path="/f/:formId" element={<PublicForm />} />
    </Routes>
  )
}
