# 🚀 Navi-Akash

> **A Discord bot for Akash Network powered by elizaOS**

[![Powered by elizaOS](https://img.shields.io/badge/Powered%20by-elizaOS-blue)](https://elizaos.ai)
[![Built with Bun](https://img.shields.io/badge/Built%20with-Bun-orange)](https://bun.sh)
[![Docker](https://img.shields.io/badge/Docker-Ready-green)](https://docker.com)

## 📖 Overview

Navi-Akash is an intelligent Discord bot designed to be your ultimate companion for the Akash Network ecosystem. It serves as a knowledgeable developer support agent that helps users navigate cloud deployments, troubleshoot issues, and get projects running on the decentralized cloud infrastructure.

### ✨ Key Features

- 🤖 **Intelligent Discord Integration** - Responds to queries in channels and DMs
- 📚 **Comprehensive Knowledge Base** - Deep understanding of Akash documentation and resources
- 🔍 **Real-time Web Search** - Access to the latest Akash Network updates and information
- 🎤 **Voice Channel Support** - Can join voice channels for interactive assistance
- 📎 **Media Processing** - Handles attachments and transcribes media content
- 🔧 **SDL & Deployment Support** - Expert knowledge of deployment processes and configurations

## 🛠️ Tech Stack

- **Runtime**: [Bun.js](https://bun.sh) - Fast JavaScript runtime
- **Framework**: [elizaOS](https://elizaos.ai) - AI agent framework
- **Containerization**: Docker & Docker Compose
- **Plugins Architecture**:
  - 🔗 **plugin-akash-chat** - Akash Network specific chat functionality
  - 🎮 **plugin-discord** - Discord integration and bot management
  - 🧠 **plugin-knowledge** - Knowledge base and documentation search
  - 🌐 **plugin-web-search** - Real-time web search capabilities

## 📋 Prerequisites

Before getting started, ensure you have:

- ✅ **Bun.js** (v1.0.0 or later) - [Install Bun](https://bun.sh/docs/installation)
- ✅ **Docker & Docker Compose** (for containerized deployment) - [Install Docker](https://docs.docker.com/get-docker/)
- ✅ **Discord Bot Token** - [Create Discord Application](https://discord.com/developers/applications)
- ✅ **Akash Chat API Key** - [Get API Access](https://chatapi.akash.network)
- ✅ **Tavily API Key** (for web search) - [Tavily API](https://tavily.com)

## 🚀 Quick Start

### Method 1: Automated Setup (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/fenilmodi00/navi-akash.git
cd navi-akash

# 2. Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# 3. Build everything with our automated script
chmod +x scripts/build.sh
./scripts/build.sh

# 4. Start the bot
chmod +x scripts/start.sh
./scripts/start.sh
```

### Method 2: Manual Setup

```bash
# 1. Clone and navigate
git clone https://github.com/fenilmodi00/navi-akash.git
cd navi-akash

# 2. Environment setup
cp .env.example .env
# Edit .env file with your credentials

# 3. Install dependencies for all components
bun run install:all

# 4. Build all plugins and main project
bun run build:all

# 5. Start the application
bun run start
```

### Method 3: Docker Deployment (Production)

```bash
# 1. Clone and setup environment
git clone https://github.com/fenilmodi00/navi-akash.git
cd navi-akash
cp .env.example .env
# Edit .env with your credentials

# 2. Deploy with Docker Compose
docker-compose up -d --build

# 3. View logs
docker logs -f navi-akash-bot
```
## ⚙️ Configuration

### Environment Variables

Create a `.env` file from the example and configure the following variables:

```bash
# Required: Discord Configuration
DISCORD_APPLICATION_ID=your_discord_application_id
DISCORD_API_TOKEN=your_discord_bot_token

# Required: Akash Chat API
AKASH_CHAT_API_KEY=your_akash_chat_api_key
AKASH_CHAT_BASE_URL=https://chatapi.akash.network/api/v1
AKASH_CHAT_SMALL_MODEL=Meta-Llama-4-Maverick-17B-128E-Instruct-FP8
AKASH_CHAT_LARGE_MODEL=DeepSeek-R1-0528

# Required: Web Search
TAVILY_API_KEY=your_tavily_api_key

# Optional: Additional Configuration
GITHUB_TOKEN=your_github_token
CTX_KNOWLEDGE_ENABLED=false
LOAD_DOCS_ON_STARTUP=true
```

### Discord Bot Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Navigate to "Bot" section
4. Create a bot and copy the token
5. Copy the Application ID from "General Information"
6. Invite the bot to your server with appropriate permissions

## 📦 Available Scripts

### Main Commands

| Command | Description |
|---------|-------------|
| `bun run start` | 🚀 Start the production bot |
| `bun run dev` | 🔧 Start development mode with hot reload |
| `bun run build` | 🏗️ Build main project only |
| `bun run test` | 🧪 Run test suite |

### Build Commands

| Command | Description |
|---------|-------------|
| `bun run build:plugins` | 🔌 Build all plugins |
| `bun run build:all` | 🏗️ Build plugins and main project |
| `bun run install:all` | 📦 Install dependencies for all projects |

### Utility Commands

| Command | Description |
|---------|-------------|
| `bun run clean` | 🧹 Clean build artifacts |
| `bun run clean:all` | 🗑️ Clean all build artifacts and node_modules |
| `bun run lint` | 🔍 Run ESLint |
| `bun run format` | ✨ Format code with Prettier |
| `bun run healthcheck` | 💊 Check application health |

### Helper Scripts

| Script | Description |
|--------|-------------|
| `./scripts/build.sh` | 🏗️ Automated build script for all components |
| `./scripts/start.sh` | 🚀 Automated start script with environment checks |

## 🏗️ Project Structure

```
navi-akash/
├── 📁 plugins/                    # Plugin ecosystem
│   ├── 🔗 plugin-akash-chat/      # Akash Network integration
│   ├── 🎮 plugin-discord/         # Discord bot functionality
│   ├── 🧠 plugin-knowledge/       # Knowledge base management
│   └── 🌐 plugin-web-search/      # Web search capabilities
├── 📁 src/                        # Core application
│   ├── 🤖 agent.ts                # Main agent configuration
│   ├── 📁 lib/                    # Shared libraries
│   ├── 📁 types/                  # TypeScript definitions
│   └── 📁 utils/                  # Utility functions
├── 📁 data/                       # Persistent data storage
│   └── 📚 akash-knowledge-base/   # Documentation repository
├── 📁 scripts/                    # Automation scripts
├── 🐳 Dockerfile                  # Container configuration
├── 🐳 docker-compose.yml          # Multi-container setup
└── ⚙️ package.json                # Project configuration
```

## 🔧 Development Guide

### Setting up Development Environment

```bash
# Clone the repository
git clone https://github.com/fenilmodi00/navi-akash.git
cd navi-akash

# Install dependencies
bun run install:all

# Copy environment configuration
cp .env.example .env
# Edit .env with your development credentials

# Start in development mode
bun run dev
```

### Plugin Development

Each plugin is a self-contained module with its own build process:

```bash
# Navigate to a plugin
cd plugins/plugin-discord

# Install plugin dependencies
bun install

# Build the plugin
bun run build

# Return to root and rebuild all
cd ../..
bun run build:all
```

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes to relevant plugins or core
3. Test your changes: `bun run test`
4. Build and verify: `bun run build:all`
5. Format code: `bun run format`
6. Commit and push: `git commit -m "feat: your feature"`

## 🐳 Docker Deployment

### Development with Docker

```bash
# Build development image
docker build -t navi-akash:dev .

# Run with development settings
docker run --rm \
  --env-file .env \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/generatedImages:/app/generatedImages \
  navi-akash:dev
```

### Production Deployment

```bash
# Use Docker Compose for production
docker-compose up -d --build

# Monitor logs
docker logs -f navi-akash-bot

# View resource usage
docker stats navi-akash-bot

# Update deployment
docker-compose pull && docker-compose up -d
```

## 🔍 Monitoring & Maintenance

### Health Checks

The bot includes built-in health monitoring:

```bash
# Manual health check
bun run healthcheck

# Docker health check (automatic)
docker exec navi-akash-bot bun run healthcheck
```

### Log Management

```bash
# View current logs
docker logs navi-akash-bot

# Follow logs in real-time
docker logs -f navi-akash-bot

# View last 100 lines
docker logs --tail 100 navi-akash-bot
```

### Data Persistence

- **`./data/`** - Knowledge base and documentation storage
- **`./generatedImages/`** - Generated images and media cache
- Both directories are mounted as volumes in Docker

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Run `bun run clean:all` then `bun run install:all` |
| Plugin errors | Check individual plugin builds with `cd plugins/[plugin] && bun run build` |
| Discord connection fails | Verify `DISCORD_API_TOKEN` and `DISCORD_APPLICATION_ID` |
| Knowledge base empty | Ensure `LOAD_DOCS_ON_STARTUP=true` and valid repo URLs |
| Memory issues | Increase Docker memory limits in `docker-compose.yml` |

### Debug Mode

```bash
# Enable debug logging
export DEBUG=elizaos:*
bun run dev

# Or with Docker
docker run --rm \
  --env-file .env \
  -e DEBUG=elizaos:* \
  navi-akash:dev
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Setup Development Environment

```bash
# Fork and clone the repository
git clone https://github.com/your-username/navi-akash.git
cd navi-akash

# Create development branch
git checkout -b feature/your-feature-name

# Install dependencies
bun run install:all
```

### 2. Development Workflow

```bash
# Make your changes
# ...

# Format and lint your code
bun run format
bun run lint

# Run tests
bun run test

# Build to ensure everything works
bun run build:all
```

### 3. Submission

```bash
# Commit your changes
git add .
git commit -m "feat: describe your feature"

# Push to your fork
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

### Contribution Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described
- Ensure all builds pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [elizaOS](https://elizaos.ai) - AI agent framework
- [Akash Network](https://akash.network) - Decentralized cloud platform
- [Bun.js](https://bun.sh) - Fast JavaScript runtime
- [Discord.js](https://discord.js.org) - Discord API library

## 📞 Support

- **Documentation**: Check the knowledge base in the `data/` directory
- **Issues**: [GitHub Issues](https://github.com/fenilmodi00/navi-akash/issues)
- **Discord**: Join the Akash Network Discord for community support
- **Email**: Contact the maintainers for urgent issues

---

<div align="center">

**Made with ❤️ for the Akash Network community**

[🌟 Star this repo](https://github.com/fenilmodi00/navi-akash) • [🐛 Report Bug](https://github.com/fenilmodi00/navi-akash/issues) • [💡 Request Feature](https://github.com/fenilmodi00/navi-akash/issues)

</div>