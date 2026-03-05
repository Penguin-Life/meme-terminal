#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  Meme Terminal — Development Start Script
#  Starts backend + frontend dev server concurrently.
# ─────────────────────────────────────────────────────────────────────────────

BOLD='\033[1m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RESET='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo ""
echo -e "${CYAN}╔═══════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║  🔧  Meme Terminal Dev Mode           ║${RESET}"
echo -e "${CYAN}╚═══════════════════════════════════════╝${RESET}"
echo ""
echo -e "  Backend:  ${CYAN}http://localhost:3902${RESET}"
echo -e "  Frontend: ${CYAN}http://localhost:5173${RESET}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all processes${RESET}"
echo ""

# Load backend .env
if [ -f "$PROJECT_ROOT/backend/.env" ]; then
  set -a
  source "$PROJECT_ROOT/backend/.env"
  set +a
fi

# Function to cleanup background processes on exit
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down dev servers...${RESET}"
  kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
  exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${BOLD}Starting backend...${RESET}"
cd "$PROJECT_ROOT/backend"
NODE_ENV=development node server.js &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${RESET}"

# Small delay to let backend initialize
sleep 1

# Start frontend dev server
echo -e "${BOLD}Starting frontend dev server...${RESET}"
cd "$PROJECT_ROOT/frontend"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend dev server started (PID: $FRONTEND_PID)${RESET}"

echo ""
echo -e "${GREEN}🚀 Dev servers running! Open http://localhost:5173${RESET}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
