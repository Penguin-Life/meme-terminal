# 🚀 Meme Terminal

> **AI-Powered Memecoin Trading Terminal — One person = one quant team.**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-≥18-brightgreen)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![OpenClaw](https://img.shields.io/badge/OpenClaw-Skills-purple)](https://openclaw.dev)

Meme Terminal is a full-stack trading intelligence platform that aggregates real-time on-chain data from DexScreener, Pump.fun, GeckoTerminal, and Helius — surfaced through a beautiful dark dashboard and an AI-powered OpenClaw skill layer accessible via Telegram.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔥 **Token Scanner** | Real-time search + trending + new pairs across all major chains |
| 💊 **Pump.fun Monitor** | Track new launches, bonding curve progress, King of the Hill |
| 👛 **Wallet Tracker** | Watch smart wallets, detect buys/sells, portfolio snapshot |
| 🔔 **Alert Engine** | Price alerts, large tx detection, new listings — push to Telegram |
| 🤖 **AI Skills Layer** | 5 OpenClaw skills for natural-language trading queries via Telegram |
| 📊 **Multi-Chain** | Solana, Ethereum, BSC, Base, Arbitrum support |
| ⚡ **Real-Time Caching** | Smart TTL caching + exponential backoff retry for all external APIs |
| 🛡️ **Security-First** | Input validation, rate limiting, security headers, CORS configuration |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       User Interfaces                           │
│   📱 Telegram Bot (via OpenClaw)    🌐 Web Dashboard (React)    │
└─────────────┬────────────────────────────────┬──────────────────┘
              │                                │
              ▼                                ▼
┌─────────────────────────┐      ┌─────────────────────────────┐
│   OpenClaw AI Brain     │      │  Express.js Backend API     │
│   (Skills Layer)        │      │  localhost:3902             │
│                         │      │                             │
│  • dexscreener skill    │─────▶│  /api/token/search          │
│  • pump-fun skill       │      │  /api/token/trending        │
│  • gecko-terminal skill │      │  /api/wallet/:chain/:addr   │
│  • smart-wallet skill   │      │  /api/alerts (CRUD)         │
│  • meme-radar skill     │      │  /api/analyze/token         │
│  • meme-terminal skill  │      │  /api/notify/telegram       │
└─────────────────────────┘      └──────────────┬──────────────┘
                                                 │
              ┌──────────────────────────────────┘
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Sources (Free APIs)                    │
│  🦎 DexScreener   🐸 GeckoTerminal   💊 Pump.fun   ⚡ Helius   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📸 Screenshots

> *Coming soon — dashboard previews*

| Scanner | Wallet Tracker | Alert Center |
|---------|---------------|--------------|
| ![Scanner](docs/screenshots/scanner.png) | ![Wallets](docs/screenshots/wallets.png) | ![Alerts](docs/screenshots/alerts.png) |

---

## ⚡ Quick Start (3 steps)

```bash
# 1. Clone
git clone https://github.com/Penguin-Life/meme-terminal.git
cd meme-terminal

# 2. Install & configure
cd backend && npm install && cp .env.example .env
cd ../frontend && npm install && cp .env.example .env

# 3. Run
# Terminal 1:
cd backend && npm start
# Terminal 2:
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — done! 🎉

---

## 📦 Full Installation Guide

### Prerequisites

- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- (Optional) OpenClaw for AI skills layer

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID for alerts

# Development (auto-reload)
npm run dev

# Production
npm start
```

Backend starts on `http://localhost:3902`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:3902/api  (default — change for prod)

# Development
npm run dev

# Production build
npm run build
# Output: frontend/dist/
```

Frontend dev server on `http://localhost:5173`

### OpenClaw Skills Installation

```bash
# Install each skill to your OpenClaw skills directory:
cp -r skills/dexscreener ~/openclaw/skills/
cp -r skills/pump-fun ~/openclaw/skills/
cp -r skills/gecko-terminal ~/openclaw/skills/
cp -r skills/smart-wallet ~/openclaw/skills/
cp -r skills/meme-radar ~/openclaw/skills/
cp -r skills/meme-terminal ~/openclaw/skills/
```

See [docs/SKILLS-GUIDE.md](docs/SKILLS-GUIDE.md) for detailed usage examples.

---

## ⚙️ Configuration

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3902` | Server port |
| `NODE_ENV` | `development` | `development` or `production` |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | Comma-separated CORS origins |
| `TELEGRAM_BOT_TOKEN` | — | BotFather token for alerts |
| `TELEGRAM_CHAT_ID` | — | Target chat/user ID for alerts |
| `HELIUS_API_KEY` | — | Optional: Helius RPC for Solana |
| `SOLANA_RPC_URL` | mainnet-beta | Custom Solana RPC endpoint |

### Telegram Bot Setup

1. Open [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot`, follow prompts
3. Copy the token → `TELEGRAM_BOT_TOKEN=<token>`
4. Open [@userinfobot](https://t.me/userinfobot) to get your chat ID
5. Set `TELEGRAM_CHAT_ID=<your-id>`

---

## 📡 API Reference

Base URL: `http://localhost:3902/api`

### Health
```
GET /api/health
→ { success, service, version, uptime, environment }

GET /api/cache/stats
→ { success, cache: { hits, misses, hitRate, size, entries } }
```

### Token Endpoints
```
GET /api/token/search?q=<query>
GET /api/token/trending?chain=solana
GET /api/token/new?chain=solana&limit=20
GET /api/token/:chain/:address
```

### Wallet Endpoints
```
GET  /api/wallet/watchlist
POST /api/wallet/watchlist
DELETE /api/wallet/watchlist/:address?chain=solana
GET  /api/wallet/:chain/:address
GET  /api/wallet/:chain/:address/trades
```

### Alert Endpoints
```
GET    /api/alerts
POST   /api/alerts
PATCH  /api/alerts/:id
DELETE /api/alerts/:id
POST   /api/alerts/check
```

### Analysis Endpoints
```
POST /api/analyze/token  { query, chain }
POST /api/analyze/wallet { address, chain }
POST /api/analyze/market
```

### Notify Endpoints
```
GET  /api/notify/status
POST /api/notify/telegram  { message }
POST /api/notify/test
```

**Rate Limits:**

| Endpoint Group | Limit |
|----------------|-------|
| Search / Trending | 60 req/min |
| Analysis (heavy) | 20 req/min |
| Alerts CRUD | 30 req/min |
| Notify | 10 req/min |

See [docs/API.md](docs/API.md) for full API reference with request/response examples.

---

## 🤖 OpenClaw Skills

This project ships with 6 skills for OpenClaw (AI assistant):

| Skill | Purpose |
|-------|---------|
| `dexscreener` | Search tokens, get prices, view trending |
| `pump-fun` | Monitor new launches and bonding curves |
| `gecko-terminal` | Multi-chain DEX data and pool analysis |
| `smart-wallet` | Track whale wallets and detect signals |
| `meme-radar` | Unified meme scanner across all sources |
| `meme-terminal` | Full analysis pipeline ("查 $TOKEN") |

**Example usage in Telegram:**
```
查一下 BONK
新上的 pump.fun 有啥热门的
帮我追踪这个钱包 5YNmS...
PEPE 目前价格多少
```

See [docs/SKILLS-GUIDE.md](docs/SKILLS-GUIDE.md) for more.

---

## 🚀 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- PM2 process management setup
- Nginx reverse proxy configuration  
- SSL/HTTPS setup
- Frontend CDN deployment
- Environment hardening

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

## 🙏 Credits

- [DexScreener](https://dexscreener.com) — free DEX pair API
- [GeckoTerminal](https://geckoterminal.com) — multi-chain pool data
- [Pump.fun](https://pump.fun) — Solana meme launches
- [Helius](https://helius.dev) — Solana RPC infrastructure
- [Binance Skills Hub](https://github.com/binance/binance-skills-hub) — on-chain signal skills
- [OpenClaw](https://openclaw.dev) — AI agent framework

---

<div align="center">

**Built with 🐧 by [Penguin-Life](https://github.com/Penguin-Life)**

*One person. One terminal. One quant team.*

</div>
