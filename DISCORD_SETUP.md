# Discord Bot Setup Guide for Navi

## Step 1: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Name it "Navi" or your preferred name
4. Click "Create"

## Step 2: Set up the Bot

1. Go to the "Bot" section in the left sidebar
2. Click "Add Bot" if not already created
3. Under "Token", click "Reset Token" and copy the new token
4. **Important**: Keep this token secret!

## Step 3: Configure Bot Permissions

In the Bot section, enable these options:
- ✅ **Public Bot** (if you want others to invite it)
- ✅ **Requires OAuth2 Code Grant** (recommended for security)

Under "Privileged Gateway Intents":
- ✅ **Presence Intent**
- ✅ **Server Members Intent** 
- ✅ **Message Content Intent**

## Step 4: Update Environment Variables

Update your `.env` file:

```bash
DISCORD_APPLICATION_ID=your_application_id_here
DISCORD_API_TOKEN=your_bot_token_here
```

## Step 5: Invite Bot to Server

1. Go to "OAuth2" > "URL Generator"
2. Select scopes:
   - ✅ **bot**
   - ✅ **applications.commands**

3. Select bot permissions:
   - ✅ **Send Messages**
   - ✅ **Read Message History**
   - ✅ **Use Slash Commands**
   - ✅ **Embed Links**
   - ✅ **Attach Files**
   - ✅ **Read Messages/View Channels**

4. Copy the generated URL and open it in your browser
5. Select your server and authorize the bot

## Step 6: Test the Bot

1. Restart your Navi application
2. In your Discord server, try messaging the bot
3. Check the console for any errors

## Troubleshooting

### "Invalid Token" Error
- Make sure you copied the token correctly
- Regenerate the token if needed
- Check for extra spaces or characters

### Bot Not Responding
- Verify the bot has the correct permissions
- Check if the bot is online in your server
- Look for errors in the console logs

### Permission Issues
- Ensure the bot role has sufficient permissions
- Check channel-specific permissions
- Verify the bot can see the channels you're testing in

## Environment Variables Reference

```bash
# Required for Discord
DISCORD_APPLICATION_ID=your_application_id
DISCORD_API_TOKEN=your_bot_token

# Optional Discord settings
DISCORD_INTENTS=Guilds,GuildMessages,MessageContent,GuildMembers
DISCORD_ALLOWED_DMS=true
DISCORD_ENABLE_WEB_SEARCH=true
```
