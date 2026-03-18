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

// ─── Mock: Smart Money Signals ────────────────────────────────────────────────

const MOCK_SIGNALS = {
  success: true,
  count: 8,
  signals: [
    {
      tokenSymbol: 'BONK', tokenName: 'Bonk', contractAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      chainId: 'CT_501', signalType: 'BUY', triggerPrice: 0.00002341, currentPrice: 0.00002847,
      maxGainPercent: 21.6, exitRate: 0.12, signalTime: Date.now() - 3600000,
      walletAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', tags: ['smart_money', 'whale'], logoUrl: null
    },
    {
      tokenSymbol: 'WIF', tokenName: 'dogwifhat', contractAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
      chainId: 'CT_501', signalType: 'BUY', triggerPrice: 1.523, currentPrice: 1.842,
      maxGainPercent: 34.8, exitRate: 0.08, signalTime: Date.now() - 7200000,
      walletAddress: '3Kz9RwL7jD4hF5ZmVxN6q8L9sB2E1nFpXvRyTcAjWmNq', tags: ['smart_money'], logoUrl: null
    },
    {
      tokenSymbol: 'PEPE', tokenName: 'Pepe', contractAddress: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
      chainId: '1', signalType: 'SELL', triggerPrice: 0.00001423, currentPrice: 0.00001187,
      maxGainPercent: 45.2, exitRate: 0.67, signalTime: Date.now() - 1800000,
      walletAddress: '0x28C6c06298d514Db089934071355E5743bf21d60', tags: ['whale', 'top_trader'], logoUrl: null
    },
    {
      tokenSymbol: 'FLOKI', tokenName: 'Floki Inu', contractAddress: '0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E',
      chainId: '1', signalType: 'BUY', triggerPrice: 0.0001567, currentPrice: 0.0001834,
      maxGainPercent: 17.0, exitRate: 0.05, signalTime: Date.now() - 5400000,
      walletAddress: '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549', tags: ['smart_money'], logoUrl: null
    },
    {
      tokenSymbol: 'POPCAT', tokenName: 'Popcat', contractAddress: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
      chainId: 'CT_501', signalType: 'BUY', triggerPrice: 0.2841, currentPrice: 0.3182,
      maxGainPercent: 12.0, exitRate: 0.15, signalTime: Date.now() - 900000,
      walletAddress: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1', tags: ['smart_money', 'alpha'], logoUrl: null
    },
    {
      tokenSymbol: 'MYRO', tokenName: 'Myro', contractAddress: 'HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4',
      chainId: 'CT_501', signalType: 'BUY', triggerPrice: 0.03142, currentPrice: 0.04291,
      maxGainPercent: 36.5, exitRate: 0.03, signalTime: Date.now() - 10800000,
      walletAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', tags: ['top_trader'], logoUrl: null
    },
    {
      tokenSymbol: 'BOME', tokenName: 'Book of Meme', contractAddress: 'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82',
      chainId: 'CT_501', signalType: 'SELL', triggerPrice: 0.01123, currentPrice: 0.00842,
      maxGainPercent: 28.9, exitRate: 0.45, signalTime: Date.now() - 14400000,
      walletAddress: '4Nd1mBQtrMJVYVfKf2PJy9NZUZdTAsp7D4xWLs4gDB4T', tags: ['whale'], logoUrl: null
    },
    {
      tokenSymbol: 'SLERF', tokenName: 'Slerf', contractAddress: '7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3',
      chainId: 'CT_501', signalType: 'BUY', triggerPrice: 0.0987, currentPrice: 0.1234,
      maxGainPercent: 25.0, exitRate: 0.10, signalTime: Date.now() - 2700000,
      walletAddress: '6Uqc7PdBed34oXPASMiEyCLYJFVGdqSaXF2DY5FBjFhm', tags: ['smart_money', 'whale'], logoUrl: null
    }
  ],
  meta: { source: 'binance-smart-money', timestamp: new Date().toISOString(), cached: false, demo: true }
};

// ─── Mock: Arbitrage Scanner ──────────────────────────────────────────────────

const MOCK_ARBITRAGE = {
  success: true,
  count: 6,
  opportunities: 2,
  results: [
    { symbol: 'BONKUSDT', keyword: 'BONK', cexPrice: 0.00002847, dexPrice: 0.00002912, spreadPercent: 2.2821, direction: 'dex_premium', opportunity: true },
    { symbol: 'WIFUSDT', keyword: 'WIF', cexPrice: 1.842, dexPrice: 1.811, spreadPercent: -1.6830, direction: 'cex_premium', opportunity: true },
    { symbol: 'PEPEUSDT', keyword: 'PEPE', cexPrice: 0.00001187, dexPrice: 0.00001192, spreadPercent: 0.4213, direction: 'dex_premium', opportunity: false },
    { symbol: 'FLOKIUSDT', keyword: 'FLOKI', cexPrice: 0.0001834, dexPrice: 0.0001829, spreadPercent: -0.2727, direction: 'cex_premium', opportunity: false },
    { symbol: 'DOGEUSDT', keyword: 'DOGE', cexPrice: 0.1423, dexPrice: 0.1431, spreadPercent: 0.5622, direction: 'dex_premium', opportunity: false },
    { symbol: 'SHIBUSDT', keyword: 'SHIB', cexPrice: 0.00002341, dexPrice: 0.00002338, spreadPercent: -0.1282, direction: 'cex_premium', opportunity: false }
  ],
  meta: { cexSource: 'binance-spot', dexSource: 'binance-web3-dex', timestamp: new Date().toISOString(), demo: true }
};

// ─── Mock: Binance Alpha Tokens ───────────────────────────────────────────────

const MOCK_ALPHA_LIST = {
  success: true,
  count: 10,
  tokens: [
    { symbol: 'GRIFFAIN', name: 'Griffain', contractAddress: 'GRFNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', chainId: 'CT_501', price: 0.0423, priceChange24h: 18.4, volume24h: 12400000, marketCap: 42300000, holders: 8923, rank: 1, logoUrl: null, tags: ['ai', 'defi'], isAlpha: true, source: 'binance-alpha' },
    { symbol: 'ONDO', name: 'Ondo Finance', contractAddress: '0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3', chainId: '1', price: 1.234, priceChange24h: 5.7, volume24h: 89000000, marketCap: 1890000000, holders: 45231, rank: 2, logoUrl: null, tags: ['rwa', 'defi'], isAlpha: true, source: 'binance-alpha' },
    { symbol: 'UXLINK', name: 'UXLINK', contractAddress: '0x2FE8733d4ca4A21D52B2B82e8B9667a61F91dA1e', chainId: '1', price: 0.892, priceChange24h: -3.2, volume24h: 34500000, marketCap: 267000000, holders: 12453, rank: 3, logoUrl: null, tags: ['social'], isAlpha: true, source: 'binance-alpha' },
    { symbol: 'MORPHO', name: 'Morpho', contractAddress: '0x9994E35Db50125E0DF82e4c2dde62496CE330999', chainId: '1', price: 2.341, priceChange24h: 12.1, volume24h: 67800000, marketCap: 456000000, holders: 23411, rank: 4, logoUrl: null, tags: ['defi', 'lending'], isAlpha: true, source: 'binance-alpha' },
    { symbol: 'VIRTUAL', name: 'Virtual Protocol', contractAddress: '0x44ff8620b8cA30902395A7bD3F2407e1A091BF73', chainId: '8453', price: 0.567, priceChange24h: 28.9, volume24h: 23400000, marketCap: 567000000, holders: 34521, rank: 5, logoUrl: null, tags: ['ai', 'agent'], isAlpha: true, source: 'binance-alpha' },
    { symbol: 'COOKIE', name: 'Cookie DAO', contractAddress: 'CookieXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', chainId: 'CT_501', price: 0.234, priceChange24h: -8.4, volume24h: 8900000, marketCap: 78000000, holders: 5621, rank: 6, logoUrl: null, tags: ['dao', 'ai'], isAlpha: true, source: 'binance-alpha' },
    { symbol: 'SWARMS', name: 'Swarms', contractAddress: 'SwarmsXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', chainId: 'CT_501', price: 0.0891, priceChange24h: 42.3, volume24h: 5600000, marketCap: 34000000, holders: 3456, rank: 7, logoUrl: null, tags: ['ai', 'agent'], isAlpha: true, source: 'binance-alpha' },
    { symbol: 'AIXBT', name: 'AixBT', contractAddress: '0xAixBTXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', chainId: '8453', price: 0.156, priceChange24h: 15.7, volume24h: 12300000, marketCap: 156000000, holders: 8723, rank: 8, logoUrl: null, tags: ['ai'], isAlpha: true, source: 'binance-alpha' },
    { symbol: 'KAITO', name: 'Kaito', contractAddress: 'KaitoXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', chainId: '1', price: 1.567, priceChange24h: 7.3, volume24h: 45600000, marketCap: 234000000, holders: 15678, rank: 9, logoUrl: null, tags: ['ai', 'search'], isAlpha: true, source: 'binance-alpha' },
    { symbol: 'ANIME', name: 'Anime Token', contractAddress: '0xAnimeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX', chainId: '42161', price: 0.0342, priceChange24h: -1.8, volume24h: 7800000, marketCap: 89000000, holders: 67890, rank: 10, logoUrl: null, tags: ['culture', 'nft'], isAlpha: true, source: 'binance-alpha' }
  ],
  meta: { rankType: 20, description: 'Binance Alpha curated tokens', source: 'binance-web3-api', timestamp: new Date().toISOString(), cached: false, demo: true }
};

const MOCK_ALPHA_TRENDING = {
  success: true,
  alpha: [
    { symbol: 'GRIFFAIN', name: 'Griffain', contractAddress: 'GRFNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', chainId: 'CT_501', price: 0.0423, priceChange24h: 18.4, volume24h: 12400000, marketCap: 42300000, holders: 8923, rank: 1, logoUrl: null, tags: ['ai'], isAlpha: true, source: 'binance-alpha', category: 'alpha' },
    { symbol: 'SWARMS', name: 'Swarms', contractAddress: 'SwarmsXXX', chainId: 'CT_501', price: 0.0891, priceChange24h: 42.3, volume24h: 5600000, marketCap: 34000000, holders: 3456, rank: 7, logoUrl: null, tags: ['ai', 'agent'], isAlpha: true, source: 'binance-alpha', category: 'alpha' },
    { symbol: 'VIRTUAL', name: 'Virtual Protocol', contractAddress: '0x44ff8620b8cA30902395A7bD3F2407e1A091BF73', chainId: '8453', price: 0.567, priceChange24h: 28.9, volume24h: 23400000, marketCap: 567000000, holders: 34521, rank: 5, logoUrl: null, tags: ['ai', 'agent'], isAlpha: true, source: 'binance-alpha', category: 'alpha' }
  ],
  trending: [
    { symbol: 'BONK', name: 'Bonk', contractAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', chainId: 'CT_501', price: 0.00002847, priceChange24h: 8.74, volume24h: 287430000, marketCap: 1842000000, holders: null, rank: null, logoUrl: null, tags: [], isAlpha: false, source: 'binance-alpha', category: 'trending' },
    { symbol: 'WIF', name: 'dogwifhat', contractAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm', chainId: 'CT_501', price: 1.842, priceChange24h: 12.31, volume24h: 193000000, marketCap: 1841000000, holders: null, rank: null, logoUrl: null, tags: [], isAlpha: false, source: 'binance-alpha', category: 'trending' }
  ],
  total: 5,
  meta: { sources: ['binance-alpha-rank', 'binance-trending-rank'], timestamp: new Date().toISOString(), cached: false, demo: true }
};

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  DEMO_MODE,
  MOCK_TRENDING,
  MOCK_TOKEN_ANALYSIS,
  MOCK_WALLET_PORTFOLIO,
  MOCK_NEW_LISTINGS,
  MOCK_ALERT_CHECK,
  MOCK_TOKEN_SEARCH,
  MOCK_SIGNALS,
  MOCK_ARBITRAGE,
  MOCK_ALPHA_LIST,
  MOCK_ALPHA_TRENDING
};
