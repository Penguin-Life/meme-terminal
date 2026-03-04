import { useState } from 'react'
import { Settings, Server, RefreshCw, ExternalLink } from 'lucide-react'
import api from '../utils/api.js'

export default function SettingsPage() {
  const [health, setHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(false)

  const checkHealth = async () => {
    setHealthLoading(true)
    try {
      const data = await api.get('/health')
      setHealth(data)
    } catch (e) {
      setHealth({ error: e.message })
    } finally {
      setHealthLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>Configuration & system info</p>
      </div>

      {/* API Connection */}
      <div className="rounded-xl p-5 mb-4 border" style={{ background: '#12131a', borderColor: '#1e2030' }}>
        <div className="flex items-center gap-2 mb-4">
          <Server size={16} style={{ color: '#3b82f6' }} />
          <span className="text-sm font-semibold text-white">Backend API</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: '#9ca3af' }}>API Endpoint</span>
            <span className="font-mono text-white">http://localhost:3902</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: '#9ca3af' }}>Health Check</span>
            <div className="flex items-center gap-2">
              {health && !health.error && (
                <span style={{ color: '#00ff88' }} className="text-xs">✅ {health.status}</span>
              )}
              {health?.error && (
                <span style={{ color: '#ff4444' }} className="text-xs">❌ {health.error}</span>
              )}
              <button
                onClick={checkHealth}
                disabled={healthLoading}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:opacity-80"
                style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <RefreshCw size={10} className={healthLoading ? 'animate-spin' : ''} />
                Check
              </button>
            </div>
          </div>
          {health && !health.error && (
            <>
              <div className="flex items-center justify-between text-xs" style={{ color: '#6b7280' }}>
                <span>Uptime</span>
                <span>{Math.floor(health.uptime / 60)}m {Math.floor(health.uptime % 60)}s</span>
              </div>
              <div className="flex items-center justify-between text-xs" style={{ color: '#6b7280' }}>
                <span>Version</span>
                <span>{health.version}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Data Sources */}
      <div className="rounded-xl p-5 mb-4 border" style={{ background: '#12131a', borderColor: '#1e2030' }}>
        <div className="text-sm font-semibold mb-4 text-white">Data Sources</div>
        <div className="space-y-2">
          {[
            { name: 'DexScreener', desc: 'Token pairs, price data, trending', url: 'https://dexscreener.com', free: true },
            { name: 'GeckoTerminal', desc: 'DEX pools, OHLCV charts', url: 'https://geckoterminal.com', free: true },
            { name: 'Pump.fun', desc: 'Solana meme launches, bonding curve', url: 'https://pump.fun', free: true },
            { name: 'Solana RPC', desc: 'Wallet portfolio, transactions', url: 'https://solana.com', free: true },
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
      <div className="rounded-xl p-5 border" style={{ background: '#12131a', borderColor: '#1e2030' }}>
        <div className="text-sm font-semibold mb-3 text-white">About</div>
        <div className="space-y-2 text-xs" style={{ color: '#6b7280' }}>
          <div className="flex justify-between">
            <span>Frontend Version</span>
            <span className="text-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Built with</span>
            <span className="text-white">React + Vite + Tailwind</span>
          </div>
          <div className="flex justify-between">
            <span>Theme</span>
            <span className="text-white">Dark Terminal</span>
          </div>
          <div className="flex justify-between">
            <span>Project</span>
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
        </div>
      </div>
    </div>
  )
}
