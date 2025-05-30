# Verifying Web Search in Discord

This guide explains how to verify that the web search functionality is working correctly in Discord.

## Prerequisites

1. The Navi agent is running and connected to Discord
2. You have the necessary permissions to interact with the bot in Discord

## Testing Steps

1. **Start the agent**:
   ```bash
   npx @elizaos/cli dev
   ```

2. **Verify the agent is connected to Discord**:
   Check the console logs to confirm that the agent has successfully connected to Discord.

3. **Send a test query in Discord**:
   Send a message to the bot in a channel or DM that includes trigger words for web search:
   ```
   What are the latest updates about Akash Network?
   ```

4. **Check the response**:
   The bot should respond with:
   - An acknowledgment that it's searching for information
   - Followed by search results about Akash Network updates

5. **Check the logs**:
   In your terminal where the agent is running, you should see logs indicating:
   - The agent received the message
   - The agent identified it as requiring web search
   - The agent executed the WEB_SEARCH action
   - The agent received search results and responded

## Troubleshooting Discord Web Search

If web search isn't working in Discord:

### 1. Check Environment Variables

Ensure these environment variables are set correctly:
```
TAVILY_API_KEY=your_tavily_api_key
DISCORD_APPLICATION_ID=your_discord_app_id
DISCORD_API_TOKEN=your_discord_token
DISCORD_ENABLE_WEB_SEARCH=true
```

### 2. Check Discord Bot Permissions

The bot needs these permissions:
- Read Messages/View Channels
- Send Messages
- Read Message History

### 3. Check Agent Configuration

In `agent.ts`, verify:
- The Discord plugin is properly imported and included in the plugins list
- The settings include `DISCORD_ENABLE_WEB_SEARCH: "true"`
- The system prompt includes instructions for using web search

### 4. Check Discord Gateway Intents

The bot needs these intents:
- Guilds
- Guild Messages
- Message Content
- Guild Members

### 5. Restart the Agent

Sometimes simply restarting the agent can resolve issues:
```bash
# Stop the current agent (Ctrl+C)
# Then restart it
npx @elizaos/cli dev
```

### 6. Check for Error Messages

Look for error messages in:
- The terminal where the agent is running
- Discord's developer portal (for rate limits or other API issues)

## Example of Working Web Search in Discord

When working correctly, the interaction should look like:

**User**: What are the latest updates about Akash Network?

**Navi**: Let me search for the latest Akash Network updates for you.

*[After a moment]*

**Navi**: Based on my web search about Akash Network updates, here's what I found:

Akash Network recently released version v0.38.2 on March 31, 2025. This is the latest stable release of the Akash node software.

Akash Network is a decentralized cloud computing marketplace that allows users to deploy containerized applications on a network of providers.

The official documentation is maintained on GitHub at github.com/akash-network/docs.

Please note that this information comes from online sources and may need verification from official Akash channels. 