#!/bin/bash

echo "Starting monorepo fix process..."

# Remove any .git directories from plugin folders
echo "Removing .git directories from plugin folders..."
rm -rf plugin-knowledge/.git
rm -rf plugin-akash-chat/.git
rm -rf plugin-discord/.git

# Clear .gitmodules file
echo "Clearing .gitmodules file..."
cat > .gitmodules << 'EOF'
# This file is intentionally empty.
# All plugins are now included directly in the repository.
EOF

# Remove any Git submodule references
echo "Removing Git submodule references..."
git rm --cached plugin-knowledge 2>/dev/null || true
git rm --cached plugin-akash-chat 2>/dev/null || true
git rm --cached plugin-discord 2>/dev/null || true

# Add the plugins as regular directories
echo "Adding plugins as regular directories..."
git add plugin-knowledge
git add plugin-akash-chat
git add plugin-discord

# Commit the changes
echo "Committing changes..."
git commit -m "Fix: Convert plugins from submodules to regular directories"

echo "Monorepo fix process completed!"
echo "You can now push the changes to GitHub." 