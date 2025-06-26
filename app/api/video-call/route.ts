import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { LIVEKIT_CONFIG, validateLiveKitConfig } from '../../config/livekit';
import { getApiBaseUrl } from '../../config/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization');
    const channelId = req.nextUrl.searchParams.get('channel');

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization required' },
        { status: 401 }
      );
    }

    const { receiverUserId, type, appVersion } = body;

    if (!channelId || !receiverUserId) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters: channelId, receiverUserId' },
        { status: 400 }
      );
    }

    // Validate LiveKit configuration
    if (!validateLiveKitConfig()) {
      return NextResponse.json(
        { success: false, message: 'LiveKit configuration is invalid' },
        { status: 500 }
      );
    }

    // Check user balance by calling the backend
    try {
      const balanceResponse = await fetch(`${getApiBaseUrl()}/payment/api/transaction/wallet-balance`, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        const currentBalance = balanceData.data?.balance || 0;
        
        // Assuming minimum balance required for video call (you can adjust this)
        const minRequiredBalance = 48; // ₹48 for video call
        
        if (currentBalance < minRequiredBalance) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'DONT_HAVE_ENOUGH_BALANCE',
              requiredBalance: minRequiredBalance,
              currentBalance 
            },
            { status: 400 }
          );
        }
      }
    } catch (balanceError) {
      console.warn('Could not check balance:', balanceError);
      // Continue without balance check if service is unavailable
    }

    // Generate room name and participant identity
    const roomName = channelId;
    const participantIdentity = `user_${Date.now()}`;
    const participantName = `User ${participantIdentity}`;

    // Create access token for LiveKit
    const at = new AccessToken(
      LIVEKIT_CONFIG.apiKey,
      LIVEKIT_CONFIG.apiSecret,
      {
        identity: participantIdentity,
        name: participantName,
        metadata: JSON.stringify({
          userId: participantIdentity,
          astrologerId: receiverUserId,
          callType: type
        }),
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

    // Also call the backend API to register the call and send notifications
    try {
      const backendResponse = await fetch(`${getApiBaseUrl()}/api/users/getaccesstoken?channel=${channelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          receiverUserId,
          type,
          appVersion
        }),
      });

      if (backendResponse.ok) {
        const backendData = await backendResponse.json();
        if (backendData.success && backendData.data) {
          // Use backend data if available
          return NextResponse.json({
            success: true,
            data: {
              token: backendData.data.token || token,
              channel: channelId,
              livekitSocketURL: backendData.data.livekitSocketURL || LIVEKIT_CONFIG.wsURL,
              receiverAvatar: backendData.data.receiverAvatar || '',
              receiverNumericId: backendData.data.receiverNumericId || receiverUserId,
              senderNumericId: backendData.data.senderNumericId || participantIdentity,
              rpm: backendData.data.rpm || 48,
              balance: backendData.data.balance || 0
            }
          });
        }
      }
    } catch (backendError) {
      console.warn('Backend call failed, using LiveKit directly:', backendError);
      // Continue with LiveKit-only approach
    }

    // Fallback: Return the token and connection details (LiveKit only)
    return NextResponse.json({
      success: true,
      data: {
        token,
        channel: channelId,
        livekitSocketURL: LIVEKIT_CONFIG.wsURL,
        receiverAvatar: '', // You can fetch this if needed
        receiverNumericId: receiverUserId,
        senderNumericId: participantIdentity,
        rpm: 48, // Default video call rate
        balance: 0 // You can include actual balance here
      }
    });

  } catch (error) {
    console.error('Video call setup error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to setup video call' },
      { status: 500 }
    );
  }
} 