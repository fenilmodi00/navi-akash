#!/bin/bash

# Cleanup script for Navi-Akash Discord Bot
# This script helps with cleaning up temporary files and optimizing storage

set -e  # Exit immediately if a command exits with a non-zero status

# Display banner
echo "========================================"
echo "Navi-Akash Discord Bot Cleanup Script"
echo "========================================"
echo

# Remove temporary files
echo "Removing temporary files..."
find . -name "*.tmp" -type f -delete
find . -name "*.log" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "*.swp" -o -name "*.swo" -type f -delete

# Clean up node_modules
echo "Cleaning up node_modules..."
find . -name "node_modules/.cache" -type d -exec rm -rf {} +

# Clean up Docker (if Docker is installed)
if command -v docker &> /dev/null; then
  echo "Cleaning up Docker..."
  
  # Remove unused Docker images
  echo "Removing unused Docker images..."
  docker image prune -f
  
  # Remove unused Docker volumes
  echo "Removing unused Docker volumes..."
  docker volume prune -f
fi

echo
echo "Cleanup completed successfully!"
echo "========================================" 