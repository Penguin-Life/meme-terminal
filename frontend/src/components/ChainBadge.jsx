const CHAIN_CONFIG = {
  solana: { label: 'SOL', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
  ethereum: { label: 'ETH', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
  eth: { label: 'ETH', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
  bsc: { label: 'BSC', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
  base: { label: 'BASE', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
  arbitrum: { label: 'ARB', color: '#12aaff', bg: 'rgba(18,170,255,0.15)', border: 'rgba(18,170,255,0.3)' },
  polygon: { label: 'MATIC', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)' },
}

export default function ChainBadge({ chain, size = 'sm' }) {
  const cfg = CHAIN_CONFIG[chain?.toLowerCase()] || {
    label: (chain || '?').toUpperCase().slice(0, 5),
    color: '#9ca3af',
    bg: 'rgba(156,163,175,0.15)',
    border: 'rgba(156,163,175,0.3)',
  }

  const px = size === 'xs' ? '4px' : size === 'sm' ? '6px' : '8px'
  const py = size === 'xs' ? '1px' : size === 'sm' ? '2px' : '3px'
  const fontSize = size === 'xs' ? '9px' : size === 'sm' ? '10px' : '12px'

  return (
    <span
      className="font-bold rounded uppercase tracking-wide whitespace-nowrap"
      style={{
        padding: `${py} ${px}`,
        fontSize,
        color: cfg.color,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  )
}
