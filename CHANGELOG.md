# Changelog

All notable changes to Meme Terminal are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),

## [1.6.0] — 2026-03-18

### Added
- **Complete Demo Mode** — all 7 pages now display realistic mock data when `DEMO_MODE=true`
  - Smart Money Signals: 8 mock signals (BUY/SELL) with tags, trigger prices, and max gain %
  - CEX-DEX Arbitrage: 6 pairs with spread calculations and opportunity flags
  - Binance Alpha: 10 curated tokens with rank, price, volume, market cap data
- Demo-ready watchlist with 5 professionally named wallets across 3 chains
- Demo-ready alerts with 5 realistic alert configurations including trigger history

### Fixed
- **BinanceAlpha.jsx crash** — `allTokens` was undefined, causing blank page render
- **Dashboard trending** — now correctly reads nested `token.symbol` / `market.price` from mock data format
- Replaced placeholder contract addresses with realistic-looking ones across all mock data
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.5.2] - 2026-03-11

### Added — Data Visualization & Testing
- 📊 **Dashboard Sparklines** — Inline SVG sparkline charts (48×16px) for trending tokens and Binance Alpha. Zero-dependency, color-coded (green=up, red=down).
- 🧪 **Test suite expansion** — 50 tests across 5 suites:
  - `formatUtils.test.js` (22 tests) — all shared formatting functions
  - `alertValidation.test.js` (9 tests) — alert creation validation
  - `signalNormalize.test.js` (9 tests) — signal data normalization
  - `arbitrage.test.js` + `binanceAlpha.test.js` — existing suites
- 📄 **`usePageTitle` hook** — All 9 pages now set proper `document.title` (e.g. "Token Scanner | Meme Terminal")
- 🌐 **Comprehensive ARIA labels** — Screen reader support for navigation, alerts, status indicators, command palette
- 🚨 **All-sections-failed banner** — Dashboard detects when all 4 API sections fail and shows "Backend unavailable" with retry + DEMO_MODE hint

### Changed — Mobile & UX
- 📱 Quick action pills horizontally scroll on mobile (no wrapping)
- 📱 Mobile CSS enhancements for dashboard cards, token stats, command palette, settings grid
- 📱 `.scrollbar-hide` utility for clean horizontal scrollers
- 🐳 `docker-compose.yml` — Removed deprecated `version` key (Compose v2+)
- 📝 `.env.example` — Added missing `BINANCE_API_KEY`, `BINANCE_SECRET_KEY`, `BINANCE_TESTNET` entries

### Fixed — Backend Hardening
- 🐛 Alert PATCH threshold validation — now rejects non-numeric values (was accepting `"abc"`)
- 🐛 Trade routes numeric validation — `quantity` and `price` must be positive numbers; LIMIT orders without `price` return 400
- 🐛 Signals POST `/filter` — graceful fallback + `minGain` validation (non-negative number)
- 🐛 Alert `new_buy` threshold requirement — correctly excluded from threshold-required list

---

## [1.5.0] - 2026-03-10

### Added — Command Palette & Architecture
- ⌘K **Command Palette** — VS Code / Linear-style quick navigation overlay with global keyboard shortcut, page search, live token search (debounced), arrow-key navigation, and backdrop blur
- 🧩 **Shared component library**:
  - `<PageHeader>` — Reusable page header with title, subtitle, badge, refresh, action slots
  - `<EmptyState>` — Unified empty state with icon, title, description, optional action
  - `<ErrorBanner>` — Reusable error banner with retry button
- 🔧 **`format.js` utility module** — Centralized `fmtUsd`, `fmtPrice`, `fmtCompact`, `timeAgo`, `shortAddr`, `fmtAge`. Replaced 6+ duplicate formatting functions across 9 files.
- 🔍 **SEO overhaul** — Open Graph, Twitter Card, meta description, keywords, theme-color, Apple mobile web app meta in `index.html`

### Changed — Polish & Hardening
- 🏷️ **Version unified** — All version strings (App.jsx, SettingsPage, server.js health/status/banner, package.json files) now consistently v1.5.x
- 🔒 **CSP header fix** — `script-src 'none'` was breaking React SPA in production; fixed to allow `'self'` scripts/styles
- 🛡️ **Wallet route validation** — Chain whitelist + address length validation (20-66 chars)
- 📝 **Page titles & descriptions** — Emoji prefixes and improved subtitles on all pages
- ♻️ **format.js migration** — TokenCard, WalletCard, BinanceAlpha, ArbitrageScanner, Alerts, Dashboard, TokenDetail all use shared formatters
- 🧹 Removed dead imports and duplicate utility functions across all components

---

## [1.4.0] - 2026-03-10

### Added — UX Overhaul
- 🔍 **Wallet search & chain filter** — Search by label/address/notes + chain filter pills (SOL/ETH/BSC/BASE/ARB)
- 📋 **Copy-to-clipboard buttons** — One-click copy for contract addresses (TokenDetail) and wallet addresses (WalletCard) with ✅ animated feedback
- ⬆️ **Back-to-top button** — Floating button on Scanner page, appears after 400px scroll, glassmorphism style
- 🏠 **Dashboard quick action pills** — One-tap navigation to Scan Tokens, Check Signals, Arbitrage, Binance Alpha
- 🔀 **Sort controls** — ArbitrageScanner (% Spread / A-Z), BinanceAlpha (Rank / 24h % / Volume)
- 🔍 **BinanceAlpha search** — Filter tokens by name, symbol, or contract address
- ⏱️ **Live timers** — ArbitrageScanner and BinanceAlpha show real-time "Xs ago" counters (1s interval)
- ⚙️ **Settings page overhaul** — Live health status badge, section hover glow, staggered entrance animations
- 🦴 **Shimmer loading skeletons** — Signals, Alerts, ArbitrageScanner all use structured shimmer placeholders
- 🎨 **Premium empty states** — Wallets and Alerts show feature pills and descriptive copy
- ✨ **CSS utility classes** — `gradient-text-green/gold`, `btn-press`, `row-hover`, `section-card`, `pulse-dot`, `animate-slide-up`, `card-hover` with shadow
- 📄 **404 route** — Friendly catch-all with penguin emoji and back-to-dashboard link

### Fixed
- 🐛 **Native balance chain display** — WalletCard now shows correct chain symbol (was always "SOL")
- 🐛 **Alert `new_buy` threshold** — No longer incorrectly requires a threshold value
- 🐛 **Mobile nav overflow** — Reduced from 8 to 6 items to prevent cramped touch targets
- 🐛 **Scanner Ctrl+K conflict** — Removed conflicting handler (now handled by global Command Palette)
- 🐛 **Backend silent catches** — Arbitrage `fetchCexPrice`/`fetchDexPrice` now log warnings instead of swallowing errors

---

## [1.3.0] - 2026-03-08

### Added
- 🔐 Spot Trading integration (`/api/trade/*`) — buy, sell, open orders, balance via Binance Spot API
- 🛡️ Safe Buy flow — one-click: Token Audit → Signal Check → Place Order
- 📡 Smart Money Signal Feed page with real-time filters (chain, buy/sell)
- 🏠 Dashboard home page — four-panel overview (trending, signals, arbitrage, alpha)
- 🔍 Token Detail page — K-line chart, security audit, smart money signals, safe buy button
- ⚡ WebSocket real-time price stream service (Binance WS → SSE)
- 🧪 Jest unit tests for arbitrage and binanceAlpha modules
- 📱 Mobile bottom tab navigation and responsive layout

### Changed
- `server.js` upgraded to v1.3.0, registers trade/stream/signal routes
- `.env.example` updated with Binance trading and WebSocket config
- Default route now shows Dashboard instead of redirecting to Scanner

---

## [1.2.0] - 2026-03-08

### Added
- 🟡 Binance Alpha Token page — discover Binance-curated alpha tokens
- 📊 CEX-DEX Arbitrage Scanner — spot price gaps between Binance and DEX
- 🏗️ README restructured with Binance-first positioning
- 📝 New arbitrage and alpha discovery workflows in docs
- `backend/routes/binanceAlpha.js` — new endpoints
- `backend/routes/arbitrage.js` — new endpoints
- `frontend/src/pages/BinanceAlpha.jsx` — Alpha token card grid with live refresh
- `frontend/src/pages/ArbitrageScanner.jsx` — CEX-DEX spread table with color-coded opportunities

### Changed
- README now highlights Binance Skills Hub as core differentiator
- Roadmap updated: v1.1.0 and v1.2.0 marked as DONE ✅

---

## [1.1.0] — 2026-03-05

### Added
- Deep backend edge-case audit: all endpoints return correct HTTP codes on invalid input
- Frontend quality pass: zero build warnings, all components verified
- Docker multi-stage build verified, setup/start scripts made executable
- `docs/ENV-VARS.md` — full environment variable reference
- Root-level `.env.example` — quick-start template
- JSDoc added to all exported backend functions
- `## 📸 Screenshots` section with placeholder references

### Fixed
- `WalletCard.jsx`: `setPortfolio(data.portfolio)` → `setPortfolio(data.data)`
- `server.js`: production SPA catch-all now calls `next()` for `/api` routes
- `.github/workflows/ci.yml`: removed duplicate `VITE_API_URL`

### Changed
- Version bump: `v1.0.0` → `v1.1.0`

---

## [1.0.0] — 2026-03-05

### 🎉 Initial Release — Full-Stack Memecoin Trading Terminal

Complete v1.0 build across 32 development rounds.

#### Highlights
- **Backend:** Express.js API with 7 route modules, smart TTL caching, exponential backoff retry, alert engine (60s cron), Telegram notifier, AI analysis pipeline, structured logging
- **Frontend:** React 18 + Vite 6 + Tailwind CSS 4 dark-mode dashboard with 4 pages (Scanner, Wallets, Alerts, Settings), lazy loading, responsive design
- **AI Layer:** 13 OpenClaw skills (6 custom + 7 Binance) for natural-language Telegram queries
- **Data Sources:** DexScreener, GeckoTerminal, Pump.fun, Helius, Solana RPC, Binance Web3 APIs
- **Security:** Helmet, CORS, rate limiting, input validation, standardized error responses
- **Infrastructure:** Demo mode, Docker + docker-compose, setup/start scripts, GitHub CI, comprehensive docs

---

[1.5.2]: https://github.com/Penguin-Life/meme-terminal/releases/tag/v1.5.2
[1.5.0]: https://github.com/Penguin-Life/meme-terminal/releases/tag/v1.5.0
[1.4.0]: https://github.com/Penguin-Life/meme-terminal/releases/tag/v1.4.0
[1.3.0]: https://github.com/Penguin-Life/meme-terminal/releases/tag/v1.3.0
[1.2.0]: https://github.com/Penguin-Life/meme-terminal/releases/tag/v1.2.0
[1.1.0]: https://github.com/Penguin-Life/meme-terminal/releases/tag/v1.1.0
[1.0.0]: https://github.com/Penguin-Life/meme-terminal/releases/tag/v1.0.0
