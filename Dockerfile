# Multi-stage build for smaller image using Bun
FROM oven/bun:1.1-alpine AS base

# Install dependencies needed for native modules
RUN apk add --no-cache python3 make g++ pkgconfig cairo-dev pango-dev

WORKDIR /app

# Copy package files
COPY package.json bun.lockb bunfig.toml ./
COPY plugins/*/package.json ./plugins/*/

# Install dependencies
FROM base AS deps
RUN bun install --frozen-lockfile --production

# Build stage
FROM base AS builder
COPY . .
RUN bun install --frozen-lockfile
RUN bun run build

# Production stage
FROM oven/bun:1.1-alpine AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# Don't copy data folder - use external storage or volume mount
# COPY --from=builder /app/data ./data

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["bun", "start"]