/**
 * Analysis Engine
 * Unified deep analysis pipeline combining all data sources.
 *
 * Risk scoring (0-100):
 *   Liquidity score  (0-25) — based on liquidity depth
 *   Volume score     (0-25) — based on volume/mcap ratio
 *   Security score   (0-25) — based on contract flags and pair health
 *   Social score     (0-25) — based on social presence & buy pressure
 *
 * Verdict:
 *   🟢 GO    = 70+  (relatively safe, buy signals)
 *   🟡 WATCH = 40-69 (mixed signals, proceed cautiously)
 *   🔴 AVOID = <40  (high risk or red flags)
 */

const dex     = require('./dexscreener');
const gecko   = require('./gecko');
const pumpfun = require('./pumpfun');

// ─── Risk Scoring ─────────────────────────────────────────────────────────────

/**
 * Score liquidity (0-25)
 * >$1M = 25 | $500k = 20 | $100k = 15 | $50k = 10 | $10k = 5 | <$10k = 0
 */
function scoreLiquidity(liquidityUsd) {
  if (!liquidityUsd) return 0;
  if (liquidityUsd >= 1_000_000) return 25;
  if (liquidityUsd >= 500_000)   return 20;
  if (liquidityUsd >= 100_000)   return 15;
  if (liquidityUsd >= 50_000)    return 10;
  if (liquidityUsd >= 10_000)    return 5;
  return 0;
}

/**
 * Score volume relative to FDV/MCap (0-25)
 * vol24h/fdv > 50% = 25 | >20% = 20 | >10% = 15 | >5% = 10 | >1% = 5 | else = 3
 */
function scoreVolume(vol24h, fdv) {
  if (!vol24h) return 0;
  if (!fdv || fdv === 0) return 5; // vol present but no fdv — some signal
  const ratio = vol24h / fdv;
  if (ratio >= 0.5)  return 25;
  if (ratio >= 0.2)  return 20;
  if (ratio >= 0.1)  return 15;
  if (ratio >= 0.05) return 10;
  if (ratio >= 0.01) return 5;
  return 3;
}

/**
 * Score security / contract health (0-25)
 * Based on pair age, DEX listing quality, anomalies
 */
function scoreSecurity(pairs) {
  if (!pairs || pairs.length === 0) return 0;

  let score = 15; // baseline — token is listed on a DEX

  const best = pairs[0];

  // Boost for multiple pairs (more liquidity distribution)
  if (pairs.length >= 3) score += 5;
  else if (pairs.length >= 2) score += 2;

  // Boost for established DEXes
  const trustedDexes = ['raydium', 'orca', 'uniswap', 'pancakeswap', 'curve', 'sushiswap', 'jupiter'];
  const dexId = (best.dexId || '').toLowerCase();
  if (trustedDexes.some(d => dexId.includes(d))) score += 5;

  // Penalty if liquidity is extremely low relative to FDV (honey pot risk)
  const liq = best.liquidity?.usd || 0;
  const fdv = best.fdv || 0;
  if (fdv > 0 && liq / fdv < 0.001) score -= 5; // liquidity < 0.1% of FDV

  return Math.max(0, Math.min(25, score));
}

/**
 * Score social / market activity (0-25)
 * Buy pressure, transaction counts, price momentum
 */
function scoreSocial(pairs) {
  if (!pairs || pairs.length === 0) return 0;

  const best = pairs[0];
  let score = 0;

  // Buy pressure in last hour
  const h1Buys  = best.txns?.h1?.buys  || 0;
  const h1Sells = best.txns?.h1?.sells || 0;
  const total   = h1Buys + h1Sells;

  if (total > 200) score += 10;
  else if (total > 50) score += 7;
  else if (total > 10) score += 4;

  if (total > 0) {
    const buyRatio = h1Buys / total;
    if (buyRatio >= 0.7) score += 8;       // strong buy pressure
    else if (buyRatio >= 0.55) score += 4; // moderate buy pressure
  }

  // Price momentum
  const h1Change = best.priceChange?.h1 || 0;
  if (h1Change > 20) score += 7;
  else if (h1Change > 5) score += 4;
  else if (h1Change > 0) score += 2;

  return Math.max(0, Math.min(25, score));
}

function getVerdict(score) {
  if (score >= 70) return { verdict: '🟢 GO',    level: 'go'    };
  if (score >= 40) return { verdict: '🟡 WATCH',  level: 'watch' };
  return               { verdict: '🔴 AVOID', level: 'avoid' };
}

function buildReasoning(scores, pairs, pumpInfo) {
  const reasons = [];

  if (scores.liquidity >= 20) reasons.push('Strong liquidity depth');
  else if (scores.liquidity >= 10) reasons.push('Moderate liquidity');
  else reasons.push('⚠️ Low liquidity — high slippage risk');

  if (scores.volume >= 20) reasons.push('Very active trading volume');
  else if (scores.volume >= 10) reasons.push('Decent volume relative to market cap');
  else reasons.push('Low volume — limited trading activity');

  if (scores.security >= 20) reasons.push('Listed on reputable DEX(es)');
  else if (scores.security >= 15) reasons.push('Standard DEX listing');
  else reasons.push('⚠️ Limited DEX presence');

  if (scores.social >= 15) reasons.push('Strong buy pressure and momentum');
  else if (scores.social >= 8) reasons.push('Moderate buying activity');
  else reasons.push('Weak buy signal');

  if (pumpInfo) {
    if (pumpInfo.complete) reasons.push('✅ Pump.fun migration complete — graduated token');
    else if (pumpInfo.usd_market_cap > 0) {
      const pct = ((pumpInfo.usd_market_cap / 69000) * 100).toFixed(1);
      reasons.push(`Pump.fun bonding curve ${pct}% filled`);
    }
  }

  return reasons.join('. ') + '.';
}

// ─── Main Analysis Functions ──────────────────────────────────────────────────

/**
 * analyzeToken — comprehensive token report with risk scoring.
 * @param {string} query — token symbol, name, or contract address
 * @param {string} chain — chain id (solana, eth, bsc, ...)
 * @returns {Object} full token analysis report
 */
async function analyzeToken(query, chain = 'solana') {
  const report = {
    query,
    chain,
    timestamp: new Date().toISOString(),
    token: null,
    market: null,
    pumpfunInfo: null,
    geckoData: null,
    scores: { liquidity: 0, volume: 0, security: 0, social: 0 },
    riskScore: 0,
    verdict: '🔴 AVOID',
    verdictLevel: 'avoid',
    reasoning: 'Insufficient data to analyze',
    errors: []
  };

  // ── Step 1: DexScreener search ────────────────────────────────────────────
  let pairs = [];
  try {
    pairs = await dex.search(query);
    // Filter to requested chain if specified
    if (chain && chain !== 'all') {
      const filtered = pairs.filter(p => p.chainId === chain);
      if (filtered.length > 0) pairs = filtered;
    }
    // Sort by liquidity descending
    pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0));
  } catch (err) {
    report.errors.push(`DexScreener search failed: ${err.message}`);
  }

  if (pairs.length === 0) {
    report.reasoning = 'Token not found on DexScreener. May be too new or delisted.';
    return report;
  }

  const best = pairs[0];
  report.token = {
    symbol:   best.baseToken?.symbol || query,
    name:     best.baseToken?.name   || query,
    address:  best.baseToken?.address,
    chainId:  best.chainId,
    dexId:    best.dexId
  };

  report.market = {
    priceUsd:    best.priceUsd,
    priceChange: best.priceChange || {},
    volume:      best.volume      || {},
    liquidity:   best.liquidity?.usd,
    fdv:         best.fdv,
    marketCap:   best.marketCap,
    txns:        best.txns        || {},
    pairCount:   pairs.length
  };

  // ── Step 2: GeckoTerminal data ────────────────────────────────────────────
  try {
    const geckoNetwork = chain === 'eth' ? 'eth' : chain === 'bsc' ? 'bsc' : 'solana';
    const trendingPools = await gecko.getTrendingPools(geckoNetwork);
    const matchingPool = trendingPools.find(p => {
      const name = p.attributes?.name || '';
      return name.toLowerCase().includes(query.toLowerCase());
    });
    if (matchingPool) {
      report.geckoData = {
        poolName:      matchingPool.attributes?.name,
        priceUsd:      matchingPool.attributes?.base_token_price_usd,
        volume24h:     matchingPool.attributes?.volume_usd?.h24,
        reserveUsd:    matchingPool.attributes?.reserve_in_usd,
        txCount24h:    matchingPool.attributes?.transactions?.h24?.buys + matchingPool.attributes?.transactions?.h24?.sells
      };
    }
  } catch (err) {
    report.errors.push(`GeckoTerminal lookup failed: ${err.message}`);
  }

  // ── Step 3: Pump.fun check (Solana only) ──────────────────────────────────
  if (chain === 'solana' && report.token?.address) {
    try {
      const pfCoins = await pumpfun.getNewCoins({ limit: 50 });
      const match = pfCoins.find(c =>
        c.mint === report.token.address ||
        c.symbol?.toLowerCase() === query.toLowerCase()
      );
      if (match) {
        report.pumpfunInfo = {
          name:         match.name,
          symbol:       match.symbol,
          mint:         match.mint,
          marketCap:    match.usd_market_cap,
          complete:     match.complete,
          createdAt:    match.created_timestamp
        };
      }
    } catch (err) {
      report.errors.push(`Pump.fun lookup failed: ${err.message}`);
    }
  }

  // ── Step 4: Risk Scoring ───────────────────────────────────────────────────
  const liq    = report.market.liquidity || 0;
  const vol24h = report.market.volume?.h24 || 0;
  const fdv    = report.market.fdv || 0;

  report.scores.liquidity = scoreLiquidity(liq);
  report.scores.volume    = scoreVolume(vol24h, fdv);
  report.scores.security  = scoreSecurity(pairs);
  report.scores.social    = scoreSocial(pairs);

  report.riskScore = report.scores.liquidity + report.scores.volume + report.scores.security + report.scores.social;

  const { verdict, level } = getVerdict(report.riskScore);
  report.verdict      = verdict;
  report.verdictLevel = level;
  report.reasoning    = buildReasoning(report.scores, pairs, report.pumpfunInfo);

  return report;
}

/**
 * analyzeWallet — wallet intelligence report.
 * @param {string} address — wallet address
 * @param {string} chain   — chain id
 * @returns {Object} wallet analysis report
 */
async function analyzeWallet(address, chain = 'solana') {
  const report = {
    address,
    chain,
    timestamp: new Date().toISOString(),
    label:      null,
    recentTrades: [],
    topHoldings:  [],
    portfolioValue: null,
    winRate:      null,
    pnlEstimate:  null,
    summary:      '',
    errors:       []
  };

  // Attempt to fetch wallet data via DexScreener (limited — no wallet API)
  // Real wallet analysis would use Helius or Birdeye (API key needed)
  // For now, provide what we can from public data

  try {
    // DexScreener doesn't have wallet API, so we provide a structure
    // that the frontend can populate via other APIs
    report.summary = `Wallet ${address.slice(0, 8)}...${address.slice(-4)} on ${chain.toUpperCase()}. ` +
      `Full on-chain analysis requires Helius/Birdeye API key. ` +
      `Set HELIUS_API_KEY or BIRDEYE_API_KEY in backend .env to enable.`;

    report.note = 'For full wallet analysis, integrate Helius RPC (Solana) or Moralis/Alchemy (EVM).';
  } catch (err) {
    report.errors.push(`Wallet analysis failed: ${err.message}`);
  }

  return report;
}

/**
 * analyzeMarket — market overview across chains.
 * @returns {Object} market overview report
 */
async function analyzeMarket() {
  const report = {
    timestamp: new Date().toISOString(),
    trending:     [],
    gainers:      [],
    losers:       [],
    newLaunches:  [],
    sentiment:    'neutral',
    sentimentScore: 50,
    summary:      '',
    errors:       []
  };

  // ── Trending via DexScreener (boosted tokens) ─────────────────────────────
  try {
    const boostedTokens = await dex.getBoostedTokens();
    if (Array.isArray(boostedTokens)) {
      report.trending = boostedTokens.slice(0, 10).map(t => ({
        symbol:    t.tokenAddress?.slice(0, 8) + '...',
        chainId:   t.chainId,
        priceUsd:  null,
        change24h: null,
        volume24h: null,
        liquidity: null
      }));
    }
  } catch (err) {
    report.errors.push(`DexScreener boosted fetch failed: ${err.message}`);
  }

  // ── Trending via GeckoTerminal ─────────────────────────────────────────────
  let geckoTrending = [];
  try {
    geckoTrending = await gecko.getTrendingPools('solana');
  } catch (err) {
    report.errors.push(`GeckoTerminal trending failed: ${err.message}`);
  }

  // ── New Pump.fun launches ─────────────────────────────────────────────────
  try {
    const newCoins = await pumpfun.getNewCoins({ limit: 50 });
    report.newLaunches = newCoins
      .filter(c => c.usd_market_cap > 5000) // filter out dead launches
      .slice(0, 10)
      .map(c => ({
        symbol:    c.symbol,
        name:      c.name,
        mint:      c.mint,
        marketCap: c.usd_market_cap,
        complete:  c.complete
      }));
  } catch (err) {
    report.errors.push(`Pump.fun new coins failed: ${err.message}`);
  }

  // ── Gainers / Losers from GeckoTerminal ───────────────────────────────────
  try {
    const pools = geckoTrending.map(p => ({
      symbol:   p.attributes?.name?.split('/')?.[0] || '?',
      change24h: parseFloat(p.attributes?.price_change_percentage?.h24 || '0'),
      volume24h: parseFloat(p.attributes?.volume_usd?.h24 || '0'),
      poolName:  p.attributes?.name
    })).filter(p => !isNaN(p.change24h));

    report.gainers = pools
      .filter(p => p.change24h > 0)
      .sort((a, b) => b.change24h - a.change24h)
      .slice(0, 5);

    report.losers = pools
      .filter(p => p.change24h < 0)
      .sort((a, b) => a.change24h - b.change24h)
      .slice(0, 5);
  } catch (err) {
    // non-critical
  }

  // ── Sentiment ─────────────────────────────────────────────────────────────
  try {
    const gainCount = report.gainers.length;
    const lossCount = report.losers.length;
    const total = gainCount + lossCount;

    if (total > 0) {
      const bullRatio = gainCount / total;
      if (bullRatio >= 0.7) {
        report.sentiment      = 'bullish';
        report.sentimentScore = Math.round(50 + bullRatio * 50);
      } else if (bullRatio <= 0.3) {
        report.sentiment      = 'bearish';
        report.sentimentScore = Math.round(50 - (1 - bullRatio) * 50);
      } else {
        report.sentiment      = 'neutral';
        report.sentimentScore = 50;
      }
    }

    const sentEmoji = { bullish: '🐂', bearish: '🐻', neutral: '😐' }[report.sentiment];
    report.summary = `${sentEmoji} Market is ${report.sentiment} (score ${report.sentimentScore}/100). ` +
      `${report.gainers.length} gainers, ${report.losers.length} losers on trending DEX pools. ` +
      `${report.newLaunches.length} new Pump.fun launches with >$5k market cap.`;
  } catch (err) {
    report.summary = 'Market analysis complete.';
  }

  return report;
}

module.exports = { analyzeToken, analyzeWallet, analyzeMarket };
