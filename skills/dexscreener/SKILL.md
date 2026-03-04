---
name: dexscreener
version: 1.0.0
description: Query DexScreener for token data, trending pairs, boosted tokens, OHLCV, and new listings across all chains. Free API, no key required.
author: meme-terminal
tags: [crypto, dex, trading, tokens, solana, eth, bsc]
---

# DexScreener Skill

Query DexScreener's free public API for real-time DEX data across 80+ chains including Solana, Ethereum, BSC, Base, and more.

## Base URL
```
https://api.dexscreener.com
```

No API key required. Rate limits: be reasonable (avoid hammering, max ~30 req/min).

---

## 1. Search Tokens / Pairs

Search by token name, symbol, or contract address. Returns matching pairs across all chains.

```bash
curl -s "https://api.dexscreener.com/latest/dex/search?q=PEPE" | jq '.pairs[:3] | .[] | {chain: .chainId, dex: .dexId, symbol: .baseToken.symbol, price: .priceUsd, volume24h: .volume.h24, liquidity: .liquidity.usd, fdv: .fdv}'
```

**Parameters:**
- `q` — search query (token name, symbol, or contract address)

**Response fields:**
- `chainId` — blockchain (solana, ethereum, bsc, base, etc.)
- `dexId` — DEX name (raydium, uniswap, pancakeswap, etc.)
- `pairAddress` — trading pair contract address
- `baseToken.symbol/name/address` — the token being traded
- `quoteToken.symbol` — paired against (SOL, USDC, WETH, etc.)
- `priceUsd` — current price in USD
- `priceNative` — price in native quote token
- `volume.h1/h6/h24` — volume in last 1h/6h/24h
- `priceChange.m5/h1/h6/h24` — price change % in time windows
- `liquidity.usd` — total liquidity in USD
- `fdv` — fully diluted valuation
- `marketCap` — market cap (if circulating supply known)
- `txns.h24.buys/sells` — 24h buy/sell transaction counts
- `pairCreatedAt` — Unix timestamp when pair was created
- `boosts.active` — number of active boost slots

**Example — search and format nicely:**
```bash
curl -s "https://api.dexscreener.com/latest/dex/search?q=WIF" | jq '
  .pairs[:5] | .[] | 
  "[\(.chainId)] \(.baseToken.symbol)/\(.quoteToken.symbol) | $\(.priceUsd) | 24h vol: $\(.volume.h24 // "N/A") | liq: $\(.liquidity.usd // "N/A") | \(.dexId)"
'
```

---

## 2. Get Token Pairs by Contract Address

Fetch all trading pairs for a specific token address on a specific chain.

```bash
# Solana token
curl -s "https://api.dexscreener.com/tokens/v1/solana/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" | jq '.[:3] | .[] | {dex: .dexId, pair: .pairAddress, price: .priceUsd, volume24h: .volume.h24}'

# Ethereum token (USDC)
curl -s "https://api.dexscreener.com/tokens/v1/ethereum/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" | jq '.[:3] | .[] | {dex: .dexId, price: .priceUsd}'
```

**URL format:** `https://api.dexscreener.com/tokens/v1/{chainId}/{tokenAddress}`

**Supported chains:** solana, ethereum, bsc, base, arbitrum, polygon, avalanche, fantom, cronos, and 70+ more.

**Response:** Array of pair objects (same structure as search results).

---

## 3. Get Specific Pair by Chain + Pair Address

Fetch details for a specific trading pair.

```bash
curl -s "https://api.dexscreener.com/latest/dex/pairs/solana/NbVgvj5fwR4N5HrrTgjcdFefkDdg2jRSTojsjdQuju2" | jq '.pairs[0] | {symbol: .baseToken.symbol, price: .priceUsd, volume24h: .volume.h24, liquidity: .liquidity.usd, priceChange24h: .priceChange.h24, buys24h: .txns.h24.buys, sells24h: .txns.h24.sells}'
```

**URL format:** `https://api.dexscreener.com/latest/dex/pairs/{chainId}/{pairAddress}`

---

## 4. Latest Boosted Tokens (Recently Promoted)

See tokens that have recently purchased promotional boosts on DexScreener. Good signal for tokens actively marketing.

```bash
curl -s "https://api.dexscreener.com/token-boosts/latest/v1" | jq '.[:5] | .[] | {chain: .chainId, token: .tokenAddress, description: .description, links: [.links[].url]}'
```

**Response fields:**
- `chainId` — chain
- `tokenAddress` — token contract
- `icon` — icon image key
- `header` — banner image URL
- `description` — token description
- `links` — array of `{type, label, url}` objects (website, twitter, telegram, etc.)

---

## 5. Top Boosted Tokens (Most Active Boosts)

Tokens currently with the most active boost slots — highest visibility on DexScreener.

```bash
curl -s "https://api.dexscreener.com/token-boosts/top/v1" | jq '.[:10] | .[] | {chain: .chainId, token: .tokenAddress, amount: .amount, totalAmount: .totalAmount}'
```

**Response includes:**
- `amount` — current active boost amount
- `totalAmount` — total boost amount ever purchased

---

## 6. Latest Token Profiles (New Listings with Metadata)

Tokens that have recently updated or created a DexScreener profile (icon, socials, description).

```bash
curl -s "https://api.dexscreener.com/token-profiles/latest/v1" | jq '.[:5] | .[] | {chain: .chainId, token: .tokenAddress, links: [.links[]?.url]}'
```

---

## 7. Combined Analysis — Full Token Report

Analyze a token by contract address with full data:

```bash
# Full token scan (replace CHAIN and ADDRESS)
CHAIN="solana"
ADDRESS="Ept8KWRvtHkAHQMS2SzVWUnhhh5q9x1zvHyrh5MGpump"

curl -s "https://api.dexscreener.com/tokens/v1/${CHAIN}/${ADDRESS}" | jq '
  . as $pairs |
  {
    token: $pairs[0].baseToken.name,
    symbol: $pairs[0].baseToken.symbol,
    price_usd: $pairs[0].priceUsd,
    market_cap: $pairs[0].marketCap,
    fdv: $pairs[0].fdv,
    liquidity_usd: $pairs[0].liquidity.usd,
    volume_24h: $pairs[0].volume.h24,
    price_change_1h: $pairs[0].priceChange.h1,
    price_change_24h: $pairs[0].priceChange.h24,
    buys_24h: $pairs[0].txns.h24.buys,
    sells_24h: $pairs[0].txns.h24.sells,
    pair_created: ($pairs[0].pairCreatedAt | todate),
    top_dex: $pairs[0].dexId,
    total_pairs: ($pairs | length),
    boosts_active: $pairs[0].boosts.active,
    dexscreener_url: $pairs[0].url
  }
'
```

---

## 8. New Pairs Quick Scan

Find the most recently created pairs for a token (watch for new launches):

```bash
# Get new pump.fun token pairs sorted by creation time
curl -s "https://api.dexscreener.com/token-profiles/latest/v1" | jq '
  .[:20] | .[] | 
  select(.chainId == "solana") |
  {chain: .chainId, token: .tokenAddress, url: .url}
'
```

---

## Usage Patterns

### When user asks: "Search for [TOKEN]"
```bash
TOKEN="BONK"
curl -s "https://api.dexscreener.com/latest/dex/search?q=${TOKEN}" | jq '
  .pairs | sort_by(-.volume.h24 // 0) | .[:5] | .[] |
  "[\(.chainId)/\(.dexId)] \(.baseToken.symbol) $\(.priceUsd) | Vol24h: $\(.volume.h24 // 0) | Liq: $\(.liquidity.usd // 0) | 24h%: \(.priceChange.h24 // 0)%"
'
```

### When user asks: "What's trending / boosted?"
```bash
curl -s "https://api.dexscreener.com/token-boosts/top/v1" | jq '
  .[:10] | .[] | "\(.chainId) — \(.tokenAddress) (boost: \(.amount))"
'
```

### When user pastes a contract address:
```bash
ADDRESS="<paste_address>"
CHAIN="solana"  # or ethereum, bsc, base, etc.
curl -s "https://api.dexscreener.com/tokens/v1/${CHAIN}/${ADDRESS}" | jq '.[0] | {symbol: .baseToken.symbol, price: .priceUsd, liq: .liquidity.usd, vol24h: .volume.h24, mcap: .marketCap, change24h: .priceChange.h24}'
```

---

## Error Handling

- **Empty pairs array**: Token not found on DexScreener, or no DEX pairs yet
- **null priceUsd**: Very new token, price not yet indexed
- **Rate limit (429)**: Slow down — wait 10s and retry
- **jq errors**: Pipe through `jq '.'` first to inspect raw response

## Edge Cases

- Some tokens have dozens of pairs across multiple DEXes — always sort by volume descending
- `marketCap` may be null if token supply info isn't available (use `fdv` instead)
- `boosts.active` = 0 means no active promotion (not necessarily bad)
- Pump.fun tokens on Solana have addresses ending in `pump`
- For very new tokens, liquidity may show $0 until properly indexed

## Notes

- All prices are real-time (updated every few seconds)
- Volume/change data is rolling windows, not calendar day
- DexScreener covers 80+ chains — always specify chain when querying by address
- Free tier: no API key needed, ~300 requests/min general limit
