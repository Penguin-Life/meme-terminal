---
name: meme-radar
version: 1.0.0
description: Meta-skill that orchestrates all meme terminal skills for unified scanning, full token analysis, wallet tracking, and trading decisions. Provides 🟢 Go / 🟡 Watch / 🔴 Avoid framework.
author: meme-terminal
tags: [crypto, meme, analysis, trading, radar, orchestration, decision-framework]
---

# Meme Radar Skill

The master orchestration skill. Combines DexScreener + Pump.fun + GeckoTerminal + Smart Wallet + Binance skills into unified workflows for real meme trading decisions.

**This skill teaches you how to combine other skills** — read each referenced skill's SKILL.md for individual API details.

---

## 🎯 Decision Framework

Every analysis ends with one of three verdicts:

| Signal | Meaning | Action |
|--------|---------|--------|
| 🟢 **GO** | Strong signals, acceptable risk | Consider entry |
| 🟡 **WATCH** | Mixed signals, needs monitoring | Set alert, wait |
| 🔴 **AVOID** | Red flags detected | Skip this one |

### Scoring Criteria

Score the token 0-100 across these dimensions:

**Momentum (0-25 pts)**
- 24h price change > 50% → +10
- 1h price change > 20% → +8
- Volume 24h > $500k → +7

**Liquidity & Safety (0-25 pts)**
- Liquidity > $100k → +10
- Liquidity > $500k → +15
- No security flags (audit) → +10

**Community (0-20 pts)**
- Pump.fun replies > 100 → +10
- Twitter/Telegram present → +5 each

**Fundamentals (0-20 pts)**
- Market cap < $5M (early) → +10
- Graduated from Pump.fun → +5
- Smart money buying → +5

**Technicals (0-10 pts)**
- OHLCV shows higher lows → +5
- Volume increasing trend → +5

**Total Score:**
- 70-100 → 🟢 GO
- 40-69 → 🟡 WATCH
- 0-39 → 🔴 AVOID

**Instant 🔴 AVOID triggers (regardless of score):**
- Honeypot detected
- Mint authority not revoked
- Freeze authority active
- Liquidity < $10k
- Top 10 holders > 80% supply
- Contract not verified (EVM)
- Rug pull pattern detected

---

## WORKFLOW 1: Hot Meme Scan

**Trigger:** "Scan for hot memes", "What's pumping?", "New launches?", "热门土狗"

### Step 1: Pump.fun New Launches
```bash
echo "🚀 === PUMP.FUN NEW LAUNCHES ==="
curl -s "https://frontend-api-v3.pump.fun/coins?offset=0&limit=20&sort=created_timestamp&order=DESC&includeNsfw=false" | jq '
  .[:10] | .[] | 
  "[\(.symbol)] \(.name) | $\(.usd_market_cap // 0 | floor) mcap | 💬\(.reply_count) | \(if .complete then "🎓Grad" else "🔵BC" end) | \(.mint[:12])..."
'
```

### Step 2: Pump.fun by Market Cap (Momentum)
```bash
echo "📈 === PUMP.FUN TOP BY MCAP ==="
curl -s "https://frontend-api-v3.pump.fun/coins?offset=0&limit=20&sort=usd_market_cap&order=DESC&includeNsfw=false" | jq '
  .[:10] | .[] | 
  "[\(.symbol)] $\(.usd_market_cap // 0 | floor) | 💬\(.reply_count) | \(if .complete then "🎓" else "🔵" end)"
'
```

### Step 3: DexScreener Boosted (Trending)
```bash
echo "⚡ === DEXSCREENER BOOSTED ==="
curl -s "https://api.dexscreener.com/token-boosts/top/v1" | jq '
  .[:10] | .[] | 
  "[\(.chainId)] \(.tokenAddress[:12])... | boost: \(.amount)"
'
```

### Step 4: GeckoTerminal Trending (Solana)
```bash
echo "🦎 === GECKO TRENDING (SOLANA) ==="
curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks/solana/trending_pools" | jq '
  .data[:5] | .[] | 
  "\(.attributes.name) | $\(.attributes.base_token_price_usd) | 24h: \(.attributes.price_change_percentage.h24)% | vol: $\(.attributes.volume_usd.h24)"
'
```

**Synthesize:** Look for tokens appearing in multiple sources — that's signal, not noise.

---

## WORKFLOW 2: Full Token Analysis

**Trigger:** "Analyze $TOKEN", "Check [ADDRESS]", "Is [TOKEN] worth buying?", "全面分析"

### Step 1: DexScreener — Price & Pairs
```bash
TOKEN_QUERY="<symbol_or_address>"
CHAIN="solana"  # adjust as needed

echo "=== 📊 DEXSCREENER ==="
curl -s "https://api.dexscreener.com/latest/dex/search?q=${TOKEN_QUERY}" | jq '
  .pairs | sort_by(-.volume.h24 // 0) | .[0] | {
    symbol: .baseToken.symbol,
    price_usd: .priceUsd,
    market_cap: .marketCap,
    fdv: .fdv,
    liquidity_usd: .liquidity.usd,
    volume_24h: .volume.h24,
    price_change_1h: .priceChange.h1,
    price_change_24h: .priceChange.h24,
    buys_24h: .txns.h24.buys,
    sells_24h: .txns.h24.sells,
    boosts_active: .boosts.active,
    dex: .dexId,
    chain: .chainId,
    pair_created: (.pairCreatedAt | todate),
    url: .url
  }
'
```

### Step 2: Pump.fun — Origin Story (Solana only)
```bash
# If token address ends in "pump", it launched on Pump.fun
MINT="<token_address>"
echo "=== 🚀 PUMP.FUN ==="
curl -s "https://frontend-api-v3.pump.fun/coins/${MINT}" | jq '{
  name: .name,
  symbol: .symbol,
  graduated: .complete,
  raydium_pool: .raydium_pool,
  replies: .reply_count,
  description: .description,
  twitter: .twitter,
  telegram: .telegram,
  website: .website,
  creator: .creator,
  created: (.created_timestamp | todate)
}'
```

### Step 3: GeckoTerminal — Candlestick Trend
```bash
# Get pool address from Step 1, then fetch OHLCV
NETWORK="solana"
POOL_ADDRESS="<pool_from_dexscreener>"

echo "=== 📈 PRICE TREND (1h candles, 24h) ==="
curl -s -H "Accept: application/json" \
  "https://api.geckoterminal.com/api/v2/networks/${NETWORK}/pools/${POOL_ADDRESS}/ohlcv/hour?aggregate=1&limit=24&currency=usd" | jq '
  .data.attributes.ohlcv_list as $c |
  {
    price_now: $c[-1][4],
    price_24h_ago: $c[0][1],
    high_24h: ($c | map(.[2]) | max),
    low_24h: ($c | map(.[3]) | min),
    vol_24h: ($c | map(.[5]) | add),
    change_24h_pct: (($c[-1][4] - $c[0][1]) / $c[0][1] * 100 | round),
    trend: (if ($c[-3][4] < $c[-2][4]) and ($c[-2][4] < $c[-1][4]) then "📈 UP" elif ($c[-3][4] > $c[-2][4]) and ($c[-2][4] > $c[-1][4]) then "📉 DOWN" else "↔️ SIDEWAYS" end)
  }
'
```

### Step 4: Security Audit (Binance Skill)
```bash
# Load binance-query-token-audit skill and run audit
# That skill handles: honeypot, mint authority, freeze authority, holder concentration
echo "=== 🔒 SECURITY AUDIT ==="
# See: ~/openclaw/skills/binance-query-token-audit/SKILL.md
```

### Step 5: Synthesize & Score

After collecting all data, score each dimension and give final verdict:

```
📊 TOKEN ANALYSIS: [SYMBOL]
━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 Price: $X.XX | MCap: $XXk | FDV: $XXk
💧 Liquidity: $XXk | Vol 24h: $XXk
📈 24h Change: +XX% | 1h: +XX%
🔁 Buys/Sells 24h: XX / XX (ratio: X.X)

🚀 Origin: Pump.fun | Graduated: ✅/❌
💬 Community: XX replies | Twitter: ✅/❌
🔒 Security: Clean/⚠️ ISSUES

SCORE: XX/100
VERDICT: 🟢 GO / 🟡 WATCH / 🔴 AVOID

Reason: [brief explanation]
```

---

## WORKFLOW 3: Wallet Tracking

**Trigger:** "Track wallet [ADDRESS]", "What is this wallet buying?", "Smart money check", "跟踪钱包"

### Step 1: Identify Chain
- Starts with `0x` → EVM (ETH/BSC/Base)  
- 32-44 char base58 → Solana

### Step 2: Solana Wallet Holdings
```bash
WALLET="<solana_address>"
echo "=== 💼 PORTFOLIO ==="
# SOL balance
curl -s -X POST "https://api.mainnet-beta.solana.com" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getBalance\",\"params\":[\"${WALLET}\"]}" | \
  jq '"SOL: \(.result.value / 1e9)"'

# Token holdings
curl -s -X POST "https://api.mainnet-beta.solana.com" \
  -H "Content-Type: application/json" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getTokenAccountsByOwner\",\"params\":[\"${WALLET}\",{\"programId\":\"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA\"},{\"encoding\":\"jsonParsed\"}]}" | \
  jq '.result.value | map(select(.account.data.parsed.info.tokenAmount.uiAmount > 0)) | length as $n | "Holds \($n) token types"'
```

### Step 3: Check Each Token on DexScreener
```bash
# For each mint from Step 2, enrich with market data:
MINT="<token_mint>"
curl -s "https://api.dexscreener.com/tokens/v1/solana/${MINT}" | jq '.[0] | {
  symbol: .baseToken.symbol,
  price: .priceUsd,
  mcap: .marketCap,
  change_24h: .priceChange.h24
}'
```

### Step 4: Recent Activity (requires Helius key)
```bash
WALLET="<address>"
HELIUS_KEY="<your_key>"
curl -s "https://api.helius.xyz/v0/addresses/${WALLET}/transactions?api-key=${HELIUS_KEY}&limit=20&type=SWAP" | jq '
  .[:5] | .[] | {
    time: (.timestamp | todate),
    action: .description
  }
'
```

---

## WORKFLOW 4: Quick Alpha Scan

**Trigger:** "Quick scan", "What to buy now?", "Alpha?", "速扫"

Optimized fast scan for immediate opportunities:

```bash
echo "⚡ QUICK ALPHA SCAN ⚡"
echo ""

# 1. Fresh Pump.fun with traction
echo "🆕 Pump.fun Traction (new + replies > 20):"
curl -s "https://frontend-api-v3.pump.fun/coins?offset=0&limit=50&sort=created_timestamp&order=DESC&includeNsfw=false" | jq '
  [.[] | select(.reply_count > 20 and (.usd_market_cap // 0) < 500000 and .complete == false)] | .[:5] | .[] |
  "  [\(.symbol)] $\(.usd_market_cap // 0 | floor) | 💬\(.reply_count) | \(.mint[:16])..."
'

echo ""

# 2. DexScreener hot new profiles
echo "⚡ DexScreener Latest Boosted (Solana):"
curl -s "https://api.dexscreener.com/token-boosts/latest/v1" | jq '
  [.[] | select(.chainId == "solana")] | .[:5] | .[] |
  "  \(.tokenAddress[:16])... | \(.description // "No desc")"
'

echo ""

# 3. GeckoTerminal new pools with volume
echo "🦎 Gecko New Pools with Volume (Solana):"
curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks/solana/new_pools" | jq '
  [.data[] | select((.attributes.volume_usd.h1 // "0" | tonumber) > 10000)] | .[:5] | .[] |
  "  \(.attributes.name) | vol1h: $\(.attributes.volume_usd.h1) | \(.attributes.price_change_percentage.h1)%1h"
'
```

---

## WORKFLOW 5: Momentum Alert Check

**Trigger:** "Is $TOKEN still pumping?", "Check momentum on [TOKEN]"

```bash
TOKEN_ADDRESS="<address>"
CHAIN="solana"

# Get 5-min candles for last hour (12 candles)
# First find pool address:
POOL=$(curl -s "https://api.dexscreener.com/tokens/v1/${CHAIN}/${TOKEN_ADDRESS}" | jq -r '.[0].pairAddress')

curl -s -H "Accept: application/json" \
  "https://api.geckoterminal.com/api/v2/networks/${CHAIN}/pools/${POOL}/ohlcv/minute?aggregate=5&limit=12&currency=usd" | jq '
  .data.attributes.ohlcv_list as $c |
  {
    first_price: $c[0][1],
    last_price: $c[-1][4],
    change_1h_pct: (($c[-1][4] - $c[0][1]) / $c[0][1] * 100 | round),
    vol_1h: ($c | map(.[5]) | add),
    momentum: (if ($c[-1][4] > $c[-2][4]) and ($c[-2][4] > $c[-3][4]) then "🚀 ACCELERATING" 
               elif $c[-1][4] > $c[0][1] then "📈 UP" 
               else "📉 COOLING" end)
  }
'
```

---

## Red Flag Checklist

Before any trade, manually verify:

```
□ Liquidity locked? (check DexScreener info tab)
□ Mint authority revoked? (audit skill)
□ Freeze authority disabled? (audit skill)
□ Team doxxed or anonymous? (social links)
□ Contract verified? (for EVM)
□ Top 10 holders < 50%? (audit skill)
□ Trading pattern normal? (no wash trading)
□ Age > 30 min? (avoid sniping)
□ Real social media presence?
□ Unique concept or pure copy?
```

---

## Quick Reference: Skill Routing

| User Request | Primary Skill | Secondary |
|-------------|---------------|-----------|
| "新土狗" / New memes | pump-fun | dexscreener |
| "Check $TOKEN" | dexscreener | gecko-terminal |
| "Is it safe?" | binance-query-token-audit | dexscreener |
| "Chart/OHLCV" | gecko-terminal | — |
| "Track wallet" | smart-wallet | dexscreener |
| "Smart money" | smart-wallet | dexscreener |
| "Trending" | dexscreener | gecko-terminal |
| "全面分析" / Full analysis | meme-radar (this) | all skills |
| "Market hot topics" | binance-meme-rush | — |
| "Token rankings" | binance-crypto-market-rank | — |

---

## Example Output Template

When providing analysis, format like this:

```
🎯 MEME RADAR: $SYMBOL
━━━━━━━━━━━━━━━━━━━━━━
Chain: Solana | DEX: Raydium/PumpSwap
Origin: Pump.fun (Graduated ✅)

📊 MARKET DATA
  Price: $0.00042 | MCap: $420k | FDV: $420k
  Liquidity: $185k 💧 GOOD
  Vol 24h: $2.1M 📊 HIGH
  24h: +340% 🚀 | 1h: +22% 📈

📈 TREND: ACCELERATING (3 consecutive higher closes)

👥 COMMUNITY
  Pump.fun replies: 234 💬 HIGH
  Twitter: ✅ @symbol | Telegram: ✅
  
🔒 SECURITY: CLEAN ✅
  Mint revoked ✅ | Freeze disabled ✅
  Top holder: 8% (healthy)
  
🧠 SMART MONEY: 2 known wallets bought in last 2h

━━━━━━━━━━━━━━━━━━━━━━
SCORE: 78/100
VERDICT: 🟢 GO

✅ Strong: High vol/liq ratio, graduated, community active, smart money in
⚠️ Risk: Token is only 4h old, high volatility expected
```

---

## Notes

- Always run security audit BEFORE giving a 🟢 GO signal
- Speed matters in meme trading — run multiple skills in parallel when possible
- This skill requires the other skills to be installed: dexscreener, pump-fun, gecko-terminal, smart-wallet
- Binance skills (binance-meme-rush, binance-query-token-audit, binance-trading-signal) enhance analysis
- Market conditions change fast — analysis is valid for ~5-15 minutes max
- Never give financial advice — provide data and let Taxy decide
- 🔴 AVOID is never wrong — protecting capital is the #1 priority
