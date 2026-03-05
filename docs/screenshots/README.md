# 📸 Screenshots

This directory holds screenshots for the Meme Terminal README.

## How to Add Screenshots

1. **Start the full stack in Demo Mode** (no live API keys required):
   ```bash
   cd backend && DEMO_MODE=true npm start &
   cd frontend && npm run dev
   ```

2. **Open** http://localhost:5173 in your browser

3. **Take screenshots** of each page at **1440 × 900px** (or similar 16:9 widescreen):
   | Filename | Page | What to show |
   |----------|------|--------------|
   | `scanner.png` | `/scanner` (Trending tab) | Token cards with price data, trending tokens |
   | `alerts.png` | `/alerts` | Alert list + the "Add Alert" form open |
   | `wallets.png` | `/wallets` | Wallet watchlist with portfolio data |
   | `settings.png` | `/settings` | Settings page with API health green/connected |

4. **Save** each screenshot as PNG in this directory with the exact filename above.

5. **Commit** and push — GitHub will display them in the README automatically.

## Tips

- Use **Demo Mode** (`DEMO_MODE=true`) so the screenshots always show rich data
- A browser width of **1440px** looks best for the sidebar + content layout
- Use a tool like [CleanShot X](https://cleanshot.com/) or macOS `⌘⇧4` for clean captures
- Crop to the main content area only (exclude browser chrome)

## Placeholder Note

The README references these files. If they don't exist yet, GitHub will simply show a broken-image icon. Add the real screenshots before the first public release.
