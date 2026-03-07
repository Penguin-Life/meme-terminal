import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Filter } from 'lucide-react'
import api from '../utils/api.js'

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Buy', value: 'BUY' },
  { label: 'Sell', value: 'SELL' },
]

const CHAINS = [
  { label: 'All Chains', value: '' },
  { label: 'Solana', value: 'CT_501' },
  { label: 'BSC', value: '56' },
  { label: 'Base', value: '8453' },
  { label: 'ETH', value: '1' },
]

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

function SignalCard({ signal }) {
  const isBuy = signal.signalType === 'BUY'
  const color = isBuy ? '#00ff88' : '#ff4444'
  const bgColor = isBuy ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,68,0.08)'
  const borderColor = isBuy ? 'rgba(0,255,136,0.2)' : 'rgba(255,68,68,0.2)'

  return (
    <div className="rounded-xl p-4 transition-all hover:scale-[1.005]" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {signal.logoUrl && <img src={signal.logoUrl} alt="" className="w-6 h-6 rounded-full" onError={e => e.target.style.display='none'} />}
          <span className="font-bold text-white">{signal.tokenSymbol}</span>
          {signal.tokenName && signal.tokenName !== signal.tokenSymbol && (
            <span className="text-xs" style={{ color: '#6b7280' }}>{signal.tokenName}</span>
          )}
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded-md" style={{ background: isBuy ? 'rgba(0,255,136,0.2)' : 'rgba(255,68,68,0.2)', color }}>
          {isBuy ? <TrendingUp size={12} className="inline mr-1" /> : <TrendingDown size={12} className="inline mr-1" />}
          {signal.signalType}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span style={{ color: '#6b7280' }}>Trigger</span>
          <p className="text-white font-medium">{signal.triggerPrice != null ? `$${signal.triggerPrice.toPrecision(4)}` : '—'}</p>
        </div>
        <div>
          <span style={{ color: '#6b7280' }}>Current</span>
          <p className="text-white font-medium">{signal.currentPrice != null ? `$${signal.currentPrice.toPrecision(4)}` : '—'}</p>
        </div>
        <div>
          <span style={{ color: '#6b7280' }}>Max Gain</span>
          <p style={{ color: '#00ff88' }} className="font-medium">{signal.maxGainPercent != null ? `+${signal.maxGainPercent.toFixed(1)}%` : '—'}</p>
        </div>
        <div>
          <span style={{ color: '#6b7280' }}>Time</span>
          <p className="text-white">{timeAgo(signal.signalTime)}</p>
        </div>
      </div>

      {signal.tags?.length > 0 && (
        <div className="flex gap-1 mt-2 flex-wrap">
          {signal.tags.map((tag, i) => (
            <span key={i} className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Signals() {
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [chainFilter, setChainFilter] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchSignals = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter) params.set('type', typeFilter)
      if (chainFilter) params.set('chainId', chainFilter)
      const data = await api.get(`/signals?${params}`)
      setSignals(data.signals || [])
    } catch { setSignals([]) }
    setLoading(false)
  }, [typeFilter, chainFilter, refreshKey])

  useEffect(() => { fetchSignals() }, [fetchSignals])

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(() => setRefreshKey(k => k + 1), 30000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-white">📡 Smart Money Signals</h1>
        <button onClick={() => setRefreshKey(k => k + 1)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors" style={{ color: '#9ca3af' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button key={f.value} onClick={() => setTypeFilter(f.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: typeFilter === f.value ? 'rgba(168,85,247,0.2)' : '#1a1a2e', color: typeFilter === f.value ? '#a855f7' : '#9ca3af', border: `1px solid ${typeFilter === f.value ? 'rgba(168,85,247,0.4)' : '#2a2a3e'}` }}>
            {f.label}
          </button>
        ))}
        <span className="mx-1" />
        {CHAINS.map(c => (
          <button key={c.value} onClick={() => setChainFilter(c.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ background: chainFilter === c.value ? 'rgba(240,185,11,0.15)' : '#1a1a2e', color: chainFilter === c.value ? '#f0b90b' : '#9ca3af', border: `1px solid ${chainFilter === c.value ? 'rgba(240,185,11,0.3)' : '#2a2a3e'}` }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Signal Grid */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" /></div>
      ) : signals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {signals.map((s, i) => <SignalCard key={i} signal={s} />)}
        </div>
      ) : (
        <div className="text-center py-12" style={{ color: '#6b7280' }}>
          <p className="text-sm">No signals found for current filters</p>
        </div>
      )}
    </div>
  )
}
