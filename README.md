# Navi Discord Bot for Akash Network

A Discord bot powered by elizaOS that provides developer support for Akash Network.

## Project Structure (Monorepo)

This project is organized as a monorepo with the following components:

- `src/` - Main application code
- `plugin-discord/` - Discord bot plugin (submodule)
- `plugin-akash-chat/` - Akash Network Chat plugin (submodule)
- `akash/` - Documentation and information about Akash Network
- `elizadb/` - Database for storing conversation history and other data
- `data/` - Data storage directory for uploads and generated content

## Production Setup

### Option 1: Automated Setup (Recommended)

Simply run the start script which will handle everything:

```bash
./start.sh
```

This script will:
1. Check for required dependencies
2. Initialize and update git submodules
3. Create the `.env` file if needed
4. Deploy using Docker if available, or fallback to standard deployment
5. Install and build all necessary dependencies

### Option 2: Manual Setup

1. **Clone the repository with submodules:**
   ```bash
   git clone https://github.com/yourusername/navi-discord.git
   cd navi-discord
   git submodule update --init --recursive
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root of the project by copying the example:
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file and add your actual API keys and tokens.

3. **Choose deployment method:**

   **A. Docker Deployment (Recommended for Production)**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

   **B. Standard Deployment**
   ```bash
   # Install main project dependencies
   npm install
   
   # Install submodule dependencies
   (cd plugin-discord && npm install)
   (cd plugin-akash-chat && npm install)
   
   # Build and start the application
   npm run build
   npm run start
   ```

## Development Setup

1. **Clone the repository with submodules:**
   ```bash
   git clone https://github.com/yourusername/navi-discord.git
   cd navi-discord
   git submodule update --init --recursive
   ```

2. **Install dependencies for all modules:**
   ```bash
   npm install
   (cd plugin-discord && npm install)
   (cd plugin-akash-chat && npm install)
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file for your development environment.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## Environment Variables

The following environment variables are required in your `.env` file:

- `DISCORD_TOKEN` - Your Discord bot token
- `DISCORD_CLIENT_ID` - Your Discord application client ID
- `DISCORD_GUILD_ID` - Your Discord server ID
- `ELIZAOS_API_KEY` - Your elizaOS API key
- `AKASH_NETWORK_API_KEY` - Your Akash Network API key

See `.env.example` for more configuration options.

## Monitoring & Maintenance

### Docker Deployment

- **View logs:**
  ```bash
  docker-compose logs -f
  ```

- **Restart the service:**
  ```bash
  docker-compose restart
  ```

- **Update to latest version:**
  ```bash
  git pull
  git submodule update --init --recursive
  docker-compose down
  docker-compose build
  docker-compose up -d
  ```

### Standard Deployment

- **Update to latest version:**
  ```bash
  git pull
  git submodule update --init --recursive
  npm install
  (cd plugin-discord && npm install)
  (cd plugin-akash-chat && npm install)
  npm run build
  npm run start
  ```

## Features

- Provide developer support for Akash Network through Discord
- Answer questions about Akash Network, its features, and implementation details
- Help with creating YML files for deployment on Akash Network
- Provide technical guidance on using Akash Network features