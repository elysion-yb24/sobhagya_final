// LiveKit Configuration
export const LIVEKIT_CONFIG = {
  // LiveKit server credentials - you need to set these in your environment variables
  wsURL: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://sobhagya-iothxaak.livekit.cloud',
  apiKey: process.env.LIVEKIT_API_KEY || '',
  apiSecret: process.env.LIVEKIT_API_SECRET || '',
};

// Validate configuration
export const validateLiveKitConfig = () => {
  const issues: string[] = [];
  
  if (!LIVEKIT_CONFIG.wsURL || LIVEKIT_CONFIG.wsURL.includes('your-livekit-server')) {
    issues.push('NEXT_PUBLIC_LIVEKIT_URL is not set or using placeholder value');
  }
  
  if (!LIVEKIT_CONFIG.apiKey || LIVEKIT_CONFIG.apiKey.includes('your-api-key')) {
    issues.push('LIVEKIT_API_KEY is not set or using placeholder value');
  }
  
  if (!LIVEKIT_CONFIG.apiSecret || LIVEKIT_CONFIG.apiSecret.includes('your-api-secret')) {
    issues.push('LIVEKIT_API_SECRET is not set or using placeholder value');
  }
  
  if (issues.length > 0) {
    console.error('LiveKit Configuration Issues:');
    issues.forEach(issue => console.error(`- ${issue}`));
    console.error('\nTo fix these issues:');
    console.error('1. Go to https://cloud.livekit.io/');
    console.error('2. Create an account and project');
    console.error('3. Get your WebSocket URL, API Key, and API Secret');
    console.error('4. Create a .env.local file with:');
    console.error('   NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud');
    console.error('   LIVEKIT_API_KEY=your-api-key');
    console.error('   LIVEKIT_API_SECRET=your-api-secret');
    
    return false;
  }
  
  return true;
};

// Room configuration
export const ROOM_CONFIG = {
  // Auto-subscribe to all tracks
  autoSubscribe: true,
  // Enable adaptive stream for better performance
  adaptiveStream: true,
  // Disconnect on page unload
  disconnectOnPageLeave: true,
  // Room options
  roomOptions: {
    // Auto manage video quality
    adaptiveStream: true,
    // Enable dynacast for better performance
    dynacast: true,
    // Audio settings
    audioCaptureDefaults: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    // Video settings
    videoCaptureDefaults: {
      resolution: {
        width: 640,
        height: 480,
      },
      facingMode: 'user',
    },
  },
};

// Generate room name for astrologer-user pair
export const generateRoomName = (astrologerId: string, userId: string): string => {
  // Create a consistent room name regardless of who initiates the call
  const ids = [astrologerId, userId].sort();
  return `call_${ids[0]}_${ids[1]}_${Date.now()}`;
};

// Generate participant identity
export const generateParticipantIdentity = (userId: string, role: 'user' | 'astrologer'): string => {
  return `${role}_${userId}`;
}; 