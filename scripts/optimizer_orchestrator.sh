#!/bin/bash
# Meme Terminal Optimizer Orchestrator
# Runs continuous self-iteration rounds until DEADLINE or manual stop

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STATUS_FILE="$PROJECT_DIR/.optimizer-orchestrator.status"
LOG_FILE="$PROJECT_DIR/.optimizer-orchestrator.log"
PROMPT_FILE="$PROJECT_DIR/.optimizer-prompt.txt"

# Deadline: 2026-03-11 01:25 CST (5 min before 01:30 hard stop)
DEADLINE_EPOCH=$(date -j -f "%Y-%m-%d %H:%M:%S" "2026-03-11 01:25:00" "+%s" 2>/dev/null || echo 1773167100)

MAX_ROUND_SECONDS=600  # 10 min per round max
ROUND=0

# macOS timeout alternative
run_with_timeout() {
  local secs=$1
  shift
  perl -e 'alarm shift; exec @ARGV' "$secs" "$@"
}

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

update_status() {
  echo "state=$1
round=$ROUND
timestamp=$(date '+%Y-%m-%d %H:%M:%S')
deadline=$(date -r $DEADLINE_EPOCH '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo '2026-03-11 01:25:00')
pid=$$" > "$STATUS_FILE"
}

cleanup() {
  log "Orchestrator shutting down after round $ROUND"
  update_status "stopped"
  exit 0
}
trap cleanup SIGTERM SIGINT

# Clear previous log
> "$LOG_FILE"

log "=== Orchestrator started (PID $$) ==="
log "Deadline: $(date -r $DEADLINE_EPOCH '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo '2026-03-11 01:25:00')"
update_status "running"

while true; do
  NOW_EPOCH=$(date '+%s')
  if [ "$NOW_EPOCH" -ge "$DEADLINE_EPOCH" ]; then
    log "Deadline reached. Stopping."
    update_status "deadline_reached"
    break
  fi

  ROUND=$((ROUND + 1))
  log "--- Starting round $ROUND ---"
  update_status "running_round_$ROUND"

  # Run Claude Code for one round
  cd "$PROJECT_DIR"
  PROMPT=$(cat "$PROMPT_FILE")
  
  run_with_timeout $MAX_ROUND_SECONDS claude --permission-mode bypassPermissions --print "$PROMPT" >> "$LOG_FILE" 2>&1
  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 142 ]; then
    log "Round $ROUND timed out after ${MAX_ROUND_SECONDS}s (SIGALRM)"
  elif [ $EXIT_CODE -ne 0 ]; then
    log "Round $ROUND exited with code $EXIT_CODE"
    # If Claude Code itself fails (not found, auth error etc), don't loop forever
    if [ $EXIT_CODE -eq 127 ]; then
      log "FATAL: claude command not found. Aborting."
      update_status "error_claude_not_found"
      exit 1
    fi
    # Rate limit or auth error — wait 30s before retry
    if [ $EXIT_CODE -eq 1 ]; then
      log "Possible rate limit or error, waiting 30s..."
      sleep 30
    fi
  else
    log "Round $ROUND completed successfully"
  fi

  # Commit changes if any (only real code changes, not just status files)
  cd "$PROJECT_DIR"
  CHANGED=$(git diff --name-only && git ls-files --others --exclude-standard | grep -v '\.optimizer-' | grep -v '.log$')
  if [ -n "$CHANGED" ]; then
    git add -A -- ':!.optimizer-orchestrator.log'
    git commit -m "optimizer: round $ROUND self-iteration" --no-verify >> "$LOG_FILE" 2>&1
    log "Round $ROUND changes committed"
  else
    log "Round $ROUND: no meaningful file changes"
  fi

  # Brief pause between rounds
  sleep 5
done

log "=== Orchestrator finished after $ROUND rounds ==="
update_status "completed"
