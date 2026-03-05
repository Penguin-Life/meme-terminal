#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  Meme Terminal — One-Click Setup Script
#  Installs all dependencies and builds the frontend.
# ─────────────────────────────────────────────────────────────────────────────

set -e  # Exit on any error

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║  🐧  Meme Terminal Setup              ║${RESET}"
echo -e "${CYAN}╚═══════════════════════════════════════╝${RESET}"
echo ""

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null || echo "not found")
if [ "$NODE_VERSION" = "not found" ]; then
  echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org"
  exit 1
fi
echo -e "✅ Node.js ${NODE_VERSION} detected"

# Navigate to project root (parent of scripts/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# ─── Backend Setup ────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}📦 Installing backend dependencies...${RESET}"
cd backend && npm install
echo -e "${GREEN}✅ Backend dependencies installed${RESET}"

# Create .env from example if not present
if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo -e "${YELLOW}⚠️  Created .env from .env.example — update it with your API keys${RESET}"
fi

# ─── Frontend Setup ───────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}🎨 Installing frontend dependencies...${RESET}"
cd ../frontend && npm install
echo -e "${GREEN}✅ Frontend dependencies installed${RESET}"

echo ""
echo -e "${BOLD}🏗️  Building frontend...${RESET}"
npm run build
echo -e "${GREEN}✅ Frontend built successfully${RESET}"

# ─── Done! ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║  ✅  Setup Complete!                  ║${RESET}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${RESET}"
echo ""
echo "  Next steps:"
echo -e "  ${CYAN}npm start${RESET}          — Start in production mode"
echo -e "  ${CYAN}npm run dev${RESET}        — Start in development mode"
echo -e "  ${CYAN}scripts/start.sh${RESET}   — Start backend only"
echo -e "  ${CYAN}scripts/dev.sh${RESET}     — Start backend + frontend dev server"
echo ""
echo "  Or with demo mode (no API keys needed):"
echo -e "  ${CYAN}DEMO_MODE=true node backend/server.js${RESET}"
echo ""
