# 🚀 Navi-AkashAdd commentMore actions

> A powerful Discord bot for Akash Network powered by elizaOS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/Node.js-Bun-green.svg)](https://bun.sh/)
[![Discord](https://img.shields.io/badge/Discord-Bot-blue.svg)](https://discord.js.org/)

Navi-Akash is an intelligent developer support agent for Akash Network that lives and breathes cloud deployment. It helps users navigate the Akash ecosystem, troubleshoot deployment issues, and get projects up and running on the decentralized cloud. The bot has deep knowledge of Akash docs, SDL files, deployment processes, and integrations.

## ✨ Features

- 🤖 **Discord Integration**: Responds to user queries in Discord channels and DMs
- 📚 **Knowledge Base**: Provides information from Akash documentation and resources
- 🔍 **Web Search**: Can search the web for the latest Akash Network updates
- 🎵 **Voice Support**: Can join voice channels for assistance
- 📎 **Media Handling**: Can process attachments and transcribe media

## 🛠️ Tech Stack

- **Runtime**: [Bun.js](https://bun.sh/)
- **Framework**: [elizaOS](https://github.com/elizaOS/eliza)
- **Plugins**:
  - **plugin-akash-chat**: Handles Akash Network specific chat functionality
  - **plugin-discord**: Manages Discord integration
  - **plugin-knowledge**: Provides knowledge base functionality
  - **plugin-web-search**: Enables web search capabilities

## 📋 Prerequisites

- [Bun.js](https://bun.sh/) (latest version)
- Git
- Discord bot token and application ID
- Akash Chat API key
- Tavily API key (for web search)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/fenilmodi00/navi-akash.git
cd navi-akash
```

### 2. Run the Setup Script

That's it! Just run this single command:

```bash
./scripts/build.sh && ./scripts/start.sh
```

This will:
- ✅ Install all dependencies
- ✅ Build all plugins
- ✅ Create a `.env` file from template
- ✅ Start the application

### 3. Configure Environment Variables

The scripts will create a `.env` file for you. You just need to add your API keys:

```bash
# Open the .env file in your favorite editor
nano .env
# or
code .env
```

## 🔑 Required Environment Variables

### Discord Configuration (Required)
Get your Discord credentials from [Discord Developer Portal](https://discord.com/developers/applications):

```env
DISCORD_APPLICATION_ID=your_discord_application_id
DISCORD_API_TOKEN=your_discord_bot_token
```

**How to get Discord credentials:**
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Copy the **Token** for `DISCORD_API_TOKEN`
5. Go to "General Information" and copy **Application ID** for `DISCORD_APPLICATION_ID`

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
# GitHub token for enhanced search (optional)
GITHUB_TOKEN=your_github_token

# Knowledge base settings
CTX_KNOWLEDGE_ENABLED=false
LOAD_DOCS_ON_STARTUP=true
```

## 🎯 Complete Setup Guide

### Step-by-Step Instructions

1. **Clone and Setup**
   ```bash
   git clone https://github.com/fenilmodi00/navi-akash.git
   cd navi-akash
   chmod +x scripts/*.sh
   ```

2. **Build and Start**
   ```bash
   ./scripts/build.sh && ./scripts/start.sh
   ```

3. **Configure Environment**
   - The script will create `.env` file automatically
   - Edit it with your API keys (see sections above)
   - Required keys: `DISCORD_API_TOKEN`, `DISCORD_APPLICATION_ID`, `AKASH_CHAT_API_KEY`, `TAVILY_API_KEY`

4. **Restart with Configuration**
   ```bash
   ./scripts/start.sh
   ```

## 🔧 Development

### Development Mode
```bash
bun run dev
```

### Available Scripts
- `./scripts/build.sh` - Build all plugins and main project
- `./scripts/start.sh` - Start the application
- `./scripts/cleanup.sh` - Clean temporary files
- `./scripts/deploy.sh` - Deploy with Docker

## 🐳 Docker Deployment (Alternative)

If you prefer Docker:

```bash
# Quick deploy with Docker
./scripts/deploy.sh

# Or manually
docker-compose up -d --build
```

## 📁 Project Structure

```
navi-akash/
├── scripts/                  # Build and deployment scripts
│   ├── build.sh             # Build all components
│   ├── start.sh             # Start application
│   ├── cleanup.sh           # Cleanup script
│   └── deploy.sh            # Docker deployment
├── plugins/                  # Plugin directories
│   ├── plugin-akash-chat/    # Akash Network functionality
│   ├── plugin-discord/       # Discord integration
│   ├── plugin-knowledge/     # Knowledge base
│   └── plugin-web-search/    # Web search capabilities
├── src/                      # Main application code
│   ├── agent.ts              # Main agent definition
│   ├── lib/                  # Shared libraries
│   ├── types/                # TypeScript types
│   └── utils/                # Utility functions
├── data/                     # Data storage
│   └── akash-knowledge-base/ # Knowledge base data
└── .env.example              # Environment template
```

## 🔗 API Key Sources

| Service | URL | Purpose | Required |
|---------|-----|---------|----------|
| Discord Developer Portal | [discord.com/developers/applications](https://discord.com/developers/applications) | Bot integration | ✅ Yes |
| Akash Chat API | [chatapi.akash.network](https://chatapi.akash.network) | AI chat functionality | ✅ Yes |
| Tavily | [tavily.com](https://tavily.com) | Web search | ✅ Yes |
| GitHub | [github.com/settings/tokens](https://github.com/settings/tokens) | Enhanced search | ❌ Optional |

## 🚨 Troubleshooting

### Common Issues

1. **Permission Error with Scripts**
   ```bash
   chmod +x scripts/*.sh
   ```

2. **Missing .env File**
   ```bash
   cp .env.example .env
   ```

3. **Build Errors**
   ```bash
   bun install
   ./scripts/cleanup.sh
   ./scripts/build.sh
   ```

4. **Bot Not Responding**
   - Check Discord token and application ID
   - Ensure bot has proper permissions in Discord server
   - Check logs: `bun run start` (without background mode)

### Logs and Debugging

```bash
# Check logs in development
bun run dev

# Check Docker logs (if using Docker)
docker logs navi-akash-bot

# Clean and rebuild everything
./scripts/cleanup.sh && ./scripts/build.sh
```

## 📝 Environment Variables Reference

### Complete .env Template
```env
# Discord Configuration (Required)
DISCORD_APPLICATION_ID=your_discord_application_id
DISCORD_API_TOKEN=your_discord_bot_token

# Akash Chat API (Required)
AKASH_CHAT_API_KEY=your_akash_chat_api_key
AKASH_CHAT_BASE_URL=https://chatapi.akash.network/api/v1
AKASH_CHAT_SMALL_MODEL=Meta-Llama-4-Maverick-17B-128E-Instruct-FP8
AKASH_CHAT_LARGE_MODEL=DeepSeek-R1-0528
AKASH_CHAT_EMBEDDING_MODEL=BAAI-bge-large-en-v1-5
AKASH_CHAT_EMBEDDING_DIMENSIONS=1024

# OpenAI Configuration (Use Akash Chat API key)
OPENAI_BASE_URL=https://chatapi.akash.network/api/v1
OPENAI_API_KEY=your_akash_chat_api_key

# Web Search (Required)
TAVILY_API_KEY=your_tavily_api_key

# Optional
GITHUB_TOKEN=your_github_token
CTX_KNOWLEDGE_ENABLED=false
LOAD_DOCS_ON_STARTUP=true

# Model Configuration
USE_STUDIOLM_TEXT_MODELS=false
USE_OLLAMA_TEXT_MODELS=false
USE_OLLAMA_EMBEDDING=false
EMBEDDING_PROVIDER=openai
TEXT_EMBEDDING_MODEL=BAAI-bge-large-en-v1-5
EMBEDDING_DIMENSION=1024

# Documentation Repositories
DOCS_REPO_1_URL=https://github.com/fenilmodi00/akash-knowledge-base.git
DOCS_REPO_1_PATH=./data/akash-knowledge-base
DOCS_REPO_1_BRANCH=main
DOCS_REPO_1_DOCS_PATH=docs-akash

DOCS_REPO_2_URL=https://github.com/fenilmodi00/akash-knowledge-base.git
DOCS_REPO_2_PATH=./data/akash-knowledge-base-awesome
DOCS_REPO_2_BRANCH=main
DOCS_REPO_2_DOCS_PATH=data/awesome-akash
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💡 Quick Commands Summary

```bash
# Complete setup (one command)
git clone https://github.com/fenilmodi00/navi-akash.git && cd navi-akash && ./scripts/build.sh && ./scripts/start.sh

# Just build
./scripts/build.sh

# Just start
./scripts/start.sh

# Development mode
bun run dev

# Clean and rebuild
./scripts/cleanup.sh && ./scripts/build.sh

# Docker deployment
./scripts/deploy.sh
```
