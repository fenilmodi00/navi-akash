# 🚀 Navi-Akash

> A powerful Discord bot for Akash Network powered by elizaOS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node/Bun](https://img.shields.io/badge/Node.js-Bun-green.svg)](https://bun.sh/)
[![Discord](https://img.shields.io/badge/Discord-Bot-blue.svg)](https://discord.js.org/)

Navi-Akash is an intelligent developer support agent for Akash Network that lives and breathes cloud deployment. It helps users navigate the Akash ecosystem, troubleshoot deployment issues, and get projects up and running on the decentralized cloud. The bot has deep knowledge of Akash docs, SDL files, deployment processes, and integrations.

---

## ✨ Features

- 🤖 **Discord Integration**: Responds to user queries in Discord channels and DMs
- 📚 **Knowledge Base**: Provides information from Akash documentation and resources
- 🔍 **Web Search**: Can search the web for the latest Akash Network updates
- 🎵 **Voice Support**: Can join voice channels for assistance
- 📎 **Media Handling**: Can process attachments and transcribe media
- 🧠 **Akash Chat API**: Uses Akash's own AI infrastructure for responses
- Built-in documentation and examples

---

## 🛠️ Tech Stack

- **Runtime**: [Bun.js](https://bun.sh/) / Node.js (18+)
- **Framework**: [elizaOS](https://github.com/elizaOS/eliza)
- **Plugins**:
  - **plugin-akash-chat**: Handles Akash Network specific chat functionality
  - **plugin-discord**: Manages Discord integration
  - **plugin-knowledge**: Provides knowledge base functionality
  - **plugin-web-search**: Enables web search capabilities

---

## 📋 Prerequisites

- [Bun.js](https://bun.sh/) (latest version)
- Node.js (v18+)
- Python 3 (for some dependencies)
- Git
- Discord bot token and application ID
- Akash Chat API key
- Tavily API key (for web search)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/fenilmodi00/navi-akash.git
cd navi-akash
```

### 2. Install Dependencies

```bash
bun install
# or, if you prefer npm:
npm install
```

### 3. Build and Start the Application

```bash
bun run build
bun run start
```

This will:
- ✅ Build all plugins and main project
- ✅ Start the application

For development mode with auto-reload:

```bash
bun run dev
```

### 4. Configure Environment Variables

Edit the `.env` file and add your API keys:

```env
DISCORD_APPLICATION_ID=your_discord_application_id
DISCORD_API_TOKEN=your_discord_bot_token
AKASH_CHAT_API_KEY=your_akash_chat_api_key
TAVILY_API_KEY=your_tavily_api_key
```

---

## 🔑 Required Environment Variables

See `.env.example` for a full template.

### Discord Configuration (Required)
Get your Discord credentials from [Discord Developer Portal](https://discord.com/developers/applications):

```env
DISCORD_APPLICATION_ID=your_discord_application_id
DISCORD_API_TOKEN=your_discord_bot_token
```

### Akash Chat API (Required)
Get your API key from [Akash Chat API](https://chatapi.akash.network):

```env
AKASH_CHAT_API_KEY=your_akash_chat_api_key
OPENAI_API_KEY=your_akash_chat_api_key  # Same as above
```

### Tavily API (Required for Web Search)
Get your API key from [Tavily](https://tavily.com):

```env
TAVILY_API_KEY=your_tavily_api_key
```

### Optional Configuration

```env
GITHUB_TOKEN=your_github_token
CTX_KNOWLEDGE_ENABLED=false
LOAD_DOCS_ON_STARTUP=true
```

---

## 🎯 Complete Setup Guide

### Step-by-Step Instructions

1. **Clone and Setup**
   ```bash
   git clone https://github.com/fenilmodi00/navi-akash.git
   cd navi-akash
   ```

2. **Install Dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Build and Start**
   ```bash
   bun run build && bun run start
   ```

4. **Configure Environment**
   - Copy `.env.example` to `.env` if it doesn't exist: `cp .env.example .env`
   - Edit the `.env` file with your API keys (see sections above)
   - Required keys: `DISCORD_API_TOKEN`, `DISCORD_APPLICATION_ID`, `AKASH_CHAT_API_KEY`, `TAVILY_API_KEY`

5. **Restart with Configuration**
   ```bash
   bun run start
   ```

---

## 🔧 Development

### Development Mode

```bash
bun run dev
# or
npm run dev
```

### Available Scripts

- `bun run build` - Build all plugins and main project
- `bun run start` - Start the application
- `bun run dev` - Start in development mode with auto-reload
- `bun run docker:build` - Build Docker image
- `bun run docker:run` - Run Docker container

---

## 🐳 Docker Deployment (Alternative)

If you prefer Docker:

```bash
# Build and run with Docker
bun run docker:build
bun run docker:run

# Or using docker-compose
docker-compose up -d --build
```

---

## 📁 Project Structure

```
navi-akash/
├── plugins/                  # Plugin directories
│   ├── plugin-akash-chat/    # Akash Network functionality
│   ├── plugin-discord/       # Discord integration
│   ├── plugin-knowledge/     # Knowledge base
│   └── plugin-web-search/    # Web search capabilities
├── src/                      # Main application code
│   ├── index.ts              # Main entry point
│   ├── plugin.ts             # Plugin configuration
│   ├── lib/                  # Shared libraries
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── data/                     # Data storage
│   └── akash-knowledge-base/ # Knowledge base data
├── dist/                     # Built output
├── .env.example              # Environment template
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── docker-compose.yml        # Docker Compose configuration
└── Dockerfile                # Docker image configuration
```

---

## 🔗 API Key Sources

| Service | URL | Purpose | Required |
|---------|-----|---------|----------|
| Discord Developer Portal | [discord.com/developers/applications](https://discord.com/developers/applications) | Bot integration | ✅ Yes |
| Akash Chat API | [chatapi.akash.network](https://chatapi.akash.network) | AI chat functionality | ✅ Yes |
| Tavily | [tavily.com](https://tavily.com) | Web search | ✅ Yes |
| GitHub | [github.com/settings/tokens](https://github.com/settings/tokens) | Enhanced search | ❌ Optional |

---

## 🚨 Troubleshooting

### Common Issues

1. **Permission Error with Scripts**
   ```bash
   # Make sure you have the correct permissions
   bun run build
   ```

2. **Missing .env File**
   ```bash
   cp .env.example .env
   ```

3. **Build Errors**
   ```bash
   bun install
   rm -rf dist node_modules/.cache
   bun run build
   ```

4. **Bot Not Responding**
   - Check Discord token and application ID
   - Ensure bot has proper permissions in Discord server
   - Check logs: `bun run dev` (development mode with logs)

### Logs and Debugging

```bash
# Check logs in development
bun run dev

# Check Docker logs (if using Docker)
docker logs navi-akash-bot

# Clean and rebuild everything
rm -rf dist node_modules/.cache && bun run build
```

---

## 📝 Environment Variables Reference

See `.env.example` for a complete template.

---

## 📄 Akash SDL Deployment Example

To deploy Navi-Akash on Akash Network, use the following SDL file (`deploy.yaml`):

```yaml
---
version: "2.0"

services:
  navi:
    image: registry.gitlab.com/fenil00/navi:v1.0
    expose:
      - port: 3000
        as: 3000
        to:
          - global: true
        http_options:
          max_body_size: 10485760  # 10MB
      - port: 50000
        as: 50000
        proto: udp
        to:
          - global: true
      - port: 50001
        as: 50001
        proto: udp
        to:
          - global: true
      - port: 50002
        as: 50002
        proto: udp
        to:
          - global: true
      - port: 50003
        as: 50003
        proto: udp
        to:
          - global: true
      - port: 50004
        as: 50004
        proto: udp
        to:
          - global: true
    env:
      - AKASH_CHAT_API_KEY=
      - AKASH_CHAT_SMALL_MODEL=DeepSeek-R1-0528
      - AKASH_CHAT_LARGE_MODEL=Meta-Llama-3-2-3B-Instruct
      - AKASH_CHAT_BASE_URL=https://chatapi.akash.network/api/v1
      - OPENAI_BASE_URL=https://chatapi.akash.network/api/v1
      - OPENAI_API_KEY=
      - TAVILY_API_KEY=
      - DISCORD_APPLICATION_ID=
      - DISCORD_API_TOKEN=
      - DISCORD_INTENTS=Guilds,GuildMessages,MessageContent,GuildMembers
      - DISCORD_ALLOWED_DMS=true
      - DISCORD_ENABLE_WEB_SEARCH=true
      - CTX_KNOWLEDGE_ENABLED=false
      - LOAD_DOCS_ON_STARTUP=true
      - EMBEDDING_PROVIDER=akash
      - TEXT_EMBEDDING_MODEL=BAAI-bge-large-en-v1-5
      - EMBEDDING_DIMENSION=1024
      - MAX_CONCURRENT_REQUESTS=50
      - REQUESTS_PER_MINUTE=300
      - TOKENS_PER_MINUTE=200000
      - DOCS_REPO_1_URL=https://github.com/fenilmodi00/akash-knowledge-base.git
      - DOCS_REPO_1_PATH=./data/akash-knowledge-base
      - DOCS_REPO_1_BRANCH=main
      - NODE_ENV=production
      - LOG_LEVEL=debug
    params:
      storage:
        data:
          mount: /app/data
          readOnly: false
        logs:
          mount: /app/logs
          readOnly: false

profiles:
  compute:
    navi:
      resources:
        cpu:
          units: 2
        memory:
          size: 2Gi
        storage:
          - size: 8Gi
          - name: data
            size: 10Gi
            attributes:
              persistent: true
              class: beta3
          - name: logs
            size: 2Gi
            attributes:
              persistent: true
              class: beta3
  placement:
    dcloud:
      pricing:
        navi:
          denom: uakt
          amount: 100000

deployment:
  navi:
    dcloud:
      profile: navi
      count: 1
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💡 Quick Commands Summary

```bash
# Complete setup (one command)
git clone https://github.com/fenilmodi00/navi-akash.git && cd navi-akash && bun install && bun run build && bun run start

# Just build
bun run build

# Just start  
bun run start

# Development mode
bun run dev

# Clean and rebuild
rm -rf dist node_modules/.cache && bun run build

# Docker deployment
bun run docker:build && bun run docker:run
```
