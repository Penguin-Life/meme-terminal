import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Flame, Wallet, Bell, Settings, Activity, Zap } from 'lucide-react'
import Scanner from './pages/Scanner.jsx'
import Wallets from './pages/Wallets.jsx'
import Alerts from './pages/Alerts.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import api from './utils/api.js'

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

  const navItems = [
    { to: '/scanner', icon: Flame, label: 'Scanner', emoji: '🔥' },
    { to: '/wallets', icon: Wallet, label: 'Wallets', emoji: '👛' },
    { to: '/alerts', icon: Bell, label: 'Alerts', emoji: '🔔' },
    { to: '/settings', icon: Settings, label: 'Settings', emoji: '⚙️' },
  ]

  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden" style={{ background: '#0a0b0f' }}>
        {/* Sidebar */}
        <aside
          className="flex flex-col w-16 md:w-56 border-r flex-shrink-0"
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
                    isActive
                      ? 'text-white'
                      : 'hover:text-white'
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

          {/* Status */}
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

        {/* Main */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Header */}
          <header
            className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
            style={{ background: '#0d0e14', borderColor: '#1e2030' }}
          >
            <div className="flex items-center gap-2">
              <Activity size={16} style={{ color: '#00ff88' }} />
              <span className="text-sm font-medium" style={{ color: '#9ca3af' }}>
                Meme Terminal
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
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/scanner" replace />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/wallets" element={<Wallets />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
