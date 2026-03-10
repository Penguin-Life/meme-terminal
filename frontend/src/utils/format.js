/**
 * Shared formatting utilities for Meme Terminal.
 * Centralizes number/price/time formatting to avoid duplication across components.
 */

/**
 * Format a USD value with magnitude suffix (K/M/B).
 * @param {number|null} n - The value to format
 * @param {number} decimals - Decimal places for small values
 * @returns {string} Formatted string like "$1.23M" or "—"
 */
export function fmtUsd(n, decimals = 2) {
  if (n == null) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(decimals)}`
}

/**
 * Format a token price with intelligent precision based on magnitude.
 * Tiny prices use scientific notation, larger prices show fixed decimals.
 * @param {number|null} n - Price value
 * @returns {string} Formatted price like "$0.001234" or "$1.23e-8"
 */
export function fmtPrice(n) {
  if (n == null) return '—'
  if (n >= 1) return `$${n.toFixed(4)}`
  if (n >= 0.0001) return `$${n.toFixed(6)}`
  if (n >= 0.000001) return `$${n.toFixed(8)}`
  return `$${n.toExponential(3)}`
}

/**
 * Format a number with compact notation (no dollar sign).
 * @param {number|null} n
 * @returns {string}
 */
export function fmtCompact(n) {
  if (n == null) return '—'
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toLocaleString()
}

/**
 * Format a relative time ago string from a timestamp.
 * @param {number|string|null} ts - Unix ms timestamp or ISO string
 * @returns {string} Like "just now", "5m ago", "2h ago", "3d ago"
 */
export function timeAgo(ts) {
  if (!ts) return ''
  const ms = typeof ts === 'string' ? new Date(ts).getTime() : ts
  const diff = Date.now() - ms
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

/**
 * Shorten a blockchain address for display.
 * @param {string} addr - Full address
 * @param {number} startLen - Characters to show from start
 * @param {number} endLen - Characters to show from end
 * @returns {string} Like "0x1234...abcd"
 */
export function shortAddr(addr, startLen = 6, endLen = 4) {
  if (!addr) return ''
  if (addr.length <= startLen + endLen + 3) return addr
  return `${addr.slice(0, startLen)}...${addr.slice(-endLen)}`
}

/**
 * Format a token age from creation date.
 * @param {string} isoString - ISO date string
 * @returns {string} Like "5m", "2h", "3d"
 */
export function fmtAge(isoString) {
  if (!isoString) return '—'
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}
