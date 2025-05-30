# Web Search Integration for Navi

This document explains how web search functionality is integrated into the Navi agent for Akash Network.

## Overview

Navi uses the Tavily API through the `@elizaos/plugin-web-search` plugin to search the web for up-to-date information when users ask about recent Akash Network updates, news, or current information.

## How It Works

1. **Trigger Detection**: When a user asks about recent updates, news, or current information about Akash Network, Navi detects this through specific trigger words in the query.

2. **Action Execution**: Navi uses the `WEB_SEARCH` action provided by the web search plugin to search the web for relevant information.

3. **Response Formatting**: After receiving search results, Navi formats the information in a clear, readable way for users.

## Configuration

The web search functionality is configured in the `agent.ts` file:

- The `TAVILY_API_KEY` environment variable is used to authenticate with the Tavily API
- Discord integration is configured to enable web search actions in Discord
- System prompt and message examples are set up to demonstrate proper web search behavior

## Trigger Words

Navi uses the following trigger words to determine when to use web search:

- latest
- recent
- news
- update
- announcement
- today
- this week
- this month
- roadmap
- upcoming
- release
- social media
- twitter
- discord announcement
- blog post
- new feature
- just released
- yesterday
- current
- now
- what is happening
- what happened
- status
- progress
- development
- launched
- launching
- released
- deployed

## Testing

You can test the web search functionality using the `test-web-search.js` script, which verifies that the Tavily API is working correctly.

## Troubleshooting

If web search isn't working properly:

1. Verify that the `TAVILY_API_KEY` is set correctly in your `.env` file
2. Check that the Discord plugin is configured to enable web search actions
3. Ensure that the agent's system prompt includes instructions for using web search
4. Test the Tavily API directly using the test script

## Discord Integration

For Discord specifically, the agent is configured with:

- `DISCORD_INTENTS` set to include necessary Discord permissions
- `DISCORD_ALLOWED_DMS` enabled to allow direct messages
- `DISCORD_ENABLE_WEB_SEARCH` set to true to enable web search in Discord

These settings ensure that Navi can properly use the web search functionality in Discord channels and direct messages. 