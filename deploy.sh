#!/bin/bash

# Deployment script for Navi-Akash Discord Bot
# This script helps with deploying the bot in production

set -e  # Exit immediately if a command exits with a non-zero status

# Display banner
echo "========================================"
echo "Navi-Akash Discord Bot Deployment Script"
echo "========================================"
echo

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found!"
  echo "Please create a .env file based on .env.example"
  exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "Error: Docker is not installed!"
  exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo "Error: Docker Compose is not installed!"
  exit 1
fi

# Create necessary directories
mkdir -p data/uploads data/generated generatedImages

# Pull latest changes (if in a git repository)
if [ -d .git ]; then
  echo "Pulling latest changes from git repository..."
  git pull
fi

# Build and start the containers
echo "Building and starting containers..."
docker-compose up -d --build

# Check if containers are running
echo "Checking container status..."
sleep 5
if [ "$(docker ps -q -f name=navi-akash-bot)" ]; then
  echo "Navi-Akash bot is running!"
  echo "You can check logs with: docker logs navi-akash-bot"
else
  echo "Error: Container failed to start. Check logs with: docker logs navi-akash-bot"
  exit 1
fi

echo
echo "Deployment completed successfully!"
echo "========================================" 