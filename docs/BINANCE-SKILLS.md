# 🐧 Binance Web3 Skills — Meme Terminal Integration Guide

Meme Terminal is built on top of **7 Binance Web3 Skills** that provide real-time on-chain data, security audits, market intelligence, and trading capabilities. This document explains each skill, how Meme Terminal uses it, and shows example inputs and outputs.

---

## Table of Contents

1. [Skills Overview](#skills-overview)
2. [Skill 1: Query Token Info](#skill-1-query-token-info)
3. [Skill 2: Query Token Audit](#skill-2-query-token-audit)
4. [Skill 3: Crypto Market Rank](#skill-3-crypto-market-rank)
5. [Skill 4: Meme Rush](#skill-4-meme-rush)
6. [Skill 5: Query Address Info](#skill-5-query-address-info)
7. [Skill 6: Trading Signal](#skill-6-trading-signal)
8. [Skill 7: Binance Spot](#skill-7-binance-spot)
9. [Skills in Action — Combined Workflows](#skills-in-action)

---

## Skills Overview

| # | Skill | Purpose | Used In |
|---|-------|---------|---------|
| 1 | **Query Token Info** | Token search, price, volume, K-line charts | Scanner page, token search |
| 2 | **Query Token Audit** | Security scan, honeypot detection | Token analysis, pre-trade safety |
| 3 | **Crypto Market Rank** | Trending tokens, social hype, smart money rank | Dashboard, trending feed |
| 4 | **Meme Rush** | New meme launches, bonding curve tracking | New listings feed, Pump.fun radar |
| 5 | **Query Address Info** | Wallet portfolio, token holdings | Wallet tracker, portfolio page |
| 6 | **Trading Signal** | Smart money buy/sell signals | Alert engine, signal feed |
| 7 | **Binance Spot** | Exchange data, price tickers, order book | Price reference, market depth |

**API Base**: `https://web3.binance.com/bapi/defi/`  
**Auth**: Most endpoints are public — no API key required!

---

## Skill 1: Query Token Info

**Location**: `~/openclaw/skills/binance-query-token-info/`

### What It Does
Search for any token by name, symbol, or contract address. Get real-time market data including price, volume, holders, liquidity, and OHLCV candlestick data for technical analysis.

### Meme Terminal Uses
- **Scanner page**: Token search bar queries this skill
- **Token detail view**: Price, volume, market cap display
- **Chart rendering**: K-line data for price charts

### APIs Covered
| API | Endpoint | Purpose |
|-----|----------|---------|
| Token Search | `GET /v5/.../market/token/search` | Find tokens by keyword |
| Token Metadata | `GET /v1/.../market/token/basic` | Static info, social links |
| Token Market Data | `GET /v1/.../market/token/dynamic` | Live price, volume, holders |
| K-Line Chart | `GET /v1/.../market/token/kline` | OHLCV candlestick data |

### Supported Chains
| Chain | chainId |
|-------|---------|
| BSC | `56` |
| Base | `8453` |
| Solana | `CT_501` |

### Example: Search for BONK

**Request**:
```bash
curl 'https://web3.binance.com/bapi/defi/v5/public/wallet-direct/buw/wallet/market/token/search?keyword=BONK&chainIds=CT_501&orderBy=volume24h' \
  -H 'Accept-Encoding: identity'
```

**Response** (simplified):
```json
{
  "code": "000000",
  "data": [
    {
      "chainId": "CT_501",
      "contractAddress": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      "name": "Bonk",
      "symbol": "BONK",
      "price": "0.00002847",
      "volume24h": "287430000",
      "marketCap": "1842000000",
      "holders": 892341,
      "priceChangePercent24h": "8.74"
    }
  ]
}
```

### Example: Get K-Line Data

**Request**:
```bash
curl 'https://web3.binance.com/bapi/defi/v1/public/.../market/token/kline?tokenId=TOKEN_ID&interval=1h&limit=24' \
  -H 'Accept-Encoding: identity'
```

**Response** (simplified):
```json
{
  "code": "000000",
  "data": {
    "klineList": [
      { "open": "0.0000261", "high": "0.0000298", "low": "0.0000258", "close": "0.0000285", "volume": "12340000", "time": 1709424000000 }
    ]
  }
}
```

---

## Skill 2: Query Token Audit

**Location**: `~/openclaw/skills/binance-query-token-audit/`

### What It Does
Deep security analysis of any token contract. Detects honeypots, rug pulls, hidden fees, dangerous ownership functions, and fake tokens — before you trade.

### Meme Terminal Uses
- **Pre-trade safety check**: Auto-scan before swap confirmation
- **Token detail view**: Security badge (SAFE / WARNING / DANGER)
- **Alert engine**: Flag risky tokens in watchlist

### API
```
POST https://web3.binance.com/bapi/defi/v1/public/wallet-direct/security/token/audit
```

### Supported Chains
`CT_501` (Solana), `56` (BSC), `8453` (Base), `1` (Ethereum)

### Example: Audit a Token

**Request**:
```bash
curl -X POST 'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/security/token/audit' \
  -H 'Content-Type: application/json' \
  -d '{
    "binanceChainId": "CT_501",
    "contractAddress": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    "requestId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

**Response** (simplified):
```json
{
  "code": "000000",
  "data": {
    "overallRisk": "LOW",
    "contractRisks": [],
    "tradingRisks": [],
    "scamDetection": { "isHoneypot": false, "isFakeToken": false },
    "tokenInfo": {
      "name": "Bonk",
      "symbol": "BONK",
      "mintAuthority": null,
      "freezeAuthority": null,
      "topHolderPercent": 12.4
    },
    "verdict": "SAFE — No malicious functions detected"
  }
}
```

### Risk Levels
| Level | Meaning |
|-------|---------|
| `LOW` | Safe to trade |
| `MEDIUM` | Some caution advised |
| `HIGH` | Significant risks found |
| `CRITICAL` | Do not trade — likely scam |

---

## Skill 3: Crypto Market Rank

**Location**: `~/openclaw/skills/binance-crypto-market-rank/`

### What It Does
Multi-dimensional token rankings: trending, top searched, Binance Alpha picks, social hype sentiment, smart money inflow, meme token rankings, and top trader PnL leaderboards.

### Meme Terminal Uses
- **Dashboard**: Top trending tokens carousel
- **Smart Money feed**: Which tokens whales are buying
- **Social hype**: Community sentiment rankings
- **Meme rank**: Top meme tokens likely to break out

### APIs Covered
| API | Purpose |
|-----|---------|
| Social Hype Leaderboard | Tokens with highest social buzz |
| Unified Token Rank | Trending, Alpha, searched tokens |
| Smart Money Inflow Rank | Tokens smart money is buying |
| Meme Rank | Top meme tokens by Pulse launchpad |
| Address PnL Rank | Top-performing trader leaderboard |

### Example: Get Trending Tokens

**Request**:
```bash
curl 'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rank/unified?rankType=10&chainId=CT_501&pageSize=10' \
  -H 'Accept-Encoding: identity'
```

**Response** (simplified):
```json
{
  "code": "000000",
  "data": {
    "rankList": [
      { "rank": 1, "symbol": "WIF", "price": "1.842", "priceChange24h": "12.31", "volume24h": "193000000", "marketCap": "1841000000" },
      { "rank": 2, "symbol": "BONK", "price": "0.00002847", "priceChange24h": "8.74", "volume24h": "287430000" }
    ]
  }
}
```

### Example: Smart Money Inflow

**Request**:
```bash
curl 'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/token/rank/smart-money-inflow?chainId=CT_501&pageSize=10'
```

**Response** (simplified):
```json
{
  "code": "000000",
  "data": {
    "rankList": [
      { "rank": 1, "symbol": "POPCAT", "smartMoneyNetInflow": "2847000", "smartMoneyBuyCount": 47, "smartMoneySellCount": 3 }
    ]
  }
}
```

---

## Skill 4: Meme Rush

**Location**: `~/openclaw/skills/binance-meme-rush/`

### What It Does
Real-time meme token lifecycle tracking from launchpads (Pump.fun, Four.meme, etc.) across three stages: **New** (bonding curve), **Finalizing** (about to migrate), **Migrated** (just hit DEX). Also includes AI-powered market hot topics (Topic Rush).

### Meme Terminal Uses
- **New Listings feed**: Fresh tokens straight from Pump.fun
- **Migration Watch**: Alert when tokens hit 90%+ bonding curve
- **Topic Rush**: Trending narratives with associated tokens

### Stages
| rankType | Stage | Description |
|----------|-------|-------------|
| `10` | New | Fresh launches, still on bonding curve |
| `20` | Finalizing | Near migration threshold |
| `30` | Migrated | Just hit DEX liquidity |

### Example: New Meme Tokens (Pump.fun)

**Request**:
```bash
curl -X POST 'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/meme/rush' \
  -H 'Content-Type: application/json' \
  -d '{
    "rankType": 10,
    "chainId": "CT_501",
    "pageSize": 20,
    "page": 1
  }'
```

**Response** (simplified):
```json
{
  "code": "000000",
  "data": {
    "rankList": [
      {
        "symbol": "TRUMPCAT",
        "name": "Trump Cat",
        "contractAddress": "TrumpCatXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "bondingCurveProgress": 34.2,
        "marketCap": "89200",
        "volume24h": "45600",
        "launchpad": "pumpfun",
        "devHoldingPercent": 0.5,
        "top10HoldingPercent": 22.1
      }
    ]
  }
}
```

### Example: Topic Rush (Trending Narratives)

**Request**:
```bash
curl -X POST 'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/market/topic/rush' \
  -H 'Content-Type: application/json' \
  -d '{ "rankType": 30, "chainId": "CT_501", "pageSize": 10, "page": 1 }'
```

**Response** (simplified):
```json
{
  "code": "000000",
  "data": {
    "topicList": [
      {
        "topic": "AI Agents",
        "netInflow": "2847000",
        "tokens": [{ "symbol": "GOAT", "netInflow": "1200000" }, { "symbol": "ELIZA", "netInflow": "980000" }]
      }
    ]
  }
}
```

---

## Skill 5: Query Address Info

**Location**: `~/openclaw/skills/binance-query-address-info/`

### What It Does
Query any wallet address for its complete token portfolio: all holdings with current prices, 24h price changes, and USD values. Works across BSC, Base, and Solana.

### Meme Terminal Uses
- **Wallet Tracker**: View any wallet's full token holdings
- **Portfolio page**: Track your own wallet performance
- **Watchlist**: Monitor smart money wallets

### API
```
GET https://web3.binance.com/bapi/defi/v3/public/wallet-direct/buw/wallet/address/pnl/active-position-list
```

### Example: Query Wallet Holdings

**Request**:
```bash
curl 'https://web3.binance.com/bapi/defi/v3/public/wallet-direct/buw/wallet/address/pnl/active-position-list?address=0xABC...&chainId=56&offset=0' \
  -H 'clienttype: web' \
  -H 'clientversion: 1.2.0'
```

**Response** (simplified):
```json
{
  "code": "000000",
  "data": {
    "activePositionList": [
      {
        "tokenSymbol": "CAKE",
        "tokenName": "PancakeSwap Token",
        "contractAddress": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
        "holdingAmount": "1250.47",
        "priceUsd": "2.34",
        "valueUsd": "2925.50",
        "priceChange24h": "-3.21"
      },
      {
        "tokenSymbol": "BONK",
        "holdingAmount": "48000000",
        "priceUsd": "0.00002847",
        "valueUsd": "1366.56",
        "priceChange24h": "8.74"
      }
    ],
    "totalCount": 12,
    "totalValueUsd": "28934.21"
  }
}
```

---

## Skill 6: Trading Signal

**Location**: `~/openclaw/skills/binance-trading-signal/`

### What It Does
Real-time smart money trading signals. Track professional/whale wallet buy and sell activity, with trigger prices, current prices, max gains achieved, and exit rates.

### Meme Terminal Uses
- **Signal Feed**: Live smart money buy/sell signals
- **Alert Engine**: Trigger alerts when smart money enters a token
- **Trade Ideas**: Use signals as references for entry points

### API
```
POST https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/web/signal/smart-money
```

### Example: Get Smart Money Signals

**Request**:
```bash
curl -X POST 'https://web3.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/web/signal/smart-money' \
  -H 'Content-Type: application/json' \
  -d '{
    "smartSignalType": "",
    "page": 1,
    "pageSize": 10,
    "chainId": "CT_501"
  }'
```

**Response** (simplified):
```json
{
  "code": "000000",
  "data": {
    "signalList": [
      {
        "tokenSymbol": "WIF",
        "signalType": "BUY",
        "triggerPrice": "1.24",
        "currentPrice": "1.842",
        "maxGainPercent": "48.5",
        "exitRate": "0.12",
        "tags": ["Solana", "Top100MC"],
        "signalTime": 1709424000000,
        "walletAddress": "SmartXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
      }
    ]
  }
}
```

### Signal Types
| Type | Description |
|------|-------------|
| `BUY` | Smart money accumulated this token |
| `SELL` | Smart money exited this token |

---

## Skill 7: Binance Spot

**Location**: `~/openclaw/skills/binance-spot/`

### What It Does
Full access to Binance Spot API: exchange info, price tickers, order books, K-line data, and authenticated trading (orders, balances). Supports both testnet and mainnet.

### Meme Terminal Uses
- **Price reference**: Cross-reference CEX prices vs DEX prices
- **Market depth**: Order book data for major meme coins listed on Binance
- **Arbitrage detection**: Identify price gaps between CEX and DEX

### Key Endpoints
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v3/ticker/price` | GET | No | Current price for any symbol |
| `/api/v3/ticker/24hr` | GET | No | 24h stats (high, low, volume) |
| `/api/v3/depth` | GET | No | Order book depth |
| `/api/v3/klines` | GET | No | OHLCV candlestick data |
| `/api/v3/order` | POST | Yes | Place a new order |
| `/api/v3/openOrders` | GET | Yes | View open orders |

### Example: Get BONK Price

**Request**:
```bash
curl 'https://api.binance.com/api/v3/ticker/price?symbol=BONKUSDT'
```

**Response**:
```json
{
  "symbol": "BONKUSDT",
  "price": "0.00002847"
}
```

### Example: Get 24h Statistics

**Request**:
```bash
curl 'https://api.binance.com/api/v3/ticker/24hr?symbol=WIFUSDT'
```

**Response** (simplified):
```json
{
  "symbol": "WIFUSDT",
  "priceChange": "0.2041",
  "priceChangePercent": "12.45",
  "weightedAvgPrice": "1.7823",
  "lastPrice": "1.842",
  "volume": "104987234",
  "quoteVolume": "193000000",
  "highPrice": "1.9123",
  "lowPrice": "1.6234"
}
```

---

## Skills in Action

### Workflow 1: Full Token Due Diligence

A complete research flow combining 4 skills before trading:

```
Step 1: DISCOVER  → Meme Rush (find new token on Pump.fun)
Step 2: RESEARCH  → Query Token Info (price, volume, holders)
Step 3: AUDIT     → Query Token Audit (honeypot? rug? safe?)
Step 4: SIGNAL    → Trading Signal (are smart wallets buying?)
Step 5: EXECUTE   → Binance Spot (reference CEX price, place order)
```

**Example**: Found "TRUMP CAT" on Meme Rush (85% bonding curve)
1. **Query Token Info** → Price $0.0000892, volume $45k/24h, 234 holders
2. **Token Audit** → `SAFE`, no mint authority, no freeze, dev holds 0.5%
3. **Trading Signal** → 3 smart wallets bought in last 2 hours (bullish)
4. **Binance Spot** → TRUMPCAT not on CEX yet → opportunity for early DEX entry
5. → **BUY** on Raydium at $0.0000892, target $0.0005 (+460%)

---

### Workflow 2: Smart Money Portfolio Mirror

Track what smart wallets hold and mirror their positions:

```
Step 1: Crypto Market Rank  → Get top-performing wallet addresses (PnL Rank)
Step 2: Query Address Info  → See exactly what tokens they hold
Step 3: Trading Signal      → Confirm with smart money buy signals
Step 4: Query Token Info    → Verify liquidity before entering
```

**Example output**:
```
Top Wallet: 0xABC... (PnL: +847% last 30 days)
Holdings: WIF (45%), BONK (30%), POPCAT (25%)
Recent Signal: WIF BUY at $1.24 → now $1.84 (+48.5% gain)
Liquidity: $24.6M ✅ — safe to enter
```

---

### Workflow 3: Meme Token Sniper Pipeline

Fast-execution workflow for catching early launches:

```
Step 1: Meme Rush (stage: New)     → Get fresh tokens <1h old
Step 2: Filter: bondingCurve > 50%, devHolding < 5%, top10 < 30%
Step 3: Token Audit                → Instant safety check
Step 4: Query Token Info           → Verify volume and holder growth
Step 5: Alert Engine               → Set price alert at +50%
```

**Filters used**:
| Filter | Threshold | Why |
|--------|-----------|-----|
| Bonding curve | > 50% | Enough momentum to migrate |
| Dev holding | < 5% | Low rug risk |
| Top 10 holders | < 30% | Decentralized distribution |
| Volume 1h | > $10k | Real trading activity |
| Audit result | SAFE | No honeypot |

---

### Workflow 4: CEX-DEX Arbitrage Alert

Identify price gaps between Binance (CEX) and DEX:

```
Step 1: Crypto Market Rank    → Find token newly listed on Binance
Step 2: Binance Spot          → Get CEX price (BONKUSDT: $0.000028)
Step 3: Query Token Info      → Get DEX price (BONK Raydium: $0.000031)
Step 4: Alert                 → Price gap = +10.7% → potential arb opportunity
```

---

## Quick Reference

### Chain IDs
| Chain | Binance chainId |
|-------|----------------|
| Solana | `CT_501` |
| BSC | `56` |
| Base | `8453` |
| Ethereum | `1` |

### Base URLs
| Service | Base URL |
|---------|----------|
| Binance Web3 API | `https://web3.binance.com/bapi/defi/` |
| Binance Spot API | `https://api.binance.com/api/v3/` |
| Binance Testnet | `https://testnet.binance.vision/api/v3/` |

### Common Headers
```bash
Accept-Encoding: identity
clienttype: web
clientversion: 1.2.0
Content-Type: application/json  # For POST requests
```

---

*Built with 🐧 love for the Binance AI Agent Hackathon*
