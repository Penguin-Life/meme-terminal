# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Active support |
| < 1.0   | ❌ No longer supported |

---

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

If you discover a security vulnerability in Meme Terminal, we ask that you report it **privately** so we can address it before public disclosure.

### How to Report

1. **Email:** Send details to `security@penguinlife.dev`  
   *(No public email? Open a [private security advisory](https://github.com/Penguin-Life/meme-terminal/security/advisories/new) via GitHub's built-in feature.)*

2. **Include in your report:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested mitigations (optional but appreciated)

3. **Response timeline:**
   - We will acknowledge receipt within **48 hours**
   - Initial assessment within **7 days**
   - Fix or mitigation plan within **30 days** for critical issues

### What to Expect

- You'll receive a confirmation that we received your report
- We'll investigate and keep you informed of progress
- Once fixed, we'll credit you in the release notes (unless you prefer to remain anonymous)
- We ask that you give us reasonable time to fix before public disclosure

---

## Security Model

Meme Terminal is designed as a **self-hosted** application. Key security considerations:

### Backend API

- **Rate limiting** on all endpoints (express-rate-limit)
- **Input validation** middleware on all routes
- **Helmet.js** security headers (HSTS, CSP, X-Frame-Options, etc.)
- **CORS** restricted to configured origins only
- **No authentication** by default — intended for localhost or private network deployment

> ⚠️ **Do not expose the backend API to the public internet without adding authentication.** The API has no auth layer by design — it's meant to run on localhost or behind a private reverse proxy.

### Environment Variables

- Never commit `.env` files (`.gitignore` excludes them)
- Telegram bot tokens and API keys should only be stored in `.env`
- Use minimal-permission Telegram bots (no admin rights needed)

### Data Storage

- `watchlist.json` and `alerts.json` are stored locally — no cloud sync
- No user passwords or private keys are ever stored
- Logs are written to `backend/logs/` — rotate or exclude from production deployments

### Dependencies

We regularly audit dependencies with:
```bash
npm audit
```

If you find a vulnerable dependency, please report it so we can update.

---

## Out of Scope

The following are **not** considered security vulnerabilities for this project:

- Rate limiting bypass on localhost (no auth is by design for local use)
- Missing HTTPS (configure your own reverse proxy for production)
- Theoretical attacks requiring physical access to the host machine
- Vulnerabilities in third-party APIs (DexScreener, GeckoTerminal, etc.) — report those upstream

---

Thank you for helping keep Meme Terminal secure! 🔒
