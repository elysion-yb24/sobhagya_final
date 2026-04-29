"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Video, Clock, Loader2, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { getAuthToken, getUserDetails } from '../../utils/auth-utils';
import { socketManager } from '../../utils/socket';

interface PendingCall {
  callId: string;
  astrologerId: string;
  userId: string;
  userName: string;
  roomName: string;
  callType: string;
  timestamp: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'active' | 'ended';
}

interface CallingApiNotificationsProps {
  astrologerId?: string;
  onCallAccepted?: (call: PendingCall) => void;
  onCallRejected?: (call: PendingCall) => void;
}

export default function CallingApiNotifications({ 
  astrologerId, 
  onCallAccepted, 
  onCallRejected 
}: CallingApiNotificationsProps) {
  const router = useRouter();
  const [pendingCalls, setPendingCalls] = useState<PendingCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Get astrologer ID from props or user details
  const getAstrologerId = useCallback(() => {
    if (astrologerId) return astrologerId;
    const userDetails = getUserDetails();
    return userDetails?._id;  
  }, [astrologerId]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);

  // Socket Connection and Event Listeners
  useEffect(() => {
    let isMounted = true;
    const currentAstrologerId = getAstrologerId();
    if (!currentAstrologerId) return;

    const setupSocket = async () => {
      try {
        setLoading(true);
        if (!socketManager.isSocketConnected()) {
          await socketManager.connect(null);
        }
        
        const handleIncomingCall = (callData: any) => {
          console.log('📱 Received incoming_call event:', callData);
          if (!isMounted) return;
          
          setPendingCalls(prev => {
            if (!prev.find(c => c.callId === callData.callId)) {
              const newCall: PendingCall = {
                callId: callData.callId,
                astrologerId: currentAstrologerId,
                userId: callData.callerId || callData.userId || 'unknown',
                userName: callData.callerName || callData.userName || 'User',
                roomName: callData.channel || callData.roomName,
                callType: callData.callType || 'video',
                timestamp: callData.timestamp || new Date().toISOString(),
                status: 'pending'
              };
              
              if (Notification.permission === 'granted') {
                new Notification(`Incoming ${newCall.callType} call`, {
                  body: `${newCall.userName} wants to connect with you`,
                  icon: '/icon-192x192.png',
                  badge: '/badge-72x72.png',
                  tag: newCall.callId,
                  requireInteraction: true
                });
              }
              
              return [...prev, newCall];
            }
            return prev;
          });
          setLastUpdate(new Date());
        };

        const handleCallEnd = (data: any) => {
          console.log('📱 Received call_end event:', data);
          if (!isMounted) return;
          setPendingCalls(prev => prev.filter(c => c.roomName !== data?.data?.channelId && c.callId !== data?.callId));
        };

        socketManager.onIncomingCall(handleIncomingCall);
        socketManager.onCallEndGlobal(handleCallEnd);

        setLoading(false);
        setError(null);
        setLastUpdate(new Date());
      } catch (err) {
        console.error('📱 Error setting up socket:', err);
        if (isMounted) {
          setError('Failed to connect to real-time service');
          setLoading(false);
        }
      }
    };

    setupSocket();

    return () => {
      isMounted = false;
      // We do not strictly disconnect since other parts might use it, but we could remove listeners.
      // We will implement `off` methods in a later refactor if needed, or rely on socket cleanup.
    };
  }, [getAstrologerId]);

  // Respond to call (accept/reject)
  const respondToCall = async (call: PendingCall, response: 'accepted' | 'rejected') => {
    try {
      setResponding(call.callId);
      const currentAstrologerId = getAstrologerId();

      console.log(`📱 Responding to call ${call.callId}: ${response}`);

      if (response === 'accepted') {
        try {
          const acceptResponse = await socketManager.acceptCall(call.roomName, true);
          console.log('📱 Call accepted via socket:', acceptResponse);
          
          setPendingCalls(prev => prev.filter(c => c.callId !== call.callId));
          
          // Connect as broadcaster before navigating
          try {
            await socketManager.joinAsBroadcaster(call.roomName, currentAstrologerId);
            console.log('✅ Astrologer successfully joined as broadcaster');
          } catch (broadcasterError) {
            console.warn('❌ Failed to join as broadcaster:', broadcasterError);
          }
          
          const token = acceptResponse?.token || '';
          
          const callUrl = `/astrologer-video-call?userId=${call.userId}&userName=${encodeURIComponent(call.userName)}&roomName=${encodeURIComponent(call.roomName)}&callType=${call.callType}&token=${encodeURIComponent(token)}`;
          console.log('📱 Navigating to:', callUrl);
          
          window.location.href = callUrl;
          
          if (onCallAccepted) {
            onCallAccepted(call);
          }
        } catch (acceptError) {
          console.error('📱 Failed to accept call:', acceptError);
          setError('Failed to accept the call');
        }
      } else {
        // Rejecting Call
        try {
          await socketManager.endCall(call.roomName, 'REJECTED_BY_ASTROLOGER');
          setPendingCalls(prev => prev.filter(c => c.callId !== call.callId));
          if (onCallRejected) {
            onCallRejected(call);
          }
        } catch (rejectError) {
          console.error('📱 Failed to reject call:', rejectError);
          setPendingCalls(prev => prev.filter(c => c.callId !== call.callId));
        }
      }
    } catch (error) {
      console.error('📱 Failed to respond to call:', error);
      setError('Unexpected error while responding to call');
    } finally {
      setResponding(null);
    }
  };

  // Format time elapsed
  const getTimeElapsed = (timestamp: string) => {
    const now = new Date();
    const callTime = new Date(timestamp);
    const diffMs = now.getTime() - callTime.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) {
      return `${diffSeconds}s ago`;
    } else {
      const diffMinutes = Math.floor(diffSeconds / 60);
      return `${diffMinutes}m ago`;
    }
  };

  if (loading && pendingCalls.length === 0) {
    return (
      <div className="bg-orange-50/80 border border-orange-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center border border-orange-200">
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Connecting to real-time network...</h4>
            <p className="text-sm text-gray-500">
              Please wait while we establish your secure connection.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">Connection Error</h4>
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-md transition-colors flex items-center gap-1 border border-red-200"
            >
              <RefreshCw className="w-3 h-3" />
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (pendingCalls.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
            <Bell className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800">No incoming calls</h4>
            <p className="text-sm text-gray-500 mb-1">
              Waiting for real-time incoming calls.
            </p>
            {lastUpdate && (
              <p className="text-xs text-gray-400">
                Connected at: {lastUpdate.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#333333] font-bold">
          <Bell className="w-5 h-5 text-[#F7941D]" />
          <span>Incoming Calls ({pendingCalls.length})</span>
        </div>
      </div>

      {pendingCalls.map((call) => (
        <div 
          key={call.callId} 
          className="bg-white border border-[#F7941D] rounded-xl p-4 shadow-sm relative overflow-hidden group animate-pulse-light"
        >
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center border border-orange-200 shadow-sm transition-transform">
                <Video className="w-6 h-6 text-[#F7941D] animate-bounce" />
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 text-lg">{call.userName}</h4>
                <p className="text-sm text-gray-600">
                  Incoming {call.callType} call
                </p>
                <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeElapsed(call.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => respondToCall(call, 'accepted')}
                disabled={responding === call.callId}
                className="px-4 py-2 bg-[#F7941D] hover:bg-[#F7941D]/90 text-white rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50 shadow-sm border border-[#F7941D]"
              >
                {responding === call.callId ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Accept
              </button>
              
              <button
                onClick={() => respondToCall(call, 'rejected')}
                disabled={responding === call.callId}
                className="px-4 py-2 bg-white hover:bg-red-50 text-red-500 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50 border border-red-200"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}