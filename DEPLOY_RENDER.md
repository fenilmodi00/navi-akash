# Deploy to Render

Click the button below to deploy Navi-Akash to Render.com:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/fenilmodi00/navi-akash.git)

## Environment Variables Required:

After clicking deploy, you'll need to set these environment variables:

- `DISCORD_APPLICATION_ID` - Your Discord application ID
- `DISCORD_API_TOKEN` - Your Discord bot token  
- `AKASH_CHAT_API_KEY` - Your Akash Chat API key
- `TAVILY_API_KEY` - Your Tavily API key (for web search)

## Free Tier Details:

- ✅ **750 hours/month** (enough for 24/7 operation)
- ✅ **No credit card required**
- ✅ **Automatic SSL certificates**
- ✅ **Auto-deploy on git push**
- ⚠️ **Sleeps after 15 minutes of inactivity** (web service only, Discord bot keeps running)

## Post-Deployment:

1. Your bot will be accessible at: `https://your-app-name.onrender.com`
2. Health check endpoint: `https://your-app-name.onrender.com/api/health`
3. Discord bot will automatically start and connect to Discord
