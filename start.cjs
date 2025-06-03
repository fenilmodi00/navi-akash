#!/usr/bin/env node

// Simple health check and startup verification
const fs = require('fs');
const path = require('path');

console.log('🔍 Pre-start health check...');

// Check if dist folder exists
const distPath = path.join(__dirname, 'dist');
console.log(`Checking for dist folder at: ${distPath}`);

if (!fs.existsSync(distPath)) {
  console.error('❌ dist/ folder not found!');
  console.log('📁 Contents of current directory:');
  try {
    const files = fs.readdirSync(__dirname);
    files.forEach(file => console.log(`  - ${file}`));
  } catch (error) {
    console.error('Cannot read current directory:', error.message);
  }
  process.exit(1);
}

// Check if server.js exists
const serverPath = path.join(distPath, 'server.js');
console.log(`Checking for server.js at: ${serverPath}`);

if (!fs.existsSync(serverPath)) {
  console.error('❌ dist/server.js not found!');
  console.log('📁 Contents of dist/ folder:');
  try {
    const files = fs.readdirSync(distPath);
    files.forEach(file => console.log(`  - ${file}`));
  } catch (error) {
    console.error('Cannot read dist folder:', error.message);
  }
  process.exit(1);
}

// Check if agent.js exists
const agentPath = path.join(distPath, 'agent.js');
if (!fs.existsSync(agentPath)) {
  console.warn('⚠️  dist/agent.js not found - Discord bot may not start');
} else {
  console.log('✅ dist/agent.js found');
}

console.log('✅ Pre-start checks passed!');
console.log('🚀 Starting server...');

// Set default port if not provided
if (!process.env.PORT) {
  process.env.PORT = '10000';
}

try {
  // Start the actual server
  require(serverPath);
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}
