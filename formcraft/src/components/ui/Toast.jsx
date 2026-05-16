import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle, Info, X, XCircle } from 'lucide-react'
import { generateId } from '../../lib/idgen.js'

const ToastContext = createContext(null)

const styles = {
  success: {
    icon: CheckCircle,
    iconClassName: 'text-success',
  },
  error: {
    icon: XCircle,
    iconClassName: 'text-danger',
  },
  info: {
    icon: Info,
    iconClassName: 'text-info',
  },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const addToast = useCallback(
    (type, message) => {
      const id = generateId()

      setToasts((current) => [...current, { id, type, message }].slice(-3))
      window.setTimeout(() => removeToast(id), 3000)
    },
    [removeToast],
  )

  const value = useMemo(
    () => {
      const toast = {
        success: (message) => addToast('success', message),
        error: (message) => addToast('error', message),
        info: (message) => addToast('info', message),
      }

      return { ...toast, toast }
    },
    [addToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const toastStyle = styles[toast.type] ?? styles.info
          const Icon = toastStyle.icon

          return (
            <div
              key={toast.id}
              className={[
                'pointer-events-auto animate-toast-in flex min-w-64 max-w-xs items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-lg',
              ].join(' ')}
              role="status"
            >
              <Icon className={`h-4 w-4 shrink-0 ${toastStyle.iconClassName}`} />
              <span className="flex-1 text-sm text-text-primary">{toast.message}</span>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-sm p-0.5 text-text-muted transition hover:text-text-secondary focus-visible:outline-none"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
