# Railway Dockerfile optimized for ElizaOS deployment
FROM node:20-bullseye-slim AS base

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PYTHON=/usr/bin/python3

# Install system dependencies including Python and build tools
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    python3 \
    python3-pip \
    python3-dev \
    python3-distutils \
    ffmpeg \
    git \
    unzip \
    libopus-dev \
    libsodium-dev \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Set Python for node-gyp and bun
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3

WORKDIR /app

# Builder stage
FROM base AS builder

# Copy package files first for better caching
COPY package.json bun.lock ./
COPY bunfig.toml* ./
COPY tsconfig*.json ./
COPY tsup.config.ts ./

# Copy plugin configuration files
COPY plugins/plugin-akash-chat/package.json ./plugins/plugin-akash-chat/
COPY plugins/plugin-akash-chat/tsconfig*.json ./plugins/plugin-akash-chat/
COPY plugins/plugin-akash-chat/tsup.config.ts* ./plugins/plugin-akash-chat/

COPY plugins/plugin-discord/package.json ./plugins/plugin-discord/
COPY plugins/plugin-discord/tsconfig*.json ./plugins/plugin-discord/
COPY plugins/plugin-discord/tsup.config.ts* ./plugins/plugin-discord/

COPY plugins/plugin-knowledge/package.json ./plugins/plugin-knowledge/
COPY plugins/plugin-knowledge/tsconfig*.json ./plugins/plugin-knowledge/
COPY plugins/plugin-knowledge/tsup.config.ts* ./plugins/plugin-knowledge/
COPY plugins/plugin-knowledge/vite.config.ts* ./plugins/plugin-knowledge/
COPY plugins/plugin-knowledge/postcss.config.js* ./plugins/plugin-knowledge/
COPY plugins/plugin-knowledge/tailwind.config.js* ./plugins/plugin-knowledge/
COPY plugins/plugin-knowledge/index.html* ./plugins/plugin-knowledge/

COPY plugins/plugin-web-search/package.json ./plugins/plugin-web-search/
COPY plugins/plugin-web-search/tsconfig*.json ./plugins/plugin-web-search/
COPY plugins/plugin-web-search/tsup.config.ts* ./plugins/plugin-web-search/

# Install dependencies with proper Python environment
ENV npm_config_build_from_source=true
ENV npm_config_python=/usr/bin/python3
RUN bun install --frozen-lockfile

# Copy source code
COPY src ./src
COPY plugins ./plugins

# Build the application
RUN bun run build

# Production stage
FROM node:20-bullseye-slim AS runner
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ffmpeg \
    git \
    python3 \
    unzip \
    libopus0 \
    libsodium23 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Bun for runtime
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

# Create non-root user
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home eliza

# Copy package.json and install production dependencies
COPY --from=builder --chown=eliza:nodejs /app/package.json ./
COPY --from=builder --chown=eliza:nodejs /app/bunfig.toml* ./

# Copy plugin package.json files
COPY --from=builder --chown=eliza:nodejs /app/plugins/plugin-akash-chat/package.json ./plugins/plugin-akash-chat/
COPY --from=builder --chown=eliza:nodejs /app/plugins/plugin-discord/package.json ./plugins/plugin-discord/
COPY --from=builder --chown=eliza:nodejs /app/plugins/plugin-knowledge/package.json ./plugins/plugin-knowledge/
COPY --from=builder --chown=eliza:nodejs /app/plugins/plugin-web-search/package.json ./plugins/plugin-web-search/

# Copy built application
COPY --from=builder --chown=eliza:nodejs /app/dist ./dist
COPY --from=builder --chown=eliza:nodejs /app/plugins/plugin-akash-chat/dist ./plugins/plugin-akash-chat/dist
COPY --from=builder --chown=eliza:nodejs /app/plugins/plugin-discord/dist ./plugins/plugin-discord/dist
COPY --from=builder --chown=eliza:nodejs /app/plugins/plugin-knowledge/dist ./plugins/plugin-knowledge/dist
COPY --from=builder --chown=eliza:nodejs /app/plugins/plugin-web-search/dist ./plugins/plugin-web-search/dist

# Copy any additional assets
COPY --from=builder --chown=eliza:nodejs /app/plugins/plugin-knowledge/.vite ./plugins/plugin-knowledge/.vite 2>/dev/null || true

# Copy node_modules with built native dependencies
COPY --from=builder --chown=eliza:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER eliza

# Railway environment variables
ENV NODE_ENV=production
ENV PORT=${PORT:-3000}

# Expose the port
EXPOSE $PORT

# Start the application
CMD ["bun", "start"]
