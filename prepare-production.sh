#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Navi Akash - Production Preparation   ${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if Bun is installed
if ! command -v bun &> /dev/null; then
    echo -e "${RED}Error: Bun is not installed. Please install Bun first.${NC}"
    echo -e "${YELLOW}You can install Bun using: curl -fsSL https://bun.sh/install | bash${NC}"
    exit 1
fi

# Step 1: Fix monorepo issues
echo -e "\n${GREEN}Step 1: Fixing monorepo issues...${NC}"
# Remove any .git directories from plugin folders
echo -e "${YELLOW}Removing .git directories from plugin folders...${NC}"
rm -rf plugin-knowledge/.git
rm -rf plugin-akash-chat/.git
rm -rf plugin-discord/.git

# Clear .gitmodules file
echo -e "${YELLOW}Clearing .gitmodules file...${NC}"
cat > .gitmodules << 'EOF'
# This file is intentionally empty.
# All plugins are now included directly in the repository.
EOF

# Remove any Git submodule references
echo -e "${YELLOW}Removing Git submodule references...${NC}"
git rm --cached plugin-knowledge 2>/dev/null || true
git rm --cached plugin-akash-chat 2>/dev/null || true
git rm --cached plugin-discord 2>/dev/null || true

# Step 2: Clean up unwanted files
echo -e "\n${GREEN}Step 2: Cleaning up unwanted files...${NC}"
echo -e "${YELLOW}Removing temporary and system files...${NC}"
find . -name "*.log" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "*.swp" -type f -delete
find . -name "*.swo" -type f -delete
find . -name "*.tmp" -type f -delete
find . -name "Thumbs.db" -type f -delete
find . -name ".git-old" -type d -exec rm -rf {} \; 2>/dev/null || true

echo -e "${YELLOW}Removing editor and IDE files...${NC}"
find . -name ".vscode" -type d -exec rm -rf {} \; 2>/dev/null || true
find . -name ".idea" -type d -exec rm -rf {} \; 2>/dev/null || true
find . -name "*.sublime-*" -type f -delete

echo -e "${YELLOW}Removing package manager cache files...${NC}"
rm -rf .npm
rm -rf .yarn
rm -rf .cache
rm -rf plugin-*/cache

echo -e "${YELLOW}Removing TypeScript build info files...${NC}"
find . -name "*.tsbuildinfo" -type f -delete

echo -e "${YELLOW}Removing database and sensitive files...${NC}"
rm -rf .elizadb
rm -rf .eliza

# Step 3: Clean build artifacts
echo -e "\n${GREEN}Step 3: Cleaning build artifacts...${NC}"
echo -e "${YELLOW}Removing node_modules and dist directories...${NC}"
rm -rf node_modules
rm -rf plugin-akash-chat/node_modules
rm -rf plugin-discord/node_modules
rm -rf plugin-knowledge/node_modules
rm -rf dist
rm -rf plugin-akash-chat/dist
rm -rf plugin-discord/dist
rm -rf plugin-knowledge/dist

# Step 4: Create necessary directories
echo -e "\n${GREEN}Step 4: Creating necessary directories...${NC}"
mkdir -p data/uploads data/generated generatedImages

# Step 5: Build plugins
echo -e "\n${GREEN}Step 5: Building plugins...${NC}"
echo -e "${YELLOW}Building plugin-discord...${NC}"
cd plugin-discord || exit 1
bun install
bun run build
cd .. || exit 1

echo -e "${YELLOW}Building plugin-akash-chat...${NC}"
cd plugin-akash-chat || exit 1
bun install
bun run build
cd .. || exit 1

echo -e "${YELLOW}Building plugin-knowledge...${NC}"
cd plugin-knowledge || exit 1
bun install
bun run build
cd .. || exit 1

# Step 6: Build main project
echo -e "\n${GREEN}Step 6: Building main project...${NC}"
bun install
bun run build

# Step 7: Make sure .gitignore is properly set up
echo -e "\n${GREEN}Step 7: Updating .gitignore...${NC}"
if ! grep -q "^\.elizadb/" .gitignore || ! grep -q "^\.eliza/" .gitignore; then
    echo -e "${YELLOW}Adding .elizadb/ and .eliza/ to .gitignore...${NC}"
    echo -e "\n# Ensure these directories are ignored\n.elizadb/\n.eliza/" >> .gitignore
    git add .gitignore
fi

# Step 8: Add plugins as regular directories to git
echo -e "\n${GREEN}Step 8: Adding plugins as regular directories to Git...${NC}"
git add plugin-knowledge
git add plugin-akash-chat
git add plugin-discord

# Step 9: Create .env.example if it doesn't exist
echo -e "\n${GREEN}Step 9: Creating .env.example if needed...${NC}"
if [ ! -f .env.example ]; then
    echo -e "${YELLOW}Creating .env.example...${NC}"
    cat > .env.example << 'EOF'
# Discord Bot Configuration
DISCORD_BOT_TOKEN=your_discord_bot_token_here
DISCORD_CLIENT_ID=your_discord_client_id_here
DISCORD_GUILD_ID=your_discord_guild_id_here

# ElizaOS Configuration
ELIZAOS_API_KEY=your_elizaos_api_key_here

# Database Configuration
DATABASE_URL=postgres://username:password@localhost:5432/dbname

# Akash Network Configuration
AKASH_NODE=https://rpc.akash.network:443
AKASH_CHAIN_ID=akashnet-2

# Plugin Configuration
KNOWLEDGE_BASE_PATH=./docs/akash-knowledge-base

# Optional: Logging Configuration
LOG_LEVEL=info

# Note: Replace all placeholder values with your actual credentials
# DO NOT commit the actual .env file to version control
EOF
    git add .env.example
fi

echo -e "\n${GREEN}Step 10: Committing changes...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    git add .
    git commit -m "Production ready: Clean up project and fix monorepo issues"
    echo -e "${GREEN}Changes committed successfully.${NC}"
    
    echo -e "\n${YELLOW}Would you like to push these changes to GitHub? (y/n)${NC}"
    read -r push_changes
    
    if [[ "$push_changes" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Enter branch name to push to (default: main):${NC}"
        read -r branch_name
        
        if [ -z "$branch_name" ]; then
            branch_name="main"
        fi
        
        echo -e "${YELLOW}Pushing changes to $branch_name...${NC}"
        git push origin "$branch_name"
        echo -e "${GREEN}Push completed successfully!${NC}"
    fi
else
    echo -e "${YELLOW}No changes to commit.${NC}"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}   Project is now production-ready!   ${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "\n${GREEN}To run the project in production mode:${NC}"
echo -e "${YELLOW}bun run start${NC}"
echo -e "\n${GREEN}To run with Docker:${NC}"
echo -e "${YELLOW}docker-compose up -d${NC}" 