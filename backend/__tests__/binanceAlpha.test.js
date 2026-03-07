/**
 * Tests for Binance Alpha normalization
 */

function normalizeAlphaToken(item) {
  return {
    symbol: item.symbol || '',
    name: item.name || item.symbol || '',
    contractAddress: item.contractAddress || item.tokenAddress || '',
    chainId: item.chainId || '',
    price: item.price ? parseFloat(item.price) : null,
    priceChange24h: item.priceChange24h != null ? parseFloat(item.priceChange24h) : null,
    volume24h: item.volume24h ? parseFloat(item.volume24h) : null,
    marketCap: item.marketCap ? parseFloat(item.marketCap) : null,
    holders: item.holders || null,
    rank: item.rank || null,
    logoUrl: item.logoUrl || item.imageUrl || null,
    tags: item.tags || [],
    isAlpha: true,
    source: 'binance-alpha'
  };
}

describe('normalizeAlphaToken', () => {
  test('normalizes complete token', () => {
    const raw = { symbol: 'BONK', name: 'Bonk', price: '0.00002847', priceChange24h: '8.74', volume24h: '287430000', rank: 1, chainId: 'CT_501' };
    const t = normalizeAlphaToken(raw);
    expect(t.symbol).toBe('BONK');
    expect(t.price).toBeCloseTo(0.00002847);
    expect(t.priceChange24h).toBeCloseTo(8.74);
    expect(t.isAlpha).toBe(true);
    expect(t.source).toBe('binance-alpha');
  });

  test('handles missing fields gracefully', () => {
    const t = normalizeAlphaToken({});
    expect(t.symbol).toBe('');
    expect(t.price).toBeNull();
    expect(t.volume24h).toBeNull();
    expect(t.tags).toEqual([]);
  });

  test('falls back tokenAddress to contractAddress', () => {
    const t = normalizeAlphaToken({ tokenAddress: '0xABC', symbol: 'TEST' });
    expect(t.contractAddress).toBe('0xABC');
  });

  test('falls back imageUrl to logoUrl', () => {
    const t = normalizeAlphaToken({ imageUrl: 'https://img.com/x.png' });
    expect(t.logoUrl).toBe('https://img.com/x.png');
  });
});
