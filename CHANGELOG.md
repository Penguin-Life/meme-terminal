# Changelog

All notable changes to Meme Terminal are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-03-05

### 🎉 Initial Release — Full-Stack Memecoin Trading Terminal

This release represents the complete v1.0 build across 32 development rounds.

---

### Added

#### Phase 0 — Project Foundation (R1-R5)

- **R1** — Project scaffold: monorepo structure with `backend/`, `frontend/`, `skills/`, `docs/` directories
- **R1** — Express.js backend bootstrapped with `server.js`, `.env.example`, and `package.json`
- **R1** — React + Vite frontend scaffolded with Tailwind CSS 4 and React Router v6
- **R2** — Core backend route structure: `/token`, `/wallet`, `/alerts`, `/analyze`, `/notify`
- **R2** — DexScreener service integration (`services/dexscreener.js`) — token search, trending, pair data
- **R3** — GeckoTerminal service integration (`services/gecko.js`) — multi-chain pool stats and OHLCV
- **R3** — Pump.fun service integration (`services/pumpfun.js`) — new launches, bonding curve progress
- **R4** — Helius / Solana RPC service (`services/solana.js`) — wallet balances, transaction history
- **R4** — In-memory TTL cache layer (`services/cache.js`) — configurable TTL per endpoint, hit/miss stats
- **R5** — Exponential backoff retry utility (`utils/retry.js`) — configurable attempts, delay, and jitter

#### Phase 1 — Feature Build-Out (R6-R10)

- **R6** — Alert engine (`services/alertEngine.js`) — cron-based evaluation loop (60s interval)
- **R6** — Alert types: `price_above`, `price_below`, `large_transaction`, `new_listing`
- **R7** — Telegram notifier (`services/notifier.js`) — Telegram Bot API integration for push alerts
- **R7** — Notify routes (`routes/notify.js`) — `POST /notify/telegram`, `POST /notify/test`, `GET /notify/status`
- **R8** — Wallet watchlist system — `GET/POST/DELETE /wallet/watchlist` with persistent JSON storage
- **R8** — Data store utility (`utils/dataStore.js`) — resilient JSON file I/O with backup and corruption recovery
- **R9** — AI analysis pipeline (`services/analyzer.js`) — token + wallet + market analysis endpoints
- **R9** — Analysis routes: `POST /analyze/token`, `POST /analyze/wallet`, `POST /analyze/market`
- **R10** — Structured logging (`utils/logger.js`) — daily rotating log files in `backend/logs/`

#### Phase 2 — OpenClaw Skills (R11-R15)

- **R11** — `skills/dexscreener/` — natural-language token search and price queries via DexScreener
- **R11** — `skills/pump-fun/` — Pump.fun launch monitor, bonding curve status, King of the Hill
- **R12** — `skills/gecko-terminal/` — multi-chain DEX pool data and candlestick charts
- **R12** — `skills/smart-wallet/` — whale wallet tracking, buy/sell detection, portfolio snapshot
- **R13** — `skills/meme-radar/` — unified scanner aggregating all data sources into one view
- **R13** — `skills/meme-terminal/` — orchestrator skill combining all sources + AI analysis in one command
- **R14** — All skills support Chinese natural-language queries ("查", "追踪", "帮我看看")
- **R14** — Skills use backend API endpoints as their data layer (not direct external API calls)
- **R15** — Binance skills integration: `query-token-info`, `crypto-market-rank`, `meme-rush`, `trading-signal`, `query-address-info`, `query-token-audit`

#### Phase 3 — Frontend Dashboard (R16-R20)

- **R16** — React Router v6 navigation with 4 pages: Scanner, Wallets, Alerts, Settings
- **R16** — Dark-mode design system with Tailwind CSS custom color palette
- **R17** — Scanner page (`pages/Scanner.jsx`) — token search, trending tab, new pairs tab
- **R17** — `TokenCard` component with price, 24h change, volume, liquidity, chain badge
- **R18** — Wallets page (`pages/Wallets.jsx`) — watchlist management, wallet balance display
- **R18** — `WalletCard` component with multi-token balance summary
- **R19** — Alerts page (`pages/Alerts.jsx`) — alert CRUD UI, status toggle, condition display
- **R19** — Settings page (`pages/SettingsPage.jsx`) — Telegram config, API URL, cache stats
- **R20** — `SearchBar` component with debounce and chain selector dropdown
- **R20** — Recharts integration for price/volume charts in token detail views

#### Phase 4 — Security & Middleware (R21-R24 Prep)

- **R21** — Helmet.js security headers middleware
- **R21** — CORS middleware with configurable allowed origins via env var
- **R21** — express-rate-limit middleware (`middleware/rateLimiter.js`) with per-route limits
- **R22** — Input validation middleware (`middleware/validate.js`) — chain name and address format checks
- **R22** — Global error handler (`middleware/errorHandler.js`) — standardized `{ success, error, code }` responses
- **R22** — All endpoints return consistent `{ success: true, data }` or `{ success: false, error }` structure
- **R23** — Timeout configuration on all Axios calls (10s default, configurable)
- **R23** — Graceful degradation: services return structured error objects instead of throwing
- **R24** — Auto-create `backend/data/` directory and default JSON files on startup
- **R24** — JSON corruption detection with automatic backup recovery and `.corrupt_TIMESTAMP` preservation

#### Phase 5 — Bug Hunt & Hardening (R21-R24)

- **R21** — Full backend audit: every endpoint tested and verified for stability
- **R22** — API response consistency pass: no `undefined`, no `null` leaks, proper HTTP status codes
- **R23** — Service reliability pass: connection error handling, API-down fallback responses
- **R24** — Data persistence hardening: atomic writes (`.tmp` → `.bak` → final), validation layer

#### Phase 6 — Frontend Quality (R25-R28)

- **R25** — Frontend build audit: zero ESLint warnings, clean `npm run build` output
- **R25** — Removed unused imports across all components
- **R26** — Loading states: `LoadingSkeleton` component used across all data-fetching views
- **R26** — Empty states: helpful messages with action prompts for zero-data scenarios
- **R26** — Error states: retry buttons and user-friendly error messages
- **R27** — Responsive layout: tested at 375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)
- **R27** — Mobile-friendly navigation with collapsible sidebar on small screens
- **R28** — End-to-end frontend-backend integration verification
- **R28** — All API error cases handled gracefully in UI (no uncaught errors)

#### Phase 7 — GitHub Professionalism (R29-R32)

- **R29** — Comprehensive README.md rewrite with badges, comparison table, mermaid architecture, full setup guide
- **R30** — `CONTRIBUTING.md` with code style guide, commit conventions, PR process
- **R30** — `SECURITY.md` with vulnerability reporting process and security model
- **R30** — `.github/ISSUE_TEMPLATE/bug_report.md` — structured bug report template
- **R30** — `.github/ISSUE_TEMPLATE/feature_request.md` — structured feature request template
- **R30** — `.github/PULL_REQUEST_TEMPLATE.md` — PR checklist and review guide
- **R30** — `.github/workflows/ci.yml` — GitHub Actions CI: backend smoke test + frontend lint + build
- **R31** — `docs/ARCHITECTURE.md` — system overview, token analysis flow, alert engine flow, caching strategy, security architecture, all with Mermaid diagrams
- **R32** — `CHANGELOG.md` — this file, in Keep a Changelog format

#### Documentation

- **`docs/API.md`** — Full API reference with request/response examples for all endpoints
- **`docs/DEPLOYMENT.md`** — PM2 process management, Nginx reverse proxy, SSL setup, environment hardening
- **`docs/SKILLS-GUIDE.md`** — Complete guide to all 13 OpenClaw skills with example conversations
- **`docs/ARCHITECTURE.md`** — System architecture with Mermaid diagrams
- **`config/cron-examples.md`** — OpenClaw cron job examples for scheduled alerts
- **`config/heartbeat-tasks.md`** — Heartbeat task configuration examples
- **`backend/.env.example`** — Documented environment variable template
- **`frontend/.env.example`** — Frontend environment variable template

---

### Technical Stack

- **Backend:** Node.js 22, Express 4.x, Axios, UUID, Morgan, express-rate-limit, Helmet, dotenv
- **Frontend:** React 18, Vite 6, Tailwind CSS 4, React Router 6, Recharts, Lucide React, Axios
- **AI Layer:** OpenClaw skills (Claude-compatible), 6 custom + 7 Binance skills
- **Data Sources:** DexScreener, GeckoTerminal, Pump.fun, Helius, Solana RPC, Binance Web3 APIs

---

[1.0.0]: https://github.com/Penguin-Life/meme-terminal/releases/tag/v1.0.0
