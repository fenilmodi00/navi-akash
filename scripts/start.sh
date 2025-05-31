#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Starting Navi Akash =====${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example...${NC}"
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}Created .env file from .env.example. Please update with your credentials.${NC}"
    else
        echo -e "${RED}Error: .env.example file not found. Please create a .env file manually.${NC}"
        exit 1
    fi
fi

# Start the application
echo -e "\n${GREEN}Starting application...${NC}"
bun start

# Make the script executable
chmod +x start.sh 