#!/bin/bash

echo "🔍 Checking Navi Configuration..."
echo

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "✅ .env file found"

# Check required environment variables
echo
echo "📋 Checking required environment variables..."

required_vars=(
    "AKASH_CHAT_API_KEY"
    "DISCORD_APPLICATION_ID"
    "DISCORD_API_TOKEN"
    "TAVILY_API_KEY"
    "OPENAI_API_KEY"
    "OPENAI_BASE_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env && ! grep -q "^${var}=$" .env && ! grep -q "^#.*${var}=" .env; then
        echo "✅ $var is set"
    else
        echo "❌ $var is missing or empty"
        missing_vars+=("$var")
    fi
done

echo
echo "🔧 Checking plugin directories..."

plugin_dirs=(
    "plugins/plugin-akash-chat"
    "plugins/plugin-discord"
    "plugins/plugin-knowledge"
    "plugins/plugin-web-search"
)

for dir in "${plugin_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir exists"
    else
        echo "❌ $dir missing"
    fi
done

echo
echo "📁 Checking knowledge base..."

if [ -d "data/akash-knowledge-base" ]; then
    echo "✅ Akash knowledge base directory exists"
    file_count=$(find data/akash-knowledge-base -name "*.md" -o -name "*.ts" -o -name "*.js" | wc -l)
    echo "📄 Found $file_count knowledge files"
else
    echo "❌ Akash knowledge base directory missing"
fi

echo
if [ ${#missing_vars[@]} -eq 0 ]; then
    echo "🎉 Configuration looks good!"
    echo "💡 Next steps:"
    echo "   1. Set up your Discord bot token (see DISCORD_SETUP.md)"
    echo "   2. Run: elizaos start"
    echo "   3. Test the bot in Discord"
else
    echo "⚠️  Please fix the missing environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
fi

echo
echo "🚀 To start Navi: elizaos start"
echo "📊 Dashboard: http://localhost:3000"
