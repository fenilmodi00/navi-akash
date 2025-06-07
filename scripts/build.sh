#!/bin/bash

# Load environment variables from .env file
if [ -f ".env" ]; then
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
fi

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Navi Akash Build Script =====${NC}"

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Function to check Akash Chat API connectivity
check_akash_api() {
    echo -e "\n${BLUE}Checking Akash Chat API connectivity...${NC}"

    # Remove any previous check file
    rm -f /tmp/akash_api_check_failed

    # Check if AKASH_CHAT_API_KEY is set
    if [ -z "$AKASH_CHAT_API_KEY" ]; then
        echo -e "${YELLOW}Warning: AKASH_CHAT_API_KEY environment variable not set.${NC}"
        echo -e "${YELLOW}Embeddings and AI features may not work correctly.${NC}"
        touch /tmp/akash_api_check_failed
        return 0
    fi

    # Try to connect to the Akash Chat API
    local api_url="https://chatapi.akash.network/api/v1/models"
    echo -e "Testing connection to Akash Chat API..."
    local response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $AKASH_CHAT_API_KEY" "$api_url")

    if [ "$response" == "200" ] || [ "$response" == "201" ]; then
        echo -e "${GREEN}✓ Successfully connected to Akash Chat API.${NC}"
        return 0
    else
        echo -e "${YELLOW}Warning: Couldn't connect to Akash Chat API (HTTP $response).${NC}"
        echo -e "${YELLOW}Embedding features may not work correctly.${NC}"
        echo -e "${YELLOW}Please check your internet connection and API key.${NC}"
        
        # Create a file to indicate API check failed
        touch /tmp/akash_api_check_failed
        
        # Ask user if they want to continue despite connectivity issues
        read -p "Continue with build despite API connectivity issues? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            handle_error "Build aborted due to API connectivity issues."
        fi
        return 0
    fi
}

# Function to build a plugin
build_plugin() {
    local plugin_path="$1"
    local plugin_name="$2"
    
    echo -e "\n${YELLOW}Building plugin: ${plugin_name}${NC}"
    
    # Check if plugin directory exists
    if [ ! -d "$plugin_path" ]; then
        handle_error "Plugin directory not found: $plugin_path"
    fi
    
    # Navigate to plugin directory
    cd "$plugin_path" || handle_error "Failed to navigate to $plugin_path"
    
    # Install dependencies
    echo "Installing dependencies..."
    bun install || handle_error "Failed to install dependencies for $plugin_name"
    
    # Build plugin
    echo "Building plugin..."
    bun run build || handle_error "Failed to build $plugin_name"
    
    # Return to root directory
    cd - > /dev/null
    
    echo -e "${GREEN}Successfully built: ${plugin_name}${NC}"
}

# Validate API connectivity
check_akash_api

# Build all plugins
echo -e "\n${YELLOW}Step 1: Building plugins...${NC}"

# Plugin: akash-chat
build_plugin "plugins/plugin-akash-chat" "plugin-akash-chat"

# Plugin: discord
build_plugin "plugins/plugin-discord" "plugin-discord"

# Plugin: knowledge
build_plugin "plugins/plugin-knowledge" "plugin-knowledge"

# Plugin: web-search
build_plugin "plugins/plugin-web-search" "plugin-web-search"

# Build main project
echo -e "\n${YELLOW}Step 2: Building main project...${NC}"
bun install || handle_error "Failed to install dependencies for main project"
bun run build || handle_error "Failed to build main project"

# Add post-build information
echo -e "\n${GREEN}===== Build completed successfully! =====${NC}"
echo -e "You can now start the application with: ${YELLOW}./scripts/start.sh${NC}"

# Check if the Akash API connectivity file exists (created by check_akash_api)
if [ -f "/tmp/akash_api_check_failed" ]; then
    echo -e "\n${YELLOW}⚠️  Warning: Akash Chat API connectivity issues detected${NC}"
    echo -e "For improved error handling with embeddings, see:"
    echo -e "${BLUE}EMBEDDING_FIX.md${NC}"
    echo -e "This document provides instructions to add fallback functionality."
    rm -f /tmp/akash_api_check_failed
fi

# Make the script executable (if not already)
chmod +x scripts/build.sh 