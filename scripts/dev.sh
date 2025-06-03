#!/bin/bash

# Start Navi-Akash Discord Bot for local development
echo "🚀 Starting Navi-Akash Discord Bot..."
echo "📍 Port: 3000"
echo "🤖 Discord bot will start automatically"
echo ""

# Set environment variables for local development
export PORT=3000
export NODE_ENV=development

# Build the project first
echo "🔨 Building project..."
bun run build:all

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🚀 Starting server on port 3000..."
    echo "🌐 Dashboard: http://localhost:3000"
    echo "🩺 Health Check: http://localhost:3000/api/health"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    # Start the server
    bun run dist/server.js
else
    echo "❌ Build failed!"
    exit 1
fi
