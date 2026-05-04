'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getUserDetails, getAuthToken } from '../utils/auth-utils';
import { getApiBaseUrl } from '../config/api';

const LIVE_SOCKET_URL = typeof window !== 'undefined' ? getApiBaseUrl() : 'https://micro.sobhagya.in';
const LIVE_SOCKET_PATH = '/live-socket/socket.io/';

export interface LiveSession {
  sessionId: string;
  broadcasterId: string;
  broadcasterName: string;
  broadcasterProfilePicture: string;
  status: string;
  viewers?: number;
  likes?: number;
  privateAudioRpm?: number;
  publicAudioRpm?: number;
  activeCall?: any;
  createdAt?: string;
}

export interface ChatMessage {
  userId: string;
  name: string;
  message: string;
  profilePicture?: string;
  timestamp?: string;
}

export interface QueueItem {
  _id: string;
  userId: string;
  userName: string;
  isPrivate: boolean;
  status: string;
  sessionId: string;
}

export function useLiveSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const userDetails = getUserDetails();
    const userId = userDetails?.id || userDetails?._id || 'anonymous';
    const token = getAuthToken() || '';

    const socket = io(LIVE_SOCKET_URL, {
      path: LIVE_SOCKET_PATH,
      query: { userId, token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 20,
    });

    socket.on('connect', () => {
      console.log('[LiveSocket] Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[LiveSocket] Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[LiveSocket] Connection error:', err.message);
    });

    // Log every inbound event so we can see what the server actually broadcasts
    // when the astrologer accepts a queued invite — exact event name varies by
    // backend and isn't documented on the Android side (FCM does that job there).
    socket.onAny((event, ...args) => {
      console.log('[LiveSocket] <=', event, ...args);
    });

    socketRef.current = socket;

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, []);

  const getSessions = useCallback((lastSessionId?: string, limit: number = 20): Promise<LiveSession[]> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve([]); return; }
      socketRef.current.emit('getSessions', { lastSessionId, limit }, (resp: any) => {
        if (!resp.error && resp.sessions) {
          resolve(resp.sessions);
        } else {
          resolve([]);
        }
      });
    });
  }, []);

  const startSession = useCallback((sessionId: string, broadcasterId: string, broadcasterName: string, broadcasterProfilePicture: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve({ error: true, message: "Socket not connected" }); return; }
      socketRef.current.emit('startSession', { sessionId, broadcasterId, broadcasterName, broadcasterProfilePicture }, (resp: any) => {
        resolve(resp);
      });
    });
  }, []);

  const endSessionBroadcaster = useCallback((sessionId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve({ error: true }); return; }
      socketRef.current.emit('endSession', { sessionId }, (resp: any) => {
        resolve(resp);
      });
    });
  }, []);

  const joinSession = useCallback((sessionId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id || '';
      const userName = userDetails?.name || userDetails?.displayName || 'User';
      const userProfilePicture = userDetails?.avatar || '';

      socketRef.current.emit('joinSession', { sessionId, userName, userId, userProfilePicture }, (resp: any) => {
        resolve(resp);
      });
    });
  }, []);

  const leaveSession = useCallback((sessionId: string) => {
    if (!socketRef.current) return;
    const userDetails = getUserDetails();
    const userId = userDetails?.id || userDetails?._id || '';
    socketRef.current.emit('leaveSession', { sessionId, userId });
  }, []);

  const fetchSessionToken = useCallback((currentSessionId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id || '';
      socketRef.current.emit('fetchSessionToken', {
        currentSessionId,
        previousSessionId: null,
        nextSessionId: null,
        userId,
      }, (resp: any) => {
        resolve(resp);
      });
    });
  }, []);

  const getChats = useCallback((sessionId: string): Promise<ChatMessage[]> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve([]); return; }
      socketRef.current.emit('get_chats', { sessionId }, (resp: any) => {
        if (!resp.error && resp.data) {
          resolve(resp.data);
        } else {
          resolve([]);
        }
      });
    });
  }, []);

  const sendChat = useCallback((sessionId: string, message: string): Promise<ChatMessage | null> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id || '';
      const name = userDetails?.name || userDetails?.displayName || 'User';
      const profilePicture = userDetails?.avatar || '';

      socketRef.current.emit('add_chat', { sessionId, userId, name, message, profilePicture }, (resp: any) => {
        if (!resp.error && resp.data) {
          resolve(resp.data);
        } else {
          resolve(null);
        }
      });
    });
  }, []);

  const joinQueue = useCallback((sessionId: string, isPrivate: boolean): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id || '';
      const userName = userDetails?.name || userDetails?.displayName || 'User';

      socketRef.current.emit('joinQueue', { sessionId, userId, userName, isPrivate }, (resp: any) => {
        resolve(resp);
      });
    });
  }, []);

  const leaveQueue = useCallback((sessionId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id || '';
      socketRef.current.emit('leaveQueue', { sessionId, userId }, (resp: any) => {
        resolve(resp);
      });
    });
  }, []);

  const getQueue = useCallback((sessionId: string): Promise<QueueItem[]> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve([]); return; }
      socketRef.current.emit('getQueue', { sessionId }, (resp: any) => {
        if (!resp.error && resp.data) {
          resolve(Array.isArray(resp.data) ? resp.data : []);
        } else {
          resolve([]);
        }
      });
    });
  }, []);

  const getActiveCall = useCallback((sessionId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      socketRef.current.emit('get_active_call', { sessionId }, (resp: any) => {
        try { console.log('[LiveSocket] get_active_call FULL:', JSON.stringify(resp)); }
        catch { console.log('[LiveSocket] get_active_call (unstringifiable):', resp); }
        if (resp?.error || !resp?.data) { resolve(null); return; }
        let ac: any = resp.data.activeCalls ?? resp.data.activeCall ?? resp.data;
        if (typeof ac === 'string') {
          try { ac = JSON.parse(ac); } catch { ac = null; }
        }
        if (!ac || typeof ac !== 'object') { resolve(null); return; }
        if (!ac.channelId && !ac.userId && !ac.user) { resolve(null); return; }
        if (typeof ac.isPrivate === 'string') {
          ac.isPrivate = ac.isPrivate === 'true';
        }
        console.log('[LiveSocket] get_active_call PARSED:', ac);
        resolve(ac);
      });
    });
  }, []);

  const addLike = useCallback((sessionId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id || '';
      socketRef.current.emit('add_like', { sessionId, userId }, (resp: any) => {
        resolve(resp);
      });
    });
  }, []);

  const getLikes = useCallback((sessionId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id || '';
      socketRef.current.emit('get_likes', { sessionId, userId }, (resp: any) => {
        resolve(resp);
      });
    });
  }, []);

  const joinRoomParticipant = useCallback((sessionId: string, callRate: number, isAudioPrivate: boolean): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id || '';
      let settled = false;
      const finish = (resp: any) => {
        if (settled) return;
        settled = true;
        resolve(resp);
      };
      // 10 s is generous — backend has to mint a LiveKit token. Anything
      // longer is a bug we'd rather surface than hide behind a spinner.
      const timer = setTimeout(() => {
        finish({ error: true, message: 'JOIN_ROOM_TIMEOUT' });
      }, 10000);
      socketRef.current.emit('joinRoomParticipant', {
        sessionId,
        userId,
        callRate,
        isAudioPrivate,
        isVideoPrivate: true,
        isVideoOff: true,
      }, (resp: any) => {
        clearTimeout(timer);
        finish(resp);
      });
    });
  }, []);

  const acceptInvite = useCallback((sessionId: string, channelId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      let settled = false;
      const finish = (resp: any) => {
        if (settled) return;
        settled = true;
        resolve(resp);
      };
      // Hard timeout — if the backend forgets to ack we don't want the UI
      // pinned on "Joining..." indefinitely. 6 s is plenty for a Redis ack
      // and well under the 60 s ring-timeout the server enforces.
      const timer = setTimeout(() => {
        finish({ error: true, message: 'ACCEPT_INVITE_TIMEOUT' });
      }, 6000);
      socketRef.current.emit('accept_invite', { sessionId, channelId }, (resp: any) => {
        clearTimeout(timer);
        finish(resp);
      });
    });
  }, []);

  const endCall = useCallback((sessionId: string, channelId: string): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id || '';
      socketRef.current.emit('end_call', { sessionId, channelId, userId, reason: 'user_ended' }, (resp: any) => {
        resolve(resp);
      });
    });
  }, []);

  const emitConnectedWithLivekit = useCallback((sessionId: string, isHlsStream: boolean = false): Promise<any> => {
    return new Promise((resolve) => {
      if (!socketRef.current) { resolve(null); return; }
      socketRef.current.emit('connectedWithLivekit', { sessionId, isHlsStream }, (resp: any) => {
        resolve(resp);
      });
    });
  }, []);

  // Mirrors useCallSocket.fetchGifts — the live backend shares the same
  // `get_gifts` event, so the modal doesn't need a REST fallback.
  const fetchGifts = useCallback((): Promise<any[]> => {
    return new Promise((resolve) => {
      if (!socketRef.current || !socketRef.current.connected) {
        resolve([]);
        return;
      }
      socketRef.current.emit('get_gifts', {}, (response: any) => {
        if (response?.error) {
          console.error('[useLiveSocket] get_gifts error:', response);
          resolve([]);
          return;
        }
        const list = Array.isArray(response?.data) ? response.data : [];
        resolve(list);
      });
    });
  }, []);

  const emitSendGift = useCallback((sessionId: string, gift: any, receiverName: string, receiverId?: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current) { reject(new Error('Socket not connected')); return; }
      const userDetails = getUserDetails();
      const userId = userDetails?.id || userDetails?._id || '';
      const userName = userDetails?.name || userDetails?.displayName || 'User';
      const itemSendId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const payload = {
        sessionId,
        channelId: sessionId,
        giftId: gift._id,
        from: userId,
        fromName: userName,
        to: receiverId || receiverName,
        giftName: gift.name,
        giftIcon: gift.icon,
        toName: receiverName,
        itemSendId,
      };

      socketRef.current.emit('send_gift', payload, (resp: any) => {
        if (resp && resp.error) {
          reject(new Error(resp.message || resp.data?.message || 'Failed to send dakshina'));
          return;
        }
        resolve(resp);
      });
    });
  }, []);

  // Event listeners
  const onChatUpdate = useCallback((callback: (data: ChatMessage) => void) => {
    socketRef.current?.on('chat_update', (resp: any) => callback(resp.data));
    return () => { socketRef.current?.off('chat_update'); };
  }, []);

  const onViewerUpdate = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('viewerUpdate', callback);
    return () => { socketRef.current?.off('viewerUpdate'); };
  }, []);

  const onViewerLeft = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('viewerLeft', callback);
    return () => { socketRef.current?.off('viewerLeft'); };
  }, []);

  const onSessionEnded = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('sessionEnded', callback);
    return () => { socketRef.current?.off('sessionEnded'); };
  }, []);

  const onCallStarted = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('call_started', callback);
    return () => { socketRef.current?.off('call_started'); };
  }, []);

  const onInviteReceived = useCallback((callback: (data: any) => void) => {
    // Different backends broadcast the "astrologer invited you" notification
    // under different event names. Subscribe to all known variants.
    const events = ['send_invite', 'invite_received', 'inviteReceived', 'invite_sent', 'inviteSent', 'invitationReceived'];
    const handler = (resp: any) => {
      callback(resp?.data ?? resp);
    };
    events.forEach(e => socketRef.current?.on(e, handler));
    return () => { events.forEach(e => socketRef.current?.off(e, handler)); };
  }, []);

  const onCallEnd = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('call_end', callback);
    return () => { socketRef.current?.off('call_end'); };
  }, []);

  const onQueueJoined = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('queueJoined', callback);
    return () => { socketRef.current?.off('queueJoined'); };
  }, []);

  const onLikeUpdate = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('like_update', callback);
    return () => { socketRef.current?.off('like_update'); };
  }, []);

  const onGiftReceived = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('receive_gift', callback);
    return () => { socketRef.current?.off('receive_gift'); };
  }, []);

  const onGiftRequest = useCallback((callback: (data: any) => void) => {
    socketRef.current?.on('gift_request', callback);
    return () => { socketRef.current?.off('gift_request'); };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    getSessions,
    startSession,
    endSessionBroadcaster,
    joinSession,
    leaveSession,
    fetchSessionToken,
    getChats,
    sendChat,
    joinQueue,
    leaveQueue,
    getQueue,
    getActiveCall,
    addLike,
    getLikes,
    joinRoomParticipant,
    acceptInvite,
    endCall,
    emitConnectedWithLivekit,
    onChatUpdate,
    onViewerUpdate,
    onViewerLeft,
    onSessionEnded,
    onCallStarted,
    onInviteReceived,
    onCallEnd,
    onQueueJoined,
    onLikeUpdate,
    onGiftReceived,
    onGiftRequest,
    emitSendGift,
    fetchGifts,
  };
}
