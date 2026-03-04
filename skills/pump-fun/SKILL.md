---
name: pump-fun
version: 1.0.0
description: Monitor Pump.fun Solana meme token launches. Get new coins, bonding curve status, king of the hill, trades, and search. Free API, no key required.
author: meme-terminal
tags: [crypto, solana, meme, pumpfun, launch, bonding-curve]
---

# Pump.fun Skill

Pump.fun is the #1 Solana meme token launchpad. Every token starts on a bonding curve — when market cap reaches ~$69k, it graduates to Raydium/PumpSwap. This skill lets you monitor new launches, track bonding curve progress, find the King of the Hill, and analyze any token.

## Base URL
```
https://frontend-api-v3.pump.fun
```

No API key required. Free and public.

---

## 1. Get New Coin Launches

Fetch the most recently created tokens on Pump.fun, sorted by creation time.

```bash
curl -s "https://frontend-api-v3.pump.fun/coins?offset=0&limit=20&sort=created_timestamp&order=DESC&includeNsfw=false" | jq '.[] | {
  name: .name,
  symbol: .symbol,
  mint: .mint,
  description: .description,
  market_cap: .usd_market_cap,
  created: (.created_timestamp | todate),
  bonding_curve_pct: ((.virtual_sol_reserves // 0) / 793100000 * 100 | round),
  replies: .reply_count,
  twitter: .twitter,
  website: .website,
  image: .image_uri
}'
```

**Parameters:**
- `offset` — pagination offset (0, 20, 40...)
- `limit` — results per page (max 50)
- `sort` — `created_timestamp` | `last_trade_timestamp` | `usd_market_cap` | `reply_count`
- `order` — `DESC` | `ASC`
- `includeNsfw` — `false` to filter NSFW content

**Key response fields:**
- `mint` — Solana token address (contract address)
- `name` — token name
- `symbol` — ticker symbol
- `description` — token description/pitch
- `usd_market_cap` — current market cap in USD
- `virtual_sol_reserves` — SOL in bonding curve (used to calculate progress)
- `virtual_token_reserves` — tokens remaining in bonding curve
- `bonding_curve` — bonding curve program address
- `associated_bonding_curve` — ATA for the bonding curve
- `complete` — `true` if graduated to Raydium
- `raydium_pool` — Raydium pool address (if graduated)
- `created_timestamp` — Unix ms timestamp
- `last_trade_timestamp` — when last trade happened
- `reply_count` — community engagement (replies on Pump.fun)
- `twitter` / `website` / `telegram` — social links
- `image_uri` — token image (IPFS)
- `king_of_the_hill_timestamp` — when it became king (if ever)

---

## 2. Bonding Curve Progress

Pump.fun tokens graduate when they accumulate ~85 SOL in the bonding curve (roughly $69k market cap). Calculate progress:

```bash
MINT="<token_mint_address>"
curl -s "https://frontend-api-v3.pump.fun/coins/${MINT}" | jq '
  . as $c |
  {
    name: .name,
    symbol: .symbol,
    market_cap_usd: .usd_market_cap,
    graduated: .complete,
    raydium_pool: .raydium_pool,
    reply_count: .reply_count,
    twitter: .twitter,
    website: .website,
    description: .description,
    created: (.created_timestamp | todate),
    last_trade: (.last_trade_timestamp | todate),
    image: .image_uri
  }
'
```

**Graduation logic:**
- `complete: false` + no `raydium_pool` → Still on bonding curve
- `complete: true` + has `raydium_pool` → Graduated to Raydium DEX
- Market cap ~$69k = graduation threshold (can vary with SOL price)

---

## 3. Get Coin Details

Fetch full details for a specific token by mint address:

```bash
MINT="BqwmfPaMhTUksoa8XDDQ8y2CvPddwGAJyzLGvqDepump"
curl -s "https://frontend-api-v3.pump.fun/coins/${MINT}" | jq '{
  name: .name,
  symbol: .symbol,
  mint: .mint,
  market_cap: .usd_market_cap,
  description: .description,
  graduated: .complete,
  raydium_pool: .raydium_pool,
  replies: .reply_count,
  creator: .creator,
  twitter: .twitter,
  telegram: .telegram,
  website: .website,
  created: (.created_timestamp | todate)
}'
```

---

## 4. Search Tokens

Search Pump.fun by name, symbol, or description:

```bash
QUERY="pepe"
curl -s "https://frontend-api-v3.pump.fun/coins?searchTerm=${QUERY}&limit=10&sort=usd_market_cap&order=DESC" | jq '.[] | {
  name: .name,
  symbol: .symbol,
  mint: .mint,
  market_cap: .usd_market_cap,
  graduated: .complete,
  replies: .reply_count
}'
```

---

## 5. Hot Coins by Market Cap

Find Pump.fun tokens ranked by market cap (best performing):

```bash
curl -s "https://frontend-api-v3.pump.fun/coins?offset=0&limit=20&sort=usd_market_cap&order=DESC&includeNsfw=false" | jq '.[] | {
  rank: (input_line_number),
  name: .name,
  symbol: .symbol,
  mint: .mint,
  market_cap: (.usd_market_cap | floor),
  graduated: .complete,
  replies: .reply_count,
  created: (.created_timestamp | todate)
}'
```

---

## 6. Hot by Social Activity (Reply Count)

Find the most discussed tokens — community activity often signals momentum:

```bash
curl -s "https://frontend-api-v3.pump.fun/coins?offset=0&limit=20&sort=reply_count&order=DESC&includeNsfw=false" | jq '.[:10] | .[] | {
  name: .name,
  symbol: .symbol,
  mint: .mint,
  market_cap: .usd_market_cap,
  replies: .reply_count,
  graduated: .complete
}'
```

---

## 7. Recently Traded (Active)

Tokens with the most recent trading activity — where the action is right now:

```bash
curl -s "https://frontend-api-v3.pump.fun/coins?offset=0&limit=20&sort=last_trade_timestamp&order=DESC&includeNsfw=false" | jq '.[:10] | .[] | {
  name: .name,
  symbol: .symbol,
  mint: .mint,
  market_cap: .usd_market_cap,
  last_trade: (.last_trade_timestamp | todate),
  graduated: .complete
}'
```

---

## 8. New Launches Radar — Combined View

Full new launch scanner with all key metrics:

```bash
curl -s "https://frontend-api-v3.pump.fun/coins?offset=0&limit=20&sort=created_timestamp&order=DESC&includeNsfw=false" | jq '
  .[] | 
  "🚀 \(.name) (\(.symbol)) | $\(.usd_market_cap // 0 | floor) mcap | replies: \(.reply_count) | grad: \(.complete) | \(.created_timestamp | todate | split("T")[0]) | \(.mint)"
'
```

---

## 9. Check if Token Graduated

Quick check for graduation status:

```bash
MINT="<token_mint_address>"
STATUS=$(curl -s "https://frontend-api-v3.pump.fun/coins/${MINT}" | jq -r 'if .complete then "✅ GRADUATED → Raydium: \(.raydium_pool)" else "⏳ Still on bonding curve | mcap: $\(.usd_market_cap // 0 | floor)" end')
echo "$STATUS"
```

---

## Usage Patterns

### When user asks: "What's new on Pump.fun?"
```bash
curl -s "https://frontend-api-v3.pump.fun/coins?offset=0&limit=10&sort=created_timestamp&order=DESC&includeNsfw=false" | jq '
  .[] | 
  "[\(.symbol)] \(.name) | $\(.usd_market_cap // 0 | floor) | 💬 \(.reply_count) | \(if .complete then "🎓 Graduated" else "🔵 Bonding" end)"
'
```

### When user asks: "Check this pump.fun token [ADDRESS]"
```bash
MINT="<address>"
curl -s "https://frontend-api-v3.pump.fun/coins/${MINT}" | jq '{
  name: .name,
  symbol: .symbol,
  market_cap_usd: .usd_market_cap,
  graduated: .complete,
  raydium_pool: .raydium_pool,
  description: .description,
  replies: .reply_count,
  creator: .creator,
  socials: {twitter: .twitter, telegram: .telegram, website: .website},
  created: (.created_timestamp | todate)
}'
```

### When user asks: "Find pump.fun tokens about [TOPIC]"
```bash
QUERY="<topic>"
curl -s "https://frontend-api-v3.pump.fun/coins?searchTerm=${QUERY}&limit=10&sort=usd_market_cap&order=DESC" | jq '
  .[:5] | .[] | "[\(.symbol)] \(.name) | $\(.usd_market_cap // 0 | floor) | 💬 \(.reply_count)"
'
```

---

## Key Metrics to Watch

| Metric | Signal |
|--------|--------|
| `usd_market_cap` > $10k | Token has real traction |
| `reply_count` > 50 | Community is engaged |
| `complete: true` | Graduated — now on Raydium |
| `twitter` + `website` present | Team is marketing |
| `last_trade_timestamp` recent | Active trading happening |
| Created < 30 min ago | Very fresh — high risk/reward |

---

## Error Handling

- **Empty array `[]`**: No tokens match the search query
- **`null` market cap**: Token just launched, no trades yet — check `usd_market_cap` with `// 0`
- **404 response**: Mint address not found on Pump.fun (may be on another platform)
- **Connection refused**: API temporarily down — retry after 30s
- **NSFW content**: Add `&includeNsfw=false` to filter

## Edge Cases

- Tokens can graduate and then have their Raydium pool abandoned — always cross-check with DexScreener
- `reply_count` can be gamed — look for organic discussion quality
- Market cap uses live SOL price — can fluctuate significantly
- Very new tokens (< 5 min) may not have `usd_market_cap` populated yet
- Some tokens have the same name/symbol — always use `mint` address as unique ID
- Pump.fun addresses end in `pump` suffix (e.g., `...MGpump`)

## Notes

- Pump.fun creates ~10,000+ new tokens per day — most fail quickly
- "King of the Hill" = token with most momentum on the bonding curve (not yet graduated)
- Graduation threshold: ~$69k market cap (historically), may change
- After graduation: token trades on PumpSwap or Raydium, track via DexScreener skill
- Risk: 95%+ of pump.fun tokens go to zero — use meme-radar skill for combined analysis
