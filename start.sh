#!/bin/bash

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "Error: Git is not installed. Please install Git first."
    exit 1
fi

# Initialize only the necessary submodules (excluding akash)
echo "Initializing required submodules..."
git submodule update --init plugin-discord
git submodule update --init plugin-akash-chat

# Create directories that are excluded from version control
mkdir -p elizadb data

# Start the Discord bot
echo "Starting Navi Discord Bot..."

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "Using Docker deployment..."
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            echo "Warning: .env file not found. Creating from .env.example..."
            cp .env.example .env
            echo "Please update the .env file with your specific configuration values."
        else
            echo "Error: .env file not found and no .env.example file to copy from."
            exit 1
        fi
    fi
    
    # Start with Docker Compose
    echo "Building and starting containers..."
    docker-compose build
    docker-compose up -d
    
    echo "Bot started! Use 'docker-compose logs -f' to view logs."
else
    echo "Docker not found, using standard deployment..."
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo "Error: Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            echo "Warning: .env file not found. Creating from .env.example..."
            cp .env.example .env
            echo "Please update the .env file with your specific configuration values."
        else
            echo "Error: .env file not found and no .env.example file to copy from."
            exit 1
        fi
    fi
    
    # Check if npm packages are installed
    if [ ! -d "node_modules" ]; then
        echo "Installing dependencies..."
        npm install
    fi
    
    # Check and install dependencies for plugin-akash-chat
    if [ -d "plugin-akash-chat" ] && [ ! -d "plugin-akash-chat/node_modules" ]; then
        echo "Installing dependencies for plugin-akash-chat..."
        (cd plugin-akash-chat && npm install)
    fi
    
    # Check and install dependencies for plugin-discord
    if [ -d "plugin-discord" ] && [ ! -d "plugin-discord/node_modules" ]; then
        echo "Installing dependencies for plugin-discord..."
        (cd plugin-discord && npm install)
    fi
    
    # Build and start
    echo "Building project..."
    npm run build
    
    echo "Starting bot..."
    npm run start
fi 