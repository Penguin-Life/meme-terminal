# 📡 API Reference

**Base URL:** `http://localhost:3902/api`

All responses follow the format:
```json
{ "success": true, "data": ... }
// or on error:
{ "success": false, "error": { "message": "...", "code": "ERROR_CODE" } }
```

---

## Rate Limits

| Endpoint Group | Limit | Window |
|----------------|-------|--------|
| `/api/token/*`, `/api/wallet/*` | 60 req | per minute |
| `/api/analyze/*` | 20 req | per minute |
| `/api/alerts/*` | 30 req | per minute |
| `/api/notify/*` | 10 req | per minute |
| All other `/api/*` | 100 req | per minute |

On limit exceeded, response is:
```json
HTTP 429 Too Many Requests
Retry-After: 60
{
  "success": false,
  "error": {
    "message": "Too many requests...",
    "code": "RATE_LIMIT_EXCEEDED",
    "details": { "limit": 60, "retryAfterSeconds": 60 }
  }
}
```

---

## Health & System

### GET /api/health
Check server status.

**Response:**
```json
{
  "success": true,
  "service": "meme-terminal-backend",
  "version": "1.0.0",
  "status": "healthy",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### GET /api/cache/stats
View cache performance metrics.

**Response:**
```json
{
  "success": true,
  "cache": {
    "size": 42,
    "activeEntries": 38,
    "hits": 1250,
    "misses": 87,
    "hitRate": "93.5%",
    "entries": [
      { "key": "dex:search:bonk", "ttlRemaining": 45000, "ageMs": 15000 }
    ]
  }
}
```

---

## Token Endpoints

### GET /api/token/search

Search tokens across DexScreener and GeckoTerminal.

**Query params:**
- `q` (required): Token name, symbol, or address

**Example:**
```bash
curl "http://localhost:3902/api/token/search?q=BONK"
```

**Response:**
```json
{
  "success": true,
  "query": "BONK",
  "count": 15,
  "results": [
    {
      "token": {
        "name": "Bonk",
        "symbol": "BONK",
        "address": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
        "chain": "solana",
        "image": "https://..."
      },
      "market": {
        "price": 0.00002345,
        "marketCap": 1500000,
        "volume24h": 45000000,
        "liquidity": 2300000,
        "priceChange": { "5m": 0.5, "1h": 2.3, "6h": -1.1, "24h": 5.7 }
      },
      "social": { "websites": [], "twitter": "https://twitter.com/...", "telegram": null },
      "meta": { "pairAddress": "0x...", "dexId": "raydium", "source": "dexscreener" }
    }
  ]
}
```

---

### GET /api/token/trending

Get trending tokens. Uses GeckoTerminal trending pools + DexScreener boosted.

**Query params:**
- `chain` (optional): `solana` (default) | `ethereum` | `bsc` | `base` | `arbitrum`

**Example:**
```bash
curl "http://localhost:3902/api/token/trending?chain=solana"
```

---

### GET /api/token/new

Get newly launched tokens.

**Query params:**
- `chain`: default `solana`
- `limit`: default `20`, max `50`

**Example:**
```bash
curl "http://localhost:3902/api/token/new?chain=solana&limit=20"
```

---

### GET /api/token/:chain/:address

Get full token data for a specific address.

**Example:**
```bash
curl "http://localhost:3902/api/token/solana/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
```

**Response includes:** DexScreener + GeckoTerminal + Pump.fun data merged.

---

## Wallet Endpoints

### GET /api/wallet/watchlist

List all tracked wallets.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "wallets": [
    {
      "address": "5YNmS...",
      "chain": "solana",
      "label": "Whale Wallet",
      "notes": "Big meme trader",
      "addedAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST /api/wallet/watchlist

Add a wallet to track.

**Body:**
```json
{
  "address": "5YNmS...",
  "chain": "solana",
  "label": "My Whale",
  "notes": "Watch for early entries"
}
```

---

### DELETE /api/wallet/watchlist/:address

Remove a wallet from tracking.

**Query params:**
- `chain` (optional): filter by chain

---

### GET /api/wallet/:chain/:address

Get wallet portfolio.

**Example:**
```bash
curl "http://localhost:3902/api/wallet/solana/5YNmS..."
```

**Response (Solana):**
```json
{
  "success": true,
  "chain": "solana",
  "address": "5YNmS...",
  "portfolio": {
    "address": "5YNmS...",
    "chain": "solana",
    "nativeBalance": 12.5,
    "nativeValueUsd": 2500,
    "tokens": [
      {
        "mint": "DezXAZ...",
        "balance": 1000000,
        "decimals": 5,
        "symbol": "BONK",
        "priceUsd": 0.00002,
        "valueUsd": 20
      }
    ],
    "tokenCount": 15,
    "totalValueUsd": 3200,
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

---

### GET /api/wallet/:chain/:address/trades

Get recent transactions.

**Query params:**
- `limit`: default `20`

---

## Alert Endpoints

### GET /api/alerts

List all alert rules.

### POST /api/alerts

Create a new alert.

**Body:**
```json
{
  "type": "price_above",
  "target": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  "chain": "solana",
  "threshold": 0.00005,
  "label": "BONK moon alert",
  "enabled": true,
  "notifyOnTrigger": true
}
```

**Valid types:** `price_above` | `price_below` | `new_buy` | `large_tx` | `new_listing`

### PATCH /api/alerts/:id

Update an alert (toggle enabled, change threshold, etc.)

### DELETE /api/alerts/:id

Delete an alert.

### POST /api/alerts/check

Manually trigger alert evaluation for all enabled alerts.

---

## Analysis Endpoints

### POST /api/analyze/token

Full token analysis report.

**Body:**
```json
{
  "query": "BONK",
  "chain": "solana"
}
```

**Response:**
```json
{
  "success": true,
  "report": {
    "query": "BONK",
    "chain": "solana",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "summary": "...",
    "token": { ... },
    "market": { ... },
    "signals": { ... },
    "verdict": { "score": 72, "rating": "MODERATE_BUY", "risks": [...] }
  }
}
```

---

### POST /api/analyze/wallet

Wallet analysis report.

**Body:**
```json
{
  "address": "5YNmS...",
  "chain": "solana"
}
```

---

### POST /api/analyze/market

Market-wide analysis (trending + new launches + signals).

**No body required.**

---

## Notify Endpoints

### GET /api/notify/status

Check Telegram bot configuration status.

### POST /api/notify/telegram

Send a message to Telegram.

**Body:**
```json
{
  "message": "🔔 BONK just hit $0.00005!",
  "chatId": "optional-override-chat-id"
}
```

### POST /api/notify/test

Send a test notification to verify setup.

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `MISSING_QUERY` | 400 | Required query param missing |
| `INVALID_CHAIN` | 400 | Chain not in allowed list |
| `INVALID_ADDRESS` | 400 | Address format invalid |
| `INVALID_ALERT_TYPE` | 400 | Alert type not recognized |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `TOKEN_NOT_FOUND` | 404 | Token not found on any source |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `NO_API_KEYS` | 403 | Binance API key not configured |
| `INVALID_INPUT` | 400 | Missing or invalid trade params |
| `TRADE_ERROR` | 500 | Binance order placement failed |
| `AUDIT_FAILED` | 200 | Token audit blocked the trade |

---

## New Endpoints (v1.3.0)

### Trading

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/trade/buy` | API Key | Place buy order |
| POST | `/api/trade/sell` | API Key | Place sell order |
| GET | `/api/trade/orders` | API Key | List open orders |
| GET | `/api/trade/balance` | API Key | Account balances |
| POST | `/api/trade/safe-buy` | API Key | Audit → Signal → Buy |

### Signals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/signals` | Smart money signals |
| GET | `/api/signals/subscribe` | SSE signal stream |
| POST | `/api/signals/filter` | Filter by chain/type/gain |

### Streaming

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stream/prices` | SSE real-time prices |
| GET | `/api/stream/status` | WebSocket status |

### K-Line

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/token/:chain/:address/kline` | OHLCV candlestick data |
