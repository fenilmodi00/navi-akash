#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Navi Akash Production Deployment =====${NC}"

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Check for Docker and Docker Compose
if ! command -v docker &> /dev/null; then
    handle_error "Docker is not installed. Please install Docker first."
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Warning: docker-compose command not found. Trying with 'docker compose' instead...${NC}"
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

# Pull latest changes if in git repository
if [ -d ".git" ]; then
    echo -e "\n${YELLOW}Pulling latest changes from repository...${NC}"
    git pull || handle_error "Failed to pull latest changes"
fi

# Verify .env file exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example...${NC}"
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${YELLOW}Created .env file from .env.example. Please update with your credentials before continuing.${NC}"
        echo -e "${YELLOW}Press Enter to continue after updating the .env file, or Ctrl+C to cancel...${NC}"
        read
    else
        handle_error ".env.example file not found. Please create a .env file manually."
    fi
fi

# Build and start Docker containers
echo -e "\n${YELLOW}Building and starting Docker containers...${NC}"
$COMPOSE_CMD up -d --build || handle_error "Failed to build and start Docker containers"

echo -e "\n${GREEN}===== Deployment completed successfully! =====${NC}"
echo -e "Navi Akash is now running in production mode."
echo -e "You can check the logs with: ${YELLOW}docker logs -f navi-akash${NC}"

# Make the script executable
chmod +x deploy.sh 