import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { LIVEKIT_CONFIG, validateLiveKitConfig } from '../../../config/livekit';

export async function POST(request: NextRequest) {
  try {
    // Validate LiveKit configuration first
    if (!validateLiveKitConfig()) {
      return NextResponse.json(
        { 
          error: 'LiveKit configuration is invalid. Please check your environment variables.',
          details: 'Check the server console for detailed configuration instructions.'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { roomName, participantName, participantIdentity, metadata } = body;

    console.log('Token generation request:', {
      roomName,
      participantName,
      participantIdentity,
      hasMetadata: !!metadata,
    });

    if (!roomName || !participantName || !participantIdentity) {
      return NextResponse.json(
        { error: 'Missing required parameters: roomName, participantName, participantIdentity' },
        { status: 400 }
      );
    }

    // Create access token
    const at = new AccessToken(
      LIVEKIT_CONFIG.apiKey,
      LIVEKIT_CONFIG.apiSecret,
      {
        identity: participantIdentity,
        name: participantName,
        metadata: metadata || '',
      }
    );

    // Grant permissions for the room
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      canUpdateOwnMetadata: true,
    });

    const token = await at.toJwt();

    console.log('Token generated successfully:', {
      roomName,
      participantIdentity,
      tokenLength: token.length,
      wsURL: LIVEKIT_CONFIG.wsURL,
    });

    return NextResponse.json({
      success: true,
      token,
      wsURL: LIVEKIT_CONFIG.wsURL,
      roomName,
      participantIdentity,
    });

  } catch (error) {
    console.error('Error generating LiveKit token:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to generate access token';
    if (error instanceof Error) {
      if (error.message.includes('Invalid key')) {
        errorMessage = 'Invalid LiveKit API credentials. Please check your API key and secret.';
      } else if (error.message.includes('JWT')) {
        errorMessage = 'Failed to generate JWT token. Please check your LiveKit configuration.';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
} 