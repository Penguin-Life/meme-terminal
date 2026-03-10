import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, ShieldAlert, ShieldCheck, TrendingUp, TrendingDown, Activity, Copy, Check } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import api from '../utils/api.js'
import usePageTitle from '../hooks/usePageTitle.js'
import { fmtPrice, fmtUsd, timeAgo } from '../utils/format.js'

function Badge({ level }) {
  const map = {
    LOW: { color: '#00ff88', bg: 'rgba(0,255,136,0.15)', icon: ShieldCheck, text: 'SAFE' },
    MEDIUM: { color: '#f0b90b', bg: 'rgba(240,185,11,0.15)', icon: Shield, text: 'CAUTION' },
    HIGH: { color: '#ff6b35', bg: 'rgba(255,107,53,0.15)', icon: ShieldAlert, text: 'WARNING' },
    CRITICAL: { color: '#ff4444', bg: 'rgba(255,68,68,0.15)', icon: ShieldAlert, text: 'DANGER' },
  }
  const m = map[level] || map.MEDIUM
  const Icon = m.icon
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold" style={{ background: m.bg, color: m.color }}>
      <Icon size={14} /> {m.text}
    </span>
  )
}

function PriceChart({ data }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-48" style={{ color: '#6b7280' }}>No chart data</div>
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} />
        <YAxis domain={['auto', 'auto']} tick={{ fill: '#6b7280', fontSize: 10 }} tickFormatter={v => v >= 0.01 ? `$${v.toFixed(4)}` : `$${v.toExponential(1)}`} />
        <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3e', borderRadius: 8, color: '#fff', fontSize: 12 }}
          formatter={v => [`$${v.toPrecision(6)}`, 'Price']} labelFormatter={t => new Date(t).toLocaleString()} />
        <Area type="monotone" dataKey="close" stroke="#00ff88" fill="url(#priceGrad)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

function CopyAddress({ address }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button onClick={handleCopy} className="flex items-center gap-1.5 mt-1 group" title="Click to copy address">
      <span className="text-xs font-mono" style={{ color: '#4b5563' }}>{address.slice(0, 8)}...{address.slice(-6)}</span>
      {copied ? <Check size={12} style={{ color: '#00ff88' }} /> : <Copy size={12} style={{ color: '#4b5563' }} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
      {copied && <span className="text-xs" style={{ color: '#00ff88' }}>Copied!</span>}
    </button>
  )
}

export default function TokenDetail() {
  const { chain, address } = useParams()
  usePageTitle(address ? `Token ${address.slice(0, 8)}…` : 'Token Detail')
  const nav = useNavigate()
  const [token, setToken] = useState(null)
  const [kline, setKline] = useState([])
  const [audit, setAudit] = useState(null)
  const [signals, setSignals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [buyMsg, setBuyMsg] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.allSettled([
      api.get(`/token/${chain}/${address}`).then(d => setToken(d.data || d.pair || d)),
      api.get(`/token/${chain}/${address}/kline?interval=1h&limit=48`).then(d => setKline(d.klineList || d.data?.klineList || [])),
      api.post('/analyze/token', { chain, address }).then(d => setAudit(d.data || d.audit || d)),
      api.get(`/signals?chainId=${chain === 'solana' ? 'CT_501' : chain}`).then(d => setSignals((d.signals || []).slice(0, 5))),
    ]).then(results => {
      // If the main token fetch failed, show error
      if (results[0].status === 'rejected') {
        setError(results[0].reason?.message || 'Failed to load token data')
      }
    }).finally(() => setLoading(false))
  }, [chain, address])

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs" style={{ color: '#6b7280' }}>Loading token data...</span>
    </div>
  )

  if (error && !token) return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
      <div className="text-4xl">⚠️</div>
      <div className="text-lg font-bold text-white">Failed to Load Token</div>
      <p className="text-sm text-center max-w-md" style={{ color: '#6b7280' }}>{error}</p>
      <div className="flex gap-3">
        <button onClick={() => nav(-1)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{ background: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: '1px solid rgba(156,163,175,0.2)' }}>
          ← Go Back
        </button>
        <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}>
          Retry
        </button>
      </div>
    </div>
  )

  const t = token || {}
  const price = parseFloat(t.priceUsd || t.price || 0)
  const change24h = parseFloat(t.priceChange?.h24 || t.priceChange24h || 0)
  const isUp = change24h >= 0

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Back + Header */}
      <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm hover:underline" style={{ color: '#9ca3af' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="rounded-xl p-5" style={{ background: '#13141e', border: '1px solid #2a2a3e' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">{t.baseToken?.symbol || t.symbol || address.slice(0, 8)}</h1>
            <p className="text-sm" style={{ color: '#6b7280' }}>{t.baseToken?.name || t.name || ''}</p>
            <CopyAddress address={address} />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{fmtPrice(price)}</p>
            <p className="flex items-center justify-end gap-1 text-sm font-medium" style={{ color: isUp ? '#00ff88' : '#ff4444' }}>
              {isUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />} {isUp ? '+' : ''}{change24h.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 token-stats-grid">
          {[
            { label: 'Volume 24h', value: t.volume?.h24 || t.volume24h, fmt: v => fmtUsd(parseFloat(v)) },
            { label: 'Liquidity', value: t.liquidity?.usd || t.liquidity, fmt: v => fmtUsd(parseFloat(v)) },
            { label: 'Market Cap', value: t.marketCap || t.fdv, fmt: v => fmtUsd(parseFloat(v)) },
            { label: 'Holders', value: t.holders, fmt: v => parseInt(v).toLocaleString() },
          ].map(({ label, value, fmt }) => (
            <div key={label} className="rounded-lg p-3" style={{ background: '#0f0f1a' }}>
              <p className="text-xs" style={{ color: '#6b7280' }}>{label}</p>
              <p className="text-sm font-medium text-white mt-0.5">{value ? fmt(value) : '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-xl p-4" style={{ background: '#13141e', border: '1px solid #2a2a3e' }}>
        <h2 className="text-sm font-semibold text-white mb-3">📈 Price Chart (1h)</h2>
        <PriceChart data={kline} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Audit */}
        <div className="rounded-xl p-4" style={{ background: '#13141e', border: '1px solid #2a2a3e' }}>
          <h2 className="text-sm font-semibold text-white mb-3">🛡️ Security Audit</h2>
          {audit?.overallRisk ? (
            <div className="space-y-3">
              <Badge level={audit.overallRisk} />
              {audit.tokenInfo && (
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div><span style={{ color: '#6b7280' }}>Mint Auth</span><p className="text-white">{audit.tokenInfo.mintAuthority ? '⚠️ Yes' : '✅ None'}</p></div>
                  <div><span style={{ color: '#6b7280' }}>Freeze Auth</span><p className="text-white">{audit.tokenInfo.freezeAuthority ? '⚠️ Yes' : '✅ None'}</p></div>
                  <div><span style={{ color: '#6b7280' }}>Top Holders</span><p className="text-white">{audit.tokenInfo.topHolderPercent ? `${audit.tokenInfo.topHolderPercent}%` : '—'}</p></div>
                  <div><span style={{ color: '#6b7280' }}>Honeypot</span><p className="text-white">{audit.scamDetection?.isHoneypot ? '🚫 YES' : '✅ No'}</p></div>
                </div>
              )}
              {audit.verdict && <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>{audit.verdict}</p>}
            </div>
          ) : (
            <p className="text-xs" style={{ color: '#6b7280' }}>Audit data unavailable</p>
          )}
        </div>

        {/* Signals */}
        <div className="rounded-xl p-4" style={{ background: '#13141e', border: '1px solid #2a2a3e' }}>
          <h2 className="text-sm font-semibold text-white mb-3">📡 Smart Money Signals</h2>
          {signals.length > 0 ? signals.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: s.signalType === 'BUY' ? 'rgba(0,255,136,0.15)' : 'rgba(255,68,68,0.15)', color: s.signalType === 'BUY' ? '#00ff88' : '#ff4444' }}>{s.signalType}</span>
                <span className="text-xs text-white">{s.tokenSymbol}</span>
              </div>
              <span className="text-xs" style={{ color: '#00ff88' }}>{s.maxGainPercent != null ? `+${s.maxGainPercent.toFixed(1)}%` : ''}</span>
            </div>
          )) : <p className="text-xs" style={{ color: '#6b7280' }}>No signals</p>}
        </div>
      </div>

      {/* Safe Buy Button */}
      <div className="flex flex-col items-center gap-2">
        <button className="px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #f0b90b, #d4a40a)', color: '#000' }}
          onClick={() => setBuyMsg(prev => prev ? null : 'Configure BINANCE_API_KEY in backend/.env to enable live trading (testnet supported)')}>
          🟡 Safe Buy — Audit → Signal → Trade
        </button>
        {buyMsg && <p className="text-xs px-3 py-2 rounded-lg animate-fade-in" style={{ background: 'rgba(240,185,11,0.1)', color: '#f0b90b', border: '1px solid rgba(240,185,11,0.2)' }}>{buyMsg}</p>}
      </div>
    </div>
  )
}
