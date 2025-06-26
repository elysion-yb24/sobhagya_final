import { io, Socket } from 'socket.io-client';
import { getAuthToken, getUserDetails } from './auth-utils';
import { getApiBaseUrl } from '../config/api';
import Cookies from "universal-cookie";

interface LiveKitCallParams {
  token: string;
  channel: string;
  rpm: number;
  receiverNumericId: string;
  senderNumericId: string;
  receiverAvatar: string;
  balance: number;
  callThrough: 'livekit';
  livekitSocketURL: string;
}

class SocketManager {
  private socket: Socket | null = null;
  private channelId: string | null = null;
  private userId: string | null = null;
  private isConnected: boolean = false;

  // Initialize socket connection
  connect(channelId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const userDetails = getUserDetails();
      if (!userDetails?.id) {
        reject(new Error('User not authenticated'));
        return;
      }

      this.userId = userDetails.id;
      this.channelId = channelId;

      // Connect to socket server
      this.socket = io('https://micro.sobhagya.in', {
        path: '/call-socket/socket.io',
        query: {
          userId: this.userId,
          role: 'user'
        },
        transports: ['websocket'],
        forceNew: true,
        reconnection: true,
        timeout: 60000,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

 
      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        this.isConnected = true;
        
        
        if (this.channelId && this.userId) {
          this.socket?.emit('register', {
            userId: this.userId,
            channelId: this.channelId
          });
        }
        
        resolve();
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        reject(error);
      });

      // Call-related event listeners
      this.socket.on('user_joined', (callDetails) => {
        console.log('User joined the call:', callDetails);
      });

      this.socket.on('broadcaster_joined', (data) => {
        console.log('Broadcaster joined the call:', data);
      });

      this.socket.on('call_end', (data) => {
        console.log('Call ended:', data);
      });
    });
  }

  // Initiate LiveKit video call
  async initiateLiveKitCall(params: LiveKitCallParams): Promise<any> {
    try {
      // Debug: Check multiple token sources
      let authToken = getAuthToken();
      const userDetails = getUserDetails();
      
      
     
      
      // Try cookies as alternative
      const cookies = new Cookies();
      const cookieToken = cookies.get('access_token');
      
     

      // Use localStorage access_token as primary choice
      if (!authToken && cookieToken) {
        authToken = cookieToken;
        console.log('🍪 Using cookie token as fallback');
      }

      if (!authToken) {
        throw new Error('User not authenticated - no token found');
      }

      console.log('📡 Making LiveKit API call to: http://localhost:8001/calling/api/call/call-token-livekit');
      console.log('📋 Request payload:', {
        ...params,
        token: params.token ? params.token.substring(0, 20) + '...' : 'null'
      });

      const response = await fetch(`http://localhost:8001/calling/api/call/call-token-livekit?channel=${params.channel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          receiverUserId: params.receiverNumericId,
          type: 'video',
          appVersion: '1.0.0'
        })
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ LiveKit call initiated successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error initiating LiveKit call:', error);
      throw error;
    }
  }

  // Initiate a video call (legacy socket-based)
  async initiateVideoCall(channelId: string, astrologerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const userDetails = getUserDetails();
      if (!userDetails?.id) {
        reject(new Error('User not authenticated'));
        return;
      }

      console.log('Initiating video call via socket:', { channelId, astrologerId });

      // Set a timeout for the operation
      const timeout = setTimeout(() => {
        reject(new Error('Socket operation timed out'));
      }, 10000); // 10 second timeout

      console.log(
        'initiate_call', {
        userId: userDetails.id,
        userType: 'user',
        callType: 'video',
        channelId: channelId,
        callThrough: 'livekit'
      }
      )
      // Emit initiate_call event
      this.socket.emit('initiate_call', {
        userId: userDetails.id,
        userType: 'user',
        callType: 'video',
        channelId: channelId,
        callThrough: 'livekit'
      }, (response: any) => {
        if (response && !response.error) {
          console.log('Call initiated successfully:', response);
          
          // Emit user_joined event
          this.socket?.emit('user_joined', {
            channelId: channelId,
            userType: 'user'
          }, (joinResponse: any) => {
            clearTimeout(timeout);
            if (joinResponse && !joinResponse.error) {
              console.log('Successfully joined the call');
              resolve(joinResponse);
            } else {
              reject(new Error(joinResponse?.message || 'Failed to join call'));
            }
          });
        } else {
            console.log('Failed to initiate call', response);
          clearTimeout(timeout);
          reject(new Error(response?.message || 'Failed to initiate call'));
        }
      });
    });
  }

  // End call
  endCall(channelId: string, reason: string = 'USER_ENDED'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const userDetails = getUserDetails();
      if (!userDetails?.id) {
        reject(new Error('User not authenticated'));
        return;
      }

      this.socket.emit('end_call', {
        channelId: channelId,
        userId: userDetails.id,
        reason: reason,
        isCallEndFromNotification: false
      }, (response: any) => {
        if (response && !response.error) {
          console.log('Call ended successfully');
          resolve();
        } else {
          reject(new Error(response?.message || 'Failed to end call'));
        }
      });
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }

  // Check if connected
  isSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
export const socketManager = new SocketManager(); 