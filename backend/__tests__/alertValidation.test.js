/**
 * Tests for alert route validation logic
 */

const VALID_TYPES = ['price_above', 'price_below', 'new_buy', 'large_tx', 'new_listing'];
const VALID_CHAINS = ['solana', 'eth', 'bsc', 'base', 'arbitrum', 'polygon'];

function validateAlert({ type, target, chain, threshold }) {
  const errors = [];
  if (!type || !target || !chain) errors.push('MISSING_FIELDS');
  if (type && !VALID_TYPES.includes(type)) errors.push('INVALID_TYPE');
  if (chain && !VALID_CHAINS.includes(chain)) errors.push('INVALID_CHAIN');

  const needsThreshold = ['price_above', 'price_below', 'large_tx'];
  if (needsThreshold.includes(type)) {
    if (threshold == null || isNaN(parseFloat(threshold)) || parseFloat(threshold) <= 0) {
      errors.push('INVALID_THRESHOLD');
    }
  }
  return errors;
}

describe('Alert validation', () => {
  test('valid price_above alert passes', () => {
    const errs = validateAlert({ type: 'price_above', target: '0xABC', chain: 'eth', threshold: 100 });
    expect(errs).toEqual([]);
  });

  test('valid new_buy alert passes without threshold', () => {
    const errs = validateAlert({ type: 'new_buy', target: '0xABC', chain: 'solana' });
    expect(errs).toEqual([]);
  });

  test('new_listing does not require threshold', () => {
    const errs = validateAlert({ type: 'new_listing', target: 'SOL123', chain: 'solana' });
    expect(errs).toEqual([]);
  });

  test('missing required fields', () => {
    expect(validateAlert({})).toContain('MISSING_FIELDS');
    expect(validateAlert({ type: 'new_buy' })).toContain('MISSING_FIELDS');
  });

  test('invalid type rejected', () => {
    expect(validateAlert({ type: 'invalid', target: 'x', chain: 'eth' })).toContain('INVALID_TYPE');
  });

  test('invalid chain rejected', () => {
    expect(validateAlert({ type: 'new_buy', target: 'x', chain: 'avalanche' })).toContain('INVALID_CHAIN');
  });

  test('price_above requires valid threshold', () => {
    expect(validateAlert({ type: 'price_above', target: 'x', chain: 'eth', threshold: null })).toContain('INVALID_THRESHOLD');
    expect(validateAlert({ type: 'price_above', target: 'x', chain: 'eth', threshold: 'abc' })).toContain('INVALID_THRESHOLD');
    expect(validateAlert({ type: 'price_above', target: 'x', chain: 'eth', threshold: -5 })).toContain('INVALID_THRESHOLD');
    expect(validateAlert({ type: 'price_above', target: 'x', chain: 'eth', threshold: 0 })).toContain('INVALID_THRESHOLD');
  });

  test('large_tx requires valid threshold', () => {
    expect(validateAlert({ type: 'large_tx', target: 'x', chain: 'bsc' })).toContain('INVALID_THRESHOLD');
    expect(validateAlert({ type: 'large_tx', target: 'x', chain: 'bsc', threshold: 5000 })).toEqual([]);
  });
});
