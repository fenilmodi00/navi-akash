import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    bot: 'navi-akash',
    version: '1.0.0'
  });
}

export async function POST(request: NextRequest) {
  // Health check endpoint for monitoring
  return NextResponse.json({ 
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
}
