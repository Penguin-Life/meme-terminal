# Meme Terminal — Architecture

This document describes the system architecture, data flows, and key design decisions in Meme Terminal.

---

## Table of Contents

- [System Overview](#system-overview)
- [Component Breakdown](#component-breakdown)
- [Token Analysis Flow](#token-analysis-flow)
- [Alert Engine Flow](#alert-engine-flow)
- [Caching Strategy](#caching-strategy)
- [Data Persistence](#data-persistence)
- [Security Architecture](#security-architecture)
- [AI Skills Layer](#ai-skills-layer)

---

## System Overview

```mermaid
graph TB
    subgraph CLIENT["Client Layer"]
        TG["📱 Telegram\n(via OpenClaw)"]
        WEB["🌐 React Dashboard\nlocalhost:5173"]
    end

    subgraph OC["OpenClaw AI Brain"]
        LLM["Claude / LLM"]
        SK["Skill Router"]
        SK1["dexscreener"]
        SK2["pump-fun"]
        SK3["gecko-terminal"]
        SK4["smart-wallet"]
        SK5["meme-radar"]
        SK6["meme-terminal"]
        BK["Binance Skills\n(7 skills)"]
    end

    subgraph API["Backend API  :3902"]
        ROUTER["Express Router"]
        MW["Middleware Stack\n(rate limit · validate · CORS · helmet)"]
        RT["Route Handlers\n/token /wallet /alerts /analyze /notify"]
        SVC["Service Layer"]
        CACHE["Smart Cache\n(TTL per endpoint)"]
        AE["Alert Engine\n(cron: 60s)"]
        DS["Data Store\n(watchlist.json · alerts.json)"]
        NOTIF["Telegram Notifier"]
    end

    subgraph EXT["External Data Sources"]
        DEX["🦎 DexScreener API"]
        GK["🐸 GeckoTerminal API"]
        PF["💊 Pump.fun API"]
        HL["⚡ Helius RPC"]
        SOL["🟣 Solana RPC"]
    end

    TG --> OC
    WEB --> API
    OC --> SK --> API
    BK --> EXT

    API --> MW --> ROUTER --> RT --> SVC
    SVC --> CACHE
    CACHE -->|miss| EXT
    CACHE -->|hit| RT

    AE --> DS
    AE --> SVC
    AE --> NOTIF
    DS --> RT
```

---

## Component Breakdown

### Frontend (React + Vite)

| Component | Responsibility |
|-----------|---------------|
| `App.jsx` | Route configuration (React Router v6), global layout |
| `pages/Scanner.jsx` | Token search, trending, new pairs |
| `pages/Wallets.jsx` | Watchlist management, wallet analysis |
| `pages/Alerts.jsx` | Alert CRUD, status display |
| `pages/SettingsPage.jsx` | Telegram config, API preferences |
| `components/TokenCard.jsx` | Reusable token display with price, volume, chain |
| `components/WalletCard.jsx` | Wallet entry with balance summary |
| `components/SearchBar.jsx` | Debounced search with chain selector |
| `components/LoadingSkeleton.jsx` | Placeholder UI during API loads |
| `utils/api.js` | Axios client, base URL config, error handling |

### Backend (Express.js)

| Module | Responsibility |
|--------|---------------|
| `server.js` | App bootstrap, middleware chain, route mounting |
| `routes/token.js` | Token search, trending, new, detail |
| `routes/wallet.js` | Watchlist CRUD, wallet data, trade history |
| `routes/alert.js` | Alert CRUD, manual trigger |
| `routes/analyze.js` | AI analysis endpoints |
| `routes/notify.js` | Telegram notification dispatch |
| `services/dexscreener.js` | DexScreener API integration |
| `services/gecko.js` | GeckoTerminal API integration |
| `services/pumpfun.js` | Pump.fun API integration |
| `services/solana.js` | Helius / Solana RPC integration |
| `services/alertEngine.js` | Cron-based alert evaluation loop |
| `services/analyzer.js` | AI analysis pipeline |
| `services/notifier.js` | Telegram Bot API dispatcher |
| `services/cache.js` | In-memory TTL cache with stats |
| `utils/dataStore.js` | JSON file persistence with corruption recovery |
| `utils/logger.js` | Winston-based structured logging |
| `utils/retry.js` | Exponential backoff retry wrapper |
| `middleware/rateLimiter.js` | Per-route rate limiting config |
| `middleware/validate.js` | Request validation (chain, address formats) |
| `middleware/errorHandler.js` | Global error handler, standardized responses |

---

## Token Analysis Flow

```mermaid
sequenceDiagram
    participant U as User (Telegram / UI)
    participant OC as OpenClaw
    participant API as Backend API
    participant CACHE as Cache
    participant DEX as DexScreener
    participant GK as GeckoTerminal
    participant BN as Binance Skills

    U->>OC: "查一下 BONK"
    OC->>OC: Route to meme-terminal skill
    OC->>API: POST /api/analyze/token { query: "BONK" }
    
    API->>CACHE: Check cache (key: analyze:BONK)
    alt Cache HIT
        CACHE-->>API: Cached result
    else Cache MISS
        API->>DEX: Search "BONK" pairs
        DEX-->>API: Top pairs data
        API->>GK: Get BONK pool stats
        GK-->>API: Pool OHLCV data
        API->>BN: query-token-info "BONK"
        BN-->>API: Price + market data
        API->>BN: trading-signal check
        BN-->>API: Smart money signals
        API->>CACHE: Store (TTL: 2min)
    end
    
    API->>OC: { success, data: { price, volume, signals, ... } }
    OC->>OC: Format natural-language response
    OC->>U: "📊 BONK — $0.0000142 | +12.4% 24h..."
```

---

## Alert Engine Flow

```mermaid
flowchart TD
    CRON["⏱️ Cron Trigger\nevery 60 seconds"]
    LOAD["Load alerts.json\n(active alerts only)"]
    LOOP["For each alert"]
    
    TYPE{Alert Type}
    
    PRICE["Price Check\nGET /token/:chain/:address"]
    WHALE["Large Tx Check\nGET /wallet/:chain/:address/trades"]
    NEW["New Listing Check\nGET /token/new"]
    
    EVAL{Condition Met?}
    
    SKIP["Skip — no action"]
    NOTIFY["POST /notify/telegram\n{message: alert details}"]
    UPDATE["Update alert\n(lastTriggered, triggerCount)"]
    PERSIST["Save alerts.json"]

    CRON --> LOAD
    LOAD --> LOOP
    LOOP --> TYPE
    
    TYPE -->|price_above / price_below| PRICE
    TYPE -->|large_transaction| WHALE
    TYPE -->|new_listing| NEW
    
    PRICE --> EVAL
    WHALE --> EVAL
    NEW --> EVAL
    
    EVAL -->|No| SKIP
    EVAL -->|Yes| NOTIFY
    NOTIFY --> UPDATE
    UPDATE --> PERSIST
    SKIP --> LOOP
    PERSIST --> LOOP
```

---

## Caching Strategy

The cache layer (`services/cache.js`) uses an in-memory TTL map to reduce external API calls.

```mermaid
graph LR
    REQ["Incoming Request"]
    KEY["Build Cache Key\nroute + params hash"]
    HIT{Cache Hit?}
    FRESH{Still Fresh?\nTTL check}
    SERVE["Serve from cache\nhit++"]
    FETCH["Fetch from API\nmiss++"]
    STORE["Store in cache\nwith TTL"]
    RESP["Return Response"]

    REQ --> KEY --> HIT
    HIT -->|Yes| FRESH
    HIT -->|No| FETCH
    FRESH -->|Yes| SERVE
    FRESH -->|No| FETCH
    FETCH --> STORE --> RESP
    SERVE --> RESP
```

**TTL by endpoint:**

| Endpoint | TTL | Reasoning |
|----------|-----|-----------|
| `/token/search` | 30s | Search results change frequently |
| `/token/trending` | 2min | Trending is semi-stable |
| `/token/new` | 60s | New listings appear every few minutes |
| `/token/:chain/:address` | 30s | Price-sensitive |
| `/wallet/:chain/:address` | 60s | Balances change on each tx |
| `/analyze/token` | 2min | Heavy computation, acceptable staleness |
| `/analyze/market` | 5min | Market overview is stable enough |

---

## Data Persistence

Watchlist and alert configurations are persisted to JSON files with a resilient store:

```mermaid
flowchart TD
    OP["File Operation\n(read/write)"]
    EXISTS{File exists?}
    CORRUPT{Valid JSON?}
    
    CREATE["Create with defaults\n[]"]
    READ["Parse JSON\nreturn data"]
    BACKUP["Save corrupt file\nas .corrupt_TIMESTAMP"]
    RECOVER["Restore from .bak\nif available"]
    WRITE["Atomic write:\n1. Write to .tmp\n2. Copy to .bak\n3. Rename .tmp → main"]

    OP -->|read| EXISTS
    EXISTS -->|No| CREATE
    EXISTS -->|Yes| CORRUPT
    CORRUPT -->|Yes| READ
    CORRUPT -->|No| BACKUP --> RECOVER

    OP -->|write| WRITE
```

**Files:**
- `backend/data/watchlist.json` — tracked wallets
- `backend/data/alerts.json` — alert rules + state
- `backend/data/*.bak` — auto backup before each write
- `backend/data/*.corrupt_TIMESTAMP` — preserved corrupt files for debugging

---

## Security Architecture

```mermaid
graph TB
    INET["Internet / LAN"]
    
    subgraph MW["Middleware Chain (ordered)"]
        HELMET["Helmet.js\nSecurity headers"]
        CORS["CORS\nAllowlist origins"]
        BODY["Body Parser\n10kb limit"]
        RATE["Rate Limiter\nper-route limits"]
        VALIDATE["Input Validator\nchain/address formats"]
    end
    
    HANDLER["Route Handler"]
    ERROR["Global Error Handler\nstandardized responses"]

    INET --> HELMET --> CORS --> BODY --> RATE --> VALIDATE --> HANDLER
    HANDLER -->|error| ERROR
```

**Security headers (via Helmet):**
- `Strict-Transport-Security`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`
- `X-XSS-Protection`

---

## AI Skills Layer

The OpenClaw skills layer provides natural-language access to all backend capabilities:

```mermaid
graph LR
    USER["👤 User\n(Telegram)"]
    LLM["🤖 Claude LLM\n(OpenClaw)"]
    
    subgraph SKILLS["Skill Router"]
        MT["meme-terminal\n(orchestrator)"]
        DS["dexscreener"]
        PF["pump-fun"]
        GK["gecko-terminal"]
        SW["smart-wallet"]
        MR["meme-radar"]
    end

    subgraph BINANCE["Binance Skills"]
        TI["query-token-info"]
        MK["crypto-market-rank"]
        MM["meme-rush"]
        TS["trading-signal"]
        AI["query-address-info"]
        AU["query-token-audit"]
    end

    BACKEND["Backend API\n:3902"]
    EXT["External APIs\n(DexScreener, etc.)"]

    USER -->|natural language| LLM
    LLM -->|skill selection| SKILLS
    SKILLS --> MT
    MT --> DS & PF & GK & SW
    MT --> BINANCE
    DS & PF & GK & SW --> BACKEND
    BINANCE --> EXT
    BACKEND --> EXT
    MT -->|formatted response| LLM
    LLM -->|human-friendly reply| USER
```

The `meme-terminal` skill acts as an **orchestrator** — it decides which sub-skills to invoke based on the query, aggregates results, and formats a comprehensive response.

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **State management** | File-based JSON | No DB dependency; self-contained; easy backup |
| **Caching** | In-memory TTL map | Zero deps; fast; sufficient for single-node |
| **Authentication** | None (localhost) | Self-hosted tool; not a multi-tenant SaaS |
| **Frontend state** | Local component state | No Redux complexity; simpler maintenance |
| **Chart library** | Recharts | Good React integration; lightweight |
| **Retry strategy** | Exponential backoff | Respects API rate limits; avoids thundering herd |
| **Logging** | File + console | Daily rotating logs; debug-friendly |
