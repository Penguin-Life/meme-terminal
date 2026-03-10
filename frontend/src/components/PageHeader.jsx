import { RefreshCw } from 'lucide-react'

/**
 * Reusable page header with title, subtitle, badge, and optional refresh button.
 * Eliminates duplicated header patterns across Scanner, Signals, Wallets, Alerts, etc.
 *
 * @param {string} title - Page heading
 * @param {string} [subtitle] - Description below title
 * @param {string} [badge] - Badge text (e.g. "📊 ARB SCANNER")
 * @param {string} [badgeColor] - Badge accent color
 * @param {boolean} [loading] - Show spinner on refresh button
 * @param {function} [onRefresh] - Refresh handler (omit to hide button)
 * @param {string} [refreshLabel] - Button label (default "Refresh")
 * @param {React.ReactNode} [actions] - Additional action buttons
 * @param {React.ReactNode} [children] - Extra content in header area
 */
export default function PageHeader({
  title,
  subtitle,
  badge,
  badgeColor = '#00ff88',
  loading,
  onRefresh,
  refreshLabel = 'Refresh',
  actions,
  children,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        {badge && (
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{
                background: `${badgeColor}18`,
                color: badgeColor,
                border: `1px solid ${badgeColor}40`,
              }}
            >
              {badge}
            </span>
          </div>
        )}
        <h1 className="text-xl font-bold text-white">{title}</h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            {subtitle}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {children}
        {actions}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50 btn-press"
            style={{
              background: `${badgeColor}18`,
              color: badgeColor,
              border: `1px solid ${badgeColor}33`,
            }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {refreshLabel}
          </button>
        )}
      </div>
    </div>
  )
}
