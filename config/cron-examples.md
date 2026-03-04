# Meme Terminal — OpenClaw Cron Job Examples

These are example cron job configurations for automated meme terminal monitoring.
Add them via `openclaw cron add` or by editing your OpenClaw config.

---

## Morning Market Scan — 9:00 AM daily

**Purpose:** Start the day with a full market briefing

```
Schedule: 0 9 * * *  (9:00 AM every day)
Timezone: Asia/Shanghai
```

**Prompt to send:**
```
Run a morning market scan using the Meme Terminal backend at http://localhost:3902.

1. Check health: curl http://localhost:3902/api/health
2. Get trending: curl http://localhost:3902/api/token/trending
3. Get market overview: curl -X POST http://localhost:3902/api/analyze/market -H "Content-Type: application/json" -d '{}'

Summarize in a concise morning briefing:
- Top 3 trending tokens with 24h price change
- Market sentiment (bullish/bearish/neutral)
- Any tokens with >200% 24h gain (if any)
- New hot launches worth watching

Format with emojis. Keep it under 10 lines.
Send to the user on Telegram.
```

---

## Smart Money Alert Check — Every 15 minutes

**Purpose:** Real-time alert monitoring with instant Telegram notification

```
Schedule: */15 * * * *  (every 15 minutes)
Timezone: Asia/Shanghai
```

**Prompt to send:**
```
Check the Meme Terminal alert engine:

curl -s http://localhost:3902/api/alerts/check

If any alerts triggered (triggered array is non-empty):
- Send Telegram notification for each triggered alert
- Format: "🔔 Alert: [label] | [details] | Value: [currentValue]"

If nothing triggered, do nothing (no message needed).
If backend is down, silently skip.
```

---

## New Token Radar — Every 30 minutes

**Purpose:** Catch early pumping tokens before they go viral

```
Schedule: */30 * * * *  (every 30 minutes)
Timezone: Asia/Shanghai
```

**Prompt to send:**
```
Scan for new hot token launches using Meme Terminal:

curl -s "http://localhost:3902/api/token/new?chain=solana&limit=50"

Filter results for tokens matching ALL criteria:
- volume.h1 > 10000 (>$10k hourly volume)
- liquidity.usd > 5000 (>$5k liquidity)
- txns.h1.buys > 50 (active buying)  
- priceChange.h1 > 20 (>+20% last hour)

If any qualifying tokens found:
- Report top 3 sorted by priceChange.h1 (highest first)
- Format: "🆕 $SYMBOL +X% 1h | Vol: $X | Liq: $X | [dexscreener link if available]"
- Send to Telegram

If no qualifying tokens, do nothing.
```

---

## Evening Deep Analysis — 9:00 PM daily

**Purpose:** End-of-day review of watchlisted wallets

```
Schedule: 0 21 * * *  (9:00 PM every day)
Timezone: Asia/Shanghai
```

**Prompt to send:**
```
Run evening wallet watchlist review using Meme Terminal:

1. Get watchlist: curl http://localhost:3902/api/wallet/watchlist
2. For each wallet in the list, run:
   curl -s "http://localhost:3902/api/wallet/{chain}/{address}"

Summarize what smart money has been doing today:
- Any significant buys/sells?
- Portfolio value changes?
- New tokens acquired?

Keep summary under 15 lines. Send to Telegram.
```

---

## OpenClaw CLI Commands to Add These Crons

```bash
# Morning scan
openclaw cron add \
  --schedule "0 9 * * *" \
  --tz "Asia/Shanghai" \
  --prompt "Run morning meme terminal scan. Check http://localhost:3902/api/health first. Then GET /api/token/trending and POST /api/analyze/market. Send the user a morning briefing on Telegram with top 3 trending + market sentiment."

# Alert check (15 min)
openclaw cron add \
  --schedule "*/15 * * * *" \
  --tz "Asia/Shanghai" \
  --prompt "Check meme terminal alerts: curl http://localhost:3902/api/alerts/check. If triggered array is non-empty, send Telegram notification for each. Otherwise do nothing."

# New token radar (30 min)
openclaw cron add \
  --schedule "*/30 * * * *" \
  --tz "Asia/Shanghai" \
  --prompt "Scan new Solana token launches: GET http://localhost:3902/api/token/new?chain=solana&limit=50. Filter: vol.h1>10k AND liq>5k AND buys.h1>50 AND priceChange.h1>20. Report top 3 to Telegram if found."
```

---

## Notes

- All schedules use cron syntax: `minute hour day month weekday`
- Backend must be running on port 3902 before cron jobs execute
- Use `openclaw cron list` to view active jobs
- Use `openclaw cron rm <id>` to remove a job
- Combine multiple checks into one cron to reduce API calls (batch them)
- For very frequent checks (< 15 min), prefer HEARTBEAT.md over cron (fewer resources)
