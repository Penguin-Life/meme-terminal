# Meme Terminal — 20-Round Build Plan

## Vision
Personal AI-powered memecoin trading terminal. One person = one quant team.
Integrates Binance Skills Hub + custom on-chain data skills + web dashboard.

## Architecture
```
Telegram/Web UI → OpenClaw (AI Brain) → Skills Layer → Data Sources
```

## Round Plan

### Phase 1: Core Skills (R1-R5)
- **R1**: DexScreener Skill — token search, trending, new pairs, OHLCV
- **R2**: Pump.fun Skill — new token launches, bonding curve status, king of the hill
- **R3**: GeckoTerminal Skill — multi-chain DEX data, token info, pools
- **R4**: Smart Wallet Skill — track addresses, detect buys/sells, portfolio snapshot
- **R5**: Meme Radar Skill — combine meme-rush + pump-fun + dexscreener into unified scanner

### Phase 2: Backend API (R6-R9)
- **R6**: Express.js server skeleton, health check, CORS, error handling
- **R7**: Token analysis endpoint — aggregates data from all skills into one report
- **R8**: Wallet watchlist endpoints — CRUD watchlist, trigger analysis
- **R9**: Alert engine — configurable rules, webhook/telegram push

### Phase 3: Frontend Dashboard (R10-R13)
- **R10**: React + Vite + Tailwind setup, dark theme, layout shell
- **R11**: Token scanner page — search, trending, new pairs grid
- **R12**: Wallet tracker page — watchlist, recent trades, PnL
- **R13**: Alert center page — active alerts, history, configure rules

### Phase 4: Integration & Automation (R14-R16)
- **R14**: OpenClaw workflow — HEARTBEAT scanning, cron-based monitoring
- **R15**: Telegram notification integration — alerts push to TG
- **R16**: One-command analysis — "查 $XXX" triggers full pipeline

### Phase 5: Polish & Ship (R17-R20)
- **R17**: Error handling, rate limiting, caching, retry logic
- **R18**: Security audit, input validation, API key management
- **R19**: GitHub README, deployment docs, skill installation guide
- **R20**: Final testing, bug fixes, demo preparation, publish

## Tech Stack
- **Skills**: OpenClaw SKILL.md format (markdown + shell/curl)
- **Backend**: Node.js + Express.js (port 3902)
- **Frontend**: React + Vite + Tailwind CSS
- **Data**: DexScreener, Pump.fun, GeckoTerminal, Helius, Birdeye
- **Binance**: All 7 Skills from binance-skills-hub
- **Deploy**: your server, PM2, Nginx

## API Keys Needed
- DexScreener: free, no key
- GeckoTerminal: free, no key  
- Pump.fun: free, no key
- Helius: free tier (need signup)
- Birdeye: free tier (need signup)

## GitHub
- Repo: Penguin-Life/meme-terminal
- License: MIT
