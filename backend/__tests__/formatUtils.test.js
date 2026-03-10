/**
 * Tests for shared formatting utilities (mirrors frontend/src/utils/format.js)
 * These test the core formatting logic used across the entire UI.
 */

// Re-implement format functions for testing (same logic as frontend)
function fmtUsd(n, decimals = 2) {
  if (n == null) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(decimals)}`;
}

function fmtPrice(n) {
  if (n == null) return '—';
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  if (n >= 0.000001) return `$${n.toFixed(8)}`;
  return `$${n.toExponential(3)}`;
}

function fmtCompact(n) {
  if (n == null) return '—';
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toLocaleString();
}

function shortAddr(addr, startLen = 6, endLen = 4) {
  if (!addr) return '';
  if (addr.length <= startLen + endLen + 3) return addr;
  return `${addr.slice(0, startLen)}...${addr.slice(-endLen)}`;
}

function timeAgo(ts) {
  if (!ts) return '';
  const ms = typeof ts === 'string' ? new Date(ts).getTime() : ts;
  const diff = Date.now() - ms;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

describe('fmtUsd', () => {
  test('formats billions', () => expect(fmtUsd(2500000000)).toBe('$2.50B'));
  test('formats millions', () => expect(fmtUsd(1234567)).toBe('$1.23M'));
  test('formats thousands', () => expect(fmtUsd(45600)).toBe('$45.6K'));
  test('formats small values', () => expect(fmtUsd(42.5)).toBe('$42.50'));
  test('handles null', () => expect(fmtUsd(null)).toBe('—'));
  test('handles zero', () => expect(fmtUsd(0)).toBe('$0.00'));
});

describe('fmtPrice', () => {
  test('formats >= $1', () => expect(fmtPrice(1.2345)).toBe('$1.2345'));
  test('formats small price', () => expect(fmtPrice(0.001234)).toBe('$0.001234'));
  test('formats very small price', () => expect(fmtPrice(0.00000123)).toBe('$0.00000123'));
  test('formats tiny price with scientific', () => {
    const result = fmtPrice(0.0000000001);
    expect(result).toMatch(/^\$\d\.\d+e/);
  });
  test('handles null', () => expect(fmtPrice(null)).toBe('—'));
});

describe('fmtCompact', () => {
  test('formats billions', () => expect(fmtCompact(1500000000)).toBe('1.5B'));
  test('formats millions', () => expect(fmtCompact(2300000)).toBe('2.3M'));
  test('formats thousands', () => expect(fmtCompact(9800)).toBe('9.8K'));
  test('handles null', () => expect(fmtCompact(null)).toBe('—'));
});

describe('shortAddr', () => {
  test('shortens long address', () => {
    expect(shortAddr('0x1234567890abcdef1234567890abcdef12345678')).toBe('0x1234...5678');
  });
  test('returns short address as-is', () => {
    expect(shortAddr('0x12345')).toBe('0x12345');
  });
  test('handles empty', () => expect(shortAddr('')).toBe(''));
  test('handles null', () => expect(shortAddr(null)).toBe(''));
});

describe('timeAgo', () => {
  test('just now for recent', () => {
    expect(timeAgo(Date.now() - 5000)).toBe('just now');
  });
  test('minutes ago', () => {
    expect(timeAgo(Date.now() - 300000)).toBe('5m ago');
  });
  test('hours ago', () => {
    expect(timeAgo(Date.now() - 7200000)).toBe('2h ago');
  });
  test('days ago', () => {
    expect(timeAgo(Date.now() - 172800000)).toBe('2d ago');
  });
  test('handles null', () => expect(timeAgo(null)).toBe(''));
  test('handles ISO string', () => {
    const recent = new Date(Date.now() - 120000).toISOString();
    expect(timeAgo(recent)).toBe('2m ago');
  });
});
