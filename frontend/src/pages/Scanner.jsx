import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, ArrowUp } from 'lucide-react'
import SearchBar from '../components/SearchBar.jsx'
import TokenCard from '../components/TokenCard.jsx'
import usePageTitle from '../hooks/usePageTitle.js'
import LoadingSkeleton from '../components/LoadingSkeleton.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { useToast } from '../components/Toast.jsx'
import api from '../utils/api.js'

const TABS = [
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'new', label: 'New Listings', icon: '✨' },
  { id: 'search', label: 'Search', icon: '🔍' },
]

const CHAINS = ['solana', 'ethereum', 'bsc', 'base', 'arbitrum']

export default function Scanner() {
  usePageTitle('Token Scanner')
  const navigate = useNavigate()
  const toast = useToast()

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
  const searchBarRef = useRef(null)
  const [showScrollTop, setShowScrollTop] = useState(false)

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
  }, [chain]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh trending every 30s
  useEffect(() => {
    autoRefreshRef.current = setInterval(() => {
      if (tab === 'trending') fetchTrending(chain)
    }, 30000)
    return () => clearInterval(autoRefreshRef.current)
  }, [tab, chain, fetchTrending])

  // Keyboard shortcut: / to focus search (⌘K is now handled by global Command Palette)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') {
        if (e.key === 'Escape') document.activeElement.blur()
        return
      }
      if (e.key === '/') {
        e.preventDefault()
        searchBarRef.current?.focus()
        setTab('search')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Show "back to top" button on scroll
  useEffect(() => {
    const mainEl = document.querySelector('.main-content-mobile') || document.querySelector('main')
    if (!mainEl) return
    const onScroll = () => setShowScrollTop(mainEl.scrollTop > 400)
    mainEl.addEventListener('scroll', onScroll, { passive: true })
    return () => mainEl.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    const mainEl = document.querySelector('.main-content-mobile') || document.querySelector('main')
    mainEl?.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
    } catch {
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

  const handleTrackWallet = (token) => {
    toast.info(`Navigate to Wallets to track ${token?.symbol || 'token'} wallets`)
    navigate('/wallets')
  }

  const handleSetAlert = (token) => {
    toast.info(`Navigate to Alerts to set alert for ${token?.symbol || 'token'}`)
    navigate('/alerts')
  }

  const handleRetry = () => {
    if (tab === 'trending') fetchTrending()
    else if (tab === 'new') fetchNew()
    else if (tab === 'search' && searchQuery) fetchSearch(searchQuery)
  }

  const currentTokens = tokens[tab] || []
  const currentLoading = loading[tab]
  const currentError = errors[tab]

  const timeSinceRefresh = lastRefresh
    ? Math.floor((Date.now() - lastRefresh.getTime()) / 1000)
    : null

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">🔥 Token Scanner</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            Real-time memecoin discovery & analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="hidden sm:inline text-xs" style={{ color: '#6b7280' }}>
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
        <div className="relative">
          <SearchBar
            ref={searchBarRef}
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={fetchSearch}
            placeholder="Search by name, symbol or address... (Press Enter)"
            loading={loading.search}
            className="w-full"
          />
          {/* Keyboard shortcut hint */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none"
            style={{ opacity: searchQuery ? 0 : 0.4 }}>
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs"
              style={{ background: '#1e2030', color: '#6b7280', border: '1px solid #2a2d3e', fontFamily: 'monospace' }}>
              /
            </kbd>
          </div>
        </div>
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
            className="flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all"
            style={{
              background: tab === id ? '#1a1b25' : 'transparent',
              color: tab === id ? '#fff' : '#9ca3af',
              border: tab === id ? '1px solid #1e2030' : '1px solid transparent',
            }}
          >
            <span>{icon}</span>
            <span className="hidden sm:inline">{label}</span>
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
      <ErrorBanner message={currentError} onRetry={handleRetry} loading={currentLoading} />

      {/* Token grid */}
      {currentLoading && currentTokens.length === 0 ? (
        <LoadingSkeleton count={6} />
      ) : currentTokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
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
              Try searching &quot;bonk&quot;, &quot;pepe&quot;, &quot;wif&quot;, or paste a contract address
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentTokens.map((tokenItem, i) => {
            const id = tokenItem.token?.address || i
            const isExpanded = expandedId === id
            const displayData = isExpanded && expandedDetail ? expandedDetail : tokenItem
            const staggerClass = i < 6 ? `stagger-${i + 1}` : ''

            return (
              <div key={`${id}-${i}`} className={`animate-fade-in-up ${staggerClass}`}>
                <TokenCard
                  token={displayData}
                  expanded={isExpanded}
                  onExpand={() => handleExpand(tokenItem)}
                  onTrackWallet={handleTrackWallet}
                  onSetAlert={handleSetAlert}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Detail loading overlay */}
      {detailLoading && (
        <div className="fixed bottom-20 md:bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs animate-slide-in-right"
          style={{ background: '#12131a', border: '1px solid #1e2030', color: '#9ca3af', zIndex: 100 }}
        >
          <div className="w-3 h-3 border-2 rounded-full animate-spin" style={{ borderColor: '#1e2030', borderTopColor: '#00ff88' }} />
          Loading details...
        </div>
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all hover:opacity-90 animate-fade-in-up shadow-lg"
          style={{
            background: 'rgba(0,255,136,0.15)',
            color: '#00ff88',
            border: '1px solid rgba(0,255,136,0.3)',
            backdropFilter: 'blur(8px)',
            zIndex: 90,
          }}
        >
          <ArrowUp size={12} /> Back to top
        </button>
      )}
    </div>
  )
}
