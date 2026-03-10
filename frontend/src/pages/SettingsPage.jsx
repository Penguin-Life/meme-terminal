import { useState, useEffect } from 'react'
import { Settings, Server, RefreshCw, ExternalLink, Zap, Info, FlaskConical, CheckCircle, XCircle, Clock } from 'lucide-react'
import api from '../utils/api.js'

const APP_VERSION = '1.4.0'

export default function SettingsPage() {
  const [health, setHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)
  const [status, setStatus] = useState(null)

  const checkHealth = async () => {
    setHealthLoading(true)
    try {
      const data = await api.get('/health')
      setHealth(data)
      // Also fetch dashboard status
      try {
        const statusData = await api.get('/status')
        setStatus(statusData?.data || null)
      } catch {
        // Status endpoint is optional — don't fail the whole check
      }
    } catch (e) {
      setHealth({ error: e.message })
    } finally {
      setHealthLoading(false)
    }
  }

  // Auto-check on mount
  useEffect(() => { checkHealth() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isHealthy = health && !health.error
  const statusIcon = isHealthy ? <CheckCircle size={14} style={{ color: '#00ff88' }} />
    : health?.error ? <XCircle size={14} style={{ color: '#ff4444' }} />
    : <Clock size={14} className="animate-spin" style={{ color: '#6b7280' }} />

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.25)' }}>
              ⚙️ SETTINGS
            </span>
            <span className="flex items-center gap-1 text-xs" style={{ color: '#6b7280' }}>
              {statusIcon}
              {isHealthy ? 'All systems go' : health?.error ? 'Connection issue' : 'Checking...'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">Settings & System Info</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            Configuration, diagnostics & data sources
          </p>
        </div>
      </div>

      {/* API Connection */}
      <div className="rounded-xl p-5 mb-4 border section-card animate-slide-up" style={{ background: '#12131a', borderColor: '#1e2030', animationDelay: '0.05s' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server size={16} style={{ color: '#3b82f6' }} />
            <span className="text-sm font-semibold text-white">Backend API</span>
          </div>
          <button
            onClick={checkHealth}
            disabled={healthLoading}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:opacity-80"
            style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <RefreshCw size={10} className={healthLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: '#9ca3af' }}>API Endpoint</span>
            <span className="font-mono text-white text-xs">{import.meta.env.VITE_API_URL || 'http://localhost:3902/api'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: '#9ca3af' }}>Status</span>
            <div className="flex items-center gap-2">
              {health && !health.error && (
                <span style={{ color: '#00ff88' }} className="text-xs">✅ {health.data?.status || 'healthy'}</span>
              )}
              {health?.error && (
                <span style={{ color: '#ff4444' }} className="text-xs">❌ {health.error}</span>
              )}
              {!health && (
                <span style={{ color: '#6b7280' }} className="text-xs">Checking…</span>
              )}
            </div>
          </div>
          {health && !health.error && (
            <>
              <div className="flex items-center justify-between text-xs" style={{ color: '#6b7280' }}>
                <span>Uptime</span>
                <span>
                  {status?.uptimeHuman || (health.data?.uptime != null
                    ? `${Math.floor(health.data.uptime / 60)}m ${health.data.uptime % 60}s`
                    : '—')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: '#6b7280' }}>
                <span>Backend Version</span>
                <span className="text-white">{health.data?.version || '1.0.0'}</span>
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: '#6b7280' }}>
                <span>Frontend Version</span>
                <span className="text-white">{APP_VERSION}</span>
              </div>
              {status && (
                <>
                  <div className="flex items-center justify-between text-xs" style={{ color: '#6b7280' }}>
                    <span>Active Alerts</span>
                    <span className="text-white">{status.activeAlerts ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs" style={{ color: '#6b7280' }}>
                    <span>Watchlist Wallets</span>
                    <span className="text-white">{status.watchlistCount ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs" style={{ color: '#6b7280' }}>
                    <span>Cache Hit Rate</span>
                    <span className="text-white">{status.cache?.hitRate ?? '—'}</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Demo Mode */}
      <div className="rounded-xl p-5 mb-4 border section-card animate-slide-up" style={{ background: '#12131a', borderColor: '#1e2030', animationDelay: '0.1s' }}>
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical size={16} style={{ color: '#f59e0b' }} />
          <span className="text-sm font-semibold text-white">Demo Mode</span>
          {health?.data?.demoMode && (
            <span className="text-xs px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
              ACTIVE
            </span>
          )}
        </div>
        <p className="text-xs mb-3" style={{ color: '#6b7280' }}>
          When Demo Mode is enabled, all API endpoints return mock data — no real API calls are made.
          Perfect for testing or presentations without live data.
        </p>
        <div className="flex items-center justify-between text-sm p-3 rounded-lg" style={{ background: '#0a0b0f' }}>
          <span style={{ color: '#9ca3af' }}>Current Mode</span>
          <span className="font-bold" style={{ color: health?.data?.demoMode ? '#f59e0b' : '#00ff88' }}>
            {health?.data?.demoMode ? '🎭 DEMO' : '📡 LIVE'}
          </span>
        </div>
        <p className="text-xs mt-2" style={{ color: '#4b5563' }}>
          To toggle: set <code className="px-1 rounded" style={{ background: '#1e2030', color: '#9ca3af' }}>DEMO_MODE=true</code> in <code style={{ color: '#9ca3af' }}>backend/.env</code> and restart the server.
        </p>
      </div>

      {/* Data Sources */}
      <div className="rounded-xl p-5 mb-4 border section-card animate-slide-up" style={{ background: '#12131a', borderColor: '#1e2030', animationDelay: '0.15s' }}>
        <div className="text-sm font-semibold mb-4 text-white">Data Sources</div>
        <div className="space-y-2">
          {[
            { name: 'DexScreener', desc: 'Token pairs, price data, trending', url: 'https://dexscreener.com', free: true },
            { name: 'GeckoTerminal', desc: 'DEX pools, OHLCV charts', url: 'https://geckoterminal.com', free: true },
            { name: 'Pump.fun', desc: 'Solana meme launches, bonding curve', url: 'https://pump.fun', free: true },
            { name: 'Solana RPC', desc: 'Wallet portfolio, transactions', url: 'https://solana.com', free: true },
            { name: 'Binance Spot', desc: 'CEX prices, arbitrage scanner', url: 'https://binance.com', free: true },
            { name: 'Binance Web3', desc: 'DEX prices, Alpha tokens', url: 'https://web3.binance.com', free: true },
          ].map(({ name, desc, url, free }) => (
            <div key={name} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#0a0b0f' }}>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{name}</span>
                  {free && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', fontSize: '9px' }}>
                      FREE
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{desc}</div>
              </div>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="transition-colors hover:text-blue-400"
                style={{ color: '#6b7280' }}
              >
                <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="rounded-xl p-5 border section-card animate-slide-up" style={{ background: '#12131a', borderColor: '#1e2030', animationDelay: '0.2s' }}>
        <div className="flex items-center gap-2 mb-3">
          <Info size={16} style={{ color: '#00ff88' }} />
          <span className="text-sm font-semibold text-white">About</span>
        </div>
        <div className="space-y-2 text-xs" style={{ color: '#6b7280' }}>
          <div className="flex justify-between">
            <span>Version</span>
            <span className="text-white">{APP_VERSION}</span>
          </div>
          <div className="flex justify-between">
            <span>Built with</span>
            <span className="text-white">React + Vite + Tailwind + Express</span>
          </div>
          <div className="flex justify-between">
            <span>Theme</span>
            <span className="text-white">Dark Terminal 🖤</span>
          </div>
          <div className="flex justify-between">
            <span>Keyboard Shortcut</span>
            <span className="text-white">
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: '#1e2030', border: '1px solid #2a2d3e', fontFamily: 'monospace' }}>/</kbd>
              {' '}or{' '}
              <kbd className="px-1.5 py-0.5 rounded" style={{ background: '#1e2030', border: '1px solid #2a2d3e', fontFamily: 'monospace' }}>Ctrl+K</kbd>
              {' '}→ Search
            </span>
          </div>
          <div className="flex justify-between">
            <span>Data Sources</span>
            <span className="text-white">DexScreener · Pump.fun · GeckoTerminal</span>
          </div>
          <div className="flex justify-between">
            <span>GitHub</span>
            <a
              href="https://github.com/Penguin-Life/meme-terminal"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
              style={{ color: '#3b82f6' }}
            >
              Penguin-Life/meme-terminal <ExternalLink size={10} />
            </a>
          </div>
          <div className="flex justify-between">
            <span>License</span>
            <span className="text-white">MIT</span>
          </div>
        </div>
        {/* Credits */}
        <div className="mt-4 pt-4 text-xs" style={{ borderTop: '1px solid #1e2030', color: '#4b5563' }}>
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={11} style={{ color: '#00ff88' }} />
            <span>Made with ❤️ by Penguin-Life</span>
          </div>
          <p>AI-powered memecoin trading terminal aggregating real-time data from the best free on-chain data sources.</p>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="rounded-xl p-5 mt-4 border section-card animate-slide-up" style={{ background: '#12131a', borderColor: '#1e2030', animationDelay: '0.25s' }}>
        <div className="text-sm font-semibold mb-3 text-white">Keyboard Shortcuts</div>
        <div className="space-y-2 text-xs">
          {[
            { keys: ['/', 'Ctrl+K'], desc: 'Focus search bar (Scanner page)' },
            { keys: ['Enter'], desc: 'Submit search' },
            { keys: ['Escape'], desc: 'Clear search / blur input' },
          ].map(({ keys, desc }) => (
            <div key={desc} className="flex items-center justify-between">
              <span style={{ color: '#9ca3af' }}>{desc}</span>
              <div className="flex items-center gap-1">
                {keys.map((k, i) => (
                  <span key={k} className="flex items-center gap-1">
                    {i > 0 && <span style={{ color: '#4b5563' }}>or</span>}
                    <kbd className="px-1.5 py-0.5 rounded text-white"
                      style={{ background: '#1e2030', border: '1px solid #2a2d3e', fontFamily: 'monospace' }}>
                      {k}
                    </kbd>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
