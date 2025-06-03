export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      bot: 'navi-akash',
      version: '1.0.0',
      uptime: process.uptime()
    });
  } else if (req.method === 'POST') {
    res.status(200).json({ 
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
