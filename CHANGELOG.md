# Changelog

All notable changes to Meme Terminal are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] — 2026-03-05

### 🔍 Deep Audit, Gap Filling & Final Polish (R41-R49)

#### Phase 10 — Deep Bug Audit (R41-R43)

- **R41** — Full backend edge-case audit: every endpoint returns correct HTTP codes and error bodies on invalid input, missing params, and external API failures
- **R42** — Frontend quality pass: zero build warnings, all components verified to have error/loading/empty states
- **R43** — Integration audit: Docker multi-stage build verified, setup/start scripts made executable, `.env.example` files completed with all required variables
- **R43** — Fixed `WalletCard.jsx`: `setPortfolio(data.portfolio)` → `setPortfolio(data.data)` (API nests response under `.data`)
- **R43** — Fixed `server.js`: production SPA catch-all now calls `next()` for `/api` routes (previously hung with no response)
- **R43** — Fixed `.github/workflows/ci.yml`: removed duplicate `VITE_API_URL` in frontend CI step
- **R43** — Added `backend/.env.example` entry for `WEBHOOK_URL` used by the notifier service
- **R43** — Created `backend/data/README.md` explaining the data directory structure

#### Phase 11 — Comprehensive Documentation (R44-R46)

- **R44** — `docs/ENV-VARS.md`: full environment variable reference (backend + frontend, required vs optional)
- **R45** — Root-level `.env.example`: quick-start template combining all commonly needed variables
- **R46** — Docs cross-linking: internal links verified across README, API.md, ARCHITECTURE.md, SKILLS-GUIDE.md

#### Phase 12 — Final Polish (R47-R49)

- **R47** — Code style consistency pass: JSDoc added to all exported functions across backend services
  - `alertEngine.js`: `readAlerts`, `writeAlerts`, `getNotifier` documented
  - `notifier.js`: `isTelegramConfigured`, `isWebhookConfigured`, `getStatus` documented
  - `server.js`: `formatUptime` documented
- **R47** — Frontend import ordering verified consistent across all components (React → libs → local)
- **R48** — README: added `## 📸 Screenshots` section with placeholder image references
- **R48** — `docs/screenshots/README.md`: guide explaining how to capture and add screenshots
- **R48** — GitHub repo description and topics set via `gh repo edit`
- **R49** — Frontend production build verified clean (`npm run build`)
- **R49** — Backend startup verified: server starts cleanly, `/api/health` returns `200 OK`
- **R49** — Tagged `v1.1.0`: deep audit, gap filling, final polish

### Changed

- Version bump: `v1.0.0` → `v1.1.0`

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

#### Phase 8 — Competition Edge (R33-R36)

- **R33** — Demo mode: `DEMO_MODE=true` env flag enables rich mock data across all endpoints (no live API needed)
- **R33** — Mock data service (`services/mockData.js`) — realistic token, wallet, alert, and analysis fixtures
- **R34** — Setup script (`scripts/setup.sh`) — one-command install for backend + frontend dependencies
- **R34** — Start script (`scripts/start.sh`) — launches backend + frontend with proper wait and PID tracking
- **R35** — `Dockerfile` — multi-stage backend Docker image
- **R35** — `docker-compose.yml` — single-command `docker compose up` deployment with env config
- **R36** — `docs/BINANCE-SKILLS.md` — comprehensive showcase of all 7 Binance skills with real example outputs

#### Phase 9 — Final Ship (R37-R40)

- **R37** — End-to-end testing: all API endpoints verified with curl (health, search, trending, new, watchlist CRUD, alerts CRUD, alert-check, token analysis, market analysis, cache stats)
- **R37** — Demo mode verification: all mocked endpoints return correct data structure
- **R38** — Frontend lazy loading: `React.lazy` + `Suspense` for all 4 page components — main bundle split from 275KB → 220KB JS
- **R38** — Backend gzip compression via `express compression` middleware — ~60% bandwidth reduction
- **R39** — README final pass: fixed `GET /alerts/check` method, added `DELETE /wallet/watchlist/:address` to API table
- **R40** — Git cleanup: verified no secrets in history, comprehensive `.gitignore`, tagged `v1.0.0`

---

### Technical Stack

- **Backend:** Node.js 22, Express 4.x, Axios, UUID, Morgan, compression, express-rate-limit, Helmet, dotenv
- **Frontend:** React 18, Vite 6, Tailwind CSS 4, React Router 6, Recharts, Lucide React, Axios
- **AI Layer:** OpenClaw skills (Claude-compatible), 6 custom + 7 Binance skills
- **Data Sources:** DexScreener, GeckoTerminal, Pump.fun, Helius, Solana RPC, Binance Web3 APIs

---

[1.1.0]: https://github.com/Penguin-Life/meme-terminal/releases/tag/v1.1.0
[1.0.0]: https://github.com/Penguin-Life/meme-terminal/releases/tag/v1.0.0
