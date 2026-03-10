/**
 * Reusable empty state component.
 * Used across Scanner, Signals, Wallets, Alerts, BinanceAlpha pages.
 *
 * @param {string} icon - Emoji to display
 * @param {string} title - Main message
 * @param {string} [description] - Secondary text
 * @param {string} [actionLabel] - Button text
 * @param {function} [onAction] - Button click handler
 * @param {string} [actionColor] - Button accent color
 * @param {React.ReactNode} [children] - Extra content below description
 */
export default function EmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  actionColor = '#00ff88',
  children,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in">
      <div className="text-4xl">{icon}</div>
      <div className="text-sm font-medium" style={{ color: '#9ca3af' }}>
        {title}
      </div>
      {description && (
        <p
          className="text-xs text-center max-w-xs"
          style={{ color: '#6b7280' }}
        >
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-4 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80 btn-press"
          style={{
            background: `${actionColor}18`,
            color: actionColor,
            border: `1px solid ${actionColor}33`,
          }}
        >
          {actionLabel}
        </button>
      )}
      {children}
    </div>
  )
}
