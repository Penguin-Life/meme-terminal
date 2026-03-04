# Meme Terminal Skill

**Description:** Personal memecoin trading terminal with token scanning, wallet tracking, and alerts

This skill connects OpenClaw (AI Brain) to the Meme Terminal backend API running at `http://localhost:3902`.
Use it to analyze tokens, track wallets, manage alerts, and get full market analysis — all from natural language.

---

## Setup

Make sure the backend is running:
```bash
cd ~/path/to/meme-terminal/backend
node server.js
# or: pm2 start ecosystem.config.js
```

Health check:
```bash
curl http://localhost:3902/api/health
```

---

## Natural Language → API Mapping

| User Says | Action | API Call |
|-----------|--------|----------|
| "查一下 $PEPE" / "analyze PEPE" | Token search + data | `GET /api/token/search?q=PEPE` |
| "分析这个合约 0xABC..." / "check this address" | Token detail by address | `GET /api/token/solana/0xABC...` |
| "什么币在涨" / "trending tokens" | Trending list | `GET /api/token/trending` |
| "新币" / "new listings" / "latest launches" | New pairs | `GET /api/token/new` |
| "追踪这个钱包 ADDRESS" / "watch wallet" | Add to watchlist | `POST /api/wallet/watchlist` |
| "我的监控列表" / "my watchlist" | View watchlist | `GET /api/wallet/watchlist` |
| "设置价格提醒" / "set alert" | Create alert | `POST /api/alerts` |
| "检查提醒" / "check alerts" | Run alert check | `GET /api/alerts/check` |
| "深度分析 TOKEN" / "deep analyze" | Full analysis pipeline | `POST /api/analyze/token` |
| "分析这个钱包" / "wallet analysis" | Wallet intelligence | `POST /api/analyze/wallet` |
| "市场概况" / "market overview" | Market snapshot | `POST /api/analyze/market` |
| "发通知" / "send test notification" | Test Telegram notify | `POST /api/notify/test` |

---

## API Endpoints Reference

### Health

```bash
curl http://localhost:3902/api/health
```

---

### Token Endpoints

#### Search tokens
```bash
curl "http://localhost:3902/api/token/search?q=PEPE"
curl "http://localhost:3902/api/token/search?q=bonk&limit=5"
```

#### Get token by chain + address
```bash
curl "http://localhost:3902/api/token/solana/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
curl "http://localhost:3902/api/token/eth/0x6982508145454Ce325dDbE47a25d4ec3d2311933"
```

#### Trending tokens
```bash
curl "http://localhost:3902/api/token/trending"
curl "http://localhost:3902/api/token/trending?chain=solana"
```

#### New token listings
```bash
curl "http://localhost:3902/api/token/new"
curl "http://localhost:3902/api/token/new?chain=solana&limit=20"
```

---

### Wallet Endpoints

#### Get watchlist
```bash
curl "http://localhost:3902/api/wallet/watchlist"
```

#### Add wallet to watchlist
```bash
curl -X POST http://localhost:3902/api/wallet/watchlist \
  -H "Content-Type: application/json" \
  -d '{"address": "WALLET_ADDRESS", "chain": "solana", "label": "Smart Money Whale"}'
```

#### Analyze a wallet
```bash
curl "http://localhost:3902/api/wallet/solana/WALLET_ADDRESS"
```

#### Remove from watchlist
```bash
curl -X DELETE http://localhost:3902/api/wallet/watchlist/WALLET_ADDRESS
```

---

### Alert Endpoints

#### List all alerts
```bash
curl "http://localhost:3902/api/alerts"
```

#### Create price alert
```bash
curl -X POST http://localhost:3902/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "type": "price_above",
    "target": "TOKEN_ADDRESS",
    "chain": "solana",
    "threshold": 0.05,
    "label": "PEPE moon alert",
    "notifyOnTrigger": true
  }'
```

Alert types: `price_above`, `price_below`, `new_buy`, `large_tx`, `new_listing`

#### Check alerts (run evaluation)
```bash
curl "http://localhost:3902/api/alerts/check"
```

#### Update alert
```bash
curl -X PATCH http://localhost:3902/api/alerts/ALERT_ID \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

#### Delete alert
```bash
curl -X DELETE http://localhost:3902/api/alerts/ALERT_ID
```

---

### Analyze Endpoints (Deep Analysis Pipeline)

#### Full token analysis
```bash
curl -X POST http://localhost:3902/api/analyze/token \
  -H "Content-Type: application/json" \
  -d '{"query": "PEPE", "chain": "solana"}'
```

Returns: market data, security score, risk verdict (🟢 GO / 🟡 WATCH / 🔴 AVOID)

#### Full wallet analysis
```bash
curl -X POST http://localhost:3902/api/analyze/wallet \
  -H "Content-Type: application/json" \
  -d '{"address": "WALLET_ADDRESS", "chain": "solana"}'
```

Returns: portfolio value, top holdings, recent activity, PnL estimate

#### Market overview
```bash
curl -X POST http://localhost:3902/api/analyze/market \
  -H "Content-Type: application/json" \
  -d '{}'
```

Returns: trending, gainers/losers, new launches, market sentiment

---

### Notify Endpoints

#### Check notification status
```bash
curl "http://localhost:3902/api/notify/status"
```

#### Send test notification
```bash
curl -X POST http://localhost:3902/api/notify/test
```

#### Send token report to Telegram
```bash
curl -X POST http://localhost:3902/api/notify/token-report \
  -H "Content-Type: application/json" \
  -d '{"tokenData": {"symbol": "PEPE", "priceUsd": "0.000012", "priceChange": {"h24": 45.5}}}'
```

#### Send alert notification
```bash
curl -X POST http://localhost:3902/api/notify/alert \
  -H "Content-Type: application/json" \
  -d '{"alert": {"label": "PEPE moon alert", "type": "price_above", "currentValue": 0.000015, "details": "Price hit threshold!"}}'
```

---

## Response Interpretation Guide

### Token Search Response
```json
{
  "success": true,
  "query": "PEPE",
  "count": 5,
  "pairs": [
    {
      "chainId": "solana",
      "pairAddress": "...",
      "baseToken": { "symbol": "PEPE", "name": "Pepe" },
      "priceUsd": "0.000012",
      "priceChange": { "h1": 5.2, "h24": 45.5, "d7": 120.3 },
      "volume": { "h1": 50000, "h24": 2000000 },
      "liquidity": { "usd": 500000 },
      "fdv": 12000000,
      "txns": { "h1": { "buys": 230, "sells": 89 } }
    }
  ]
}
```

**AI Interpretation:**
- `priceChange.h24 > 100%` → 🚀 Pumping hard — check if sustainable
- `liquidity.usd < 50000` → ⚠️ Low liquidity, high slippage risk
- `txns.h1.buys >> sells` → Buying pressure, bullish signal
- `volume.h24 > fdv * 0.5` → Very high volume relative to market cap (potential manipulation)

### Alert Check Response
```json
{
  "success": true,
  "checkedAt": "2026-03-05T04:00:00Z",
  "total": 3,
  "triggered": [
    {
      "id": "abc-123",
      "label": "PEPE moon alert",
      "type": "price_above",
      "currentValue": 0.000015,
      "details": "Price $0.000015 is above threshold $0.000012"
    }
  ]
}
```

**AI Interpretation:**
- `triggered.length > 0` → 🔔 Alert(s) fired! Report each one
- `triggered.length === 0` → ✅ All quiet, no alerts triggered
- Include `details` field in user report — it has human-readable explanation

### Analyze Token Response
```json
{
  "success": true,
  "report": {
    "token": { "symbol": "PEPE", "name": "Pepe" },
    "market": { "priceUsd": "0.000012", "volume24h": 2000000, "liquidity": 500000, "fdv": 12000000 },
    "riskScore": 72,
    "verdict": "🟢 GO",
    "reasoning": "Strong liquidity, active volume, no major red flags",
    "scores": {
      "liquidity": 20,
      "volume": 18,
      "security": 22,
      "social": 12
    }
  }
}
```

**AI Interpretation:**
- `riskScore >= 70` → 🟢 GO — relatively safe, positive signals
- `riskScore 40-69` → 🟡 WATCH — mixed signals, proceed cautiously
- `riskScore < 40` → 🔴 AVOID — high risk, red flags detected
- Always mention `reasoning` field to user — explains the verdict

---

## Environment Variables for Notifications

Set these in `backend/.env` to enable Telegram notifications:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
WEBHOOK_URL=https://your-webhook-url.com/hook  # optional
```

---

## Quick One-Liners for OpenClaw

```bash
# Morning briefing: trending tokens
curl -s http://localhost:3902/api/token/trending | jq '.pairs[:5]'

# Full deep analysis on a token
curl -s -X POST http://localhost:3902/api/analyze/token -H "Content-Type: application/json" \
  -d '{"query":"BONK","chain":"solana"}' | jq '.report | {symbol:.token.symbol, verdict:.verdict, score:.riskScore}'

# Check all alerts
curl -s http://localhost:3902/api/alerts/check | jq '{triggered:.triggered | length, details:.triggered[].details}'

# Market pulse
curl -s -X POST http://localhost:3902/api/analyze/market -H "Content-Type: application/json" -d '{}' | jq '.report.sentiment'
```
