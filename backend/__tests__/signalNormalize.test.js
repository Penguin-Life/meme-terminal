/**
 * Tests for signal normalization logic
 */

function normalizeSignal(s) {
  return {
    tokenSymbol: s.tokenSymbol || '',
    tokenName: s.tokenName || s.tokenSymbol || '',
    contractAddress: s.contractAddress || '',
    chainId: s.chainId || '',
    signalType: s.signalType || s.smartSignalType || '',
    triggerPrice: s.triggerPrice ? parseFloat(s.triggerPrice) : null,
    currentPrice: s.currentPrice ? parseFloat(s.currentPrice) : null,
    maxGainPercent: s.maxGainPercent != null ? parseFloat(s.maxGainPercent) : null,
    exitRate: s.exitRate != null ? parseFloat(s.exitRate) : null,
    signalTime: s.signalTime || s.createTime || Date.now(),
    walletAddress: s.walletAddress || s.address || '',
    tags: s.tags || [],
    logoUrl: s.logoUrl || s.imageUrl || null
  };
}

describe('normalizeSignal', () => {
  test('normalizes complete signal', () => {
    const raw = {
      tokenSymbol: 'PEPE',
      tokenName: 'Pepe',
      contractAddress: '0x123',
      chainId: 'CT_56',
      signalType: 'BUY',
      triggerPrice: '0.00001234',
      currentPrice: '0.00001567',
      maxGainPercent: 26.9,
      exitRate: 0.15,
      signalTime: 1700000000000,
      walletAddress: '0xWhale',
      tags: ['smart-money'],
      logoUrl: 'https://img.com/pepe.png'
    };
    const n = normalizeSignal(raw);
    expect(n.tokenSymbol).toBe('PEPE');
    expect(n.triggerPrice).toBeCloseTo(0.00001234);
    expect(n.currentPrice).toBeCloseTo(0.00001567);
    expect(n.maxGainPercent).toBeCloseTo(26.9);
    expect(n.signalType).toBe('BUY');
  });

  test('falls back smartSignalType to signalType', () => {
    const n = normalizeSignal({ smartSignalType: 'SELL' });
    expect(n.signalType).toBe('SELL');
  });

  test('falls back createTime to signalTime', () => {
    const n = normalizeSignal({ createTime: 1234567890 });
    expect(n.signalTime).toBe(1234567890);
  });

  test('falls back address to walletAddress', () => {
    const n = normalizeSignal({ address: '0xFallback' });
    expect(n.walletAddress).toBe('0xFallback');
  });

  test('falls back imageUrl to logoUrl', () => {
    const n = normalizeSignal({ imageUrl: 'https://x.com/y.png' });
    expect(n.logoUrl).toBe('https://x.com/y.png');
  });

  test('handles empty input gracefully', () => {
    const n = normalizeSignal({});
    expect(n.tokenSymbol).toBe('');
    expect(n.triggerPrice).toBeNull();
    expect(n.currentPrice).toBeNull();
    expect(n.maxGainPercent).toBeNull();
    expect(n.tags).toEqual([]);
    expect(n.logoUrl).toBeNull();
  });

  test('tokenName falls back to tokenSymbol', () => {
    const n = normalizeSignal({ tokenSymbol: 'DOGE' });
    expect(n.tokenName).toBe('DOGE');
  });

  test('parses string prices correctly', () => {
    const n = normalizeSignal({ triggerPrice: '99.5', currentPrice: '100.25' });
    expect(n.triggerPrice).toBe(99.5);
    expect(n.currentPrice).toBe(100.25);
  });
});
