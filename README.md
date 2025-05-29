# Navi-Akash

A Discord bot for Akash Network powered by elizaOS.

## Project Overview

Navi-Akash is a Discord bot that provides information and assistance for the Akash Network community. It leverages elizaOS and includes several plugins:

- **plugin-akash-chat**: Handles Akash Network specific chat functionality
- **plugin-discord**: Manages Discord integration
- **plugin-knowledge**: Provides knowledge base functionality

## Prerequisites

- Node.js (v16 or higher)
- Bun package manager
- Discord bot token and application
- ElizaOS API key

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/fenilmodi00/navi-akash.git
   cd navi-akash
   ```

2. Install dependencies:
   ```bash
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

To build and run the bot for production:

```bash
bun run build
bun run start
```

## Project Structure

```
navi-akash/
├── plugin-akash-chat/    # Akash Network specific chat functionality
├── plugin-discord/       # Discord integration
├── plugin-knowledge/     # Knowledge base functionality
├── src/                  # Main application code
│   ├── lib/              # Shared libraries
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── docs/                 # Documentation
└── data/                 # Data storage
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.