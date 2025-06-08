# 🚀 Navi - Akash Network Support Agent

> A powerful AI agent specialized in Akash Network deployment support, powered by ElizaOS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ElizaOS](https://img.shields.io/badge/ElizaOS-Agent-blue.svg)](https://github.com/elizaOS/eliza)
[![Akash Network](https://img.shields.io/badge/Akash-Network-red.svg)](https://akash.network/)

Navi is an intelligent developer support agent for Akash Network that helps users navigate the Akash ecosystem, troubleshoot deployment issues, and get projects up and running on the decentralized cloud. The agent has deep knowledge of Akash docs, SDL files, deployment processes, and integrations.

## ✨ Features

- 🤖 **Discord Integration**: Responds to user queries in Discord channels and DMs
- 📚 **Knowledge Base**: Provides information from Akash documentation and resources
- 🔍 **Web Search**: Can search the web for the latest Akash Network updates
- 🎵 **Voice Support**: Can join voice channels for assistance
- 📎 **Media Handling**: Can process attachments and transcribe media
- 🧠 **Akash Chat API**: Uses Akash's own AI infrastructure for responses
- Built-in documentation and examples

## 🛠️ Tech Stack

- **Runtime**: [Bun.js](https://bun.sh/) / Node.js
- **Framework**: [ElizaOS](https://github.com/elizaOS/eliza)
- **Plugins**:
  - **plugin-akash-chat**: Handles Akash Network specific chat functionality
  - **plugin-discord**: Manages Discord integration
  - **plugin-knowledge**: Provides knowledge base functionality
  - **plugin-web-search**: Enables web search capabilities

## 📋 Prerequisites

- [Bun.js](https://bun.sh/) or Node.js (latest version)
- Git
- Discord bot token and application ID
- Akash Chat API key
- Tavily API key (for web search)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Configure Environment Variables

Edit the `.env` file and add your API keys:

```bash
# Discord Configuration (Required)
DISCORD_APPLICATION_ID=your_discord_application_id_here
DISCORD_API_TOKEN=your_discord_bot_token_here

# Akash Chat API Configuration (Required)
AKASH_CHAT_API_KEY=your_akash_chat_api_key_here

# Web Search Configuration (Required)
TAVILY_API_KEY=your_tavily_api_key_here
```

### 3. Build and Run

```bash
npm run build
npm start
# or
bun run build
bun run start
```

## Development

```bash
# Start development server
npm run dev

# Build the project
npm run build

# Test the project
npm run test
```

## Testing

ElizaOS provides a comprehensive testing structure for projects:

### Test Structure

- **Component Tests** (`__tests__/` directory):

  - **Unit Tests**: Test individual functions and components in isolation
  - **Integration Tests**: Test how components work together
  - Run with: `npm run test:component`

- **End-to-End Tests** (`e2e/` directory):

  - Test the project within a full ElizaOS runtime
  - Run with: `npm run test:e2e`

- **Running All Tests**:
  - `npm run test` runs both component and e2e tests

### Writing Tests

Component tests use Vitest:

```typescript
// Unit test example (__tests__/config.test.ts)
describe('Configuration', () => {
  it('should load configuration correctly', () => {
    expect(config.debug).toBeDefined();
  });
});

// Integration test example (__tests__/integration.test.ts)
describe('Integration: Plugin with Character', () => {
  it('should initialize character with plugins', async () => {
    // Test interactions between components
  });
});
```

E2E tests use ElizaOS test interface:

```typescript
// E2E test example (e2e/project.test.ts)
export class ProjectTestSuite implements TestSuite {
  name = 'project_test_suite';
  tests = [
    {
      name: 'project_initialization',
      fn: async (runtime) => {
        // Test project in a real runtime
      },
    },
  ];
}

export default new ProjectTestSuite();
```

The test utilities in `__tests__/utils/` provide helper functions to simplify writing tests.

## Configuration

Customize your project by modifying:

- `src/index.ts` - Main entry point
- `src/character.ts` - Character definition
- `src/plugin.ts` - Plugin configuration

## 🎯 Usage

Once running, Navi can help with:
- Creating SDL (Stack Definition Language) files for Akash deployments
- Troubleshooting deployment issues
- Provider selection and optimization
- GPU deployment guidance
- Persistent storage configuration
- Cost optimization strategies
- Latest Akash Network updates and announcements

## 📁 Project Structure

```
navi/
├── plugins/                  # Plugin directories
│   ├── plugin-akash-chat/    # Akash Network functionality
│   ├── plugin-discord/       # Discord integration
│   ├── plugin-knowledge/     # Knowledge base
│   └── plugin-web-search/    # Web search capabilities
├── src/                      # Main application code
│   └── index.ts              # Main agent definition
├── data/                     # Data storage
│   └── akash-knowledge-base/ # Akash documentation
└── .env                      # Environment configuration
```

## 🔧 Development

### Development Mode
```bash
npm run dev
# or
bun run dev
```

### Available Scripts
- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run dev` - Start in development mode
- `npm run test` - Run tests
- `npm run lint` - Format code with Prettier

## 🐛 Troubleshooting

### Common Issues

1. **Missing API Keys**
   - Ensure all required API keys are set in `.env`
   - Check that Discord bot has proper permissions

2. **Discord Bot Not Responding**
   - Verify Discord token and application ID
   - Ensure bot has proper permissions in Discord server
   - Check logs for connection errors

3. **Build Errors**
   - Run `npm install` or `bun install` to ensure dependencies are installed
   - Check that all required plugins are available

### Logs and Debugging

```bash
# Check logs in development
npm run dev

# Check for any configuration issues
npm run start
```

## 🔑 API Key Sources

### Discord Configuration
Get your Discord credentials from [Discord Developer Portal](https://discord.com/developers/applications):
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Copy the **Token** for `DISCORD_API_TOKEN`
5. Go to "General Information" and copy **Application ID** for `DISCORD_APPLICATION_ID`

### Akash Chat API
Get your API key from [Akash Chat API](https://chatapi.akash.network)

### Tavily API
Get your API key from [Tavily](https://tavily.com) for web search functionality

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ElizaOS](https://github.com/elizaOS/eliza) - The AI agent framework
- [Akash Network](https://akash.network/) - The decentralized cloud platform
- Original [navi-akash](https://github.com/fenilmodi00/navi-akash) project by [Fenil Modi](https://github.com/fenilmodi00)
