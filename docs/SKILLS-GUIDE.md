# 🤖 OpenClaw Skills Guide

This guide shows how to install and use the 6 Meme Terminal skills with OpenClaw.

---

## Installation

### Option A: Copy skills directory

```bash
# From the meme-terminal project root:
cp -r skills/dexscreener ~/openclaw/skills/
cp -r skills/pump-fun ~/openclaw/skills/
cp -r skills/gecko-terminal ~/openclaw/skills/
cp -r skills/smart-wallet ~/openclaw/skills/
cp -r skills/meme-radar ~/openclaw/skills/
cp -r skills/meme-terminal ~/openclaw/skills/
```

### Option B: Symlink (easier updates)

```bash
ln -s $(pwd)/skills/dexscreener ~/openclaw/skills/dexscreener
ln -s $(pwd)/skills/pump-fun ~/openclaw/skills/pump-fun
# etc.
```

Restart OpenClaw after installing skills.

---

## Skills Overview

| Skill | Directory | Purpose |
|-------|-----------|---------|
| DexScreener | `skills/dexscreener/` | Token search, prices, trending |
| Pump.fun | `skills/pump-fun/` | New launches, bonding curve |
| GeckoTerminal | `skills/gecko-terminal/` | Multi-chain DEX data |
| Smart Wallet | `skills/smart-wallet/` | Wallet tracking & trades |
| Meme Radar | `skills/meme-radar/` | Unified meme scanner |
| Meme Terminal | `skills/meme-terminal/` | Full analysis pipeline |

---

## Usage Examples

### 🦎 DexScreener Skill

**中文:**
```
搜索 BONK 的价格
PEPE 在哪个链上交易量最大
查一下最热的 solana 代币
```

**English:**
```
Search for WIF token price
What's the trending tokens on Solana right now?
Look up token 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### 💊 Pump.fun Skill

**中文:**
```
pump.fun 现在有什么新发的代币
王者之巅是哪个代币
查一下这个 mint 的绑定曲线进度
```

**English:**
```
What new tokens launched on pump.fun today?
Which token is King of the Hill right now?
Show me the bonding curve progress for 7xKX...
```

### 🐸 GeckoTerminal Skill

**中文:**
```
base 链上的热门流动池有哪些
查 arbitrum 链的新交易对
这个代币在各链的流动性情况
```

**English:**
```
Show trending pools on Base chain
What are the newest pools on Arbitrum?
Get pool info for 0x...
```

### 👛 Smart Wallet Skill

**中文:**
```
追踪这个钱包 5YNmS1234...
这个地址最近买了什么
看看这个钱包的持仓
```

**English:**
```
Track wallet 5YNmS1234...
What tokens has this address bought recently?
Show portfolio for wallet address HN7cABqL...
```

### 🔭 Meme Radar Skill

**中文:**
```
扫描最新的 meme 代币
哪些代币现在最热
全链最新的 meme 代币有哪些
```

**English:**
```
Scan for new meme tokens
What's trending across all chains right now?
Show me hot meme tokens on Solana
```

### 🖥️ Meme Terminal Skill (Full Pipeline)

**中文 — 最常用:**
```
查 $BONK
分析 PEPE
全分析 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
市场概览
帮我分析这个钱包 5YNmS...
```

**English:**
```
Analyze $WIF
Full report on token TRUMP
Market overview
Analyze wallet 5YNmS...
```

---

## Automation Setup

### Heartbeat Monitoring (every 30 min)

Add to your `~/openclaw/workspace/HEARTBEAT.md`:

```markdown
## Meme Terminal Tasks

- Check pump.fun for new launches > 10% bonding curve
- Look for trending tokens with volume spike > 200%
- Alert if any watched wallet makes a large buy (>$10k)
```

### Cron-based Alerts (PM2 scheduler)

```bash
# Check alerts every 5 minutes
openclaw cron add "*/5 * * * *" "cd /path/to/backend && curl -s localhost:3902/api/alerts/check"
```

### Telegram Auto-monitoring

Create a Telegram cron that runs market scans:

```bash
# Daily market briefing at 9 AM
openclaw cron add "0 9 * * *" "query meme-terminal for market overview and send to Telegram"
```

---

## Configuring the Backend URL

Skills read the backend URL from config. Update `skills/meme-terminal/SKILL.md` if you change the port:

```yaml
# Default: http://localhost:3902
backend_url: http://localhost:3902
```

For production deployments, update to your domain:
```yaml
backend_url: https://api.yourdomain.com
```

---

## Troubleshooting

**Skills not showing up?**
- Restart OpenClaw after copying skills
- Check that each skill directory has a `SKILL.md` file
- Run `openclaw skills list` to verify

**Backend connection failed?**
- Ensure backend is running: `curl http://localhost:3902/api/health`
- Check port in `.env`: `PORT=3902`
- Verify CORS: `ALLOWED_ORIGINS=http://localhost:5173`

**Telegram alerts not working?**
- Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in `.env`
- Test: `POST /api/notify/test`
- Make sure you've started a conversation with your bot first
