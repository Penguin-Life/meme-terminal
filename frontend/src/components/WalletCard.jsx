import { useState } from 'react'
import { ExternalLink, Trash2, ChevronDown, ChevronUp, RefreshCw, Copy, Check } from 'lucide-react'
import ChainBadge from './ChainBadge.jsx'
import api from '../utils/api.js'

function shortAddr(addr) {
  if (!addr) return ''
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function fmt(num) {
  if (num === null || num === undefined) return '—'
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

export default function WalletCard({ wallet, onRemove }) {
  const [expanded, setExpanded] = useState(false)
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  const { address, chain, label } = wallet

  const handleCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* ignore */ }
  }

  const loadPortfolio = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get(`/wallet/${chain}/${address}`)
      setPortfolio(data.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExpand = () => {
    if (!expanded && !portfolio) loadPortfolio()
    setExpanded(!expanded)
  }

  const totalValue = portfolio?.tokens?.reduce((sum, t) => sum + (t.usdValue || 0), 0)

  const explorerUrl = () => {
    if (chain === 'solana') return `https://solscan.io/account/${address}`
    if (chain === 'eth' || chain === 'ethereum') return `https://etherscan.io/address/${address}`
    if (chain === 'bsc') return `https://bscscan.com/address/${address}`
    if (chain === 'base') return `https://basescan.org/address/${address}`
    if (chain === 'arbitrum') return `https://arbiscan.io/address/${address}`
    return '#'
  }

  return (
    <div
      className="rounded-xl border transition-all"
      style={{
        background: expanded ? '#1a1b25' : '#12131a',
        borderColor: expanded ? 'rgba(59,130,246,0.25)' : '#1e2030',
      }}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 p-4">
        {/* Chain avatar */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e2030, #2d3050)', color: '#9ca3af' }}
        >
          {(label || '?').slice(0, 1).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{label || shortAddr(address)}</span>
            <ChainBadge chain={chain} size="xs" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs font-mono" style={{ color: '#6b7280' }}>
              {shortAddr(address)}
            </span>
            <button
              onClick={handleCopy}
              className="transition-colors hover:text-white"
              style={{ color: copied ? '#00ff88' : '#6b7280' }}
              title={copied ? 'Copied!' : 'Copy address'}
            >
              {copied ? <Check size={10} /> : <Copy size={10} />}
            </button>
            <a
              href={explorerUrl()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ color: '#6b7280' }}
              className="hover:text-blue-400 transition-colors"
            >
              <ExternalLink size={10} />
            </a>
          </div>
        </div>

        {/* Value */}
        {portfolio && totalValue !== undefined && (
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-bold text-white">{fmt(totalValue)}</div>
            <div className="text-xs" style={{ color: '#6b7280' }}>
              {portfolio.tokenCount || portfolio.tokens?.length || 0} tokens
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={handleExpand}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? 'Hide' : 'View'}
          </button>
          <button
            onClick={() => onRemove && onRemove(wallet)}
            className="p-1.5 rounded-lg transition-all hover:opacity-80"
            style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.15)' }}
            title="Remove wallet"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Expanded: portfolio */}
      {expanded && (
        <div
          className="border-t px-4 pb-4 animate-fade-in"
          style={{ borderColor: '#1e2030' }}
        >
          {loading && (
            <div className="py-6 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: '#1e2030', borderTopColor: '#3b82f6' }} />
              <span className="text-sm" style={{ color: '#6b7280' }}>Loading portfolio...</span>
            </div>
          )}

          {error && (
            <div className="py-3 flex items-center justify-between">
              <span className="text-xs" style={{ color: '#ff4444' }}>⚠️ {error}</span>
              <button
                onClick={loadPortfolio}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-all hover:opacity-80"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <RefreshCw size={10} /> Retry
              </button>
            </div>
          )}

          {portfolio && !loading && (
            <>
              {/* EVM note */}
              {portfolio.note && (
                <div
                  className="mt-3 p-3 rounded-lg text-xs"
                  style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
                >
                  ⚠️ {portfolio.note}
                </div>
              )}

              {/* Token holdings */}
              {portfolio.tokens?.length > 0 ? (
                <div className="mt-3">
                  <div className="text-xs font-semibold mb-2" style={{ color: '#9ca3af' }}>TOKEN HOLDINGS</div>
                  <div className="space-y-1">
                    {portfolio.tokens.slice(0, 10).map((t, i) => {
                      const pct = totalValue > 0 ? (t.usdValue / totalValue * 100) : 0
                      return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-white truncate">{t.symbol || t.mint?.slice(0, 6)}</span>
                              {t.name && <span className="truncate" style={{ color: '#6b7280' }}>{t.name}</span>}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-white">{fmt(t.usdValue)}</div>
                            <div style={{ color: '#6b7280' }}>{pct.toFixed(1)}%</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                !portfolio.note && (
                  <div className="mt-3 text-xs text-center py-4" style={{ color: '#6b7280' }}>
                    No token holdings found
                  </div>
                )
              )}

              {/* Native balance */}
              {portfolio.nativeBalance !== null && portfolio.nativeBalance !== undefined && (
                <div className="mt-3 pt-3 border-t text-xs flex items-center justify-between" style={{ borderColor: '#1e2030' }}>
                  <span style={{ color: '#6b7280' }}>Native Balance:</span>
                  <span className="text-white font-medium">
                    {portfolio.nativeBalance?.toFixed(4)} {
                      chain === 'solana' ? 'SOL' :
                      chain === 'bsc' ? 'BNB' :
                      chain === 'polygon' ? 'MATIC' :
                      'ETH'
                    }
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
