import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/layout/AppShell.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Builder from './pages/Builder.jsx'
import Analytics from './pages/Analytics.jsx'
import PublicForm from './pages/PublicForm.jsx'
import AuthCallback from './pages/AuthCallback.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import { useAuthStore } from './store/useAuthStore.js'

function ShellRoute({ children }) {
  return <AppShell>{children}</AppShell>
}

function ProtectedRoute({ children }) {
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-raised">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <Dashboard />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/builder/:formId"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <Builder />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics/:formId"
        element={
          <ProtectedRoute>
            <ShellRoute>
              <Analytics />
            </ShellRoute>
          </ProtectedRoute>
        }
      />
      <Route path="/f/:formId" element={<PublicForm />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  )
}
