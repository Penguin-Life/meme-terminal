---
name: gecko-terminal
version: 1.0.0
description: Query GeckoTerminal for multi-chain DEX data — trending pools, new pools, token info, OHLCV candlestick data, and pool search. Free API, no key required.
author: meme-terminal
tags: [crypto, dex, trading, ohlcv, solana, eth, bsc, base, multi-chain]
---

# GeckoTerminal Skill

GeckoTerminal (by CoinGecko) provides on-chain DEX data across 100+ networks. Best for: OHLCV candlestick data, multi-chain trending pools, new pool discovery, and detailed token/pool analysis.

## Base URL
```
https://api.geckoterminal.com/api/v2
```

**Free tier**: No API key required. Rate limit ~30 requests/minute.  
**Header required**: `Accept: application/json`

---

## 1. List Supported Networks

```bash
curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks?page=1" | jq '.data[:20] | .[] | {id: .id, name: .attributes.name}'
```

**Common network IDs:**
- `solana` — Solana
- `eth` — Ethereum
- `bsc` — BNB Chain
- `base` — Base (Coinbase L2)
- `arbitrum` — Arbitrum One
- `polygon_pos` — Polygon
- `avalanche` — Avalanche
- `sui-network` — Sui
- `ton` — TON

---

## 2. Trending Pools by Network

Get the hottest trading pools on a specific network right now.

```bash
NETWORK="solana"
curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks/${NETWORK}/trending_pools?page=1" | jq '
  .data[:10] | .[] | {
    pool: .attributes.name,
    address: (.id | split("_")[1]),
    price_usd: .attributes.base_token_price_usd,
    volume_24h: .attributes.volume_usd.h24,
    price_change_24h: .attributes.price_change_percentage.h24,
    liquidity_usd: .attributes.reserve_in_usd,
    fdv: .attributes.fdv_usd,
    market_cap: .attributes.market_cap_usd,
    created_at: .attributes.pool_created_at,
    tx_24h: .attributes.transactions.h24.buys
  }
'
```

**Parameters:**
- `page` — page number (1-10)

**Response attributes:**
- `name` — pool name (e.g., "PIZZA / SOL")
- `base_token_price_usd` — price of base token in USD
- `base_token_price_native_currency` — price in native token (SOL, ETH, etc.)
- `quote_token_price_usd` — price of quote token
- `volume_usd.h1/h6/h24` — volume in USD for time windows
- `price_change_percentage.m5/h1/h6/h24` — price change %
- `reserve_in_usd` — total liquidity (TVL)
- `fdv_usd` — fully diluted valuation
- `market_cap_usd` — market cap (may be null)
- `transactions.h24.buys/sells` — 24h transaction counts
- `pool_created_at` — ISO 8601 timestamp

---

## 3. New Pools by Network

Discover freshly created trading pools — catch launches early.

```bash
NETWORK="solana"
curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks/${NETWORK}/new_pools?page=1" | jq '
  .data[:10] | .[] | {
    pool: .attributes.name,
    address: (.id | split("_")[1]),
    price_usd: .attributes.base_token_price_usd,
    liquidity_usd: .attributes.reserve_in_usd,
    volume_1h: .attributes.volume_usd.h1,
    price_change_1h: .attributes.price_change_percentage.h1,
    created_at: .attributes.pool_created_at,
    dex: .relationships.dex.data.id
  }
'
```

---

## 4. Search Pools by Token

Search for pools trading a specific token across all networks or a specific one.

```bash
# Search across all networks
QUERY="pepe"
curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/search/pools?query=${QUERY}&page=1" | jq '
  .data[:5] | .[] | {
    pool: .attributes.name,
    network: (.id | split("_")[0]),
    price_usd: .attributes.base_token_price_usd,
    volume_24h: .attributes.volume_usd.h24,
    liquidity_usd: .attributes.reserve_in_usd
  }
'

# Search on specific network
curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/search/pools?query=bonk&network=solana&page=1" | jq '.data[:5] | .[] | {pool: .attributes.name, price: .attributes.base_token_price_usd, liq: .attributes.reserve_in_usd}'
```

**Parameters:**
- `query` — token name, symbol, or address
- `network` — (optional) filter by network ID
- `page` — page number

---

## 5. Token Info by Address

Get detailed token information including price, market data, and security info.

```bash
NETWORK="solana"
TOKEN_ADDRESS="So11111111111111111111111111111111111111112"

curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks/${NETWORK}/tokens/${TOKEN_ADDRESS}" | jq '
  .data.attributes | {
    name: .name,
    symbol: .symbol,
    address: .address,
    decimals: .decimals,
    price_usd: .price_usd,
    fdv_usd: .fdv_usd,
    market_cap_usd: .market_cap_usd,
    total_supply: .normalized_total_supply,
    coingecko_id: .coingecko_coin_id,
    image: .image_url,
    volume_24h: .volume_usd.h24
  }
'
```

---

## 6. All Pools for a Token

Find every DEX pool trading a specific token (useful for finding best liquidity):

```bash
NETWORK="solana"
TOKEN_ADDRESS="So11111111111111111111111111111111111111112"

curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks/${NETWORK}/tokens/${TOKEN_ADDRESS}/pools?page=1" | jq '
  .data[:5] | .[] | {
    pool_name: .attributes.name,
    pool_address: (.id | split("_")[1]),
    dex: .relationships.dex.data.id,
    price_usd: .attributes.base_token_price_usd,
    liquidity_usd: .attributes.reserve_in_usd,
    volume_24h: .attributes.volume_usd.h24
  }
'
```

---

## 7. OHLCV Candlestick Data

Get candlestick data for a pool — perfect for charting or technical analysis.

```bash
NETWORK="solana"
POOL_ADDRESS="NbVgvj5fwR4N5HrrTgjcdFefkDdg2jRSTojsjdQuju2"

# 5-minute candles (last 50)
curl -s -H "Accept: application/json" \
  "https://api.geckoterminal.com/api/v2/networks/${NETWORK}/pools/${POOL_ADDRESS}/ohlcv/minute?aggregate=5&limit=50&currency=usd" | jq '
  .data.attributes.ohlcv_list | .[-10:] | .[] | 
  {
    time: (.[0] | todate),
    open: .[1],
    high: .[2],
    low: .[3],
    close: .[4],
    volume: .[5]
  }
'
```

**Timeframe options:**
- `/ohlcv/minute` — minute candles (`aggregate`: 1, 5, 15)
- `/ohlcv/hour` — hour candles (`aggregate`: 1, 4, 12)
- `/ohlcv/day` — day candles (`aggregate`: 1)

**Parameters:**
- `aggregate` — candle aggregation (e.g., 5 for 5-min candles)
- `limit` — number of candles (max 1000)
- `currency` — `usd` or `token` (native currency)
- `before_timestamp` — Unix timestamp to paginate backwards

**OHLCV array format:** `[timestamp, open, high, low, close, volume]`

**Example — detect pump (recent high vs current price):**
```bash
NETWORK="solana"
POOL="NbVgvj5fwR4N5HrrTgjcdFefkDdg2jRSTojsjdQuju2"
curl -s -H "Accept: application/json" \
  "https://api.geckoterminal.com/api/v2/networks/${NETWORK}/pools/${POOL}/ohlcv/hour?aggregate=1&limit=24&currency=usd" | jq '
  .data.attributes.ohlcv_list as $candles |
  {
    latest_close: ($candles[-1][4]),
    open_24h: ($candles[0][1]),
    high_24h: ($candles | map(.[2]) | max),
    low_24h: ($candles | map(.[3]) | min),
    volume_24h: ($candles | map(.[5]) | add),
    change_24h_pct: ((($candles[-1][4] - $candles[0][1]) / $candles[0][1] * 100) | round)
  }
'
```

---

## 8. Specific Pool Details

Get full details for a known pool address:

```bash
NETWORK="solana"
POOL="NbVgvj5fwR4N5HrrTgjcdFefkDdg2jRSTojsjdQuju2"

curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks/${NETWORK}/pools/${POOL}" | jq '
  .data.attributes | {
    name: .name,
    price_usd: .base_token_price_usd,
    liquidity_usd: .reserve_in_usd,
    fdv: .fdv_usd,
    market_cap: .market_cap_usd,
    volume_1h: .volume_usd.h1,
    volume_6h: .volume_usd.h6,
    volume_24h: .volume_usd.h24,
    price_change_5m: .price_change_percentage.m5,
    price_change_1h: .price_change_percentage.h1,
    price_change_24h: .price_change_percentage.h24,
    buys_24h: .transactions.h24.buys,
    sells_24h: .transactions.h24.sells,
    created_at: .pool_created_at
  }
'
```

---

## 9. Multi-chain Trending Overview

Get trending pools across multiple chains at once:

```bash
for NETWORK in solana eth bsc base; do
  echo "=== $NETWORK ==="
  curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks/${NETWORK}/trending_pools?page=1" | jq '
    .data[:3] | .[] | "  \(.attributes.name) | $\(.attributes.base_token_price_usd | tonumber | . * 100000 | round / 100000) | 24h vol: $\(.attributes.volume_usd.h24) | \(.attributes.price_change_percentage.h24)%"
  '
  sleep 2  # respect rate limits
done
```

---

## Usage Patterns

### When user asks: "What's trending on Solana / ETH / BSC?"
```bash
NETWORK="solana"  # or eth, bsc, base
curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks/${NETWORK}/trending_pools" | jq '
  .data[:10] | .[] | "\(.attributes.name) | $\(.attributes.base_token_price_usd) | 📈 \(.attributes.price_change_percentage.h24)% | 💧 $\(.attributes.reserve_in_usd) liq"
'
```

### When user asks: "Show me the chart / price history for [POOL]"
```bash
# First find the pool address via search or DexScreener
# Then get OHLCV:
curl -s -H "Accept: application/json" \
  "https://api.geckoterminal.com/api/v2/networks/solana/pools/${POOL}/ohlcv/hour?aggregate=1&limit=24&currency=usd" | jq '
  .data.attributes.ohlcv_list | .[] | {time: (.[0] | todate), o: .[1], h: .[2], l: .[3], c: .[4], vol: .[5]}
'
```

### When user provides a token address and wants market data:
```bash
curl -s -H "Accept: application/json" "https://api.geckoterminal.com/api/v2/networks/solana/tokens/${ADDRESS}" | jq '.data.attributes | {name, symbol, price_usd, fdv_usd, market_cap_usd}'
```

---

## Error Handling

- **429 Too Many Requests**: Hit rate limit — wait 60s, then retry. Add `sleep 2` between chain loops.
- **404**: Pool or token not found on this network — try searching instead
- **null values**: Some fields (market_cap, fdv) may be null for very new tokens — use `// "N/A"` in jq
- **Empty data array**: No results match — try different network or query

## Edge Cases

- GeckoTerminal uses network-specific pool IDs: `{network}_{pool_address}` (e.g., `solana_ABC123...`)
- Some networks have different rate limits than others
- OHLCV returns newest candles last — use `.[-1]` for latest, `.[0]` for oldest
- The `new_pools` endpoint for `/networks/new_pools` (all networks) has stricter rate limits — prefer per-network endpoint
- Prices may lag by 10-30 seconds vs real-time DEX feeds
- Pool addresses on Solana are base58, on EVM chains are 0x hex

## Notes

- GeckoTerminal supports 100+ networks — always check `/networks` for the correct ID
- OHLCV data goes back up to 6 months
- Best for: charting, technical analysis, cross-chain comparison
- Complement with DexScreener skill for real-time prices and DexScreener's boost/trending data
- Token security analysis: use binance-query-token-audit skill alongside this
