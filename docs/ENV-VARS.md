# Environment Variables Reference

All environment variables used by Meme Terminal backend and frontend, with descriptions and default values.

---

## Backend (`backend/.env`)

| Variable | Description | Default | Required |
|---|---|---|---|
| `PORT` | HTTP port the backend server listens on | `3902` | No |
| `NODE_ENV` | Runtime environment (`development` / `production`) | `development` | No |
| `DEMO_MODE` | Set `true` to return mock data from all endpoints (no real API calls) | `false` | No |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins | `http://localhost:5173,http://localhost:3000` | No |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for alert notifications (from @BotFather) | — | No |
| `TELEGRAM_CHAT_ID` | Telegram chat/channel ID to receive alerts | — | No |
| `HELIUS_API_KEY` | Helius API key for enhanced Solana RPC performance | — | No |
| `SOLANA_RPC_URL` | Solana RPC endpoint URL | `https://api.mainnet-beta.solana.com` | No |
| `BIRDEYE_API_KEY` | Birdeye API key for enhanced Solana token data | — | No |
| `ETHERSCAN_API_KEY` | Etherscan API key for EVM wallet portfolio data | — | No |

### Notes

- **DEMO_MODE**: When enabled, all `/api/token/*`, `/api/wallet/*`, and `/api/alerts/check` endpoints return realistic mock data. Useful for presentations, demos, or development without hitting rate limits.
- **ALLOWED_ORIGINS**: In `development` mode, all origins are allowed regardless of this setting. In `production`, only listed origins are accepted.
- **TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID**: Both are required for Telegram alert notifications. Without them, alerts are triggered but notifications are silently skipped.
- **HELIUS_API_KEY**: Free tier available at https://www.helius.dev/. Without it, the public Solana RPC is used (rate-limited).
- **BIRDEYE_API_KEY / ETHERSCAN_API_KEY**: Optional enrichment APIs. The terminal works without them using free public endpoints.

---

## Frontend (`frontend/.env`)

| Variable | Description | Default | Required |
|---|---|---|---|
| `VITE_API_URL` | Full URL to the backend API (must include `/api`) | `http://localhost:3902/api` | No |

### Notes

- **VITE_API_URL**: Change this for production deployments. Example: `https://api.meme.yourdomain.com/api`
- All `VITE_` prefixed variables are embedded at build time (not runtime).

---

## Quick Setup

Copy the example files and edit as needed:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend (optional — defaults to localhost)
cp frontend/.env.example frontend/.env
```

For a minimal local dev setup, no environment variables are required — defaults work out of the box.
