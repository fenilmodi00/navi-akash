#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}===== Navi Akash Branch Merge Script =====${NC}"

# Function to handle errors
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ $? -ne 0 ]; then
    handle_error "Failed to get current branch. Make sure you're in a git repository."
fi

echo -e "Current branch: ${YELLOW}${CURRENT_BRANCH}${NC}"
echo -e "Target branch: ${YELLOW}main${NC}"

# Check if we have uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}You have uncommitted changes. Committing them before merging...${NC}"
    git add .
    git commit -m "Automatic commit before merging to main"
    if [ $? -ne 0 ]; then
        handle_error "Failed to commit changes."
    fi
fi

# Switch to main branch
echo -e "\n${YELLOW}Switching to main branch...${NC}"
git checkout main
if [ $? -ne 0 ]; then
    handle_error "Failed to switch to main branch. Make sure it exists."
fi

# Pull latest changes from main
echo -e "\n${YELLOW}Pulling latest changes from main...${NC}"
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Warning: Failed to pull from origin. Continuing with local merge...${NC}"
fi

# Merge changes from the source branch
echo -e "\n${YELLOW}Merging changes from ${CURRENT_BRANCH}...${NC}"
git merge ${CURRENT_BRANCH}

# Check if there are merge conflicts
if [ $? -ne 0 ]; then
    echo -e "${RED}Merge conflicts detected.${NC}"
    echo -e "${YELLOW}Please resolve conflicts manually, then run:${NC}"
    echo -e "git add ."
    echo -e "git commit -m \"Resolved merge conflicts\""
    echo -e "git push origin main"
    exit 1
fi

# Push changes to main
echo -e "\n${YELLOW}Pushing changes to main...${NC}"
git push origin main
if [ $? -ne 0 ]; then
    handle_error "Failed to push to main branch."
fi

# Switch back to original branch
echo -e "\n${YELLOW}Switching back to ${CURRENT_BRANCH}...${NC}"
git checkout ${CURRENT_BRANCH}
if [ $? -ne 0 ]; then
    handle_error "Failed to switch back to ${CURRENT_BRANCH}."
fi

echo -e "\n${GREEN}===== Merge completed successfully! =====${NC}"
echo -e "Changes from ${YELLOW}${CURRENT_BRANCH}${NC} have been merged into ${YELLOW}main${NC}."

# Make the script executable
chmod +x merge.sh 