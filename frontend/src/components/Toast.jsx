import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

const ICONS = {
  success: <CheckCircle size={15} />,
  error:   <AlertCircle size={15} />,
  warning: <AlertTriangle size={15} />,
  info:    <Info size={15} />,
}

const COLORS = {
  success: { color: '#00ff88', bg: 'rgba(0,255,136,0.12)', border: 'rgba(0,255,136,0.25)' },
  error:   { color: '#ff4444', bg: 'rgba(255,68,68,0.12)',  border: 'rgba(255,68,68,0.25)' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  info:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type, removing: false }])
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t))
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 280)
    }, duration)
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t))
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 280)
  }, [])

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error:   (msg, dur) => addToast(msg, 'error', dur || 5000),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => {
          const cfg = COLORS[t.type] || COLORS.info
          return (
            <div
              key={t.id}
              className={`toast-item flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl shadow-lg ${
                t.removing ? 'animate-slide-out-right' : 'animate-slide-in-right'
              }`}
              style={{
                background: '#12131a',
                border: `1px solid ${cfg.border}`,
                color: '#e5e7eb',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              }}
            >
              <span style={{ color: cfg.color, flexShrink: 0, marginTop: '1px' }}>
                {ICONS[t.type]}
              </span>
              <span className="text-sm flex-1 leading-snug">{t.message}</span>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 mt-0.5 rounded transition-opacity hover:opacity-70"
                style={{ color: '#6b7280' }}
              >
                <X size={12} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
