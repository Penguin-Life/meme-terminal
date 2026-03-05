#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  Meme Terminal — Production Start Script
#  Starts the backend server (with PM2 if available, otherwise plain node).
# ─────────────────────────────────────────────────────────────────────────────

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RESET='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo ""
echo -e "${CYAN}🚀 Starting Meme Terminal...${RESET}"
echo ""

cd "$PROJECT_ROOT/backend"

# Load environment
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo -e "✅ Loaded .env"
fi

PORT="${PORT:-3902}"
NODE_ENV="${NODE_ENV:-production}"

echo -e "   Port: ${CYAN}${PORT}${RESET}"
echo -e "   Environment: ${CYAN}${NODE_ENV}${RESET}"

if [ "${DEMO_MODE}" = "true" ]; then
  echo -e "   Mode: ${YELLOW}🎭 DEMO (mock data)${RESET}"
fi

echo ""

# Try PM2 first, fall back to node
if command -v pm2 &>/dev/null; then
  echo -e "${BOLD}Starting with PM2...${RESET}"
  
  # Check if ecosystem config exists
  if [ -f ecosystem.config.js ]; then
    pm2 start ecosystem.config.js --env production
  else
    pm2 start server.js --name meme-terminal \
      --env NODE_ENV=production \
      --log ./logs/pm2.log \
      --time
  fi
  
  echo ""
  echo -e "${GREEN}✅ Meme Terminal started with PM2${RESET}"
  echo ""
  echo "  Commands:"
  echo -e "  ${CYAN}pm2 status${RESET}          — Check status"
  echo -e "  ${CYAN}pm2 logs meme-terminal${RESET} — View logs"
  echo -e "  ${CYAN}pm2 stop meme-terminal${RESET} — Stop server"
  echo -e "  ${CYAN}pm2 restart meme-terminal${RESET} — Restart server"
else
  echo -e "${YELLOW}PM2 not found — starting with node (install PM2 for production: npm install -g pm2)${RESET}"
  echo ""
  echo -e "  Starting on http://localhost:${PORT}"
  echo ""
  NODE_ENV="$NODE_ENV" node server.js
fi
