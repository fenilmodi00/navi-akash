#!/bin/bash

set -e

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Updating Navi Discord Bot${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Pull latest changes from main repository
echo -e "${YELLOW}Pulling latest changes from repository...${NC}"
git pull

# Update only necessary submodules (excluding akash)
echo -e "${YELLOW}Updating required submodules...${NC}"
git submodule update --init plugin-discord
git submodule update --init plugin-akash-chat

# Update plugin repositories
echo -e "${YELLOW}Pulling latest changes for plugin-discord...${NC}"
(cd plugin-discord && git pull origin main)

echo -e "${YELLOW}Pulling latest changes for plugin-akash-chat...${NC}"
(cd plugin-akash-chat && git pull origin main)

# Create directories that might be missing
mkdir -p elizadb data

# Check deployment type
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker detected. Rebuilding and restarting containers...${NC}"
    
    # Stop current containers
    docker-compose down
    
    # Rebuild with latest changes
    docker-compose build
    
    # Start again
    docker-compose up -d
    
    echo -e "${GREEN}Update completed successfully with Docker deployment!${NC}"
    echo -e "${YELLOW}To check logs, run: docker-compose logs -f${NC}"
else
    echo -e "${YELLOW}Standard deployment detected. Updating dependencies and rebuilding...${NC}"
    
    # Install/update dependencies for main project
    echo -e "${YELLOW}Updating main project dependencies...${NC}"
    npm install
    
    # Update plugin dependencies
    if [ -d "plugin-discord" ]; then
        echo -e "${YELLOW}Updating plugin-discord dependencies...${NC}"
        (cd plugin-discord && npm install)
    fi
    
    if [ -d "plugin-akash-chat" ]; then
        echo -e "${YELLOW}Updating plugin-akash-chat dependencies...${NC}"
        (cd plugin-akash-chat && npm install)
    fi
    
    # Rebuild the project
    echo -e "${YELLOW}Building project...${NC}"
    npm run build
    
    # Inform the user they need to restart the service
    echo -e "${GREEN}Build completed successfully!${NC}"
    echo -e "${YELLOW}To apply the changes, you need to restart the service.${NC}"
    echo -e "${YELLOW}If using systemd, run: sudo systemctl restart navi-discord.service${NC}"
    echo -e "${YELLOW}Or manually stop the current process and run: npm run start${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Update process completed!${NC}"
echo -e "${GREEN}========================================${NC}" 