import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Flame, Activity, Wallet, Bell, Zap, BarChart2, Settings,
  Search, ArrowRight, Command, Hash, TrendingUp
} from 'lucide-react'
import api from '../utils/api.js'

/**
 * Command Palette — ⌘K / Ctrl+K
 *
 * A VS Code / Linear-style quick navigation and search overlay.
 * Power users can jump to any page, search tokens, or trigger actions instantly.
 */

const NAV_ITEMS = [
  { id: 'nav-home',      label: 'Dashboard',          desc: 'Overview & quick stats',           icon: LayoutDashboard, path: '/',          tags: ['home', 'overview'] },
  { id: 'nav-scanner',   label: 'Token Scanner',      desc: 'Trending & new tokens',            icon: Flame,           path: '/scanner',   tags: ['trending', 'new', 'scan'] },
  { id: 'nav-signals',   label: 'Smart Money Signals', desc: 'On-chain signal detection',       icon: Activity,        path: '/signals',   tags: ['smart money', 'buy', 'sell'] },
  { id: 'nav-wallets',   label: 'Wallet Tracker',     desc: 'Monitor whale wallets',            icon: Wallet,          path: '/wallets',   tags: ['whale', 'portfolio', 'track'] },
  { id: 'nav-alerts',    label: 'Alert Center',       desc: 'Price & activity alerts',          icon: Bell,            path: '/alerts',     tags: ['price', 'notification'] },
  { id: 'nav-alpha',     label: 'Binance Alpha',      desc: 'Curated early-stage tokens',       icon: Zap,             path: '/alpha',     tags: ['binance', 'early', 'discovery'] },
  { id: 'nav-arbitrage', label: 'Arbitrage Scanner',  desc: 'CEX–DEX price gaps',               icon: BarChart2,       path: '/arbitrage', tags: ['cex', 'dex', 'spread'] },
  { id: 'nav-settings',  label: 'Settings',           desc: 'Configuration & diagnostics',      icon: Settings,        path: '/settings',  tags: ['config', 'api', 'system'] },
]

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [tokenResults, setTokenResults] = useState([])
  const [tokenLoading, setTokenLoading] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const searchTimerRef = useRef(null)

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setSelectedIndex(0)
      setTokenResults([])
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Filter navigation items
  const filteredNav = useMemo(() => {
    if (!query.trim()) return NAV_ITEMS
    const q = query.toLowerCase()
    return NAV_ITEMS.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.tags.some(t => t.includes(q))
    )
  }, [query])

  // Debounced token search when query looks like a token search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)

    const q = query.trim()
    if (q.length < 2) {
      setTokenResults([])
      return
    }

    // Only search tokens if query doesn't match nav items well
    searchTimerRef.current = setTimeout(async () => {
      setTokenLoading(true)
      try {
        const data = await api.get(`/token/search?q=${encodeURIComponent(q)}`)
        const results = (data.results || []).slice(0, 5).map((item, i) => ({
          id: `token-${i}`,
          type: 'token',
          label: item.token?.symbol || item.symbol || '?',
          desc: item.token?.name || item.name || '',
          chain: item.token?.chain || 'solana',
          address: item.token?.address || item.address || '',
        }))
        setTokenResults(results)
      } catch {
        setTokenResults([])
      } finally {
        setTokenLoading(false)
      }
    }, 300)

    return () => clearTimeout(searchTimerRef.current)
  }, [query])

  // Combined items: nav + token results
  const allItems = useMemo(() => {
    const items = []
    if (filteredNav.length > 0) {
      items.push({ type: 'section', label: 'Navigate' })
      items.push(...filteredNav.map(n => ({ ...n, type: 'nav' })))
    }
    if (tokenResults.length > 0) {
      items.push({ type: 'section', label: 'Tokens' })
      items.push(...tokenResults)
    }
    if (tokenLoading && query.trim().length >= 2) {
      items.push({ type: 'section', label: 'Searching tokens...' })
    }
    return items
  }, [filteredNav, tokenResults, tokenLoading, query])

  // Selectable items only (exclude section headers)
  const selectableItems = allItems.filter(i => i.type !== 'section')

  // Clamp selected index
  useEffect(() => {
    setSelectedIndex(prev => Math.min(prev, Math.max(0, selectableItems.length - 1)))
  }, [selectableItems.length])

  const executeItem = useCallback((item) => {
    if (item.type === 'nav') {
      navigate(item.path)
    } else if (item.type === 'token' && item.address) {
      navigate(`/token/${item.chain}/${item.address}`)
    }
    onClose()
  }, [navigate, onClose])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKey = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, selectableItems.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (selectableItems[selectedIndex]) {
            executeItem(selectableItems[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, selectedIndex, selectableItems, executeItem, onClose])

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return
    const selected = listRef.current.querySelector('[data-selected="true"]')
    selected?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!open) return null

  let selectableIdx = -1

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Palette */}
      <div
        className="fixed z-[101] left-1/2 -translate-x-1/2 w-full max-w-lg rounded-xl overflow-hidden shadow-2xl animate-fade-in-up"
        style={{
          top: '15%',
          background: '#0d0e14',
          border: '1px solid #1e2030',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,136,0.08)',
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid #1e2030' }}
        >
          <Search size={16} style={{ color: '#6b7280', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0) }}
            placeholder="Search pages, tokens, or actions..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#e5e7eb', caretColor: '#00ff88' }}
            autoComplete="off"
            spellCheck="false"
          />
          <kbd
            className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs"
            style={{ background: '#1e2030', color: '#6b7280', border: '1px solid #2a2d3e', fontFamily: 'monospace' }}
          >
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1">
          {allItems.length === 0 && !tokenLoading && (
            <div className="px-4 py-8 text-center">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm" style={{ color: '#6b7280' }}>
                No results for "{query}"
              </div>
            </div>
          )}

          {allItems.map((item, i) => {
            if (item.type === 'section') {
              return (
                <div
                  key={`section-${i}`}
                  className="px-4 pt-3 pb-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: '#4b5563' }}
                >
                  {item.label}
                </div>
              )
            }

            selectableIdx++
            const isSelected = selectableIdx === selectedIndex
            const Icon = item.icon || (item.type === 'token' ? TrendingUp : Hash)

            return (
              <button
                key={item.id}
                data-selected={isSelected}
                onClick={() => executeItem(item)}
                onMouseEnter={() => setSelectedIndex(selectableIdx)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                style={{
                  background: isSelected ? 'rgba(0,255,136,0.06)' : 'transparent',
                  color: isSelected ? '#fff' : '#9ca3af',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isSelected ? 'rgba(0,255,136,0.12)' : 'rgba(255,255,255,0.04)',
                  }}
                >
                  <Icon size={14} style={{ color: isSelected ? '#00ff88' : '#6b7280' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {item.label}
                    {item.type === 'token' && item.chain && (
                      <span
                        className="ml-1.5 text-xs px-1 py-0.5 rounded font-bold"
                        style={{ background: 'rgba(139,92,246,0.15)', color: '#8b5cf6', fontSize: '9px' }}
                      >
                        {item.chain.toUpperCase()}
                      </span>
                    )}
                  </div>
                  {item.desc && (
                    <div className="text-xs truncate" style={{ color: '#4b5563' }}>
                      {item.desc}
                    </div>
                  )}
                </div>
                <ArrowRight
                  size={12}
                  className="flex-shrink-0 transition-opacity"
                  style={{ color: '#4b5563', opacity: isSelected ? 1 : 0 }}
                />
              </button>
            )
          })}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2 text-xs"
          style={{ borderTop: '1px solid #1e2030', color: '#4b5563' }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded" style={{ background: '#1e2030', border: '1px solid #2a2d3e', fontFamily: 'monospace' }}>↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 rounded" style={{ background: '#1e2030', border: '1px solid #2a2d3e', fontFamily: 'monospace' }}>↵</kbd>
              Select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command size={10} />
            Meme Terminal
          </span>
        </div>
      </div>
    </>
  )
}
