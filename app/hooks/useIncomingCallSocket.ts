'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getApiBaseUrl } from '../config/api';
import { getUserDetails, getAuthToken } from '../utils/auth-utils';

export interface IncomingCall {
  callId: string;
  channel: string;
  callType: 'call' | 'video' | string;
  callerId: string;
  callerName: string;
  callerAvatar?: string;
  receiverId: string;
  rpm?: number;
  livekitSocketURL?: string;
  timestamp: string;
}

const CALL_SOCKET_URL = typeof window !== 'undefined' ? getApiBaseUrl() : 'https://micro.sobhagya.in';
const CALL_SOCKET_PATH = '/call-socket/socket.io/';

/**
 * Subscribes the partner web client to its per-user room on the calling-service
 * socket and surfaces incoming calls. Backend emits `incoming_call` to
 * `user:<receiverId>` from livekitTokenController on call initiation.
 *
 * Falls back to short-interval REST polling so calls aren't missed if the
 * socket is mid-reconnect when the user dials in.
 */
export function useIncomingCallSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const dismissedRef = useRef<Set<string>>(new Set());

  const acceptCall = useCallback((channelId: string, isLivekit: boolean = true): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !socketRef.current.connected) {
        return reject(new Error('Socket not connected'));
      }
      socketRef.current.emit('accept_call', { channelId, isLivekit }, (response: any) => {
        if (response?.error || response?.success === false) {
          reject(new Error(response?.message || 'Failed to accept call'));
        } else {
          resolve(response);
        }
      });
    });
  }, []);

  const rejectCall = useCallback((channelId: string, userId: string, reason: string = 'rejected_by_partner'): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !socketRef.current.connected) {
        return reject(new Error('Socket not connected'));
      }
      socketRef.current.emit('end_call', { channelId, userId, reason, isCallEndFromNotification: true }, (response: any) => {
        resolve(response);
      });
    });
  }, []);

  const dismiss = useCallback((callId?: string) => {
    if (callId) dismissedRef.current.add(callId);
    setIncomingCall(null);
  }, []);

  useEffect(() => {
    const userDetails = getUserDetails();
    const userId = userDetails?.id || userDetails?._id;
    if (!userId) return;

    const token = getAuthToken() || '';

    const socket = io(CALL_SOCKET_URL, {
      path: CALL_SOCKET_PATH,
      query: { userId, token, role: 'broadcaster' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1500,
      reconnectionAttempts: Infinity,
    });

    socket.on('connect', () => {
      console.log('[IncomingCallSocket] connected', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[IncomingCallSocket] disconnected', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[IncomingCallSocket] connect_error', err.message);
    });

    const handleIncoming = (payload: any) => {
      if (!payload || !payload.channel) return;
      const call: IncomingCall = {
        callId: String(payload.callId || payload.channel),
        channel: String(payload.channel),
        callType: payload.callType || 'call',
        callerId: String(payload.callerId || ''),
        callerName: payload.callerName || 'Caller',
        callerAvatar: payload.callerAvatar || '',
        receiverId: String(payload.receiverId || userId),
        rpm: payload.rpm,
        livekitSocketURL: payload.livekitSocketURL,
        timestamp: payload.timestamp || new Date().toISOString(),
      };
      if (dismissedRef.current.has(call.callId)) return;
      setIncomingCall(call);
    };

    socket.on('incoming_call', handleIncoming);

    // Also surface a server-initiated cancel so the popup auto-dismisses if the
    // caller hangs up before the partner picks up.
    socket.on('call_end', (payload: any) => {
      if (!payload) return;
      const ch = payload?.data?.channelId || payload?.channelId;
      setIncomingCall((curr) => (curr && (curr.channel === ch || !ch) ? null : curr));
    });

    socketRef.current = socket;

    return () => {
      socket.off('incoming_call', handleIncoming);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, []);

  return { incomingCall, isConnected, dismiss, acceptCall, rejectCall };
}
