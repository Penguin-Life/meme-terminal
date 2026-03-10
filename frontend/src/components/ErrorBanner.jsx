import { RefreshCw } from 'lucide-react'

/**
 * Reusable error banner with retry button.
 * Replaces the repeated error display pattern across all pages.
 *
 * @param {string} message - Error message to display
 * @param {function} [onRetry] - Retry handler
 * @param {boolean} [loading] - Show spinner on retry button
 */
export default function ErrorBanner({ message, onRetry, loading }) {
  if (!message) return null
  return (
    <div
      className="mb-4 p-3 rounded-lg flex items-center justify-between gap-3 animate-fade-in"
      style={{
        background: 'rgba(255,68,68,0.1)',
        color: '#ff4444',
        border: '1px solid rgba(255,68,68,0.2)',
      }}
    >
      <span className="text-sm">⚠️ {message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={loading}
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
          style={{
            background: 'rgba(255,68,68,0.15)',
            color: '#ff4444',
            border: '1px solid rgba(255,68,68,0.3)',
          }}
        >
          <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
          Retry
        </button>
      )}
    </div>
  )
}
