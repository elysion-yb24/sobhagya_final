import { useEffect, useRef, useState, useCallback } from 'react';
import { useRoomContext, useLocalParticipant, useRemoteParticipants } from '@livekit/components-react';
import { RoomEvent, ConnectionState, ConnectionQuality, Track } from 'livekit-client';
import { getUserDetails } from '../utils/auth-utils';

interface CallMonitorProps {
    channelId: string;
    emitGetCallInfo: (channelId: string) => void;
    endCall: (message?: string, isFromNotification?: boolean) => void;
    onCallEndProp: (data?: any) => void;
    callType?: 'call' | 'video';
}

export const useCallMonitor = ({ channelId, emitGetCallInfo, endCall, onCallEndProp, callType = 'video' }: CallMonitorProps) => {
    const room = useRoomContext();
    const { localParticipant } = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();

    const [isReconnecting, setIsReconnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCallEnded, setIsCallEnded] = useState(false);

    const userDetails = getUserDetails();
    const role = 'user'; // Sobhagya users are always 'user' role

    const onCallEnd = useCallback((data?: any) => {
        if (data?.status === 'completed') {
            setIsCallEnded(true);
        }
        onCallEndProp(data);
    }, [onCallEndProp]);

    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const participantTimerRef = useRef<NodeJS.Timeout | null>(null);

    const cleanup = useCallback(() => {
        console.log('[useCallMonitor] Running cleanup...');
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        if (participantTimerRef.current) clearTimeout(participantTimerRef.current);

        reconnectTimeoutRef.current = null;
        participantTimerRef.current = null;
    }, []);

    // Reactive participant check
    useEffect(() => {
        if (!room) return;

        // Filter for "Live" participants
        const liveParticipants = remoteParticipants.filter(p =>
            p.connectionQuality !== ConnectionQuality.Lost &&
            p.connectionQuality !== ConnectionQuality.Unknown
        );

        if (liveParticipants.length > 0) {
            if (participantTimerRef.current) {
                console.log('[useCallMonitor] Live remote participant found. Clearing timer.');
                clearTimeout(participantTimerRef.current);
                participantTimerRef.current = null;
            }
        } else if (room.state === ConnectionState.Connected) {
            // Start 50s timer only if no live participants
            if (!participantTimerRef.current) {
                console.log('[useCallMonitor] No live participants detected. Starting 50s wait.');
                participantTimerRef.current = setTimeout(() => {
                    const stillNoLive = room.remoteParticipants.size === 0 ||
                        Array.from(room.remoteParticipants.values()).every(p => p.connectionQuality === ConnectionQuality.Lost);

                    if (stillNoLive && room.state === ConnectionState.Connected) {
                        console.log('[useCallMonitor] No live remote participants for 50s. Ending call.');
                        const message = "Astrologer Network Disconnected";
                        endCall(message, false);
                        onCallEnd({ reason: message, status: 'completed' });
                        cleanup();
                    }
                }, 50000);
            }
        }
    }, [remoteParticipants, room?.state, role, endCall, onCallEnd, cleanup, room]);

    useEffect(() => {
        if (!room) return;

        const handleConnected = async () => {
            console.log('[useCallMonitor] Connected');
            setIsReconnecting(false);
            setError(null);

            // Enable microphone (always) and camera (video calls only)
            try {
                await localParticipant.setMicrophoneEnabled(true);
                if (callType === 'video') {
                    console.log('[useCallMonitor] Enabling camera for video call...');
                    await localParticipant.setCameraEnabled(true);

                    // Verify camera track is published, retry if not
                    setTimeout(async () => {
                        try {
                            if (!localParticipant.isCameraEnabled) {
                                console.log('[useCallMonitor] Camera not enabled after initial attempt, retrying...');
                                await localParticipant.setCameraEnabled(true);
                            }
                            // Check if camera track exists and is published
                            const camPub = localParticipant.getTrackPublication(Track.Source.Camera);
                            console.log('[useCallMonitor] Camera track status:', {
                                enabled: localParticipant.isCameraEnabled,
                                hasPublication: !!camPub,
                                isMuted: camPub?.isMuted,
                                trackExists: !!camPub?.track,
                            });
                        } catch (retryErr) {
                            console.log('[useCallMonitor] Camera retry failed:', retryErr);
                        }
                    }, 2000);
                }
            } catch (err) {
                console.log('[useCallMonitor] Failed to enable devices:', err);
                // Retry camera after a delay on failure
                if (callType === 'video') {
                    setTimeout(async () => {
                        try {
                            console.log('[useCallMonitor] Retrying camera enable after failure...');
                            await localParticipant.setCameraEnabled(true);
                        } catch (retryErr) {
                            console.log('[useCallMonitor] Camera retry also failed:', retryErr);
                        }
                    }, 3000);
                }
            }

            // Immediate call get_call info on connect
            emitGetCallInfo(channelId);
        };

        const handleReconnecting = () => {
            console.log('[useCallMonitor] Reconnecting...');
            setIsReconnecting(true);

            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(() => {
                if (room.state === ConnectionState.Reconnecting || room.state === ConnectionState.Disconnected) {
                    console.log('[useCallMonitor] Local reconnection failed after 15s. Ending call.');
                    const message = `User's Reconnection failed`;
                    endCall(message, false);
                    onCallEnd({ reason: message, status: 'completed' });
                    cleanup();
                }
            }, 15000);
        };

        const handleReconnected = () => {
            console.log('[useCallMonitor] Reconnected');
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            setIsReconnecting(false);
            emitGetCallInfo(channelId);
        };

        const handleDisconnected = (reason?: any) => {
            console.log('[useCallMonitor] Fatal Disconnected:', reason);
            cleanup();
        };

        room.on(RoomEvent.Connected, handleConnected);
        room.on(RoomEvent.Disconnected, handleDisconnected);
        room.on(RoomEvent.Reconnecting, handleReconnecting);
        room.on(RoomEvent.Reconnected, handleReconnected);

        // If room is already connected when this effect runs, fire handler immediately
        if (room.state === ConnectionState.Connected) {
            console.log('[useCallMonitor] Room already connected, enabling devices...');
            handleConnected();
        }

        return () => {
            room.off(RoomEvent.Connected, handleConnected);
            room.off(RoomEvent.Disconnected, handleDisconnected);
            room.off(RoomEvent.Reconnecting, handleReconnecting);
            room.off(RoomEvent.Reconnected, handleReconnected);
            cleanup();
        };
    }, [room, localParticipant, channelId, emitGetCallInfo, endCall, cleanup, role, onCallEnd, isCallEnded]);

    return { isReconnecting, error, isCallEnded };
};
