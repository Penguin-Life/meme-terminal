import { useState, useEffect, useMemo } from 'react'
import { Plus, Wallet, RefreshCw, Search, Filter } from 'lucide-react'
import WalletCard from '../components/WalletCard.jsx'
import { WalletCardSkeleton } from '../components/LoadingSkeleton.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import { useToast } from '../components/Toast.jsx'
import api from '../utils/api.js'

const CHAINS = ['solana', 'eth', 'bsc', 'base', 'arbitrum']

export default function Wallets() {
  const toast = useToast()
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState({ address: '', chain: 'solana', label: '', notes: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState(null)
  const [filterChain, setFilterChain] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filtered and searched wallets
  const filteredWallets = useMemo(() => {
    let result = watchlist
    if (filterChain !== 'all') {
      result = result.filter(w => w.chain === filterChain)
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(w =>
        (w.label || '').toLowerCase().includes(q) ||
        (w.address || '').toLowerCase().includes(q) ||
        (w.notes || '').toLowerCase().includes(q)
      )
    }
    return result
  }, [watchlist, filterChain, searchTerm])

  const fetchWatchlist = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/wallet/watchlist')
      setWatchlist(data.wallets || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWatchlist()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.address || !form.chain) return
    setAddLoading(true)
    setAddError(null)
    try {
      const data = await api.post('/wallet/watchlist', form)
      setWatchlist(w => [...w, data.wallet])
      setForm({ address: '', chain: 'solana', label: '', notes: '' })
      setShowAddForm(false)
      toast.success(`Wallet "${data.wallet?.label || form.address.slice(0, 8) + '...'}" added to watchlist`)
    } catch (e) {
      setAddError(e.message)
      toast.error('Failed to add wallet: ' + e.message)
    } finally {
      setAddLoading(false)
    }
  }

  const handleRemove = async (wallet) => {
    if (!confirm(`Remove wallet "${wallet.label}"?`)) return
    try {
      await api.delete(`/wallet/watchlist/${wallet.address}?chain=${wallet.chain}`)
      setWatchlist(w => w.filter(x => !(x.address === wallet.address && x.chain === wallet.chain)))
      toast.success(`Wallet "${wallet.label}" removed`)
    } catch (e) {
      toast.error('Failed to remove: ' + e.message)
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">👛 Wallet Tracker</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            Monitor whale wallets & smart money moves
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchWatchlist}
            disabled={loading}
            className="p-2 rounded-lg transition-all hover:opacity-80"
            style={{ background: '#12131a', border: '1px solid #1e2030', color: '#9ca3af' }}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: showAddForm ? 'rgba(255,68,68,0.1)' : 'rgba(0,255,136,0.1)',
              color: showAddForm ? '#ff4444' : '#00ff88',
              border: `1px solid ${showAddForm ? 'rgba(255,68,68,0.2)' : 'rgba(0,255,136,0.2)'}`,
            }}
          >
            <Plus size={14} className={showAddForm ? 'rotate-45' : ''} style={{ transition: 'transform 0.2s' }} />
            {showAddForm ? 'Cancel' : 'Add Wallet'}
          </button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-xl p-5 mb-6 border animate-fade-in-up"
          style={{ background: '#12131a', borderColor: 'rgba(0,255,136,0.2)' }}
        >
          <div className="text-sm font-semibold mb-4 text-white">Add Wallet to Watchlist</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Wallet Address *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="0x... or Solana address"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: '#0a0b0f',
                  border: '1px solid #1e2030',
                  color: '#e5e7eb',
                }}
              />
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Chain *</label>
              <select
                value={form.chain}
                onChange={(e) => setForm(f => ({ ...f, chain: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: '#0a0b0f', border: '1px solid #1e2030', color: '#e5e7eb' }}
              >
                {CHAINS.map(c => (
                  <option key={c} value={c}>{c.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. Whale #1, Smart Money"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: '#0a0b0f', border: '1px solid #1e2030', color: '#e5e7eb' }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Notes (optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. Usually buys early memes"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: '#0a0b0f', border: '1px solid #1e2030', color: '#e5e7eb' }}
              />
            </div>
          </div>

          {addError && (
            <div
              className="mb-3 p-2 rounded text-xs"
              style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)' }}
            >
              {addError}
            </div>
          )}

          <button
            type="submit"
            disabled={addLoading || !form.address}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.25)' }}
          >
            {addLoading ? (
              <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: '#00ff88' }} />
            ) : (
              <Plus size={14} />
            )}
            Add to Watchlist
          </button>
        </form>
      )}

      {/* Error */}
      <ErrorBanner message={error} onRetry={fetchWatchlist} loading={loading} />

      {/* Search & Filter bar */}
      {!loading && watchlist.length > 0 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap animate-fade-in">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#6b7280' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search wallets..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: '#12131a', border: '1px solid #1e2030', color: '#e5e7eb' }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter size={12} style={{ color: '#6b7280' }} />
            {['all', ...CHAINS].map(c => (
              <button
                key={c}
                onClick={() => setFilterChain(c)}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background: filterChain === c ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.03)',
                  color: filterChain === c ? '#00ff88' : '#6b7280',
                  border: `1px solid ${filterChain === c ? 'rgba(0,255,136,0.3)' : '#1e2030'}`,
                }}
              >
                {c === 'all' ? 'All' : c.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active filter indicator */}
      {(filterChain !== 'all' || searchTerm.trim()) && watchlist.length > 0 && (
        <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: '#9ca3af' }}>
          <span>Showing {filteredWallets.length} of {watchlist.length} wallets</span>
          <button
            onClick={() => { setFilterChain('all'); setSearchTerm('') }}
            className="px-2 py-0.5 rounded text-xs transition-all hover:opacity-80"
            style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.15)' }}
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Stats */}
      {!loading && watchlist.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up">
          {[
            { label: 'Wallets Tracked', value: watchlist.length, color: '#00ff88' },
            { label: 'Chains', value: [...new Set(watchlist.map(w => w.chain))].length, color: '#3b82f6' },
            { label: 'Added Today', value: watchlist.filter(w => new Date(w.addedAt).toDateString() === new Date().toDateString()).length, color: '#f59e0b' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4 border" style={{ background: '#12131a', borderColor: '#1e2030' }}>
              <div className="text-2xl font-bold" style={{ color }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Watchlist */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <WalletCardSkeleton key={i} />)}
        </div>
      ) : watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'rgba(0,255,136,0.05)', border: '2px dashed rgba(0,255,136,0.15)' }}>
            <Wallet size={36} style={{ color: '#1e2030' }} />
          </div>
          <div className="text-sm font-medium" style={{ color: '#9ca3af' }}>No wallets tracked yet</div>
          <div className="text-xs max-w-xs text-center" style={{ color: '#6b7280' }}>
            Track whale wallets, smart money addresses, and your own portfolio across multiple chains
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}
          >
            <Plus size={14} /> Add First Wallet
          </button>
          <div className="flex gap-4 mt-6 text-xs" style={{ color: '#4b5563' }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: '#00ff88' }} />
              Multi-chain support
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: '#3b82f6' }} />
              Portfolio tracking
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: '#f59e0b' }} />
              Explorer links
            </div>
          </div>
        </div>
      ) : filteredWallets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 animate-fade-in">
          <Search size={32} style={{ color: '#1e2030' }} />
          <div className="text-sm" style={{ color: '#9ca3af' }}>No wallets match your filters</div>
          <button
            onClick={() => { setFilterChain('all'); setSearchTerm('') }}
            className="mt-1 text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWallets.map((wallet, i) => (
            <div key={`${wallet.address}-${wallet.chain}`} className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <WalletCard
                wallet={wallet}
                onRemove={handleRemove}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
