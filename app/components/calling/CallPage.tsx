"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import "@livekit/components-styles";
import {
    LiveKitRoom,
    RoomAudioRenderer,
} from "@livekit/components-react";
import { useCallSocket } from '../../hooks/useCallSocket';
import VideoCallView from './views/VideoCallView';
import AudioCallView from './views/AudioCallView';
import { useCallMonitor } from '../../hooks/useCallMonitor';

export interface CallData {
    balance: string;
    rpm: string;
    startTime: string;
    userJoinTime?: string;
}

export interface CallPageProps {
    token: string;
    serverUrl: string;
    receiverName: string;
    channelId: string;
    receiverId: string;
    onDisconnect?: () => void;
    callType?: 'call' | 'video';
    receiverAvatar?: string;
    initialRpm?: string;
    initialBalance?: string;
}

export interface CallEndData {
    reason?: string;
    status?: string;
    [key: string]: any;
}

const CallMonitor = ({
    channelId,
    onCallEnd,
    emitGetCallInfo,
    endCall
}: {
    channelId: string,
    onCallEnd: (data?: CallEndData) => void,
    emitGetCallInfo: (channelId: string) => void,
    endCall: (message?: string, isFromNotification?: boolean) => void
}) => {
    useCallMonitor({ channelId, onCallEndProp: onCallEnd, emitGetCallInfo, endCall });
    return null;
};

export default function CallPage({ token, serverUrl, receiverName, channelId, receiverId, onDisconnect, callType = 'video', receiverAvatar, initialRpm, initialBalance }: CallPageProps) {
    const [connect, setConnect] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [callData, setCallData] = useState<CallData>({
        balance: initialBalance || '0',
        rpm: initialRpm || '0',
        startTime: '',
    });
    const router = useRouter();
    const hasNavigatedAwayRef = React.useRef(false);
    const hasSentEndCallRef = React.useRef(false);

    const exitRoute = "/astrologers";

    const closeCall = React.useCallback(() => {
        if (hasNavigatedAwayRef.current) {
            return;
        }

        hasNavigatedAwayRef.current = true;
        setIsDisconnecting(true);
        setConnect(false);
        console.log('[CallPage] Cleaning up and navigating away.');

        if (onDisconnect) {
            onDisconnect();
        } else {
            router.replace(exitRoute);
        }
    }, [onDisconnect, router, exitRoute]);

    // Initialize the socket connection for this page
    const { endCall, sendGift, requestGift, emitGetCallInfo } = useCallSocket(channelId, {
        onCallEnd: (data: CallEndData) => {
            console.log('[CallPage] Socket signaled call end:', data);
            closeCall();
        },
        onGiftRequest: (data: any) => {
            console.log('[CallPage] Gift request received:', data);
        },
        onCallDataUpdate: (data: any) => {
            console.log('[CallPage] Call data update received:', data);
            setCallData(prev => ({
                ...prev,
                balance: data.balance ?? prev.balance,
                rpm: data.rpm ?? prev.rpm,
                startTime: data.startTime ?? prev.startTime,
                userJoinTime: data.userJoinTime ?? prev.userJoinTime,
            }));
        }
    });

    const emitEndCallOnce = React.useCallback((reason: string, isFromNotification = false) => {
        if (hasSentEndCallRef.current) {
            return;
        }

        hasSentEndCallRef.current = true;
        endCall(reason, isFromNotification);
    }, [endCall]);

    const handleDisconnect = React.useCallback((reason?: string | CallEndData | any) => {
        let reasonStr = 'USER_HUNG_UP';

        if (typeof reason === 'string') {
            reasonStr = reason;
        } else if (reason && typeof reason === 'object' && 'reason' in reason) {
            reasonStr = (reason as CallEndData).reason || 'USER_HUNG_UP';
        }

        console.log('[CallPage] handleDisconnect called. Reason:', reasonStr);
        emitEndCallOnce(reasonStr);
        closeCall();
    }, [emitEndCallOnce, closeCall]);

    React.useEffect(() => {
        if (token) {
            setConnect(true);
        }
    }, [token]);

    React.useEffect(() => {
        router.prefetch(exitRoute);
    }, [router, exitRoute]);


    return (
        <div className="relative w-full h-[100dvh] p-0 xl:p-2 overflow-hidden bg-black xl:bg-[#fdfcfb]">
            {isDisconnecting && (
                <div className="absolute inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center">
                    <p className="text-sm font-medium text-white">Ending call...</p>
                </div>
            )}

            <LiveKitRoom
                video={callType === 'video'}
                audio={true}
                token={token}
                serverUrl={serverUrl}
                style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', zIndex: 10 }}
                connect={connect}
            >
                <CallMonitor
                    channelId={channelId}
                    emitGetCallInfo={emitGetCallInfo}
                    endCall={endCall}
                    onCallEnd={() => closeCall()}
                />

                <div className="relative w-full mx-auto flex-1 h-full min-h-0">
                    {callType === 'video' ? (
                        <VideoCallView
                            onDisconnect={handleDisconnect}
                            receiverName={receiverName}
                            receiverAvatar={receiverAvatar}
                            callData={callData}
                        />
                    ) : (
                        <AudioCallView
                            onDisconnect={handleDisconnect}
                            receiverName={receiverName}
                            receiverId={receiverId}
                            receiverAvatar={receiverAvatar}
                            callData={callData}
                        />
                    )}
                </div>

                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
}
