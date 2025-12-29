import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { astrologerId, callerId, receiverId, callType, rpm } = await request.json();

    // Mock video call initialization
    const callId = `video_call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const roomId = `room_${astrologerId}_${callerId}_${Date.now()}`;

    // Simulate successful video call request
    return NextResponse.json({
      success: true,
      message: 'Video call initiated successfully',
      data: {
        callId,
        roomId,
        astrologerId,
        callerId,
        callType: 'video',
        rpm,
        status: 'connecting',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate video call',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 