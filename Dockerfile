FROM oven/bun:1 as base

WORKDIR /app

# Install git
RUN apt-get update && apt-get install -y git && apt-get clean

# Copy package files
COPY package.json bun.lock ./

# Copy plugin directories
COPY plugin-discord ./plugin-discord/
COPY plugin-akash-chat ./plugin-akash-chat/
COPY plugin-knowledge ./plugin-knowledge/

# Create necessary directories
RUN mkdir -p data/uploads data/generated generatedImages

# Build each plugin
WORKDIR /app/plugin-discord
COPY plugin-discord/package.json plugin-discord/bun.lock ./
RUN bun install
COPY plugin-discord/ ./
RUN bun run build

WORKDIR /app/plugin-akash-chat
COPY plugin-akash-chat/package.json plugin-akash-chat/bun.lock ./
RUN bun install
COPY plugin-akash-chat/ ./
RUN bun run build

WORKDIR /app/plugin-knowledge
COPY plugin-knowledge/package.json plugin-knowledge/bun.lock ./
RUN bun install
COPY plugin-knowledge/ ./
RUN bun run build

# Return to main directory and build the main project
WORKDIR /app
RUN bun install --production

# Copy the rest of the application
COPY . .

# Build the application
RUN bun run build

# Start the application
CMD ["bun", "run", "start"] 