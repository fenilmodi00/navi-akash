FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    python3 \
    make \
    git \
    curl

# Install bun globally
RUN npm install -g bun@1.2.5

# Create python symlink
RUN ln -s /usr/bin/python3 /usr/bin/python

# Copy package files and configurations
COPY package.json bun.lock bunfig.toml tsconfig.json tsup.config.ts ./

# Copy source code and plugins
COPY src ./src
COPY plugins ./plugins

# Copy data directory for knowledge base
COPY data ./data

# Install dependencies and build
RUN bun install --production --no-cache

# Build the project
RUN bun run build

# Clean up build artifacts and dev dependencies
RUN rm -rf node_modules/.cache \
    && rm -rf /root/.bun/install/cache \
    && find . -name "*.test.*" -delete \
    && find . -name "*.spec.*" -delete

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache \
    curl \
    ffmpeg \
    git \
    python3

# Install bun globally
RUN npm install -g bun@1.2.5

# Copy built application from builder stage
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bunfig.toml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/plugins ./plugins

# Set environment to production
ENV NODE_ENV=production

# Expose default ports
EXPOSE 3000
EXPOSE 50000-50100/udp

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application with the built project file
CMD ["./node_modules/.bin/elizaos", "start", "./dist/index.js"]
