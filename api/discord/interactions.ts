import { NextRequest, NextResponse } from 'next/server';
import { verifyKey } from 'discord-interactions';

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body = await request.text();

    // Verify the request is from Discord
    const isValidRequest = signature && timestamp && verifyKey(body, signature, timestamp, process.env.DISCORD_PUBLIC_KEY!);
    
    if (!isValidRequest) {
      return NextResponse.json({ error: 'Invalid request signature' }, { status: 401 });
    }

    const interaction = JSON.parse(body);

    // Handle Discord interaction types
    if (interaction.type === 1) {
      // PING - respond with PONG
      return NextResponse.json({ type: 1 });
    }

    if (interaction.type === 2) {
      // APPLICATION_COMMAND - handle slash commands
      return handleSlashCommand(interaction);
    }

    return NextResponse.json({ error: 'Unknown interaction type' }, { status: 400 });
  } catch (error) {
    console.error('Discord webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleSlashCommand(interaction: any) {
  const { data } = interaction;
  
  switch (data.name) {
    case 'help':
      return NextResponse.json({
        type: 4,
        data: {
          content: '🚀 **Navi-Akash Bot Commands**\n\n• `/help` - Show this help message\n• `/akash` - Get Akash Network information\n• `/deploy` - Learn about deploying on Akash'
        }
      });
      
    case 'akash':
      return NextResponse.json({
        type: 4,
        data: {
          content: '☁️ **Akash Network** is the world\'s first decentralized cloud marketplace.\n\nGet started at: https://akash.network'
        }
      });
      
    default:
      return NextResponse.json({
        type: 4,
        data: {
          content: 'Unknown command. Use `/help` to see available commands.'
        }
      });
  }
}
