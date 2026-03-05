import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useState, useEffect, lazy, Suspense } from 'react'
import { Flame, Wallet, Bell, Settings, Activity, Zap } from 'lucide-react'
import { ToastProvider } from './components/Toast.jsx'
import api from './utils/api.js'

// Lazy-load pages for better initial bundle performance
const Scanner = lazy(() => import('./pages/Scanner.jsx'))
const Wallets = lazy(() => import('./pages/Wallets.jsx'))
const Alerts = lazy(() => import('./pages/Alerts.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))

// Page loading fallback
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full" style={{ color: '#00ff88' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
        <span className="text-sm" style={{ color: '#6b7280' }}>Loading…</span>
      </div>
    </div>
  )
}

const navItems = [
  { to: '/scanner', icon: Flame, label: 'Scanner', emoji: '🔥' },
  { to: '/wallets', icon: Wallet, label: 'Wallets', emoji: '👛' },
  { to: '/alerts', icon: Bell, label: 'Alerts', emoji: '🔔' },
  { to: '/settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
]

function App() {
  const [connected, setConnected] = useState(null) // null=checking, true=ok, false=error

  useEffect(() => {
    const check = () => {
      api.get('/health')
        .then(() => setConnected(true))
        .catch(() => setConnected(false))
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <BrowserRouter>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden" style={{ background: '#0a0b0f' }}>

          {/* Sidebar — hidden on mobile, shown md+ */}
          <aside
            className="sidebar-desktop flex-col w-16 md:w-56 border-r flex-shrink-0"
            style={{ background: '#0d0e14', borderColor: '#1e2030' }}
          >
            {/* Logo */}
            <div
              className="flex items-center gap-2 px-3 py-4 border-b"
              style={{ borderColor: '#1e2030' }}
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00ff88 0%, #3b82f6 100%)' }}
              >
                <Zap size={16} className="text-black" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-bold text-white leading-tight">Meme Terminal</div>
                <div className="text-xs" style={{ color: '#6b7280' }}>v1.0.0</div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-1 p-2 flex-1">
              {navItems.map(({ to, icon: Icon, label, emoji }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                      isActive ? 'text-white' : 'hover:text-white'
                    }`
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'rgba(0,255,136,0.1)' : 'transparent',
                    color: isActive ? '#00ff88' : '#9ca3af',
                    border: isActive ? '1px solid rgba(0,255,136,0.2)' : '1px solid transparent',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span className="text-base flex-shrink-0">{emoji}</span>
                      <span className="hidden md:block text-sm font-medium">{label}</span>
                      {isActive && (
                        <div
                          className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full"
                          style={{ background: '#00ff88' }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            {/* Connection Status */}
            <div
              className="px-3 py-3 border-t"
              style={{ borderColor: '#1e2030' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: connected === null ? '#f59e0b' : connected ? '#00ff88' : '#ff4444',
                    boxShadow: connected === true ? '0 0 6px #00ff88' : 'none'
                  }}
                />
                <span className="hidden md:block text-xs" style={{ color: '#6b7280' }}>
                  {connected === null ? 'Connecting...' : connected ? 'API Connected' : 'API Offline'}
                </span>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {/* Header */}
            <header
              className="flex items-center justify-between px-4 md:px-6 py-3 border-b flex-shrink-0"
              style={{ background: '#0d0e14', borderColor: '#1e2030' }}
            >
              <div className="flex items-center gap-2">
                {/* Mobile logo */}
                <div
                  className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg"
                  style={{ background: 'linear-gradient(135deg, #00ff88 0%, #3b82f6 100%)' }}
                >
                  <Zap size={13} className="text-black" />
                </div>
                <Activity size={16} style={{ color: '#00ff88' }} className="hidden md:block" />
                <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>
                  <span className="md:hidden font-bold text-white">Meme Terminal</span>
                  <span className="hidden md:inline">Meme Terminal</span>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
                  style={{
                    background: connected ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)',
                    color: connected ? '#00ff88' : '#ff4444',
                    border: `1px solid ${connected ? 'rgba(0,255,136,0.2)' : 'rgba(255,68,68,0.2)'}`
                  }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: connected ? '#00ff88' : '#ff4444' }}
                  />
                  {connected === null ? 'Checking...' : connected ? 'Live' : 'Offline'}
                </div>
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-auto main-content-mobile">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/scanner" replace />} />
                  <Route path="/scanner" element={<Scanner />} />
                  <Route path="/wallets" element={<Wallets />} />
                  <Route path="/alerts" element={<Alerts />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Routes>
              </Suspense>
            </main>

            {/* Footer — desktop only */}
            <footer
              className="hidden md:flex items-center justify-between px-6 py-2 border-t flex-shrink-0 text-xs"
              style={{ background: '#0d0e14', borderColor: '#1e2030', color: '#4b5563' }}
            >
              <span>🐧 Meme Terminal v1.0.0 — AI-Powered Memecoin Trading</span>
              <span>
                <a
                  href="https://github.com/Penguin-Life/meme-terminal"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#6b7280' }}
                  className="hover:text-white transition-colors"
                >
                  GitHub ↗
                </a>
                <span className="mx-2">·</span>
                <span>Data: DexScreener · Pump.fun · GeckoTerminal</span>
              </span>
            </footer>
          </div>

          {/* Mobile bottom navigation */}
          <nav
            className="mobile-bottom-nav fixed bottom-0 left-0 right-0 border-t z-50"
            style={{ background: '#0d0e14', borderColor: '#1e2030' }}
          >
            <div className="flex items-center justify-around py-2">
              {navItems.map(({ to, label, emoji }) => (
                <NavLink
                  key={to}
                  to={to}
                  className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-lg transition-all"
                  style={({ isActive }) => ({
                    color: isActive ? '#00ff88' : '#6b7280',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      <span className={`text-xl leading-none transition-transform ${isActive ? 'scale-110' : ''}`}>
                        {emoji}
                      </span>
                      <span className="text-xs font-medium">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

        </div>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
