# ==============================================================================
# Multi-Stage Production Dockerfile for CohortLens (Track 2-03)
# ==============================================================================

# Stage 1: Build the React + TypeScript frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy source code and build client bundle
COPY . .
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm install -g tsx

# Copy source and built static assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5000/api/health || exit 1

# Start the unified production server
CMD ["tsx", "server/index.ts"]
