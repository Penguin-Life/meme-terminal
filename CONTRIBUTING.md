# Contributing to Meme Terminal

First off — thank you for taking the time to contribute! 🎉

Every contribution, from a typo fix to a new data source integration, makes Meme Terminal better for the entire community of meme traders.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

---

## Code of Conduct

Be respectful, constructive, and welcoming. We're all here to build something cool.

- No harassment, discrimination, or toxic behavior
- Give and receive feedback graciously
- Assume good intent; ask for clarification before assuming bad intent

---

## How Can I Contribute?

### 🐛 Bug Reports

Found something broken? Open a [Bug Report](https://github.com/Penguin-Life/meme-terminal/issues/new?template=bug_report.md). Include:
- What you did
- What you expected to happen
- What actually happened
- Steps to reproduce
- Node.js version and OS

### 💡 Feature Requests

Have an idea? Open a [Feature Request](https://github.com/Penguin-Life/meme-terminal/issues/new?template=feature_request.md). Explain:
- What problem it solves
- How it would work
- Any alternatives you've considered

### 🔧 Code Contributions

1. Check the [open issues](https://github.com/Penguin-Life/meme-terminal/issues) for something to work on
2. Comment on the issue to claim it (avoid duplicate work)
3. Fork, build, and open a PR

### 📖 Documentation

Docs improvements are always welcome:
- Fix typos or unclear wording
- Add missing examples
- Improve API documentation

---

## Development Setup

### Prerequisites

- Node.js ≥ 22.0.0
- npm ≥ 10.0.0

### Local Setup

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/meme-terminal.git
cd meme-terminal

# 2. Add upstream remote
git remote add upstream https://github.com/Penguin-Life/meme-terminal.git

# 3. Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env as needed
npm run dev

# 4. Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
```

---

## Code Style

### General

- **Clarity over cleverness** — readable code > clever one-liners
- **Consistent naming** — camelCase for variables/functions, PascalCase for React components
- **No magic numbers** — use named constants
- **Error handling** — every async operation must handle errors gracefully

### Backend (Node.js / Express)

```js
// ✅ Good — descriptive names, error handling
async function fetchTokenPrice(chain, address) {
  try {
    const response = await dexscreenerService.getPair(chain, address);
    return { success: true, data: response };
  } catch (err) {
    logger.error('fetchTokenPrice failed', { chain, address, err: err.message });
    return { success: false, error: 'Failed to fetch price' };
  }
}

// ❌ Bad — vague names, swallowed errors
async function get(c, a) {
  const r = await fetch(c, a);
  return r;
}
```

- All API responses must follow the standard structure:
  ```json
  { "success": true, "data": {...} }
  { "success": false, "error": "message", "code": 400 }
  ```
- Use `logger.js` for all logging — never `console.log` in production paths
- Add JSDoc comments for exported functions

### Frontend (React)

```jsx
// ✅ Good — typed props, loading states, error boundaries
function TokenCard({ token, isLoading }) {
  if (isLoading) return <LoadingSkeleton />;
  if (!token) return <EmptyState message="No token data" />;
  return <div className="...">{token.name}</div>;
}

// ❌ Bad — no loading/error handling
function TokenCard({ token }) {
  return <div>{token.name}</div>;
}
```

- Every data-fetching component needs loading + error + empty states
- Use Tailwind utility classes; avoid inline styles
- Keep components focused — split if > ~150 lines
- All user-visible strings should be human-friendly (no raw error codes)

### ESLint

The project uses ESLint. Before submitting a PR:

```bash
cd frontend && npm run lint
```

Fix all warnings and errors.

---

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

**Types:**

| Type | When to use |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code refactor, no feature/fix |
| `perf` | Performance improvement |
| `test` | Adding/fixing tests |
| `chore` | Build, deps, tooling |

**Examples:**
```
feat(backend): add websocket streaming for live prices
fix(frontend): resolve wallet tracker crash on empty balance
docs: update API reference for /analyze/token endpoint
chore(deps): bump axios from 1.6.8 to 1.7.0
```

---

## Pull Request Process

1. **Branch** off `main`: `git checkout -b feat/my-feature`
2. **Write clean code** following the style guide above
3. **Test your changes** manually — start backend + frontend, verify the feature works
4. **Update docs** if you changed any API endpoints or added features
5. **Open a PR** against `main` using the PR template
6. **Respond to reviews** — address comments, push fixes
7. **Squash and merge** once approved

### PR Checklist

- [ ] Code follows the style guide
- [ ] Backend changes: endpoints tested with curl or Postman
- [ ] Frontend changes: tested at mobile (375px) and desktop (1440px)
- [ ] No `console.log` or debug code left in
- [ ] README/docs updated if applicable
- [ ] Commit messages follow Conventional Commits

---

## Project Structure

```
meme-terminal/
├── backend/               # Express.js API server
│   ├── middleware/        # Rate limiting, validation, error handling
│   ├── routes/            # Express route handlers
│   ├── services/          # External API integrations (DexScreener, etc.)
│   ├── utils/             # Logger, cache, retry, data store
│   └── server.js          # Entry point
├── frontend/              # React + Vite dashboard
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route-level page components
│       └── utils/         # API client, helpers
├── skills/                # OpenClaw AI skills
│   ├── dexscreener/
│   ├── pump-fun/
│   ├── gecko-terminal/
│   ├── smart-wallet/
│   ├── meme-radar/
│   └── meme-terminal/
└── docs/                  # Extended documentation
    ├── API.md
    ├── ARCHITECTURE.md
    ├── DEPLOYMENT.md
    └── SKILLS-GUIDE.md
```

---

## Questions?

Open a [GitHub Discussion](https://github.com/Penguin-Life/meme-terminal/discussions) or ping via the issue tracker.

Happy trading! 🐧
