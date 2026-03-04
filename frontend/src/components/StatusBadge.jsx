export default function StatusBadge({ status, label, size = 'sm' }) {
  // status: 'safe' | 'warning' | 'danger' | 'unknown'
  const configs = {
    safe:    { icon: '✅', color: '#00ff88', bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.2)' },
    warning: { icon: '⚠️', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    danger:  { icon: '❌', color: '#ff4444', bg: 'rgba(255,68,68,0.1)', border: 'rgba(255,68,68,0.2)' },
    unknown: { icon: '❓', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' },
  }
  const cfg = configs[status] || configs.unknown
  const fontSize = size === 'xs' ? '10px' : size === 'sm' ? '11px' : '13px'

  return (
    <span
      className="inline-flex items-center gap-1 rounded font-medium whitespace-nowrap"
      style={{
        fontSize,
        padding: size === 'xs' ? '1px 5px' : '2px 7px',
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span>{cfg.icon}</span>
      {label && <span>{label}</span>}
    </span>
  )
}
