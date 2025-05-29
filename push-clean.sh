#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Clean Git Push for Navi Akash Bot${NC}"
echo -e "${GREEN}========================================${NC}"

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Error: Git is not installed. Please install Git first.${NC}"
    exit 1
fi

# Make sure .elizadb and .eliza are in .gitignore
if ! grep -q "^\.elizadb/" .gitignore || ! grep -q "^\.eliza/" .gitignore; then
    echo -e "${YELLOW}Adding .elizadb/ and .eliza/ to .gitignore...${NC}"
    echo -e "\n# Ensure these directories are ignored\n.elizadb/\n.eliza/" >> .gitignore
    git add .gitignore
fi

# Remove any .git directories from plugin folders
echo -e "${YELLOW}Removing .git directories from plugin folders...${NC}"
rm -rf plugin-knowledge/.git
rm -rf plugin-akash-chat/.git
rm -rf plugin-discord/.git

# Remove any tracked files that should be ignored
echo -e "${YELLOW}Removing any tracked sensitive directories from Git...${NC}"
git rm -r --cached --ignore-unmatch .elizadb/ .eliza/

# Make sure plugins are added as regular directories
echo -e "${YELLOW}Adding plugins as regular directories...${NC}"
git add plugin-knowledge
git add plugin-akash-chat
git add plugin-discord

# Check if there are any changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Committing changes...${NC}"
    git add .
    
    # Ask for commit message
    echo -e "${YELLOW}Enter commit message:${NC}"
    read -r commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Update project files and fix monorepo issues"
    fi
    
    git commit -m "$commit_message"
    
    # Ask for branch name
    echo -e "${YELLOW}Enter branch name to push to (default: main):${NC}"
    read -r branch_name
    
    if [ -z "$branch_name" ]; then
        branch_name="main"
    fi
    
    # Push changes
    echo -e "${YELLOW}Pushing changes to $branch_name...${NC}"
    git push origin "$branch_name"
    
    echo -e "${GREEN}Push completed successfully!${NC}"
else
    echo -e "${YELLOW}No changes to commit.${NC}"
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   Clean Git Push Completed${NC}"
echo -e "${GREEN}========================================${NC}" 