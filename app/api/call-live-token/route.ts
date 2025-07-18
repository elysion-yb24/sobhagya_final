import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';
import { LIVEKIT_CONFIG, validateLiveKitConfig } from '../../config/livekit';

// In-memory store for device tokens (in production, use database)
const deviceTokens = new Map<string, {
  astrologerId: string;
  deviceToken: string;
  platform: 'ios' | 'android' | 'web';
  timestamp: Date;
}>();

// In-memory store for call sessions (in production, use database)
const callSessions = new Map<string, {
  callId: string;
  astrologerId: string;
  userId: string;
  userName: string;
  roomName: string;
  callType: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'active' | 'ended';
  timestamp: Date;
  liveKitToken?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    console.log('📞 Calling API request:', { action, ...body });

    switch (action) {
      case 'generate_livekit_token':
        return await generateLiveKitToken(body);
      
      case 'send_notification':
        return await sendNotification(body);
      
      case 'register_device_token':
        return await registerDeviceToken(body);
      
      case 'get_call_status':
        return await getCallStatus(body);
      
      case 'update_call_status':
        return await updateCallStatus(body);
      
      case 'end_call':
        return await endCall(body);
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: generate_livekit_token, send_notification, register_device_token, get_call_status, update_call_status, end_call'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('📞 Calling API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// Generate LiveKit token for video calls
async function generateLiveKitToken(data: {
  roomName: string;
  participantName: string;
  participantIdentity: string;
  metadata?: string;
  astrologerId?: string;
  userId?: string;
  callType?: string;
}) {
  try {
    const { roomName, participantName, participantIdentity, metadata, astrologerId, userId, callType } = data;

    // Validate LiveKit configuration
    if (!validateLiveKitConfig()) {
      return NextResponse.json({
        success: false,
        error: 'LiveKit configuration is invalid'
      }, { status: 500 });
    }

    if (!roomName || !participantName || !participantIdentity) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: roomName, participantName, participantIdentity'
      }, { status: 400 });
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

    // Store call session if astrologer and user info provided
    if (astrologerId && userId) {
      const callId = `call_${Date.now()}_${astrologerId}_${userId}`;
      callSessions.set(callId, {
        callId,
        astrologerId,
        userId,
        userName: participantName,
        roomName,
        callType: callType || 'video',
        status: 'pending',
        timestamp: new Date(),
        liveKitToken: token
      });

      console.log('📞 Call session created:', callId);
    }

    console.log('📞 LiveKit token generated successfully');

    return NextResponse.json({
      success: true,
      token,
      wsURL: LIVEKIT_CONFIG.wsURL,
      roomName,
      participantIdentity,
      message: 'LiveKit token generated successfully'
    });

  } catch (error) {
    console.error('📞 Error generating LiveKit token:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate LiveKit token'
    }, { status: 500 });
  }
}

// Send notification to astrologer
async function sendNotification(data: {
  astrologerId: string;
  userId: string;
  userName: string;
  roomName: string;
  callType: string;
  callId?: string;
  notificationData?: {
    title: string;
    body: string;
    action: string;
    timestamp: string;
  };
}) {
  try {
    const { astrologerId, userId, userName, roomName, callType, callId, notificationData } = data;

    console.log('📞 Sending notification to astrologer:', astrologerId);

    // Store call session
    const sessionCallId = callId || `call_${Date.now()}_${astrologerId}_${userId}`;
    callSessions.set(sessionCallId, {
      callId: sessionCallId,
      astrologerId,
      userId,
      userName,
      roomName,
      callType,
      status: 'pending',
      timestamp: new Date()
    });

    console.log('📞 Notification stored in call session:', sessionCallId);

    // Get device token for push notification
    const deviceToken = deviceTokens.get(astrologerId);
    
    if (deviceToken) {
      console.log('📞 Device token found for astrologer:', astrologerId);
      
      // Here you would integrate with your push notification service
      // For example: FCM, APNS, or other push notification providers
      
      const pushNotificationPayload = {
        to: deviceToken.deviceToken,
        notification: {
          title: notificationData?.title || `Incoming ${callType} call`,
          body: notificationData?.body || `${userName} wants to connect with you`,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          tag: sessionCallId,
          requireInteraction: true,
          actions: [
            {
              action: 'accept',
              title: 'Accept',
              icon: '/accept-icon.png'
            },
            {
              action: 'reject',
              title: 'Reject',
              icon: '/reject-icon.png'
            }
          ]
        },
        data: {
          callId: sessionCallId,
          astrologerId,
          userId,
          userName,
          roomName,
          callType,
          action: 'video_call_request',
          timestamp: new Date().toISOString()
        }
      };

      console.log('📞 Push notification payload prepared:', {
        platform: deviceToken.platform,
        tokenLength: deviceToken.deviceToken.length,
        callId: sessionCallId
      });

      // TODO: Implement actual push notification sending here
      // await sendPushNotification(pushNotificationPayload, deviceToken.platform);
    } else {
      console.log('📞 No device token found for astrologer:', astrologerId);
    }

    return NextResponse.json({
      success: true,
      callId: sessionCallId,
      message: 'Notification sent successfully',
      data: {
        astrologerId,
        userId,
        userName,
        roomName,
        callType,
        timestamp: new Date().toISOString(),
        notificationMethods: {
          callSession: true,
          pushNotification: !!deviceToken
        }
      }
    });

  } catch (error) {
    console.error('📞 Error sending notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send notification'
    }, { status: 500 });
  }
}

// Register device token for push notifications
async function registerDeviceToken(data: {
  astrologerId: string;
  deviceToken: string;
  platform?: 'ios' | 'android' | 'web';
}) {
  try {
    const { astrologerId, deviceToken, platform = 'web' } = data;

    console.log('📞 Registering device token for astrologer:', astrologerId);

    // Store device token
    deviceTokens.set(astrologerId, {
      astrologerId,
      deviceToken,
      platform,
      timestamp: new Date()
    });

    console.log('📞 Device token registered successfully');

    return NextResponse.json({
      success: true,
      message: 'Device token registered successfully',
      data: {
        astrologerId,
        platform,
        tokenLength: deviceToken.length,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('📞 Error registering device token:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to register device token'
    }, { status: 500 });
  }
}

// Get call status
async function getCallStatus(data: {
  callId: string;
}) {
  try {
    const { callId } = data;

    const callSession = callSessions.get(callId);
    
    if (!callSession) {
      return NextResponse.json({
        success: false,
        error: 'Call session not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...callSession,
        timestamp: callSession.timestamp.toISOString()
      }
    });

  } catch (error) {
    console.error('📞 Error getting call status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get call status'
    }, { status: 500 });
  }
}

// Update call status
async function updateCallStatus(data: {
  callId: string;
  status: 'accepted' | 'rejected' | 'active' | 'ended';
  astrologerId?: string;
}) {
  try {
    const { callId, status, astrologerId } = data;

    const callSession = callSessions.get(callId);
    
    if (!callSession) {
      return NextResponse.json({
        success: false,
        error: 'Call session not found'
      }, { status: 404 });
    }

    // Verify astrologer ID if provided
    if (astrologerId && callSession.astrologerId !== astrologerId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to update this call'
      }, { status: 403 });
    }

    // Update status
    callSession.status = status;
    callSessions.set(callId, callSession);

    console.log('📞 Call status updated:', { callId, status });

    return NextResponse.json({
      success: true,
      message: 'Call status updated successfully',
      data: {
        callId,
        status,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('📞 Error updating call status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update call status'
    }, { status: 500 });
  }
}

// End call
async function endCall(data: {
  callId: string;
  astrologerId?: string;
  userId?: string;
}) {
  try {
    const { callId, astrologerId, userId } = data;

    const callSession = callSessions.get(callId);
    
    if (!callSession) {
      return NextResponse.json({
        success: false,
        error: 'Call session not found'
      }, { status: 404 });
    }

    // Verify participant
    if (astrologerId && callSession.astrologerId !== astrologerId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to end this call'
      }, { status: 403 });
    }

    if (userId && callSession.userId !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized to end this call'
      }, { status: 403 });
    }

    // Update status to ended
    callSession.status = 'ended';
    callSessions.set(callId, callSession);

    console.log('📞 Call ended:', { callId });

    return NextResponse.json({
      success: true,
      message: 'Call ended successfully',
      data: {
        callId,
        status: 'ended',
        duration: new Date().getTime() - callSession.timestamp.getTime(),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('📞 Error ending call:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to end call'
    }, { status: 500 });
  }
}

// GET endpoint for health check and call sessions
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const astrologerId = url.searchParams.get('astrologerId');

  if (action === 'get_active_calls' && astrologerId) {
    // Get active calls for astrologer
    const activeCalls = Array.from(callSessions.values())
      .filter(call => 
        call.astrologerId === astrologerId && 
        ['pending', 'active'].includes(call.status)
      )
      .map(call => ({
        ...call,
        timestamp: call.timestamp.toISOString()
      }));

    return NextResponse.json({
      success: true,
      data: activeCalls
    });
  }

  // Health check
  return NextResponse.json({
    success: true,
    message: 'Calling API is running',
    endpoints: {
      'POST /': 'Main API endpoint',
      'GET /?action=get_active_calls&astrologerId={id}': 'Get active calls for astrologer'
    },
    actions: [
      'generate_livekit_token',
      'send_notification', 
      'register_device_token',
      'get_call_status',
      'update_call_status',
      'end_call'
    ],
    timestamp: new Date().toISOString()
  });
} 