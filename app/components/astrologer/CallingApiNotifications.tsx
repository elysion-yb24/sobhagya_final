"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Video, Clock, Loader2, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { getAuthToken, getUserDetails } from '../../utils/auth-utils';

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

  // Fetch pending calls from calling API
  const fetchPendingCalls = useCallback(async () => {
    const currentAstrologerId = getAstrologerId();
    if (!currentAstrologerId) return;

    try {
      console.log('📱 Fetching pending calls for astrologer:', currentAstrologerId);
      
      const response = await fetch(`/api/calling/call/call-token-livekit?action=get_active_calls&astrologerId=${currentAstrologerId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📱 Pending calls response:', result);
        
        if (result.success && Array.isArray(result.data)) {
          const activeCalls = result.data.filter((call: PendingCall) => 
            call.status === 'pending' || call.status === 'active'
          );
          
          setPendingCalls(activeCalls);
          setError(null);
          setLastUpdate(new Date());
          
          // Show browser notification for new calls
          activeCalls.forEach((call: PendingCall) => {
            if (call.status === 'pending' && Notification.permission === 'granted') {
              new Notification(`Incoming ${call.callType} call`, {
                body: `${call.userName} wants to connect with you`,
                icon: '/icon-192x192.png',
                badge: '/badge-72x72.png',
                tag: call.callId,
                requireInteraction: true
              });
            }
          });
        } else {
          setPendingCalls([]);
        }
      } else {
        console.error('📱 Failed to fetch pending calls:', response.status, response.statusText);
        setError('Failed to fetch notifications');
      }
    } catch (err) {
      console.error('📱 Error fetching pending calls:', err);
      setError('Network error while fetching notifications');
    } finally {
      setLoading(false);
    }
  }, [getAstrologerId]);

  // Poll for updates every 10 seconds instead of 3
  useEffect(() => {
    fetchPendingCalls();
    
    const interval = setInterval(fetchPendingCalls, 10000); // Increased from 3000 to 10000
    
    return () => clearInterval(interval);
  }, [fetchPendingCalls]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);

  // Respond to call (accept/reject)
  const respondToCall = async (call: PendingCall, response: 'accepted' | 'rejected') => {
    try {
      setResponding(call.callId);
      const currentAstrologerId = getAstrologerId();

      console.log(`📱 Responding to call ${call.callId}: ${response}`);

      try {
        // Update call status via calling API
        const updateResponse = await fetch('/api/calling/call/call-token-livekit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({
            action: 'update_call_status',
            callId: call.callId,
            status: response,
            astrologerId: currentAstrologerId
          }),
        });

        if (updateResponse.ok) {
          const result = await updateResponse.json();
          console.log('📱 Call status updated:', result);

          // Remove from pending list
          setPendingCalls(prev => prev.filter(c => c.callId !== call.callId));

          if (response === 'accepted') {
            try {
              // For accepted calls, use proper socket + LiveKit integration
              console.log('📱 Call accepted, setting up LiveKit session...');
              
              // Connect astrologer socket with broadcaster role
              try {
                const { io } = await import('socket.io-client');
                const socket = io('https://micro.sobhagya.in', {
                  path: '/call-socket/socket.io',
                  query: {
                    userId: currentAstrologerId,
                    role: 'broadcaster' // Important: Connect as broadcaster
                  },
                  transports: ['websocket']
                });

                socket.on('connect', () => {
                  console.log('📱 Astrologer socket connected:', socket.id);
                  
                  // Register with the channel
                  socket.emit('register', {
                    userId: currentAstrologerId,
                    channelId: call.roomName
                  });

                  // Emit broadcaster_joined event
                  socket.emit('broadcaster_joined', {
                    channelId: call.roomName,
                    userId: currentAstrologerId
                  }, (response: any) => {
                    console.log('📱 Broadcaster joined response:', response);
                    if (response && response.error) {
                      console.error('❌ Failed to join as broadcaster:', response);
                    } else {
                      console.log('✅ Astrologer successfully joined as broadcaster');
                    }
                  });
                });

                socket.on('connect_error', (error: any) => {
                  console.error('❌ Astrologer socket connection error:', error);
                });

                // Store socket reference for cleanup
                (window as any).astrologerSocket = socket;
              } catch (socketError) {
                console.warn('📱 Socket integration failed, using LiveKit directly:', socketError);
              }
              
              // Navigate to video call page with proper parameters
              const callUrl = `/astrologer-video-call?userId=${call.userId}&userName=${encodeURIComponent(call.userName)}&roomName=${encodeURIComponent(call.roomName)}&callType=${call.callType}`;
              console.log('📱 Navigating to:', callUrl);
              
              // Use router push for better error handling
              window.location.href = callUrl;
              
              if (onCallAccepted) {
                onCallAccepted(call);
              }
            } catch (navError) {
              console.error('📱 Navigation error:', navError);
              setError('Failed to navigate to call page');
            }
          } else {
            if (onCallRejected) {
              onCallRejected(call);
            }
          }
        } else {
          const errorText = await updateResponse.text();
          console.error('📱 Failed to update call status:', updateResponse.status, errorText);
          setError('Failed to respond to call');
        }
      } catch (apiError) {
        console.error('📱 API call failed:', apiError);
        setError('Network error while responding to call');
        
        // Fallback: Remove from pending list even if API call fails
        setPendingCalls(prev => prev.filter(c => c.callId !== call.callId));
        
        if (response === 'accepted') {
          // Try to navigate anyway for better user experience
          try {
            const fallbackUrl = `/astrologer-video-call?userId=${call.userId}&userName=${encodeURIComponent(call.userName)}&roomName=${encodeURIComponent(call.roomName)}&callType=${call.callType}`;
            console.log('📱 Using fallback navigation to:', fallbackUrl);
            window.location.href = fallbackUrl;
          } catch (fallbackError) {
            console.error('📱 Fallback navigation failed:', fallbackError);
          }
        }
      }
    } catch (error) {
      console.error('📱 Failed to respond to call:', error);
      setError('Unexpected error while responding to call');
    } finally {
      setResponding(null);
    }
  };

  // Register device token only once on mount
  useEffect(() => {
    let registered = false;
    const registerDeviceToken = async () => {
      if (registered) return;
      
      const currentAstrologerId = getAstrologerId();
      if (!currentAstrologerId) return;

      try {
        registered = true;
        // Generate a web device token (in production, use actual push notification service)
        const deviceToken = `web_${currentAstrologerId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const response = await fetch('/api/calling/call/call-token-livekit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`,
          },
          body: JSON.stringify({
            action: 'register_device_token',
            astrologerId: currentAstrologerId,
            deviceToken,
            platform: 'web'
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📱 Device token registered:', result);
        } else {
          console.error('📱 Failed to register device token:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('📱 Error registering device token:', error);
      }
    };

    registerDeviceToken();
  }, []); // Empty dependency array - only run once

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

  // Retry function
  const handleRetry = () => {
    setError(null);
    setLoading(true);
    fetchPendingCalls();
  };

  if (loading && pendingCalls.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900">Loading Notifications</h4>
            <p className="text-sm text-blue-700">
              Connecting to calling API for real-time notifications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-900">Notification Error</h4>
            <p className="text-sm text-red-700 mb-2">{error}</p>
            <button
              onClick={handleRetry}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
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
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">No Pending Calls</h4>
            <p className="text-sm text-gray-600 mb-1">
              You'll receive notifications when users request video calls
            </p>
            {lastUpdate && (
              <p className="text-xs text-gray-500">
                Last checked: {lastUpdate.toLocaleTimeString()}
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
        <div className="flex items-center gap-2 text-orange-600 font-semibold">
          <Bell className="w-5 h-5" />
          <span>Incoming Video Calls ({pendingCalls.length})</span>
        </div>
        {lastUpdate && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {pendingCalls.map((call) => (
        <div 
          key={call.callId} 
          className="bg-white border border-orange-200 rounded-lg p-4 shadow-sm animate-pulse"
          style={{ backgroundColor: '#FDF4E6' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900">{call.userName}</h4>
                <p className="text-sm text-gray-600">
                  Requesting {call.callType} consultation
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{getTimeElapsed(call.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => respondToCall(call, 'accepted')}
                disabled={responding === call.callId}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
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
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 