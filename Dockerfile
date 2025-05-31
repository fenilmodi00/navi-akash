FROM oven/bun:1-slim as base

# Set working directory
WORKDIR /app

# Install git and other dependencies, then clean up to reduce image size
RUN apt-get update && \
    apt-get install -y --no-install-recommends git ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lock ./

# Create necessary directories
RUN mkdir -p data/uploads data/generated generatedImages

# Copy plugin directories
COPY plugins/ ./plugins/

# Build stage
FROM base as builder

# Build plugin-discord
WORKDIR /app/plugins/plugin-discord
COPY plugins/plugin-discord/package.json plugins/plugin-discord/bun.lock ./
RUN bun install
COPY plugins/plugin-discord/ ./
RUN bun run build

# Build plugin-akash-chat
WORKDIR /app/plugins/plugin-akash-chat
COPY plugins/plugin-akash-chat/package.json plugins/plugin-akash-chat/bun.lock ./
RUN bun install
COPY plugins/plugin-akash-chat/ ./
RUN bun run build

# Build plugin-knowledge
WORKDIR /app/plugins/plugin-knowledge
COPY plugins/plugin-knowledge/package.json plugins/plugin-knowledge/bun.lock ./
RUN bun install
COPY plugins/plugin-knowledge/ ./
RUN bun run build

# Build plugin-web-search
WORKDIR /app/plugins/plugin-web-search
COPY plugins/plugin-web-search/package.json plugins/plugin-web-search/bun.lock ./
RUN bun install
COPY plugins/plugin-web-search/ ./
RUN bun run build

# Return to main directory and build the main project
WORKDIR /app
RUN bun install
COPY . .
RUN bun run build

# Production stage
FROM base as production

# Copy built artifacts from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/plugins/plugin-discord/dist ./plugins/plugin-discord/dist
COPY --from=builder /app/plugins/plugin-akash-chat/dist ./plugins/plugin-akash-chat/dist
COPY --from=builder /app/plugins/plugin-knowledge/dist ./plugins/plugin-knowledge/dist
COPY --from=builder /app/plugins/plugin-web-search/dist ./plugins/plugin-web-search/dist

# Install production dependencies only
COPY package.json bun.lock ./
RUN bun install --production

# Copy plugin package.json files for production dependencies
COPY plugins/plugin-discord/package.json ./plugins/plugin-discord/
COPY plugins/plugin-akash-chat/package.json ./plugins/plugin-akash-chat/
COPY plugins/plugin-knowledge/package.json ./plugins/plugin-knowledge/
COPY plugins/plugin-web-search/package.json ./plugins/plugin-web-search/

# Install production dependencies for plugins
WORKDIR /app/plugins/plugin-discord
RUN bun install --production
WORKDIR /app/plugins/plugin-akash-chat
RUN bun install --production
WORKDIR /app/plugins/plugin-knowledge
RUN bun install --production
WORKDIR /app/plugins/plugin-web-search
RUN bun install --production

# Return to main directory
WORKDIR /app

# Create data directories
RUN mkdir -p data/uploads data/generated generatedImages

# Set up healthcheck using our custom script
COPY src/healthcheck.ts ./healthcheck.ts
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD ["bun", "run", "healthcheck.ts"]

# Set environment variables
ENV NODE_ENV=production

# Set non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 bunjs && \
    chown -R bunjs:nodejs /app

USER bunjs

# Start the application
CMD ["bun", "run", "start"] 