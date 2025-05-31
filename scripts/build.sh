#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Navi Akash Build Script =====${NC}"

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
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

echo -e "\n${GREEN}===== Build completed successfully! =====${NC}"
echo -e "You can now start the application with: ${YELLOW}bun start${NC}"

# Make the script executable
chmod +x build.sh 