import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle, Info, XCircle } from 'lucide-react'
import { generateId } from '../../lib/idgen.js'

const ToastContext = createContext(null)

const styles = {
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-800',
  },
  error: {
    icon: XCircle,
    className: 'border-red-200 bg-red-50 text-red-800',
  },
  info: {
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800',
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
    () => ({
      toast: {
        success: (message) => addToast('success', message),
        error: (message) => addToast('error', message),
        info: (message) => addToast('info', message),
      },
    }),
    [addToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const toastStyle = styles[toast.type] ?? styles.info
          const Icon = toastStyle.icon

          return (
            <div
              key={toast.id}
              className={[
                'flex items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-sm',
                toastStyle.className,
              ].join(' ')}
              role="status"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{toast.message}</span>
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
