# Navi-Akash

A Discord bot for Akash Network powered by elizaOS.

## Project Overview

Navi-Akash is a developer support agent for Akash Network that lives and breathes cloud deployment. It helps users navigate the Akash ecosystem, troubleshoot deployment issues, and get projects up and running on the decentralized cloud. The bot has deep knowledge of Akash docs, SDL files, deployment processes, and integrations.

## Features

- **Discord Integration**: Responds to user queries in Discord channels and DMs
- **Knowledge Base**: Provides information from Akash documentation and resources
- **Web Search**: Can search the web for the latest Akash Network updates
- **Voice Support**: Can join voice channels for assistance
- **Media Handling**: Can process attachments and transcribe media

## Tech Stack

- **Runtime**: Bun.js
- **Framework**: elizaOS
- **Plugins**:
  - **plugin-akash-chat**: Handles Akash Network specific chat functionality
  - **plugin-discord**: Manages Discord integration
  - **plugin-knowledge**: Provides knowledge base functionality
  - **plugin-web-search**: Enables web search capabilities

## Prerequisites

- Bun.js (latest version)
- Docker and Docker Compose (for containerized deployment)
- Discord bot token and application ID
- Akash Chat API key
- Tavily API key (for web search)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fenilmodi00/navi-akash.git
   cd navi-akash
   ```

2. Install dependencies and build the project:
   ```bash
   # Automated build script (recommended)
   ./build.sh
   
   # Or manually
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit the `.env` file with your actual credentials.

## Development

To run the bot in development mode:

```bash
bun run dev
```

## Production Deployment

### Using Docker (Recommended)

Build and run using Docker Compose:

```bash
# Use the automated deployment script
./deploy.sh

# Or manually with Docker Compose
docker-compose up -d --build
```

### Manual Deployment

#### Using the Provided Scripts (Recommended)

```bash
# Build all plugins and the main project
./build.sh

# Start the application
./start.sh
```

#### Manual Commands

To build and run the bot for production:

```bash
# Build each plugin individually
cd plugins/plugin-akash-chat
bun install && bun run build
cd ../plugin-discord
bun install && bun run build
cd ../plugin-knowledge
bun install && bun run build
cd ../plugin-web-search
bun install && bun run build
cd ../..

# Build and start the main project
bun install
bun run build
bun run start
```

## Project Structure

```
navi-akash/
├── plugins/                  # Plugin directories
│   ├── plugin-akash-chat/    # Akash Network specific chat functionality
│   ├── plugin-discord/       # Discord integration
│   ├── plugin-knowledge/     # Knowledge base functionality
│   └── plugin-web-search/    # Web search capabilities
├── src/                      # Main application code
│   ├── agent.ts              # Main agent definition
│   ├── lib/                  # Shared libraries
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
├── data/                     # Data storage (mounted as volume in Docker)
│   └── akash-knowledge-base/ # Knowledge base data
├── generatedImages/          # Storage for generated images
├── Dockerfile                # Docker configuration
└── docker-compose.yml        # Docker Compose configuration
```

## Environment Variables

The following environment variables are required:

```
# Akash Chat API Configuration
AKASH_CHAT_API_KEY=your_akash_chat_api_key
AKASH_Chat_SMALL_MODEL=your_small_model_name
AKASH_Chat_LARGE_MODEL=your_large_model_name

# Discord Bot Configuration
DISCORD_APPLICATION_ID=your_discord_application_id
DISCORD_API_TOKEN=your_discord_bot_token

# Web Search Configuration
TAVILY_API_KEY=your_tavily_api_key
```

## Maintenance

- Logs are stored in the Docker container and can be viewed with `docker logs navi-akash-bot`
- The bot will automatically restart unless explicitly stopped
- Data is persisted in the `data` and `generatedImages` directories

## Maintenance Scripts

The project includes helpful maintenance scripts:

- `build.sh`: Builds all plugins and the main project
- `start.sh`: Starts the application and ensures the .env file exists
- `cleanup.sh`: Removes temporary files and cleans up storage
- `deploy.sh`: Automates production deployment with Docker

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.