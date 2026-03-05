# ─────────────────────────────────────────────────────────────────────────────
#  Meme Terminal — Multi-Stage Dockerfile
#  Stage 1: Build frontend with Vite
#  Stage 2: Production backend that serves the built frontend
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Frontend Build ───────────────────────────────────────────────────
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

# Install dependencies first (layer cache)
COPY frontend/package*.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Production Backend ───────────────────────────────────────────────
FROM node:22-alpine

LABEL org.opencontainers.image.title="Meme Terminal"
LABEL org.opencontainers.image.description="AI-Powered Memecoin Trading Terminal"
LABEL org.opencontainers.image.source="https://github.com/Penguin-Life/meme-terminal"

WORKDIR /app

# Install production dependencies only
COPY backend/package*.json ./
RUN npm ci --production

# Copy backend source
COPY backend/ ./

# Copy built frontend from stage 1
COPY --from=frontend-build /app/frontend/dist ./public

# Create data directory for persistent storage
RUN mkdir -p ./data ./logs

# Create non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup && \
    chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 3902

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3902/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Start server
ENV NODE_ENV=production
CMD ["node", "server.js"]
