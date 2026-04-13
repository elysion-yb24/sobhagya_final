import { useEffect, useRef, useCallback, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { getUserDetails } from '../utils/auth-utils';
import { socketManager } from '../utils/socket';

/**
 * useCallSocket — Reuses the existing SocketManager singleton in Sobhagya.
 * This keeps a single shared socket instance across components/pages.
 */
export const useCallSocket = (
    channelId: string,
    callbacks?: {
        onCallEnd?: (data: any) => void;
        onGiftRequest?: (data: any) => void;
        onCallDataUpdate?: (data: any) => void;
    }
) => {
    const socketRef = useRef<Socket | null>(null);

    const userDetails = getUserDetails();
    const userId = userDetails?.id || userDetails?._id;
    const userName = userDetails?.name;

    const callbacksRef = useRef(callbacks);
    useEffect(() => {
        callbacksRef.current = callbacks;
    }, [callbacks]);

    const sendGift = useCallback(async (gift: any, receiverId: string, receiverName: string) => {
        const itemSendId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const payload = {
            channelId,
            giftId: gift._id,
            from: userId,
            fromName: userName || 'Unknown',
            to: receiverName,
            giftName: gift.name,
            giftIcon: gift.icon,
            toName: receiverName,
            itemSendId,
        };

        try {
            if (socketManager && socketManager.isSocketConnected()) {
                await socketManager.sendGift(payload as any);
            } else if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('send_gift', payload, (response: any) => {
                    console.log('[useCallSocket] Send gift callback response:', response);
                });
            } else {
                console.log('[useCallSocket] Socket not connected, cannot send gift');
            }
        } catch (err) {
            console.log('[useCallSocket] sendGift error:', err);
        }
    }, [channelId, userId, userName]);

    const requestGift = useCallback(async (giftId: string) => {
        try {
            if (socketManager && socketManager.isSocketConnected()) {
                await socketManager.requestGift(channelId, giftId);
            } else if (socketRef.current && socketRef.current.connected) {
                socketRef.current.emit('request_gift', { channelId, giftId }, (response: any) => {
                    console.log('[useCallSocket] Request gift callback response:', response);
                });
            } else {
                console.log('[useCallSocket] Socket not connected, cannot request gift');
            }
        } catch (err) {
            console.log('[useCallSocket] requestGift error:', err);
        }
    }, [channelId]);

    const emitGetCallInfo = useCallback((channelId: string) => {
        const emitFunction = () => {
            const s = socketRef.current ?? socketManager.getSocket();
            if (s && s.connected) {
                console.log('[useCallSocket] Emitting get_call event...', { channelId });
                s.emit('get_call', { channelId }, (response: any) => {
                    console.log('[useCallSocket] Get call ACK response:', response);
                    const callInfo = response?.data ?? response;
                    if (callInfo && typeof callInfo === 'object' && callInfo.startTime) {
                        callbacksRef.current?.onCallDataUpdate?.(callInfo);
                    }
                    const callStatus = response?.status ?? callInfo?.status;
                    if (callStatus === 'completed') {
                        if (callbacksRef.current?.onCallEnd) {
                            callbacksRef.current.onCallEnd({ reason: 'CALL_COMPLETED_FROM_BACKEND', status: 'completed' });
                        }
                    }
                });
            }
        };

        const s = socketRef.current ?? socketManager.getSocket();
        if (s && s.connected) {
            emitFunction();
        } else {
            (async () => {
                try {
                    if (!socketManager.isSocketConnected() || socketManager.getChannelId() !== channelId) {
                        await socketManager.connect(channelId);
                    }
                    socketRef.current = socketManager.getSocket();
                    emitFunction();
                } catch (err) {
                    console.log('[useCallSocket] emitGetCallInfo failed', err);
                }
            })();
        }
    }, []);

    const endCall = useCallback(
        async (message: string = 'USER_HUNG_UP', isFromNotification: boolean = false) => {
            try {
                if (!channelId || !userId) {
                    console.log('[useCallSocket] Missing channelId or userId');
                    return;
                }

                const payload = {
                    channelId,
                    userId,
                    reason: message || 'NO_REASON_GOT_FROM_FRONTEND',
                    isFromNotification,
                };

                if (socketManager && socketManager.isSocketConnected()) {
                    await socketManager.endCall(channelId, message);
                } else if (socketRef.current && socketRef.current.connected) {
                    socketRef.current.emit('end_call', payload, (response: any) => {
                        console.log('[useCallSocket] End call callback response:', response);
                    });
                } else {
                    console.log('[useCallSocket] Socket not connected, skipping end call');
                }
            } catch (error) {
                console.log('[useCallSocket] Error while ending call:', error);
            }
        },
        [channelId, userId]
    );

    useEffect(() => {
        if (!userId || !channelId) {
            console.log('[useCallSocket] Skipping socket connection: missing userId or channelId');
            return;
        }

        let socket: Socket | null = null;
        let didCancel = false;

        const handleConnect = () => {
            console.log('[useCallSocket] Socket connected:', socket?.id);
            // Register user on connect/reconnect and capture call data
            if (userId && channelId) {
                socket?.emit('register', { userId, channelId }, (response: any) => {
                    console.log('[useCallSocket] Register response:', response);
                    if (response?.data) {
                        callbacksRef.current?.onCallDataUpdate?.(response.data);
                    }
                });
            }
        };

        const handleCallEnd = (data: any) => {
            console.log('[useCallSocket] Received call_end:', data);
            if (callbacksRef.current?.onCallEnd) {
                callbacksRef.current.onCallEnd(data);
            }
        };

        const handleReceiveGift = (data: any) => {
            console.log('[useCallSocket] Received receive_gift:', data);
        };

        const handleGiftRequest = (data: any) => {
            console.log('[useCallSocket] Received gift_request:', data);
            if (callbacksRef.current?.onGiftRequest) {
                callbacksRef.current.onGiftRequest(data);
            }
        };

        const handleConnectError = (error: any) => {
            console.log('[useCallSocket] Socket connection error:', error);
        };

        const handleDisconnect = (reason: string) => {
            console.log('[useCallSocket] Socket disconnected:', reason);
        };

        (async () => {
            try {
                if (!socketManager.isSocketConnected() || socketManager.getChannelId() !== channelId) {
                    await socketManager.connect(channelId);
                }

                if (didCancel) return;

                socket = socketManager.getSocket();
                socketRef.current = socket;

                socket?.on('connect', handleConnect);
                socket?.on('call_end', handleCallEnd);
                socket?.on('receive_gift', handleReceiveGift);
                socket?.on('gift_request', handleGiftRequest);
                socket?.on('connect_error', handleConnectError);
                socket?.on('disconnect', handleDisconnect);

                if (socket?.connected) handleConnect();
            } catch (err) {
                console.log('[useCallSocket] Error initializing socket:', err);
            }
        })();

        return () => {
            didCancel = true;
            if (socket) {
                socket.off('connect', handleConnect);
                socket.off('call_end', handleCallEnd);
                socket.off('receive_gift', handleReceiveGift);
                socket.off('gift_request', handleGiftRequest);
                socket.off('connect_error', handleConnectError);
                socket.off('disconnect', handleDisconnect);
            }
            socketRef.current = null;
        };
    }, [userId, channelId]);

    return useMemo(() => ({
        socket: socketRef.current,
        endCall,
        sendGift,
        requestGift,
        emitGetCallInfo,
    }), [endCall, sendGift, requestGift, emitGetCallInfo]);
};
