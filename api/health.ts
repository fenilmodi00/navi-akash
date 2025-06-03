import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'navi-akash-discord-bot',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3000,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      discord: {
        applicationId: process.env.DISCORD_APPLICATION_ID ? '✓ Configured' : '✗ Missing',
        token: process.env.DISCORD_API_TOKEN ? '✓ Configured' : '✗ Missing'
      },
      akash: {
        apiKey: process.env.AKASH_CHAT_API_KEY ? '✓ Configured' : '✗ Missing',
        baseUrl: process.env.AKASH_CHAT_BASE_URL || 'https://chatapi.akash.network/api/v1'
      },
      webSearch: {
        tavilyKey: process.env.TAVILY_API_KEY ? '✓ Configured' : '✗ Missing'
      }
    };

    // Set cache headers for health check
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    return res.status(200).json(healthData);
  } else if (req.method === 'POST') {
    return res.status(200).json({ 
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
