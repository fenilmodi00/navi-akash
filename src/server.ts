import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    bot: 'navi-akash',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Discord interactions endpoint
app.post('/api/discord/interactions', (req, res) => {
  // Basic Discord interaction handling
  const { type } = req.body;
  
  if (type === 1) {
    // PING - respond with PONG
    return res.json({ type: 1 });
  }
  
  res.json({
    type: 4,
    data: {
      content: '🤖 Navi-Akash is running on Render! Use the Discord bot in your server.'
    }
  });
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  
  // Import and start the Discord bot in production or local development
  if (process.env.NODE_ENV !== 'development' || process.env.START_BOT !== 'false') {
    import('./agent.js').then(() => {
      console.log('🤖 Discord bot started successfully!');
    }).catch((error) => {
      console.error('❌ Failed to start Discord bot:', error);
    });
  } else {
    console.log('⏸️  Discord bot startup skipped (development mode)');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
