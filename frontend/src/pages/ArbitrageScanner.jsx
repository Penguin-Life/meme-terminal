import { useState, useEffect, useCallback, useMemo } from 'react'
import { RefreshCw, TrendingUp, TrendingDown, Minus, Zap, AlertCircle } from 'lucide-react'
import ErrorBanner from '../components/ErrorBanner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import api from '../utils/api.js'
import usePageTitle from '../hooks/usePageTitle.js'
import { fmtPrice } from '../utils/format.js'

/**
 * Color-code a spread percent value.
 * > 2% → green (opportunity)
 * 1-2% → yellow (watch)
 * < 1% → gray (normal)
 */
function spreadColor(pct) {
  if (pct == null) return '#6b7280'
  const abs = Math.abs(pct)
  if (abs >= 2) return '#00ff88'
  if (abs >= 1) return '#f59e0b'
  return '#6b7280'
}

function spreadBg(pct) {
  if (pct == null) return 'rgba(255,255,255,0.04)'
  const abs = Math.abs(pct)
  if (abs >= 2) return 'rgba(0,255,136,0.08)'
  if (abs >= 1) return 'rgba(245,158,11,0.08)'
  return 'rgba(255,255,255,0.04)'
}

/**
 * Direction label chip.
 */
function DirectionChip({ direction }) {
  const map = {
    dex_premium:  { label: 'DEX > CEX',  color: '#00ff88', bg: 'rgba(0,255,136,0.1)',    icon: TrendingUp   },
    cex_premium:  { label: 'CEX > DEX',  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   icon: TrendingDown },
    parity:       { label: 'Parity',     color: '#9ca3af', bg: 'rgba(255,255,255,0.06)', icon: Minus        },
    unknown:      { label: 'Unknown',    color: '#6b7280', bg: 'rgba(255,255,255,0.04)', icon: AlertCircle  }
  }
  const d = map[direction] || map.unknown
  const Icon = d.icon
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: d.bg, color: d.color }}
    >
      <Icon size={10} />
      {d.label}
    </span>
  )
}

/**
 * Opportunity badge — shown when spread ≥ 1.5%.
 */
function OpportunityBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-bold animate-pulse"
      style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}
    >
      <Zap size={9} />
      ARB
    </span>
  )
}

/**
 * CEX-DEX Arbitrage Scanner Page
 * Compares Binance spot price vs on-chain DEX price to surface spread opportunities.
 * CEX-DEX价差扫描器 — 对比币安现货与链上DEX价格，发现套利机会
 */
export default function ArbitrageScanner() {
  usePageTitle('Arbitrage Scanner')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)
  const [customSymbol, setCustomSymbol] = useState('')
  const [customResult, setCustomResult] = useState(null)
  const [customLoading, setCustomLoading] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [sortBy, setSortBy] = useState('spread') // 'spread' | 'symbol'

  // Live timer for "Xs ago"
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchBulk = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/arbitrage/scan')
      setData(res)
      setLastFetch(new Date())
    } catch (e) {
      setError(e.message || 'Arbitrage scan failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBulk()
    const interval = setInterval(fetchBulk, 30000)
    return () => clearInterval(interval)
  }, [fetchBulk])

  const handleCustomScan = async (e) => {
    e.preventDefault()
    if (!customSymbol.trim()) return
    setCustomLoading(true)
    setCustomResult(null)
    try {
      const sym = customSymbol.trim().toUpperCase()
      const symbol = sym.endsWith('USDT') ? sym : `${sym}USDT`
      const res = await api.get(`/arbitrage/scan?symbol=${symbol}`)
      setCustomResult(res)
    } catch (e) {
      setCustomResult({ error: e.message })
    } finally {
      setCustomLoading(false)
    }
  }

  const rawResults = data?.results || []
  const opportunities = data?.opportunities || 0

  const results = useMemo(() => {
    const sorted = [...rawResults]
    if (sortBy === 'symbol') {
      sorted.sort((a, b) => (a.keyword || a.symbol).localeCompare(b.keyword || b.symbol))
    }
    // default 'spread' is already sorted by API
    return sorted
  }, [rawResults, sortBy])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: 'rgba(0,255,136,0.12)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.25)' }}
            >
              📊 ARB SCANNER
            </span>
            {opportunities > 0 && (
              <span
                className="px-2 py-0.5 rounded text-xs font-bold animate-pulse"
                style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88' }}
              >
                {opportunities} opportunities
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold gradient-text-green">CEX–DEX Arbitrage Scanner</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            Binance Spot vs on-chain DEX price gaps · 币安现货 vs 链上价差
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastFetch && (
            <span className="hidden sm:inline text-xs" style={{ color: '#6b7280' }}>
              {Math.floor((now - lastFetch) / 1000)}s ago
            </span>
          )}
          <button
            onClick={fetchBulk}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50 btn-press"
            style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 p-4 rounded-xl mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(59,130,246,0.03))',
          border: '1px solid rgba(0,255,136,0.15)'
        }}
      >
        <span className="text-2xl flex-shrink-0">⚡</span>
        <div>
          <div className="font-semibold text-sm text-white mb-1">How it works</div>
          <div className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
            Compares Binance CEX spot price vs on-chain DEX price (via Binance Web3 API).
            A spread ≥ 2% signals a potential arbitrage opportunity.
            <span className="inline-flex items-center gap-1 mx-1 px-1.5 rounded" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88' }}>≥2%</span> = opportunity ·
            <span className="inline-flex items-center gap-1 mx-1 px-1.5 rounded" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>1-2%</span> = watch ·
            <span className="inline-flex items-center gap-1 mx-1 px-1.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#6b7280' }}>&lt;1%</span> = normal
          </div>
        </div>
      </div>

      {/* Custom symbol scanner */}
      <form
        onSubmit={handleCustomScan}
        className="flex gap-2 mb-6"
      >
        <input
          type="text"
          value={customSymbol}
          onChange={e => setCustomSymbol(e.target.value)}
          placeholder="Custom symbol, e.g. BONK or BONKUSDT"
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
          style={{
            background: '#13141e',
            border: '1px solid #1e2030',
            color: '#fff',
            caretColor: '#00ff88'
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(0,255,136,0.4)'}
          onBlur={e => e.target.style.borderColor = '#1e2030'}
        />
        <button
          type="submit"
          disabled={customLoading || !customSymbol.trim()}
          className="px-4 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-80 disabled:opacity-50"
          style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}
        >
          {customLoading ? <RefreshCw size={12} className="animate-spin" /> : 'Scan'}
        </button>
      </form>

      {/* Custom result */}
      {customResult && !customResult.error && (
        <div
          className="p-4 rounded-xl mb-6 animate-fade-in"
          style={{ background: spreadBg(customResult.spreadPercent), border: `1px solid ${spreadColor(customResult.spreadPercent)}33` }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">{customResult.symbol}</span>
              {customResult.opportunity && <OpportunityBadge />}
            </div>
            <DirectionChip direction={customResult.direction} />
          </div>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <div className="text-xs mb-1" style={{ color: '#6b7280' }}>CEX Price</div>
              <div className="text-sm font-semibold text-white">{fmtPrice(customResult.cexPrice)}</div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: '#6b7280' }}>DEX Price</div>
              <div className="text-sm font-semibold text-white">{fmtPrice(customResult.dexPrice)}</div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: '#6b7280' }}>Spread</div>
              <div
                className="text-sm font-bold"
                style={{ color: spreadColor(customResult.spreadPercent) }}
              >
                {customResult.spreadPercent != null ? `${customResult.spreadPercent > 0 ? '+' : ''}${customResult.spreadPercent.toFixed(2)}%` : '—'}
              </div>
            </div>
          </div>
        </div>
      )}
      {customResult?.error && (
        <div className="p-3 rounded-lg mb-6 text-sm" style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444' }}>
          ⚠️ {customResult.error}
        </div>
      )}

      {/* Error */}
      <ErrorBanner message={error} onRetry={fetchBulk} loading={loading} />

      {/* Results count + sort */}
      {results.length > 0 && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>
              {results.length} pairs scanned
            </span>
            {opportunities > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-bold animate-glow"
                style={{ background: 'rgba(0,255,136,0.12)', color: '#00ff88' }}>
                {opportunities} opp{opportunities > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span style={{ color: '#6b7280' }}>Sort:</span>
            {['spread', 'symbol'].map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className="px-2 py-1 rounded transition-all btn-press"
                style={{
                  background: sortBy === s ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.04)',
                  color: sortBy === s ? '#00ff88' : '#6b7280',
                  border: `1px solid ${sortBy === s ? 'rgba(0,255,136,0.25)' : 'transparent'}`
                }}>
                {s === 'spread' ? '% Spread' : 'A-Z'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main table */}
      {results.length > 0 && (
        <div
          className="rounded-xl overflow-hidden arb-table-wrap"
          style={{ border: '1px solid #1e2030' }}
        >
          {/* Table header */}
          <div
            className="grid gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wider"
            style={{
              background: 'linear-gradient(180deg, #0d0e14, #0a0b0f)',
              color: '#6b7280',
              gridTemplateColumns: '120px 1fr 1fr 100px 140px 60px'
            }}
          >
            <span>Symbol</span>
            <span>CEX Price</span>
            <span>DEX Price</span>
            <span>Spread %</span>
            <span>Direction</span>
            <span>Opp.</span>
          </div>

          {/* Rows */}
          {results.map((row, i) => (
            <div
              key={row.symbol}
              className="grid gap-3 px-4 py-3 items-center transition-colors row-hover"
              style={{
                gridTemplateColumns: '120px 1fr 1fr 100px 140px 60px',
                borderTop: '1px solid #1e2030',
                background: row.opportunity ? 'rgba(0,255,136,0.03)' : i % 2 === 0 ? '#0d0e14' : '#0a0b0f'
              }}
            >
              {/* Symbol */}
              <div className="font-bold text-white text-sm">
                {row.keyword || row.symbol.replace('USDT', '')}
                <div className="text-xs font-normal" style={{ color: '#6b7280' }}>{row.symbol}</div>
              </div>

              {/* CEX price */}
              <div className="text-sm font-medium text-white">{fmtPrice(row.cexPrice)}</div>

              {/* DEX price */}
              <div className="text-sm font-medium" style={{ color: '#9ca3af' }}>{fmtPrice(row.dexPrice)}</div>

              {/* Spread */}
              <div
                className="text-sm font-bold tabular-nums"
                style={{ color: spreadColor(row.spreadPercent) }}
              >
                {row.spreadPercent != null
                  ? `${row.spreadPercent > 0 ? '+' : ''}${row.spreadPercent.toFixed(2)}%`
                  : '—'}
              </div>

              {/* Direction */}
              <DirectionChip direction={row.direction} />

              {/* Opportunity */}
              <div>{row.opportunity ? <OpportunityBadge /> : <span style={{ color: '#374151' }}>—</span>}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && results.length === 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1e2030' }}>
          {/* Skeleton header */}
          <div className="h-10" style={{ background: 'linear-gradient(180deg, #0d0e14, #0a0b0f)' }} />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid gap-3 px-4 py-3 items-center"
              style={{
                gridTemplateColumns: '120px 1fr 1fr 100px 140px 60px',
                borderTop: '1px solid #1e2030',
                background: i % 2 === 0 ? '#0d0e14' : '#0a0b0f'
              }}
            >
              <div className="h-4 w-16 rounded skeleton-shimmer" />
              <div className="h-4 w-20 rounded skeleton-shimmer" />
              <div className="h-4 w-20 rounded skeleton-shimmer" />
              <div className="h-4 w-14 rounded skeleton-shimmer" />
              <div className="h-4 w-24 rounded skeleton-shimmer" />
              <div className="h-4 w-8 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && results.length === 0 && !error && (
        <EmptyState
          icon="📊"
          title="No arbitrage data loaded yet"
          actionLabel="Start Scan"
          onAction={fetchBulk}
        />
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs" style={{ color: '#4b5563' }}>
        <span>CEX: Binance Spot API</span>
        <span>·</span>
        <span>DEX: Binance Web3 API (on-chain)</span>
        <span>·</span>
        <span>Auto-refreshes every 30s</span>
        <span>·</span>
        <span>Spread ≥ 1.5% = Opportunity</span>
      </div>
    </div>
  )
}
