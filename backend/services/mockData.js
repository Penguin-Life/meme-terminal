/**
 * Mock Data Service — Demo Mode
 *
 * When DEMO_MODE=true, all API endpoints return this realistic sample data
 * instead of calling external APIs. Perfect for demos, judging, and offline use.
 */

const DEMO_MODE = process.env.DEMO_MODE === 'true';

// ─── Mock: Trending Tokens ────────────────────────────────────────────────────

const MOCK_TRENDING = {
  success: true,
  chain: 'solana',
  count: 10,
  results: [
    {
      token: { name: 'Bonk', symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', chain: 'solana', image: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg' },
      market: { price: 0.00002847, marketCap: 1842000000, volume24h: 287430000, liquidity: 48200000, priceChange: { '5m': 0.42, '1h': 2.15, '6h': -1.33, '24h': 8.74 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 12.4 },
      social: { websites: ['https://bonkcoin.com'], twitter: 'bonk_inu', telegram: 'bonkofficialportal' },
      meta: { createdAt: '2022-12-25T00:00:00Z', pairAddress: '8QaXeHBrShJTdtN1rWCccBxpSVvKksQ2Pz1iBxAYQDB', dexId: 'raydium', source: 'geckoterminal' },
      _rank: 'trending'
    },
    {
      token: { name: 'dogwifhat', symbol: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', chain: 'solana', image: 'https://assets.coingecko.com/coins/images/33566/small/dogwifhat.jpg' },
      market: { price: 1.842, marketCap: 1841000000, volume24h: 193000000, liquidity: 24600000, priceChange: { '5m': -0.18, '1h': 1.03, '6h': 3.45, '24h': 12.31 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 8.9 },
      social: { websites: ['https://dogwifcoin.org'], twitter: 'dogwifcoin', telegram: null },
      meta: { createdAt: '2023-11-20T00:00:00Z', pairAddress: 'EP2ib6dYdEeqD8MfE2ezHCxX3kP3K2oqa3jjZR9jW9rs', dexId: 'raydium', source: 'geckoterminal' },
      _rank: 'trending'
    },
    {
      token: { name: 'Popcat', symbol: 'POPCAT', address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', chain: 'solana', image: 'https://assets.coingecko.com/coins/images/39347/small/popcat.png' },
      market: { price: 0.3182, marketCap: 318200000, volume24h: 67400000, liquidity: 8900000, priceChange: { '5m': 0.88, '1h': -2.11, '6h': 5.67, '24h': -4.22 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 15.2 },
      social: { websites: ['https://popcatsolana.xyz'], twitter: 'Popcatsolana', telegram: 'popcatsolana' },
      meta: { createdAt: '2024-01-08T00:00:00Z', pairAddress: 'FRhB8L7Y9Qq41qZXYwXifpQxfjJB6HoJ6i3xsGNBP7V3', dexId: 'raydium', source: 'geckoterminal' },
      _rank: 'trending'
    },
    {
      token: { name: 'Myro', symbol: 'MYRO', address: 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4', chain: 'solana', image: null },
      market: { price: 0.04291, marketCap: 42910000, volume24h: 12300000, liquidity: 3400000, priceChange: { '5m': 1.24, '1h': 4.78, '6h': 11.23, '24h': 28.45 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 22.1 },
      social: { websites: ['https://myro.lol'], twitter: 'myro_sol', telegram: 'myrosolana' },
      meta: { createdAt: '2023-11-12T00:00:00Z', pairAddress: null, dexId: 'raydium', source: 'geckoterminal' },
      _rank: 'trending'
    },
    {
      token: { name: 'Book of Meme', symbol: 'BOME', address: 'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82', chain: 'solana', image: null },
      market: { price: 0.00842, marketCap: 352000000, volume24h: 89200000, liquidity: 11300000, priceChange: { '5m': -0.63, '1h': 2.34, '6h': -3.17, '24h': 6.89 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 9.7 },
      social: { websites: [], twitter: 'BookofMeme', telegram: null },
      meta: { createdAt: '2024-03-14T00:00:00Z', pairAddress: null, dexId: 'raydium', source: 'geckoterminal' },
      _rank: 'trending'
    },
    {
      token: { name: 'Catwifhat', symbol: 'CWIF', address: '7atgF8KQo4wJrD5ATGX7t1V2zVvykPJbFfNeVf1icFv1', chain: 'solana', image: null },
      market: { price: 0.000001823, marketCap: 1823000, volume24h: 456000, liquidity: 234000, priceChange: { '5m': 3.21, '1h': 15.67, '6h': 42.11, '24h': 187.34 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 31.0 },
      social: { websites: [], twitter: null, telegram: null },
      meta: { createdAt: '2024-05-01T00:00:00Z', pairAddress: null, dexId: 'raydium', source: 'pumpfun', bondingCurveProgress: 87.4, graduated: false },
      _rank: 'boosted'
    },
    {
      token: { name: 'Pepe Solana', symbol: 'PEPE', address: 'A9TmJiHNNJJFGKkTtGHwrXyKkfqJeiqMJ3q2BHHe4gMX', chain: 'solana', image: null },
      market: { price: 0.00000412, marketCap: 4120000, volume24h: 1230000, liquidity: 890000, priceChange: { '5m': -1.45, '1h': 7.23, '6h': 22.41, '24h': 94.12 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 18.5 },
      social: { websites: [], twitter: null, telegram: null },
      meta: { createdAt: '2024-04-20T00:00:00Z', pairAddress: null, dexId: 'raydium', source: 'pumpfun', bondingCurveProgress: 45.2, graduated: false },
      _rank: 'boosted'
    },
    {
      token: { name: 'Slerf', symbol: 'SLERF', address: '7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3', chain: 'solana', image: null },
      market: { price: 0.1234, marketCap: 123400000, volume24h: 34500000, liquidity: 6700000, priceChange: { '5m': 0.11, '1h': -0.87, '6h': 2.34, '24h': -8.12 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 11.3 },
      social: { websites: ['https://slerf.xyz'], twitter: 'SLERFsol', telegram: null },
      meta: { createdAt: '2024-03-18T00:00:00Z', pairAddress: null, dexId: 'raydium', source: 'geckoterminal' },
      _rank: 'trending'
    },
    {
      token: { name: 'Wen', symbol: 'WEN', address: 'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk', chain: 'solana', image: null },
      market: { price: 0.00001847, marketCap: 184700000, volume24h: 28900000, liquidity: 5100000, priceChange: { '5m': 2.03, '1h': 5.44, '6h': 9.87, '24h': 23.11 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 7.8 },
      social: { websites: ['https://wen.finance'], twitter: 'wen_coin', telegram: 'wenofficial' },
      meta: { createdAt: '2024-01-25T00:00:00Z', pairAddress: null, dexId: 'raydium', source: 'geckoterminal' },
      _rank: 'trending'
    },
    {
      token: { name: 'Jeo Boden', symbol: 'BODEN', address: '3psH1Mj1f7yUfaVrLZiMQZGk3Q3D3LjTF2vUFE2cFqr', chain: 'solana', image: null },
      market: { price: 0.02841, marketCap: 28410000, volume24h: 8900000, liquidity: 2100000, priceChange: { '5m': -0.34, '1h': 1.67, '6h': -4.21, '24h': 15.67 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 25.4 },
      social: { websites: [], twitter: 'JeoBoden', telegram: null },
      meta: { createdAt: '2024-03-06T00:00:00Z', pairAddress: null, dexId: 'raydium', source: 'geckoterminal' },
      _rank: 'trending'
    }
  ],
  meta: {
    sources: ['geckoterminal', 'dexscreener'],
    timestamp: new Date().toISOString(),
    demo: true
  }
};

// ─── Mock: Token Analysis ─────────────────────────────────────────────────────

const MOCK_TOKEN_ANALYSIS = {
  success: true,
  data: {
    report: {
      query: 'BONK',
      chain: 'solana',
      token: {
        name: 'Bonk',
        symbol: 'BONK',
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        chain: 'solana',
        image: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg'
      },
      market: {
        price: 0.00002847,
        marketCap: 1842000000,
        volume24h: 287430000,
        liquidity: 48200000,
        priceChange: { '5m': 0.42, '1h': 2.15, '6h': -1.33, '24h': 8.74 }
      },
      signals: {
        volumeToMcap: 15.6,
        liquidityScore: 8.2,
        momentum: 'bullish',
        riskLevel: 'medium'
      },
      security: {
        mintAuthority: null,
        freezeAuthority: null,
        isHoneypot: false,
        topHolderPct: 12.4,
        verdict: 'SAFE'
      },
      social: {
        websites: ['https://bonkcoin.com'],
        twitter: 'bonk_inu',
        telegram: 'bonkofficialportal'
      },
      aiSummary: '🟢 BONK is the OG Solana meme coin with strong fundamentals. Massive community, deep liquidity ($48M), and high volume-to-mcap ratio signals active trading. Price up 8.74% in 24h with bullish momentum. Safe contract: no mint/freeze authority. Consider as a core meme portfolio holding.',
      sources: ['dexscreener', 'geckoterminal'],
      timestamp: new Date().toISOString(),
      demo: true
    }
  },
  meta: { source: 'multi', timestamp: new Date().toISOString() }
};

// ─── Mock: Wallet Portfolio ───────────────────────────────────────────────────

const MOCK_WALLET_PORTFOLIO = {
  success: true,
  chain: 'solana',
  address: 'demo1111111111111111111111111111111111111111',
  data: {
    address: 'demo1111111111111111111111111111111111111111',
    chain: 'solana',
    nativeBalance: 12.487,
    nativeValueUsd: 2185.23,
    totalValueUsd: 48234.67,
    tokens: [
      { mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk', amount: 48000000, decimals: 5, uiAmount: 480.0, priceUsd: 0.00002847, valueUsd: 13665.6, priceChange24h: 8.74 },
      { mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', symbol: 'WIF', name: 'dogwifhat', amount: 5000000000, decimals: 6, uiAmount: 5000.0, priceUsd: 1.842, valueUsd: 9210.0, priceChange24h: 12.31 },
      { mint: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', symbol: 'POPCAT', name: 'Popcat', amount: 25000000000, decimals: 9, uiAmount: 25.0, priceUsd: 0.3182, valueUsd: 7955.0, priceChange24h: -4.22 },
      { mint: 'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82', symbol: 'BOME', name: 'Book of Meme', amount: 1000000000000, decimals: 6, uiAmount: 1000000.0, priceUsd: 0.00842, valueUsd: 8420.0, priceChange24h: 6.89 },
      { mint: 'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk', symbol: 'WEN', name: 'Wen', amount: 500000000000000, decimals: 9, uiAmount: 500000.0, priceUsd: 0.00001847, valueUsd: 9235.0, priceChange24h: 23.11 }
    ],
    tokenCount: 5,
    updatedAt: new Date().toISOString(),
    demo: true
  },
  meta: { source: 'demo', timestamp: new Date().toISOString() }
};

// ─── Mock: New Listings ───────────────────────────────────────────────────────

const MOCK_NEW_LISTINGS = {
  success: true,
  chain: 'solana',
  count: 8,
  results: [
    {
      token: { name: 'Trump Turbo', symbol: 'TURBO', address: 'TurboXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', chain: 'solana', image: null },
      market: { price: 0.0000892, marketCap: 89200, volume24h: 45600, liquidity: 12300, priceChange: { '5m': 12.4, '1h': 45.7, '6h': null, '24h': null } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: null, topHolderPct: null },
      social: { websites: [], twitter: null, telegram: null },
      meta: { createdAt: new Date(Date.now() - 1800000).toISOString(), source: 'pumpfun', bondingCurveProgress: 34.2, graduated: false }
    },
    {
      token: { name: 'Doge on Sol', symbol: 'DOGS', address: 'DogsXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', chain: 'solana', image: null },
      market: { price: 0.00000341, marketCap: 341000, volume24h: 123000, liquidity: 45000, priceChange: { '5m': 3.2, '1h': 8.9, '6h': null, '24h': null } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: null, topHolderPct: null },
      social: { websites: [], twitter: null, telegram: null },
      meta: { createdAt: new Date(Date.now() - 3600000).toISOString(), source: 'pumpfun', bondingCurveProgress: 67.8, graduated: false }
    },
    {
      token: { name: 'Solana Shiba', symbol: 'SSHIB', address: 'ShibXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', chain: 'solana', image: null },
      market: { price: 0.000000841, marketCap: 841000, volume24h: 234000, liquidity: 78000, priceChange: { '5m': 28.4, '1h': 112.3, '6h': null, '24h': null } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: null, topHolderPct: null },
      social: { websites: [], twitter: null, telegram: null },
      meta: { createdAt: new Date(Date.now() - 5400000).toISOString(), source: 'pumpfun', bondingCurveProgress: 98.1, graduated: false }
    },
    {
      token: { name: 'Moon Cat', symbol: 'MCAT', address: 'McatXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', chain: 'solana', image: null },
      market: { price: 0.00421, marketCap: 4210000, volume24h: 890000, liquidity: 340000, priceChange: { '5m': -2.1, '1h': 5.4, '6h': 18.9, '24h': null } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: null, topHolderPct: null },
      social: { websites: [], twitter: 'mooncat_sol', telegram: null },
      meta: { createdAt: new Date(Date.now() - 7200000).toISOString(), source: 'pumpfun', bondingCurveProgress: 100, graduated: true }
    }
  ],
  meta: { sources: ['pumpfun', 'geckoterminal'], timestamp: new Date().toISOString(), demo: true }
};

// ─── Mock: Alert Check Results ────────────────────────────────────────────────

const MOCK_ALERT_CHECK = {
  success: true,
  data: {
    checked: 3,
    triggered: 2,
    results: [
      {
        alertId: 'demo-alert-1',
        type: 'price_above',
        label: 'BONK Moon Alert',
        target: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        chain: 'solana',
        threshold: 0.000025,
        currentValue: 0.00002847,
        triggered: true,
        message: '🚨 BONK price ($0.00002847) crossed above threshold ($0.000025)',
        timestamp: new Date().toISOString()
      },
      {
        alertId: 'demo-alert-2',
        type: 'price_below',
        label: 'WIF Buy Zone',
        target: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
        chain: 'solana',
        threshold: 2.0,
        currentValue: 1.842,
        triggered: true,
        message: '📉 WIF price ($1.842) dropped below threshold ($2.00)',
        timestamp: new Date().toISOString()
      },
      {
        alertId: 'demo-alert-3',
        type: 'price_above',
        label: 'POPCAT Breakout',
        target: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
        chain: 'solana',
        threshold: 0.5,
        currentValue: 0.3182,
        triggered: false,
        message: null,
        timestamp: new Date().toISOString()
      }
    ],
    demo: true
  },
  meta: { timestamp: new Date().toISOString() }
};

// ─── Mock: Token Search ───────────────────────────────────────────────────────

const MOCK_TOKEN_SEARCH = (q) => ({
  success: true,
  query: q,
  count: 3,
  results: [
    {
      token: { name: 'Bonk', symbol: 'BONK', address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', chain: 'solana', image: null },
      market: { price: 0.00002847, marketCap: 1842000000, volume24h: 287430000, liquidity: 48200000, priceChange: { '5m': 0.42, '1h': 2.15, '6h': -1.33, '24h': 8.74 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 12.4 },
      social: { websites: ['https://bonkcoin.com'], twitter: 'bonk_inu', telegram: null },
      meta: { createdAt: '2022-12-25T00:00:00Z', pairAddress: '8QaXeHBrShJTdtN1rWCccBxpSVvKksQ2Pz1iBxAYQDB', dexId: 'raydium', source: 'dexscreener' }
    },
    {
      token: { name: 'dogwifhat', symbol: 'WIF', address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', chain: 'solana', image: null },
      market: { price: 1.842, marketCap: 1841000000, volume24h: 193000000, liquidity: 24600000, priceChange: { '5m': -0.18, '1h': 1.03, '6h': 3.45, '24h': 12.31 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 8.9 },
      social: { websites: [], twitter: 'dogwifcoin', telegram: null },
      meta: { createdAt: '2023-11-20T00:00:00Z', pairAddress: null, dexId: 'raydium', source: 'dexscreener' }
    },
    {
      token: { name: 'Popcat', symbol: 'POPCAT', address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', chain: 'solana', image: null },
      market: { price: 0.3182, marketCap: 318200000, volume24h: 67400000, liquidity: 8900000, priceChange: { '5m': 0.88, '1h': -2.11, '6h': 5.67, '24h': -4.22 } },
      security: { mintAuthority: null, freezeAuthority: null, isHoneypot: false, topHolderPct: 15.2 },
      social: { websites: [], twitter: 'Popcatsolana', telegram: null },
      meta: { createdAt: '2024-01-08T00:00:00Z', pairAddress: null, dexId: 'raydium', source: 'dexscreener' }
    }
  ],
  meta: { sources: ['dexscreener', 'geckoterminal'], timestamp: new Date().toISOString(), demo: true }
});

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  DEMO_MODE,
  MOCK_TRENDING,
  MOCK_TOKEN_ANALYSIS,
  MOCK_WALLET_PORTFOLIO,
  MOCK_NEW_LISTINGS,
  MOCK_ALERT_CHECK,
  MOCK_TOKEN_SEARCH
};
