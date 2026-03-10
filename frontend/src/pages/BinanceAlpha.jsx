import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, ExternalLink, TrendingUp, TrendingDown, Minus, Search, X } from 'lucide-react'
import ErrorBanner from '../components/ErrorBanner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import usePageTitle from '../hooks/usePageTitle.js'
import api from '../utils/api.js'
import { fmtUsd, fmtPrice } from '../utils/format.js'

/**
 * Render a price-change badge with appropriate color and icon.
 */
function PriceChange({ value }) {
  if (value == null) return <span style={{ color: '#6b7280' }}>—</span>
  const isPos = value >= 0
  const isNeg = value < 0
  const color = isPos ? '#00ff88' : isNeg ? '#ff4444' : '#9ca3af'
  const Icon = isPos ? TrendingUp : isNeg ? TrendingDown : Minus
  return (
    <span className="flex items-center gap-1 font-medium" style={{ color }}>
      <Icon size={12} />
      {isPos ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

/**
 * Individual Alpha token card.
 */
function AlphaCard({ token, index, onNavigate }) {
  return (
    <div
      className="rounded-xl p-4 flex flex-col gap-3 transition-all hover:scale-[1.01] cursor-pointer"
      onClick={() => token.contractAddress && onNavigate && onNavigate(token)}
      style={{
        background: 'linear-gradient(135deg, #13141e 0%, #1a1b25 100%)',
        border: '1px solid rgba(240,185,11,0.25)',
        boxShadow: '0 0 12px rgba(240,185,11,0.04)',
        animationDelay: `${index * 60}ms`
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {/* Rank badge */}
          {token.rank != null && (
            <span
              className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(240,185,11,0.15)', color: '#f0b90b' }}
            >
              {token.rank}
            </span>
          )}
          {/* Logo or letter avatar */}
          {token.logoUrl ? (
            <img
              src={token.logoUrl}
              alt={token.symbol}
              className="w-8 h-8 rounded-full flex-shrink-0"
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(240,185,11,0.2)', color: '#f0b90b' }}
            >
              {(token.symbol || '?').slice(0, 2)}
            </div>
          )}
          <div className="min-w-0">
            <div className="font-bold text-white text-sm truncate">{token.symbol}</div>
            <div className="text-xs truncate" style={{ color: '#6b7280' }}>{token.name}</div>
          </div>
        </div>

        {/* Alpha badge */}
        <span
          className="flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold tracking-wide"
          style={{
            background: 'linear-gradient(90deg, rgba(240,185,11,0.25), rgba(240,185,11,0.1))',
            color: '#f0b90b',
            border: '1px solid rgba(240,185,11,0.35)'
          }}
        >
          🟡 Alpha
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs mb-0.5" style={{ color: '#6b7280' }}>Price</div>
          <div className="text-sm font-semibold text-white">{fmtPrice(token.price)}</div>
        </div>
        <div>
          <div className="text-xs mb-0.5" style={{ color: '#6b7280' }}>24h Change</div>
          <PriceChange value={token.priceChange24h} />
        </div>
        <div>
          <div className="text-xs mb-0.5" style={{ color: '#6b7280' }}>Volume 24h</div>
          <div className="text-sm font-medium" style={{ color: '#9ca3af' }}>{fmtUsd(token.volume24h)}</div>
        </div>
        <div>
          <div className="text-xs mb-0.5" style={{ color: '#6b7280' }}>Market Cap</div>
          <div className="text-sm font-medium" style={{ color: '#9ca3af' }}>{fmtUsd(token.marketCap)}</div>
        </div>
      </div>

      {/* Contract address */}
      {token.contractAddress && (
        <div
          className="text-xs px-2 py-1 rounded-lg font-mono truncate"
          style={{ background: 'rgba(255,255,255,0.04)', color: '#6b7280' }}
        >
          {token.contractAddress.slice(0, 20)}…{token.contractAddress.slice(-6)}
        </div>
      )}
    </div>
  )
}

/**
 * Binance Alpha Token Discovery Page
 * Showcases Binance-curated alpha tokens for early discovery.
 * 币安Alpha代币发现页面 — 展示币安精选的Alpha代币，用于早期发现机会
 */
export default function BinanceAlpha() {
  usePageTitle('Binance Alpha')
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rank') // rank | change | volume
  const [now, setNow] = useState(Date.now())

  // Live timer
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const fetchAlpha = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/token/binance-alpha')
      setData(res)
      setLastFetch(new Date())
    } catch (e) {
      setError(e.message || 'Failed to fetch Binance Alpha tokens')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlpha()
    const interval = setInterval(fetchAlpha, 60000) // auto-refresh every 60s
    return () => clearInterval(interval)
  }, [fetchAlpha])

  const allTokens = data?.tokens || []

  const tokens = useMemo(() => {
    let filtered = allTokens
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        (t.symbol || '').toLowerCase().includes(q) ||
        (t.name || '').toLowerCase().includes(q) ||
        (t.contractAddress || '').toLowerCase().includes(q)
      )
    }
    if (sortBy === 'change') {
      filtered = [...filtered].sort((a, b) => (b.priceChange24h ?? -999) - (a.priceChange24h ?? -999))
    } else if (sortBy === 'volume') {
      filtered = [...filtered].sort((a, b) => (b.volume24h ?? 0) - (a.volume24h ?? 0))
    }
    return filtered
  }, [allTokens, searchQuery, sortBy])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: 'rgba(240,185,11,0.15)', color: '#f0b90b', border: '1px solid rgba(240,185,11,0.3)' }}
            >
              🟡 BINANCE ALPHA
            </span>
          </div>
          <h1 className="text-xl font-bold gradient-text-gold">Alpha Token Discovery</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            Binance-curated early-stage tokens · 币安精选Alpha代币
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastFetch && (
            <span className="hidden sm:inline text-xs" style={{ color: '#6b7280' }}>
              {Math.floor((now - lastFetch) / 1000)}s ago
            </span>
          )}
          <button
            onClick={fetchAlpha}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50 btn-press"
            style={{ background: 'rgba(240,185,11,0.1)', color: '#f0b90b', border: '1px solid rgba(240,185,11,0.2)' }}
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
          background: 'linear-gradient(135deg, rgba(240,185,11,0.08), rgba(240,185,11,0.03))',
          border: '1px solid rgba(240,185,11,0.2)'
        }}
      >
        <span className="text-2xl flex-shrink-0">🟡</span>
        <div>
          <div className="font-semibold text-sm text-white mb-1">What is Binance Alpha?</div>
          <div className="text-xs leading-relaxed" style={{ color: '#9ca3af' }}>
            Binance Alpha is a curated list of emerging tokens identified by Binance's on-chain intelligence.
            These tokens show early signals of momentum before potential CEX listing or breakout.
            Use this list to discover opportunities ahead of the crowd.
            <br />
            <span style={{ color: '#6b7280' }}>币安Alpha精选正在崛起的代币 — 在主流发现之前抢先布局</span>
          </div>
        </div>
      </div>

      {/* Search + Sort */}
      {allTokens.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, symbol, or address..."
              className="w-full pl-9 pr-8 py-2 rounded-lg text-sm outline-none transition-all"
              style={{ background: '#13141e', border: '1px solid #1e2030', color: '#fff', caretColor: '#f0b90b' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2"
                style={{ color: '#6b7280' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs flex-shrink-0">
            <span style={{ color: '#6b7280' }}>Sort:</span>
            {[
              { key: 'rank', label: 'Rank' },
              { key: 'change', label: '24h %' },
              { key: 'volume', label: 'Volume' },
            ].map(s => (
              <button key={s.key} onClick={() => setSortBy(s.key)}
                className="px-2 py-1 rounded transition-all btn-press"
                style={{
                  background: sortBy === s.key ? 'rgba(240,185,11,0.12)' : 'rgba(255,255,255,0.04)',
                  color: sortBy === s.key ? '#f0b90b' : '#6b7280',
                  border: `1px solid ${sortBy === s.key ? 'rgba(240,185,11,0.25)' : 'transparent'}`
                }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      <ErrorBanner message={error} onRetry={fetchAlpha} loading={loading} />

      {/* Loading skeleton */}
      {loading && tokens.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl p-4 h-44 animate-pulse"
              style={{ background: '#13141e', border: '1px solid rgba(240,185,11,0.1)' }}
            />
          ))}
        </div>
      )}

      {/* Token grid */}
      {tokens.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>
              {searchQuery ? `${tokens.length} of ${allTokens.length}` : tokens.length} Alpha Tokens
            </span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-xs" style={{ color: '#6b7280' }}>Live data</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {tokens.map((token, i) => (
              <AlphaCard key={token.contractAddress || token.symbol || i} token={token} index={i} onNavigate={(t) => {
                const chain = t.chainId === 'CT_501' ? 'solana' : t.chainId === '56' ? 'bsc' : t.chainId === '8453' ? 'base' : 'ethereum'
                navigate(`/token/${chain}/${t.contractAddress}`)
              }} />
            ))}
          </div>
        </>
      )}

      {/* Empty search state */}
      {!loading && tokens.length === 0 && allTokens.length > 0 && searchQuery && (
        <EmptyState
          icon="🔍"
          title={`No tokens match "${searchQuery}"`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
          actionColor="#f0b90b"
        />
      )}

      {/* Empty state */}
      {!loading && allTokens.length === 0 && !error && (
        <EmptyState
          icon="🟡"
          title="No Alpha tokens loaded yet"
          actionLabel="Load Alpha Tokens"
          onAction={fetchAlpha}
          actionColor="#f0b90b"
        />
      )}

      {/* Footer note */}
      <div className="mt-8 text-center text-xs" style={{ color: '#4b5563' }}>
        Data from Binance Web3 API · Crypto Market Rank (rankType=20) · Updates every 60s
      </div>
    </div>
  )
}
