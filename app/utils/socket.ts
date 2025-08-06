import { io, Socket } from 'socket.io-client';
import { getAuthToken, getUserDetails } from './auth-utils';
import { getApiBaseUrl } from '../config/api';
import Cookies from "universal-cookie";
import { buildApiUrl } from '../config/api';

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
  callType?: 'video' | 'call';
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
      const userId = userDetails?.id || userDetails?._id;
      if (!userId) {
        reject(new Error('User not authenticated'));
        return;
      }
      this.userId = userId;
      this.channelId = channelId;

      // Connect to socket server with only userId and role in query
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

      this.socket.on('end_call', (data) => {
        console.log('Call ended:', data);
      });
    });
  }

  // Initiate LiveKit call (video or audio)
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

      console.log('📡 Making LiveKit API call to: ' + buildApiUrl('/calling/api/call/call-token-livekit'));
      console.log('📋 Request payload:', {
        ...params,
        token: params.token ? params.token.substring(0, 20) + '...' : 'null'
      });

      const response = await fetch(buildApiUrl(`/calling/api/call/call-token-livekit?channel=${params.channel}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({
          receiverUserId: params.receiverNumericId,
          type: params.callType || 'video',
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
  async initiateVideoCall(channelId: string, receiverUserId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id;
      if (!userId) {
        reject(new Error('User not authenticated'));
        return;
      }

      console.log('Initiating video call via socket:', { channelId, receiverUserId });

      // Set a timeout for the operation
      const timeout = setTimeout(() => {
        reject(new Error('Socket operation timed out'));
      }, 10000); // 10 second timeout

      console.log(
        'initiate_call', {
        userId: userId,
        userType: 'user',
        callType: 'video',
        channelId: channelId,
        callThrough: 'livekit'
      }
      )
      // Emit initiate_call event
      this.socket.emit('initiate_call', {
        userId: userId,
        userType: 'user',
        callType: 'video',
        channelId: channelId,
        receiverUserId: receiverUserId,
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

  // Initiate an audio call (legacy socket-based)
  async initiateAudioCall(channelId: string, receiverUserId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id;
      if (!userId) {
        reject(new Error('User not authenticated'));
        return;
      }

      console.log('Initiating audio call via socket:', { channelId, receiverUserId });

      // Set a timeout for the operation
      const timeout = setTimeout(() => {
        reject(new Error('Socket operation timed out'));
      }, 10000); // 10 second timeout

      console.log(
        'initiate_call', {
        userId: userId,
        userType: 'user',
        callType: 'call',
        channelId: channelId,
        callThrough: 'livekit'
      }
      )
      // Emit initiate_call event
      this.socket.emit('initiate_call', {
        userId: userId,
        userType: 'user',
        callType: 'call',
        channelId: channelId,
        receiverUserId: receiverUserId,
        callThrough: 'livekit'
      }, (response: any) => {
        if (response && !response.error) {
          console.log('Audio call initiated successfully:', response);
          
          // Emit user_joined event
          this.socket?.emit('user_joined', {
            channelId: channelId,
            userType: 'user'
          }, (joinResponse: any) => {
            clearTimeout(timeout);
            if (joinResponse && !joinResponse.error) {  
              console.log('Successfully joined the audio call');
              resolve(joinResponse);
            } else {
              reject(new Error(joinResponse?.message || 'Failed to join audio call'));
            }
          });
        } else {
            console.log('Failed to initiate audio call', response);
          clearTimeout(timeout);
          reject(new Error(response?.message || 'Failed to initiate audio call'));
        }
      });
    });
  }

  // End call
  endCall(channelId: string, reason: string = 'USER_ENDED'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        console.warn('Socket not connected, using emitCallEnd as fallback');
        this.emitCallEnd(channelId, reason);
        resolve(); // Resolve anyway since we emitted the event
        return;
      }

      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id;
      if (!userId) {
        console.warn('User not authenticated, using emitCallEnd as fallback');
        this.emitCallEnd(channelId, reason);
        resolve(); // Resolve anyway since we emitted the event
        return;
      }

      this.socket.emit('end_call', {
        channelId: channelId,
        userId: userId,
        reason: reason,
        isCallEndFromNotification: false
      }, (response: any) => {
        if (response && !response.error) {
          console.log('Call ended successfully');
          resolve();
        } else {
          console.warn('Call end response error, but continuing:', response?.message || 'No response');
          resolve(); // Resolve anyway to continue with cleanup
        }
      });
    });
  }

  // Emit end_call event to notify other participants
  emitCallEnd(channelId: string, reason: string = 'USER_ENDED'): void {
    if (!this.socket || !this.isConnected) {
      console.warn('Socket not connected, cannot emit end_call');
      return;
    }

    const userDetails = getUserDetails();
    const userId = userDetails?.id || userDetails?._id;
    if (!userId) {
      console.warn('User not authenticated, cannot emit end_call');
      return;
    }

    console.log('Emitting end_call event:', { channelId, userId, reason });
    try {
      this.socket.emit('end_call', {
        channelId: channelId,
        userId: userId,
        reason: reason
      });
    } catch (error) {
      console.warn('Failed to emit end_call event:', error);
      // Continue anyway, the call will be cleaned up by the room disconnect
    }
  }

  // Join as broadcaster (for astrologers)
  async joinAsBroadcaster(channelId: string, astrologerId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      console.log('Joining as broadcaster:', { channelId, astrologerId });

      // Set a timeout for the operation
      const timeout = setTimeout(() => {
        reject(new Error('Socket operation timed out'));
      }, 10000); // 10 second timeout

      // Emit broadcaster_joined event
      this.socket.emit('broadcaster_joined', {
        channelId: channelId,
        userId: astrologerId
      }, (response: any) => {
        clearTimeout(timeout);
        if (response && !response.error) {
          console.log('Successfully joined as broadcaster');
          resolve(response);
        } else {
          reject(new Error(response?.message || 'Failed to join as broadcaster'));
        }
      });
    });
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket and cleaning up...');
      
      try {
        // Emit end_call event before disconnecting if we have channel info
        if (this.channelId && this.userId) {
          this.emitCallEnd(this.channelId, 'USER_DISCONNECTED');
        }
        
        // Remove all event listeners
        this.socket.removeAllListeners();
        
        // Disconnect the socket
        this.socket.disconnect();
        
        // Force close the socket connection
        if (this.socket.connected) {
          this.socket.close();
        }
        
        this.socket = null;
        this.isConnected = false;
        this.channelId = null;
        this.userId = null;
        
        console.log('Socket disconnected and cleaned up');
      } catch (error) {
        console.warn('Error during socket disconnect:', error);
        // Force cleanup even if there's an error
        this.socket = null;
        this.isConnected = false;
        this.channelId = null;
        this.userId = null;
      }
    } else {
      console.log('No socket to disconnect');
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

  getChannelId(): string | null {
    return this.channelId;
  }
  
  sendGift({
    channelId,
    giftId,
    from,
    fromName,
    to,
    giftName,
    giftIcon,
    toName,
    itemSendId
  }: {
    channelId: string;
    giftId: string;
    from: string;
    fromName: string;
    to: string;
    giftName: string;
    giftIcon: string;
    toName: string;
    itemSendId?: string;
  }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit(
        'send_gift',
        {
          channelId,
          giftId,
          from,
          fromName,
          to,
          giftName,
          giftIcon,
          toName,
          itemSendId
        },
        (response: any) => {
          if (response && !response.error) {
            resolve(response);
          } else {
            reject(response?.message || 'Failed to send gift');
          }
        }
      );
    });
  }

  // Listen for receiving a gift
  onReceiveGift(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('receive_gift', callback);
  }

  // Request a gift (optional, for requesting a gift from the other side)
  requestGift(channelId: string, giftId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }
      this.socket.emit(
        'request_gift',
        { channelId, giftId },
        (response: any) => {
          if (response && !response.error) {
            resolve(response);
          } else {
            reject(response?.message || 'Failed to request gift');
          }
        }
      );
    });
  }

  // Listen for gift requests
  onGiftRequest(callback: (data: any) => void) {
    if (!this.socket) return;
    this.socket.on('gift_request', callback);
  }

  // Request gift from user (for astrologers)
  requestGiftFromUser(channelId: string, giftId: string, giftName: string, giftIcon: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket || !this.isConnected) {
        reject(new Error('Socket not connected'));
        return;
      }

      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id;
      if (!userId) {
        reject(new Error('User not authenticated'));
        return;
      }

      console.log('🎁 Requesting gift from user:', { channelId, giftId, giftName });

      this.socket.emit('request_gift_from_user', {
        channelId: channelId,
        giftId: giftId,
        giftName: giftName,
        giftIcon: giftIcon,
        fromUserId: userId
      }, (response: any) => {
        if (response && !response.error) {
          console.log('✅ Gift request sent successfully');
          resolve(response);
        } else {
          console.error('❌ Failed to request gift:', response?.message);
          reject(new Error(response?.message || 'Failed to request gift'));
        }
      });
    });
  }
}

// Export singleton instance
export const socketManager = new SocketManager(); 