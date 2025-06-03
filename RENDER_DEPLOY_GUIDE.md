# 🚀 Deploy Navi-Akash to Render

## Quick Deploy Steps

### 1. **Create Render Account**
- Go to [render.com](https://render.com) and sign up with your GitHub account

### 2. **Connect Repository**
- Click "New +" → "Web Service"
- Connect your GitHub account and select the `navi-akash` repository
- **IMPORTANT**: Select the `perf` branch (not main)

### 3. **Configure Service**
- **Name**: `navi-akash-bot`
- **Region**: Choose closest to your users
- **Branch**: `perf` ⚠️ **Must be perf branch**
- **Runtime**: `Node`
- **Build Command**: `bun run install:all && bun run build:all`
- **Start Command**: `bun start`

### 4. **Set Environment Variables**
Add these environment variables in Render dashboard:

```
DISCORD_APPLICATION_ID=your_discord_app_id
DISCORD_API_TOKEN=your_bot_token
AKASH_CHAT_API_KEY=your_akash_api_key
AKASH_CHAT_BASE_URL=https://chatapi.akash.network/api/v1
AKASH_CHAT_SMALL_MODEL=Meta-Llama-4-Maverick-17B-128E-Instruct-FP8
AKASH_CHAT_LARGE_MODEL=DeepSeek-R1-0528
TAVILY_API_KEY=your_tavily_api_key
NODE_ENV=production
PORT=10000
CTX_KNOWLEDGE_ENABLED=false
LOAD_DOCS_ON_STARTUP=true
```

### 5. **Deploy**
- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Your bot will be available at: `https://your-service-name.onrender.com`

## ✅ Verify Deployment
- Check health endpoint: `https://your-service-name.onrender.com/api/health`
- Verify Discord bot is online in your server

## 🔧 Troubleshooting

### Build Failures
- **Issue**: "Cannot find elizaOS packages"
- **Solution**: Ensure you selected the `perf` branch, not `main`

### Bot Not Starting
- **Issue**: Bot shows offline in Discord
- **Solution**: Check environment variables are set correctly in Render dashboard

### Health Check Fails
- **Issue**: `/api/health` returns 404 or 500
- **Solution**: Check the deployment logs in Render dashboard

## 📝 Important Notes
- **Free tier**: Service spins down after 15 minutes of inactivity
- **Cold starts**: First request after spin-down may take 30-60 seconds
- **24/7 uptime**: Upgrade to paid plan for continuous availability
- **Branch selection**: Always use `perf` branch for deployments

## 🔄 Updating the Bot
1. Push changes to the `perf` branch
2. Render will automatically redeploy
3. Monitor deployment progress in Render dashboard

## 💡 Pro Tips
- Set up Render's health check endpoint at `/api/health`
- Monitor deployment logs for any issues
- Use environment variables for all sensitive configuration
