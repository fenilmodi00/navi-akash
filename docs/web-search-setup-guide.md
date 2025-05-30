# Web Search Setup Guide for Navi

This guide explains how to set up and configure the web search functionality for the Navi agent.

## Prerequisites

1. A Tavily API key (get one at [https://tavily.com](https://tavily.com))
2. Access to the Navi agent codebase

## Setup Steps

### 1. Environment Variables

Add the following to your `.env` file:

```
TAVILY_API_KEY=your_tavily_api_key_here
DISCORD_ENABLE_WEB_SEARCH=true
```

### 2. Plugin Installation

Ensure the web search plugin is installed:

```bash
npm install @elizaos/plugin-web-search
```

### 3. Agent Configuration

The agent should already be configured in `src/agent.ts` with:

```javascript
import { webSearchPlugin } from '@elizaos/plugin-web-search';

// ...

const character: Partial<Character> = {
  // ...
  plugins: [
    // ... other plugins
    '@elizaos/plugin-web-search'
  ],
  settings: {
    // ... other settings
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    DISCORD_ENABLE_WEB_SEARCH: "true",
  },
  // ...
};
```

### 4. Testing the Setup

Run the test script to verify that the Tavily API is working correctly:

```bash
node test-web-search.js
```

You should see search results for "latest Akash Network updates" if everything is configured correctly.

## Discord-Specific Configuration

For Discord integration, ensure the following settings are in place:

```javascript
// In your .env file
DISCORD_APPLICATION_ID=your_discord_app_id
DISCORD_API_TOKEN=your_discord_token

// In agent.ts settings
DISCORD_INTENTS: "Guilds,GuildMessages,MessageContent,GuildMembers",
DISCORD_ALLOWED_DMS: "true",
DISCORD_ENABLE_WEB_SEARCH: "true",
```

## Troubleshooting

### Web Search Not Working in Discord

If web search works locally but not in Discord:

1. Check that `DISCORD_ENABLE_WEB_SEARCH` is set to "true"
2. Verify that the Discord bot has the correct permissions
3. Ensure the agent's system prompt includes instructions for using web search
4. Check Discord logs for any error messages related to actions or permissions

### API Key Issues

If you see errors related to the Tavily API key:

1. Verify that the key is correctly set in your `.env` file
2. Check that the key is valid and active in your Tavily account
3. Ensure the environment variable is being properly loaded in the agent configuration

### Testing API Directly

You can test the Tavily API directly using curl:

```bash
curl -X POST https://api.tavily.com/search \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "your_tavily_api_key",
    "query": "latest Akash Network updates",
    "search_depth": "basic",
    "include_answer": true,
    "max_results": 5
  }'
```

This will help determine if the issue is with the API key or with the agent configuration. 