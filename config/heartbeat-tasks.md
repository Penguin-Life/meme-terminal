# Meme Terminal — HEARTBEAT.md Template

Copy this content into your OpenClaw `HEARTBEAT.md` to enable automated meme token scanning.
The backend must be running on port 3902 before heartbeats will work.

---

## Paste into HEARTBEAT.md:

```markdown
# HEARTBEAT Tasks — Meme Terminal Monitor

Backend base URL: http://localhost:3902

## Task Schedule

### Every 30 min — Trending Token Scan
Check trending tokens, flag any with >100% 24h gain.

Command:
```bash
curl -s "http://localhost:3902/api/token/trending" | \
  jq -r '.pairs[] | select(.priceChange.h24 > 100) | "🚀 \(.baseToken.symbol) +\(.priceChange.h24)% | Vol: $\(.volume.h24 | tostring) | Liq: $\(.liquidity.usd | tostring)"'
```

If any results appear, report them with: "🔥 Trending alert: [symbol] is up [%] in 24h!"
Ignore if no results or if curl fails.

---

### Every 1h — Alert Engine Check
Run the alert engine to check all configured alert rules.

Command:
```bash
curl -s "http://localhost:3902/api/alerts/check"
```

- If `triggered` array is non-empty, report each alert with label + details
- If `triggered` is empty, stay silent (HEARTBEAT_OK)
- If backend is down, note it briefly

---

### Every 2h — New Pump.fun Launches Radar
Scan new Solana token launches, filter by quality criteria.

Command:
```bash
curl -s "http://localhost:3902/api/token/new?chain=solana&limit=50"
```

Filter and report tokens that match ALL of these:
- `volume.h1 > 10000` (at least $10k hourly volume)
- `liquidity.usd > 5000` (at least $5k liquidity)
- `txns.h1.buys > 50` (active buying)
- `priceChange.h1 > 20` (up more than 20% in last hour)

Format report: "🆕 Hot new launch: $SYMBOL | +[h1]% 1h | Vol: $[vol] | Liq: $[liq]"

---

## Silence Rules
- Don't report if backend health check fails (it may be offline)
- Don't repeat the same token more than once per session
- Late night (23:00-08:00 GMT+8): only report if >500% gain or alert triggered
- HEARTBEAT_OK if nothing actionable found

## Backend Health Check (run first)
```bash
curl -s http://localhost:3902/api/health | jq -r '.status'
```
If result is not "healthy", skip all checks and reply HEARTBEAT_OK.
```

---

## Implementation Notes for OpenClaw AI

When processing heartbeat results:

1. **Run health check first** — skip all meme tasks if backend is down
2. **Trending scan**: Only report tokens with `priceChange.h24 > 100`. Use `jq` to filter.
3. **Alert check**: Parse `.triggered[]` array. Each item has `.label`, `.type`, `.currentValue`, `.details`
4. **New launches**: The filtering happens client-side in your analysis. Apply all 4 criteria.
5. **Dedup**: Use memory state file to avoid repeating same tokens. Track in `memory/meme-state.json`:
   ```json
   {
     "lastTrendingReport": { "BONK": "2026-03-05T04:00:00Z" },
     "lastAlertCheck": "2026-03-05T04:00:00Z",
     "lastNewScan": "2026-03-05T02:00:00Z"
   }
   ```

## Sample meme-state.json
Create at `~/openclaw-workspace/memory/meme-state.json`:
```json
{
  "lastTrendingReport": {},
  "lastAlertCheck": null,
  "lastNewScan": null
}
```
