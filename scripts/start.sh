#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e "${CYAN}${BOLD}  ╔══════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}${BOLD}  ║       ModelGate — AI Control Plane           ║${RESET}"
echo -e "${CYAN}${BOLD}  ╚══════════════════════════════════════════════╝${RESET}"
echo ""

# ── Preflight checks ───────────────────────────────────────

# .env
if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo -e "${RED}[error]${RESET} .env file not found. Copy .env.example and add your OPENROUTER_API_KEY."
    exit 1
fi

# Python venv
if [ ! -d "$PROJECT_DIR/backend/venv" ]; then
    echo -e "${YELLOW}[setup]${RESET} Creating Python 3.12 virtual environment..."
    python3.12 -m venv "$PROJECT_DIR/backend/venv" --system-site-packages
    source "$PROJECT_DIR/backend/venv/bin/activate"
    pip install -r "$PROJECT_DIR/backend/requirements.txt" -q
    echo -e "${GREEN}[setup]${RESET} Python venv ready"
else
    source "$PROJECT_DIR/backend/venv/bin/activate"
fi

# Frontend deps
if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
    echo -e "${YELLOW}[setup]${RESET} Installing frontend dependencies..."
    cd "$PROJECT_DIR/frontend" && npm install --silent
    echo -e "${GREEN}[setup]${RESET} Frontend deps ready"
fi

# Seed data
if [ ! -f "$PROJECT_DIR/backend/data/controlplane.db" ]; then
    echo -e "${YELLOW}[setup]${RESET} Seeding demo data..."
    cd "$PROJECT_DIR" && python scripts/seed_data.py
    echo -e "${GREEN}[setup]${RESET} Demo data seeded"
fi

# ── Build frontend for production ──────────────────────────

echo -e "${YELLOW}[frontend]${RESET} Building for production..."
cd "$PROJECT_DIR/frontend"
npx next build 2>&1 | while IFS= read -r line; do
    echo -e "${DIM}[frontend]${RESET} $line"
done
echo -e "${GREEN}[frontend]${RESET} Build complete"

# ── Detect network ─────────────────────────────────────────

TAILSCALE_IP=$(tailscale ip -4 2>/dev/null || echo "")
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "127.0.0.1")

# ── Start services ─────────────────────────────────────────

echo ""
echo -e "${BOLD}Starting services...${RESET}"
echo ""

# Backend
cd "$PROJECT_DIR"
source backend/venv/bin/activate
uvicorn backend.main:app --host 0.0.0.0 --port 8000 2>&1 | while IFS= read -r line; do
    echo -e "${GREEN}[backend]${RESET}  $line"
done &
BACKEND_PID=$!

# Wait for backend to be ready
for i in $(seq 1 30); do
    if curl -s -o /dev/null http://localhost:8000/health 2>/dev/null; then
        break
    fi
    sleep 1
done

# Frontend (production)
cd "$PROJECT_DIR/frontend"
npx next start --hostname 0.0.0.0 --port 3000 2>&1 | while IFS= read -r line; do
    echo -e "${CYAN}[frontend]${RESET} $line"
done &
FRONTEND_PID=$!

sleep 2

# ── Print access info ──────────────────────────────────────

echo ""
echo -e "${BOLD}═══════════════════════════════════════════════${RESET}"
echo -e "${GREEN}${BOLD}  ModelGate is running${RESET}"
echo -e "${BOLD}═══════════════════════════════════════════════${RESET}"
echo ""
echo -e "  ${BOLD}Dashboard${RESET}     http://localhost:3000"
echo -e "  ${BOLD}API${RESET}           http://localhost:8000"
echo -e "  ${BOLD}API Docs${RESET}      http://localhost:8000/docs"
if [ -n "$TAILSCALE_IP" ]; then
    echo ""
    echo -e "  ${BOLD}Remote${RESET}        http://${TAILSCALE_IP}:3000"
    echo -e "  ${BOLD}Remote API${RESET}    http://${TAILSCALE_IP}:8000"
fi
echo ""
echo -e "  ${DIM}Press Ctrl+C to stop all services${RESET}"
echo ""

# ── Cleanup on exit ────────────────────────────────────────

cleanup() {
    echo ""
    echo -e "${YELLOW}[shutdown]${RESET} Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    # Kill any child processes from the pipe
    pkill -P $BACKEND_PID 2>/dev/null
    pkill -P $FRONTEND_PID 2>/dev/null
    pkill -f "uvicorn backend.main" 2>/dev/null
    pkill -f "next start" 2>/dev/null
    echo -e "${GREEN}[shutdown]${RESET} All services stopped"
    exit 0
}

trap cleanup INT TERM
wait
