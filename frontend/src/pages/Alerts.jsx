import { useState, useEffect } from 'react'
import { Plus, Bell, BellOff, Trash2, RefreshCw, Play, Zap } from 'lucide-react'
import ChainBadge from '../components/ChainBadge.jsx'
import ErrorBanner from '../components/ErrorBanner.jsx'
import { useToast } from '../components/Toast.jsx'
import api from '../utils/api.js'
import { shortAddr as shortAddrShared } from '../utils/format.js'

const ALERT_TYPES = [
  { value: 'price_above', label: 'Price Above', icon: '📈', color: '#00ff88' },
  { value: 'price_below', label: 'Price Below', icon: '📉', color: '#ff4444' },
  { value: 'new_buy',     label: 'New Buy',     icon: '💰', color: '#f59e0b' },
  { value: 'large_tx',   label: 'Large TX',    icon: '🐋', color: '#8b5cf6' },
  { value: 'new_listing',label: 'New Listing', icon: '🆕', color: '#3b82f6' },
]

const CHAINS = ['solana', 'eth', 'bsc', 'base', 'arbitrum', 'polygon']

function shortAddr(addr) {
  if (!addr) return ''
  if (addr.length <= 12) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function fmtTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString()
}

export default function Alerts() {
  const toast = useToast()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'price_above',
    target: '',
    chain: 'solana',
    threshold: '',
    label: '',
  })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState(null)
  const [checkLoading, setCheckLoading] = useState(false)
  const [checkResults, setCheckResults] = useState(null)
  const [checkError, setCheckError] = useState(null)

  const needsThreshold = ['price_above', 'price_below', 'large_tx'].includes(form.type)

  const fetchAlerts = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get('/alerts')
      setAlerts(data.alerts || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)
    try {
      const payload = {
        type: form.type,
        target: form.target,
        chain: form.chain,
        label: form.label || undefined,
        threshold: needsThreshold && form.threshold ? parseFloat(form.threshold) : undefined,
      }
      const data = await api.post('/alerts', payload)
      setAlerts(a => [...a, data.alert])
      setForm({ type: 'price_above', target: '', chain: 'solana', threshold: '', label: '' })
      setShowForm(false)
      toast.success(`Alert "${data.alert?.label || form.type}" created`)
    } catch (e) {
      setAddError(e.message)
      toast.error('Failed to create alert: ' + e.message)
    } finally {
      setAddLoading(false)
    }
  }

  const handleToggle = async (alertItem) => {
    try {
      const data = await api.patch(`/alerts/${alertItem.id}`, { enabled: !alertItem.enabled })
      setAlerts(a => a.map(x => x.id === alertItem.id ? data.alert : x))
      toast.info(data.alert?.enabled ? 'Alert enabled' : 'Alert paused')
    } catch (e) {
      toast.error('Failed to update alert: ' + e.message)
    }
  }

  const handleDelete = async (alertItem) => {
    if (!confirm(`Delete alert "${alertItem.label}"?`)) return
    try {
      await api.delete(`/alerts/${alertItem.id}`)
      setAlerts(a => a.filter(x => x.id !== alertItem.id))
      toast.success(`Alert "${alertItem.label}" deleted`)
    } catch (e) {
      toast.error('Failed to delete: ' + e.message)
    }
  }

  const handleCheckNow = async () => {
    setCheckLoading(true)
    setCheckError(null)
    setCheckResults(null)
    try {
      const resp = await api.get('/alerts/check')
      // Backend wraps result in resp.data
      const checkData = resp.data || resp
      setCheckResults(checkData)
      const triggeredCount = Array.isArray(checkData.triggered) ? checkData.triggered.length : (checkData.triggered || 0)
      if (triggeredCount > 0) {
        toast.warning(`${triggeredCount} alert${triggeredCount > 1 ? 's' : ''} triggered!`)
      } else {
        toast.info(`Checked ${checkData.total || 0} alerts — no triggers`)
      }
      await fetchAlerts()
    } catch (e) {
      setCheckError(e.message)
      toast.error('Check failed: ' + e.message)
    } finally {
      setCheckLoading(false)
    }
  }

  const enabledAlerts  = alerts.filter(a => a.enabled)
  const disabledAlerts = alerts.filter(a => !a.enabled)
  const triggeredAlerts = alerts.filter(a => a.lastTriggeredAt)

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">🔔 Alert Center</h1>
          <p className="text-sm mt-0.5" style={{ color: '#6b7280' }}>
            Price alerts & whale activity notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCheckNow}
            disabled={checkLoading || alerts.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            {checkLoading ? (
              <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: '#f59e0b' }} />
            ) : (
              <Play size={12} />
            )}
            <span className="hidden sm:inline">Check Now</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{
              background: showForm ? 'rgba(255,68,68,0.1)' : 'rgba(0,255,136,0.1)',
              color: showForm ? '#ff4444' : '#00ff88',
              border: `1px solid ${showForm ? 'rgba(255,68,68,0.2)' : 'rgba(0,255,136,0.2)'}`,
            }}
          >
            <Plus size={14} className={showForm ? 'rotate-45' : ''} style={{ transition: 'transform 0.2s' }} />
            {showForm ? 'Cancel' : 'New Alert'}
          </button>
        </div>
      </div>

      {/* Check Results */}
      {checkResults && (
        <div
          className="mb-5 p-4 rounded-xl border animate-fade-in-up"
          style={{ background: '#12131a', borderColor: 'rgba(245,158,11,0.25)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} style={{ color: '#f59e0b' }} />
            <span className="text-sm font-semibold text-white">Check Results</span>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              {Array.isArray(checkResults.triggered) ? checkResults.triggered.length : (checkResults.triggered || 0)} triggered
            </span>
          </div>
          {Array.isArray(checkResults.triggered) && checkResults.triggered.length > 0 ? (
            <div className="space-y-2">
              {checkResults.triggered.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs p-2 rounded-lg" style={{ background: '#1a1b25' }}>
                  <span className="mt-0.5">🔔</span>
                  <div className="flex-1">
                    <div className="text-white font-medium">{r.label || r.id || 'Alert'}</div>
                    <div style={{ color: '#6b7280' }}>{r.reason || 'Alert triggered!'}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs" style={{ color: '#6b7280' }}>
              Checked {checkResults.total || 0} alerts — no triggers
            </div>
          )}
          <button
            onClick={() => setCheckResults(null)}
            className="mt-2 text-xs hover:opacity-70 transition-opacity"
            style={{ color: '#6b7280' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {checkError && (
        <div
          className="mb-4 p-3 rounded-lg flex items-center justify-between gap-3 animate-fade-in"
          style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)' }}
        >
          <span className="text-sm">⚠️ {checkError}</span>
          <button
            onClick={handleCheckNow}
            disabled={checkLoading}
            className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'rgba(255,68,68,0.15)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.3)' }}
          >
            <RefreshCw size={10} />
            Retry
          </button>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-xl p-5 mb-6 border animate-fade-in-up"
          style={{ background: '#12131a', borderColor: 'rgba(0,255,136,0.2)' }}
        >
          <div className="text-sm font-semibold mb-4 text-white">Create New Alert</div>

          {/* Alert type selector */}
          <div className="mb-4">
            <label className="block text-xs mb-2" style={{ color: '#9ca3af' }}>Alert Type *</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {ALERT_TYPES.map(({ value, label, icon, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: value }))}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: form.type === value ? `${color}20` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${form.type === value ? `${color}40` : '#1e2030'}`,
                    color: form.type === value ? color : '#9ca3af',
                  }}
                >
                  <span className="text-base">{icon}</span>
                  <span className="text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Target Address *</label>
              <input
                type="text"
                value={form.target}
                onChange={(e) => setForm(f => ({ ...f, target: e.target.value }))}
                placeholder="Token or wallet address"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: '#0a0b0f', border: '1px solid #1e2030', color: '#e5e7eb' }}
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

            {needsThreshold && (
              <div>
                <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>
                  Threshold {form.type.includes('price') ? '(USD)' : '(Amount)'}
                </label>
                <input
                  type="number"
                  value={form.threshold}
                  onChange={(e) => setForm(f => ({ ...f, threshold: e.target.value }))}
                  placeholder={form.type.includes('price') ? '0.001' : '1000'}
                  step="any"
                  required
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: '#0a0b0f', border: '1px solid #1e2030', color: '#e5e7eb' }}
                />
              </div>
            )}

            <div className={needsThreshold ? '' : 'md:col-span-2'}>
              <label className="block text-xs mb-1.5" style={{ color: '#9ca3af' }}>Label</label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))}
                placeholder="e.g. WIF price alert"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ background: '#0a0b0f', border: '1px solid #1e2030', color: '#e5e7eb' }}
              />
            </div>
          </div>

          {addError && (
            <div className="mb-3 p-2 rounded text-xs" style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.2)' }}>
              {addError}
            </div>
          )}

          <button
            type="submit"
            disabled={addLoading || !form.target || (needsThreshold && !form.threshold)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
            style={{ background: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.25)' }}
          >
            {addLoading ? (
              <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: '#00ff88' }} />
            ) : (
              <Plus size={14} />
            )}
            Create Alert
          </button>
        </form>
      )}

      {/* Error */}
      <ErrorBanner message={error} onRetry={fetchAlerts} loading={loading} />

      {/* Stats */}
      {!loading && alerts.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6 animate-fade-in-up">
          {[
            { label: 'Active Alerts', value: enabledAlerts.length, color: '#00ff88' },
            { label: 'Paused', value: disabledAlerts.length, color: '#9ca3af' },
            { label: 'Triggered', value: triggeredAlerts.length, color: '#f59e0b' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-4 border" style={{ background: '#12131a', borderColor: '#1e2030' }}>
              <div className="text-2xl font-bold" style={{ color }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Loading — shimmer skeleton */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: '#12131a', borderColor: '#1e2030' }}>
              <div className="w-8 h-8 rounded-lg skeleton-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 rounded skeleton-shimmer" style={{ width: '45%' }} />
                <div className="h-2.5 rounded skeleton-shimmer" style={{ width: '65%' }} />
              </div>
              <div className="flex gap-1.5">
                <div className="w-7 h-7 rounded-lg skeleton-shimmer" />
                <div className="w-7 h-7 rounded-lg skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2" style={{ background: 'rgba(0,255,136,0.05)', border: '2px dashed rgba(0,255,136,0.15)' }}>
            <Bell size={36} style={{ color: '#1e2030' }} />
          </div>
          <div className="text-sm font-medium" style={{ color: '#9ca3af' }}>No alerts configured</div>
          <div className="text-xs max-w-xs text-center" style={{ color: '#6b7280' }}>
            Set up price alerts, whale movement notifications, and new listing monitors
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="mt-3 flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
            style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}
          >
            <Plus size={14} /> Create First Alert
          </button>
          <div className="flex gap-4 mt-6 text-xs" style={{ color: '#4b5563' }}>
            {ALERT_TYPES.slice(0, 3).map(({ icon, label, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Active alerts */}
          {enabledAlerts.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-semibold mb-3 flex items-center gap-2" style={{ color: '#9ca3af' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 6px #00ff88' }} />
                ACTIVE ALERTS ({enabledAlerts.length})
              </div>
              <div className="space-y-2">
                {enabledAlerts.map((alertItem, i) => (
                  <div key={alertItem.id} className={`animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                    <AlertRow
                      alert={alertItem}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Paused alerts */}
          {disabledAlerts.length > 0 && (
            <div className="mb-6">
              <div className="text-xs font-semibold mb-3" style={{ color: '#6b7280' }}>
                PAUSED ({disabledAlerts.length})
              </div>
              <div className="space-y-2">
                {disabledAlerts.map((alertItem) => (
                  <AlertRow
                    key={alertItem.id}
                    alert={alertItem}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trigger history */}
          {triggeredAlerts.length > 0 && (
            <div>
              <div className="text-xs font-semibold mb-3" style={{ color: '#9ca3af' }}>
                TRIGGER HISTORY
              </div>
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{ background: '#12131a', borderColor: '#1e2030' }}
              >
                {triggeredAlerts
                  .sort((a, b) => new Date(b.lastTriggeredAt) - new Date(a.lastTriggeredAt))
                  .map((alertItem) => (
                    <div key={alertItem.id} className="flex items-start gap-3 text-xs">
                      <span className="text-base mt-0.5">
                        {ALERT_TYPES.find(t => t.value === alertItem.type)?.icon || '🔔'}
                      </span>
                      <div className="flex-1">
                        <div className="text-white font-medium">{alertItem.label}</div>
                        <div style={{ color: '#6b7280' }}>
                          {shortAddr(alertItem.target)} · {alertItem.chain?.toUpperCase()}
                          {alertItem.threshold && ` · $${alertItem.threshold}`}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0" style={{ color: '#6b7280' }}>
                        {fmtTime(alertItem.lastTriggeredAt)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AlertRow({ alert, onToggle, onDelete }) {
  const typeCfg = ALERT_TYPES.find(t => t.value === alert.type) || {}

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl border transition-all"
      style={{
        background: alert.enabled ? '#12131a' : 'rgba(255,255,255,0.02)',
        borderColor: alert.enabled ? '#1e2030' : 'rgba(255,255,255,0.05)',
        opacity: alert.enabled ? 1 : 0.6,
      }}
    >
      {/* Type icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: `${typeCfg.color || '#9ca3af'}15` }}
      >
        {typeCfg.icon || '🔔'}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-white truncate">{alert.label}</span>
          <ChainBadge chain={alert.chain} size="xs" />
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs font-mono" style={{ color: '#6b7280' }}>
            {shortAddr(alert.target)}
          </span>
          {alert.threshold && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${typeCfg.color || '#9ca3af'}15`, color: typeCfg.color || '#9ca3af', fontSize: '10px' }}>
              {alert.type.includes('price') ? '$' : ''}{alert.threshold}
            </span>
          )}
          {alert.lastTriggeredAt && (
            <span className="text-xs" style={{ color: '#f59e0b' }}>
              🔔 {new Date(alert.lastTriggeredAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => onToggle(alert)}
          className="p-1.5 rounded-lg transition-all hover:opacity-80"
          style={{
            background: alert.enabled ? 'rgba(0,255,136,0.1)' : 'rgba(156,163,175,0.1)',
            color: alert.enabled ? '#00ff88' : '#9ca3af',
            border: `1px solid ${alert.enabled ? 'rgba(0,255,136,0.2)' : 'rgba(156,163,175,0.2)'}`,
          }}
          title={alert.enabled ? 'Pause' : 'Enable'}
        >
          {alert.enabled ? <Bell size={12} /> : <BellOff size={12} />}
        </button>
        <button
          onClick={() => onDelete(alert)}
          className="p-1.5 rounded-lg transition-all hover:opacity-80"
          style={{ background: 'rgba(255,68,68,0.1)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.15)' }}
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}
