import { useState, useEffect, useCallback, useRef } from 'react'
import { RefreshCw, TrendingUp, Sparkles, Search as SearchIcon } from 'lucide-react'
import SearchBar from '../components/SearchBar.jsx'
import TokenCard from '../components/TokenCard.jsx'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import api from '../utils/api.js'

const TABS = [
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'new', label: 'New Listings', icon: '✨' },
  { id: 'search', label: 'Search', icon: '🔍' },
]

const CHAINS = ['solana', 'ethereum', 'bsc', 'base', 'arbitrum']

export default function Scanner() {
  const [tab, setTab] = useState('trending')
  const [chain, setChain] = useState('solana')
  const [searchQuery, setSearchQuery] = useState('')
  const [tokens, setTokens] = useState({ trending: [], new: [], search: [] })
  const [loading, setLoading] = useState({ trending: false, new: false, search: false })
  const [errors, setErrors] = useState({})
  const [expandedId, setExpandedId] = useState(null)
  const [expandedDetail, setExpandedDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  const autoRefreshRef = useRef(null)

  const fetchTrending = useCallback(async (selectedChain = chain) => {
    setLoading(l => ({ ...l, trending: true }))
    setErrors(e => ({ ...e, trending: null }))
    try {
      const data = await api.get(`/token/trending?chain=${selectedChain}`)
      setTokens(t => ({ ...t, trending: data.results || [] }))
      setLastRefresh(new Date())
    } catch (e) {
      setErrors(err => ({ ...err, trending: e.message }))
    } finally {
      setLoading(l => ({ ...l, trending: false }))
    }
  }, [chain])

  const fetchNew = useCallback(async (selectedChain = chain) => {
    setLoading(l => ({ ...l, new: true }))
    setErrors(e => ({ ...e, new: null }))
    try {
      const data = await api.get(`/token/new?chain=${selectedChain}&limit=20`)
      setTokens(t => ({ ...t, new: data.results || [] }))
    } catch (e) {
      setErrors(err => ({ ...err, new: e.message }))
    } finally {
      setLoading(l => ({ ...l, new: false }))
    }
  }, [chain])

  const fetchSearch = useCallback(async (q) => {
    if (!q || q.trim().length < 1) return
    setLoading(l => ({ ...l, search: true }))
    setErrors(e => ({ ...e, search: null }))
    try {
      const data = await api.get(`/token/search?q=${encodeURIComponent(q)}`)
      setTokens(t => ({ ...t, search: data.results || [] }))
      setTab('search')
    } catch (e) {
      setErrors(err => ({ ...err, search: e.message }))
    } finally {
      setLoading(l => ({ ...l, search: false }))
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchTrending(chain)
    fetchNew(chain)
  }, [chain])

  // Auto-refresh trending every 30s
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => {
      if (tab === 'trending') fetchTrending(chain)
    }, 30000)
    return () => clearInterval(autoRefreshRef.current)
  }, [tab, chain, fetchTrending])

  const handleExpand = async (tokenItem) => {
    const id = tokenItem.token?.address
    if (!id) return

    if (expandedId === id) {
      setExpandedId(null)
      setExpandedDetail(null)
      return
    }

    setExpandedId(id)
    setExpandedDetail(null)
    setDetailLoading(true)

    try {
      const data = await api.get(`/token/${tokenItem.token.chain}/${id}`)
      setExpandedDetail(data.data)
    } catch (e) {
      // fallback to card data
      setExpandedDetail(tokenItem)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleChainChange = (newChain) => {
    setChain(newChain)
    setExpandedId(null)
    setExpandedDetail(null)
  }

  const currentTokens = tokens[tab] || []
  const currentLoading = loading[tab]
  const currentError = errors[tab]

  const timeSinceRefresh = lastRefresh
    ? Math.floor((Date.now() - lastRefresh.getTime()) / 1000)
    : null

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">Token Scanner</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            Real-time meme coin data
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs" style={{ color: '#6b7280' }}>
              Refreshed {timeSinceRefresh}s ago
            </span>
          )}
          <button
            onClick={() => tab === 'trending' ? fetchTrending() : fetchNew()}
            disabled={currentLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}
          >
            <RefreshCw size={12} className={currentLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={fetchSearch}
          placeholder="Search by name, symbol or address... (Press Enter)"
          loading={loading.search}
          className="w-full"
        />
      </div>

      {/* Chain filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs" style={{ color: '#6b7280' }}>Chain:</span>
        {CHAINS.map((c) => (
          <button
            key={c}
            onClick={() => handleChainChange(c)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: chain === c ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.05)',
              color: chain === c ? '#00ff88' : '#9ca3af',
              border: `1px solid ${chain === c ? 'rgba(0,255,136,0.3)' : '#1e2030'}`,
            }}
          >
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: '#12131a', border: '1px solid #1e2030' }}>
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === id ? '#1a1b25' : 'transparent',
              color: tab === id ? '#fff' : '#9ca3af',
              border: tab === id ? '1px solid #1e2030' : '1px solid transparent',
            }}
          >
            <span>{icon}</span>
            <span>{label}</span>
            {tokens[id]?.length > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', fontSize: '10px' }}
              >
                {tokens[id].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {currentError && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)' }}
        >
          ⚠️ {currentError}
        </div>
      )}

      {/* Token grid */}
      {currentLoading && currentTokens.length === 0 ? (
        <LoadingSkeleton count={6} />
      ) : currentTokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="text-4xl">
            {tab === 'search' ? '🔍' : tab === 'trending' ? '🔥' : '✨'}
          </div>
          <div className="text-sm" style={{ color: '#9ca3af' }}>
            {tab === 'search'
              ? 'Search for tokens by name, symbol, or address'
              : `No ${tab} tokens found for ${chain.toUpperCase()}`}
          </div>
          {tab === 'search' && (
            <div className="text-xs" style={{ color: '#6b7280' }}>
              Try searching "bonk", "pepe", "wif", or paste a contract address
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentTokens.map((tokenItem, i) => {
            const id = tokenItem.token?.address || i
            const isExpanded = expandedId === id
            const displayData = isExpanded && expandedDetail ? expandedDetail : tokenItem

            return (
              <TokenCard
                key={`${id}-${i}`}
                token={displayData}
                expanded={isExpanded}
                onExpand={() => handleExpand(tokenItem)}
                onTrackWallet={(t) => console.log('Track wallet for', t)}
                onSetAlert={(t) => console.log('Set alert for', t)}
              />
            )
          })}
        </div>
      )}

      {/* Detail loading overlay */}
      {detailLoading && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
          style={{ background: '#12131a', border: '1px solid #1e2030', color: '#9ca3af' }}
        >
          <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: '#1e2030', borderTopColor: '#00ff88' }} />
          Loading details...
        </div>
      )}
    </div>
  )
}
