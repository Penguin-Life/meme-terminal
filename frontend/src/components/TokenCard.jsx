import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, TrendingUp, TrendingDown, Shield, Users, Globe, Twitter, ArrowRight } from 'lucide-react'
import ChainBadge from './ChainBadge.jsx'
import StatusBadge from './StatusBadge.jsx'
import { fmtUsd as fmt, fmtPrice, fmtAge } from '../utils/format.js'

function PriceChange({ value, label }) {
  if (value === null || value === undefined) return null
  const positive = value >= 0
  return (
    <span
      className="text-xs font-medium"
      style={{ color: positive ? '#00ff88' : '#ff4444' }}
    >
      {positive ? '+' : ''}{value.toFixed(1)}%
      {label && <span className="text-gray-500 ml-0.5">{label}</span>}
    </span>
  )
}

function MiniBar({ value, max = 100 }) {
  if (value === null || value === undefined) return null
  const positive = value >= 0
  const pct = Math.min(Math.abs(value) / max, 1) * 100
  return (
    <div className="flex items-center gap-1">
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#1e2030' }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: positive ? '#00ff88' : '#ff4444',
          }}
        />
      </div>
    </div>
  )
}

export default function TokenCard({ token, expanded, onExpand, onTrackWallet, onSetAlert }) {
  const navigate = useNavigate()
  const { token: t, market, security, social, meta } = token || {}
  const isExpanded = expanded

  const securityStatus = (field) => {
    if (field === null || field === undefined) return 'unknown'
    if (field === false || field === 'null' || field === 'None') return 'safe'
    return 'danger'
  }

  return (
    <div
      className="rounded-xl border transition-all cursor-pointer group card-hover"
      style={{
        background: isExpanded ? '#1a1b25' : '#12131a',
        borderColor: isExpanded ? 'rgba(0,255,136,0.25)' : '#1e2030',
      }}
      onClick={onExpand}
    >
      {/* Main card */}
      <div className="p-4">
        {/* Top row: image + name + chain */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            {t?.image ? (
              <img
                src={t.image}
                alt={t?.symbol}
                className="w-10 h-10 rounded-full object-cover"
                style={{ border: '1px solid #1e2030' }}
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              />
            ) : null}
            <div
              className="w-10 h-10 rounded-full items-center justify-center text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg, #1e2030, #2d3050)',
                color: '#9ca3af',
                display: t?.image ? 'none' : 'flex',
              }}
            >
              {t?.symbol?.slice(0, 2) || '??'}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white truncate">
                {t?.symbol || '???'}
              </span>
              <ChainBadge chain={t?.chain} size="xs" />
              {meta?._rank === 'boosted' && (
                <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)', fontSize: '9px' }}>
                  BOOSTED
                </span>
              )}
            </div>
            <div className="text-xs truncate mt-0.5" style={{ color: '#6b7280' }}>
              {t?.name || ''}
            </div>
          </div>
          <div className="flex-shrink-0 text-right">
            <div className="text-sm font-mono font-bold text-white">
              {fmtPrice(market?.price)}
            </div>
            <PriceChange value={market?.priceChange?.['24h']} label="24h" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div style={{ color: '#6b7280' }} className="mb-0.5">MCap</div>
            <div className="font-medium text-white">{fmt(market?.marketCap)}</div>
          </div>
          <div>
            <div style={{ color: '#6b7280' }} className="mb-0.5">Vol 24h</div>
            <div className="font-medium text-white">{fmt(market?.volume24h)}</div>
          </div>
          <div>
            <div style={{ color: '#6b7280' }} className="mb-0.5">Liq</div>
            <div className="font-medium text-white">{fmt(market?.liquidity)}</div>
          </div>
        </div>

        {/* Age + price bar */}
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #1e2030' }}>
          <div className="text-xs" style={{ color: '#6b7280' }}>
            Age: <span className="text-white">{fmtAge(meta?.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            {market?.priceChange?.['1h'] !== null && market?.priceChange?.['1h'] !== undefined && (
              <span className="text-xs" style={{ color: '#6b7280' }}>
                1h: <PriceChange value={market.priceChange['1h']} />
              </span>
            )}
            {market?.priceChange?.['5m'] !== null && market?.priceChange?.['5m'] !== undefined && (
              <span className="text-xs" style={{ color: '#6b7280' }}>
                5m: <PriceChange value={market.priceChange['5m']} />
              </span>
            )}
          </div>
        </div>

        {/* 24h change bar */}
        {market?.priceChange?.['24h'] !== null && (
          <div className="mt-2">
            <MiniBar value={market?.priceChange?.['24h']} max={50} />
          </div>
        )}
      </div>

      {/* Expanded panel */}
      {isExpanded && (
        <div
          className="border-t px-4 pb-4 pt-3"
          style={{ borderColor: '#1e2030' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Security */}
          <div className="mb-4">
            <div className="text-xs font-semibold mb-2" style={{ color: '#9ca3af' }}>
              SECURITY
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge
                status={securityStatus(security?.mintAuthority)}
                label="Mint Auth"
                size="xs"
              />
              <StatusBadge
                status={securityStatus(security?.freezeAuthority)}
                label="Freeze"
                size="xs"
              />
              <StatusBadge
                status={security?.isHoneypot === true ? 'danger' : security?.isHoneypot === false ? 'safe' : 'unknown'}
                label="Honeypot"
                size="xs"
              />
              {security?.topHolderPct !== null && security?.topHolderPct !== undefined && (
                <StatusBadge
                  status={security.topHolderPct > 30 ? 'warning' : 'safe'}
                  label={`Top Holder ${security.topHolderPct?.toFixed(1)}%`}
                  size="xs"
                />
              )}
            </div>
          </div>

          {/* Pump.fun meta */}
          {meta?.bondingCurveProgress !== undefined && (
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: '#9ca3af' }}>
                PUMP.FUN
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs" style={{ color: '#6b7280' }}>Bonding Curve:</span>
                <span className="text-xs font-medium text-white">{meta.bondingCurveProgress?.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e2030' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${meta.bondingCurveProgress || 0}%`,
                    background: 'linear-gradient(90deg, #8b5cf6, #00ff88)',
                  }}
                />
              </div>
              <div className="flex gap-3 mt-2">
                {meta.graduated && <StatusBadge status="safe" label="Graduated" size="xs" />}
                {meta.kingOfTheHill && <StatusBadge status="safe" label="👑 KOTH" size="xs" />}
                {meta.replies > 0 && <span className="text-xs" style={{ color: '#6b7280' }}>💬 {meta.replies}</span>}
              </div>
            </div>
          )}

          {/* Social */}
          {(social?.websites?.length > 0 || social?.twitter || social?.telegram) && (
            <div className="mb-4">
              <div className="text-xs font-semibold mb-2" style={{ color: '#9ca3af' }}>SOCIALS</div>
              <div className="flex gap-2 flex-wrap">
                {social.twitter && (
                  <a href={social.twitter} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-opacity hover:opacity-80"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
                  >
                    <Twitter size={10} /> Twitter
                  </a>
                )}
                {social.telegram && (
                  <a href={social.telegram} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-opacity hover:opacity-80"
                    style={{ background: 'rgba(0,136,204,0.15)', color: '#0088cc', border: '1px solid rgba(0,136,204,0.2)' }}
                  >
                    <ExternalLink size={10} /> Telegram
                  </a>
                )}
                {social.websites?.slice(0, 2).map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-opacity hover:opacity-80"
                    style={{ background: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: '1px solid rgba(156,163,175,0.2)' }}
                  >
                    <Globe size={10} /> Website
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Token address */}
          {t?.address && (
            <div className="mb-4 text-xs font-mono" style={{ color: '#6b7280' }}>
              <span style={{ color: '#9ca3af' }}>CA: </span>
              <span>{t.address.slice(0, 12)}...{t.address.slice(-8)}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onTrackWallet && onTrackWallet(t)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}
            >
              <Users size={12} /> Track Wallet
            </button>
            <button
              onClick={() => onSetAlert && onSetAlert(t)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}
            >
              <Shield size={12} /> Set Alert
            </button>
            <button
              onClick={() => t?.address && navigate(`/token/${t.chain || 'solana'}/${t.address}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: 'rgba(240,185,11,0.1)', color: '#f0b90b', border: '1px solid rgba(240,185,11,0.2)' }}
            >
              <ArrowRight size={12} /> Detail
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
