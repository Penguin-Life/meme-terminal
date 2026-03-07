/**
 * Tests for arbitrage route utilities
 */

// Extract calcSpread for testing
function calcSpread(cexPrice, dexPrice) {
  if (!cexPrice || !dexPrice) return { spreadPercent: null, direction: 'unknown', opportunity: false };
  const spread = ((dexPrice - cexPrice) / cexPrice) * 100;
  return {
    spreadPercent: parseFloat(spread.toFixed(4)),
    direction: spread > 0 ? 'dex_premium' : spread < 0 ? 'cex_premium' : 'parity',
    opportunity: Math.abs(spread) >= 1.5
  };
}

describe('calcSpread', () => {
  test('returns unknown for null prices', () => {
    expect(calcSpread(null, 1.5)).toEqual({ spreadPercent: null, direction: 'unknown', opportunity: false });
    expect(calcSpread(1.5, null)).toEqual({ spreadPercent: null, direction: 'unknown', opportunity: false });
  });

  test('detects DEX premium', () => {
    const r = calcSpread(1.0, 1.05);
    expect(r.direction).toBe('dex_premium');
    expect(r.spreadPercent).toBeCloseTo(5.0, 1);
    expect(r.opportunity).toBe(true);
  });

  test('detects CEX premium', () => {
    const r = calcSpread(1.05, 1.0);
    expect(r.direction).toBe('cex_premium');
    expect(r.spreadPercent).toBeLessThan(0);
    expect(r.opportunity).toBe(true);
  });

  test('no opportunity for small spread', () => {
    const r = calcSpread(1.0, 1.005);
    expect(r.opportunity).toBe(false);
  });

  test('parity when prices equal', () => {
    const r = calcSpread(1.0, 1.0);
    expect(r.direction).toBe('parity');
    expect(r.spreadPercent).toBe(0);
    expect(r.opportunity).toBe(false);
  });
});
