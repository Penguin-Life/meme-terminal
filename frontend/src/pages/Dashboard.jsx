import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Zap, BarChart2, Activity, RefreshCw, ArrowRight } from 'lucide-react'
import api from '../utils/api.js'
import { fmtPrice, timeAgo as fmtTimeAgo } from '../utils/format.js'
import usePageTitle from '../hooks/usePageTitle.js'

/** Tiny inline SVG sparkline — no recharts overhead */
function Sparkline({ data, width = 48, height = 16, color = '#00ff88' }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="inline-block ml-2 flex-shrink-0" style={{ verticalAlign: 'middle' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SectionCard({ title, emoji, color, linkTo, children, loading, error, onRetry }) {
  const nav = useNavigate()
  return (
    <div className="rounded-xl p-4 flex flex-col dash-section-card" style={{ background: '#13141e', border: '1px solid #2a2a3e', minHeight: 260 }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span>{emoji}</span>
          <h3 className="font-semibold text-sm" style={{ color }}>{title}</h3>
        </div>
        <button onClick={() => nav(linkTo)} className="flex items-center gap-1 text-xs hover:underline" style={{ color: '#6b7280' }}>
          View all <ArrowRight size={12} />
        </button>
      </div>
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full"><div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" style={{ color }} /></div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <p className="text-xs" style={{ color: '#ff4444' }}>Failed to load data</p>
            {onRetry && <button onClick={onRetry} className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors" style={{ color: '#9ca3af' }}>Retry</button>}
          </div>
        ) : children}
      </div>
    </div>
  )
}

function TokenRow({ symbol, name, price, change, sparkData, onClick }) {
  const isUp = change >= 0
  const sparkColor = isUp ? '#00ff88' : '#ff4444'
  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors" onClick={onClick}>
      <div className="min-w-0 flex items-center">
        <span className="font-medium text-sm text-white">{symbol}</span>
        {name && <span className="text-xs ml-1.5 hidden sm:inline" style={{ color: '#6b7280' }}>{name}</span>}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
        <Sparkline data={sparkData} color={sparkColor} />
        {price != null && <span className="text-xs text-white">{fmtPrice(typeof price === 'number' ? price : parseFloat(price))}</span>}
        {change != null && <span className="text-xs ml-1" style={{ color: sparkColor }}>{isUp ? '+' : ''}{change.toFixed(1)}%</span>}
      </div>
    </div>
  )
}

function SignalRow({ signal }) {
  const isBuy = signal.signalType === 'BUY'
  const timeAgoStr = signal.signalTime ? fmtTimeAgo(signal.signalTime) : ''
  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: isBuy ? 'rgba(0,255,136,0.15)' : 'rgba(255,68,68,0.15)', color: isBuy ? '#00ff88' : '#ff4444' }}>
          {signal.signalType}
        </span>
        <span className="text-sm text-white font-medium">{signal.tokenSymbol}</span>
      </div>
      <div className="text-right flex-shrink-0">
        {signal.maxGainPercent != null && <span className="text-xs" style={{ color: '#00ff88' }}>+{signal.maxGainPercent.toFixed(1)}%</span>}
        <span className="text-xs ml-2" style={{ color: '#6b7280' }}>{timeAgoStr}</span>
      </div>
    </div>
  )
}

function ArbRow({ result }) {
  const absSpread = Math.abs(result.spreadPercent || 0)
  const color = absSpread > 2 ? '#00ff88' : absSpread > 1 ? '#f0b90b' : '#6b7280'
  return (
    <div className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-white/5 transition-colors">
      <span className="text-sm text-white font-medium">{result.keyword || result.symbol}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs" style={{ color: '#9ca3af' }}>{result.direction === 'dex_premium' ? 'DEX↑' : 'CEX↑'}</span>
        <span className="text-xs font-bold" style={{ color }}>{absSpread.toFixed(2)}%</span>
      </div>
    </div>
  )
}

export default function Dashboard() {
  usePageTitle('Dashboard')
  const nav = useNavigate()
  const [trending, setTrending] = useState([])
  const [signals, setSignals] = useState([])
  const [arb, setArb] = useState([])
  const [alpha, setAlpha] = useState([])
  const [loading, setLoading] = useState({ trending: true, signals: true, arb: true, alpha: true })
  const [errors, setErrors] = useState({ trending: null, signals: null, arb: null, alpha: null })
  const [lastRefresh, setLastRefresh] = useState(Date.now())

  useEffect(() => {
    setErrors({ trending: null, signals: null, arb: null, alpha: null })
    api.get('/token/trending').then(d => setTrending((d.pairs || d.data?.pairs || []).slice(0, 5))).catch(e => setErrors(p => ({ ...p, trending: e.message || 'Failed to load' }))).finally(() => setLoading(p => ({ ...p, trending: false })))
    api.get('/signals').then(d => setSignals((d.signals || []).slice(0, 5))).catch(e => setErrors(p => ({ ...p, signals: e.message || 'Failed to load' }))).finally(() => setLoading(p => ({ ...p, signals: false })))
    api.get('/arbitrage/scan').then(d => setArb((d.results || []).slice(0, 4))).catch(e => setErrors(p => ({ ...p, arb: e.message || 'Failed to load' }))).finally(() => setLoading(p => ({ ...p, arb: false })))
    api.get('/token/binance-alpha').then(d => setAlpha((d.tokens || []).slice(0, 5))).catch(e => setErrors(p => ({ ...p, alpha: e.message || 'Failed to load' }))).finally(() => setLoading(p => ({ ...p, alpha: false })))
  }, [lastRefresh])

  const allFailed = !loading.trending && !loading.signals && !loading.arb && !loading.alpha &&
    errors.trending && errors.signals && errors.arb && errors.alpha

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* All-sections-failed banner */}
      {allFailed && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', color: '#ff6b6b' }}>
          <span>⚠️</span>
          <div className="flex-1">
            <p className="font-medium">Backend unavailable</p>
            <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>Check that the API server is running on port 3902, or enable DEMO_MODE in .env</p>
          </div>
          <button onClick={() => setLastRefresh(Date.now())} className="px-3 py-1 rounded-lg text-xs font-medium hover:bg-white/5 transition-colors" style={{ border: '1px solid rgba(255,68,68,0.3)' }}>Retry</button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">🐧 Meme Terminal</h1>
          <p className="text-xs mt-0.5" style={{ color: '#4b5563' }}>
            AI-powered memecoin intelligence dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!loading.trending && (
            <span className="hidden sm:inline text-xs" style={{ color: '#4b5563' }}>
              Updated {new Date(lastRefresh).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button onClick={() => setLastRefresh(Date.now())} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs hover:bg-white/10 transition-colors" style={{ color: '#9ca3af' }}
            title="Refresh all dashboard data">
            <RefreshCw size={14} className={Object.values(loading).some(Boolean) ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Quick action pills — scrollable on mobile */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
        {[
          { label: 'Scan Tokens', emoji: '🔥', to: '/scanner' },
          { label: 'Check Signals', emoji: '📡', to: '/signals' },
          { label: 'Arbitrage', emoji: '📊', to: '/arbitrage' },
          { label: 'Binance Alpha', emoji: '🟡', to: '/alpha' },
        ].map(({ label, emoji, to }) => (
          <button
            key={to}
            onClick={() => nav(to)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.04)', color: '#9ca3af', border: '1px solid #1e2030' }}
          >
            <span>{emoji}</span> {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Trending" emoji="🔥" icon={Flame} color="#ff6b35" linkTo="/scanner" loading={loading.trending} error={errors.trending} onRetry={() => setLastRefresh(Date.now())}>
          {trending.length > 0 ? trending.map((t, i) => {
            const price = parseFloat(t.priceUsd || t.price || 0)
            const change = parseFloat(t.priceChange?.h24 || t.priceChange24h || 0)
            // Generate sparkline from h6/h1/m5 price changes if available, else synthesize from 24h change
            const h6 = parseFloat(t.priceChange?.h6 || change * 0.4)
            const h1 = parseFloat(t.priceChange?.h1 || change * 0.15)
            const m5 = parseFloat(t.priceChange?.m5 || change * 0.03)
            const base = price / (1 + change / 100) || price
            const spark = [base, base * (1 + m5 / 200), base * (1 + m5 / 100), base * (1 + h1 / 200), base * (1 + h1 / 100), base * (1 + h6 / 200), base * (1 + h6 / 100), price]
            return (
              <TokenRow key={i} symbol={t.baseToken?.symbol || t.symbol || '?'} name={t.baseToken?.name} price={price} change={change} sparkData={spark}
                onClick={() => { const chain = t.chainId || 'solana'; const addr = t.baseToken?.address || t.pairAddress; if (addr) nav(`/token/${chain}/${addr}`) }} />
            )
          }) : <p className="text-xs" style={{ color: '#6b7280' }}>No data available</p>}
        </SectionCard>

        <SectionCard title="Smart Money Signals" emoji="📡" icon={Activity} color="#a855f7" linkTo="/signals" loading={loading.signals} error={errors.signals} onRetry={() => setLastRefresh(Date.now())}>
          {signals.length > 0 ? signals.map((s, i) => <SignalRow key={i} signal={s} />) : <p className="text-xs" style={{ color: '#6b7280' }}>No signals</p>}
        </SectionCard>

        <SectionCard title="Arbitrage" emoji="📊" icon={BarChart2} color="#00ff88" linkTo="/arbitrage" loading={loading.arb} error={errors.arb} onRetry={() => setLastRefresh(Date.now())}>
          {arb.length > 0 ? arb.map((r, i) => <ArbRow key={i} result={r} />) : <p className="text-xs" style={{ color: '#6b7280' }}>No data</p>}
        </SectionCard>

        <SectionCard title="Binance Alpha" emoji="🟡" icon={Zap} color="#f0b90b" linkTo="/alpha" loading={loading.alpha} error={errors.alpha} onRetry={() => setLastRefresh(Date.now())}>
          {alpha.length > 0 ? alpha.map((t, i) => {
            const chg = t.priceChange24h || 0
            const base = (t.price || 0) / (1 + chg / 100) || t.price || 0
            const spark = [base, base * (1 + chg / 400), base * (1 + chg / 200), base * (1 + chg / 133), t.price || 0]
            return <TokenRow key={i} symbol={t.symbol} price={t.price} change={chg} sparkData={spark} />
          }) : <p className="text-xs" style={{ color: '#6b7280' }}>No data</p>}
        </SectionCard>
      </div>
    </div>
  )
}
