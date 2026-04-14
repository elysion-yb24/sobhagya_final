"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
    endCall,
    callType
}: {
    channelId: string,
    onCallEnd: (data?: CallEndData) => void,
    emitGetCallInfo: (channelId: string) => void,
    endCall: (message?: string, isFromNotification?: boolean) => void,
    callType?: 'call' | 'video'
}) => {
    useCallMonitor({ channelId, onCallEndProp: onCallEnd, emitGetCallInfo, endCall, callType });
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
    const [giftNotification, setGiftNotification] = useState<{ type: 'received' | 'request'; giftName?: string; fromName?: string; price?: number } | null>(null);
    const [dakshinaRequestModal, setDakshinaRequestModal] = useState<{ gift?: any; visible: boolean }>({ visible: false });

    const { endCall, sendGift, requestGift, emitGetCallInfo, gifts, fetchGifts } = useCallSocket(channelId, {
        onCallEnd: (data: CallEndData) => {
            console.log('[CallPage] Socket signaled call end:', data);
            closeCall();
        },
        onGiftReceived: (data: any) => {
            console.log('[CallPage] Gift received:', data);
            setGiftNotification({ type: 'received', giftName: data.giftName, fromName: data.fromName, price: data.price });
            setTimeout(() => setGiftNotification(null), 3500);
        },
        onGiftRequest: (data: any) => {
            console.log('[CallPage] Gift request received:', data);
            setDakshinaRequestModal({ gift: data.gift, visible: true });
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
        <div className="fixed inset-0 z-[100] overflow-hidden bg-black">
            {isDisconnecting && (
                <div className="absolute inset-0 z-[120] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-400/30 flex items-center justify-center mb-2">
                        <svg className="w-7 h-7 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.68 13.31a16 16 0 003.41 2.6l1.09-1.09a2 2 0 012.57-.45 11.3 11.3 0 004.58 1.01 2 2 0 012 2v3.39a2 2 0 01-2.18 2A19.72 19.72 0 013.07 2.18 2 2 0 015.07 0H8.5a2 2 0 012 2c0 1.58.33 3.12 1.01 4.58a2 2 0 01-.45 2.57L9.97 10.24" />
                            <line x1="23" y1="1" x2="1" y2="23" />
                        </svg>
                    </div>
                    <p className="text-base font-semibold text-white/90 tracking-tight">Ending call...</p>
                    <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                    </div>
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
                    callType={callType}
                />

                <div className="relative w-full mx-auto flex-1 h-full min-h-0">
                    {callType === 'video' ? (
                        <VideoCallView
                            onDisconnect={handleDisconnect}
                            receiverName={receiverName}
                            receiverAvatar={receiverAvatar}
                            callData={callData}
                            sendGift={sendGift}
                            receiverId={receiverId}
                            gifts={gifts}
                            fetchGifts={fetchGifts}
                        />
                    ) : (
                        <AudioCallView
                            onDisconnect={handleDisconnect}
                            receiverName={receiverName}
                            receiverId={receiverId}
                            receiverAvatar={receiverAvatar}
                            callData={callData}
                            sendGift={sendGift}
                            gifts={gifts}
                            fetchGifts={fetchGifts}
                        />
                    )}

                    {/* Gift Notification Overlay — for received gifts only */}
                    {giftNotification && giftNotification.type === 'received' && (
                        <div className="absolute top-4 inset-x-0 z-[60] flex justify-center pointer-events-none" style={{ animation: 'dksh-scaleIn 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
                            <div className="px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl border flex items-center gap-3 bg-gradient-to-r from-amber-500/90 to-orange-500/90 border-amber-300/40">
                                <span className="text-2xl">🙏</span>
                                <div>
                                    <p className="text-white text-sm font-bold">Dakshina Received!</p>
                                    <p className="text-white/80 text-xs">
                                        {`${giftNotification.fromName || 'User'} sent ${giftNotification.giftName || 'Dakshina'}${giftNotification.price ? ` (₹${giftNotification.price})` : ''}`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dakshina Request Modal — when astrologer requests dakshina */}
                    {dakshinaRequestModal.visible && (
                        <>
                            <div className="absolute inset-0 z-[70] bg-black/40 backdrop-blur-sm" onClick={() => setDakshinaRequestModal({ visible: false })} />
                            <div className="absolute inset-0 z-[71] flex items-center justify-center px-6" style={{ animation: 'dksh-scaleIn 0.35s cubic-bezier(0.16,1,0.3,1)' }}>
                                <div className="w-full max-w-sm bg-gradient-to-b from-[#2a1545] to-[#1a0e2e] rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                                    {/* Header */}
                                    <div className="px-6 pt-7 pb-4 text-center">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border-2 border-purple-400/30 mb-4">
                                            {dakshinaRequestModal.gift?.icon && (dakshinaRequestModal.gift.icon.startsWith('http') || dakshinaRequestModal.gift.icon.startsWith('//'))
                                                ? <img src={dakshinaRequestModal.gift.icon} alt="gift" className="w-9 h-9 object-contain" />
                                                : <svg className="w-8 h-8 text-purple-300" viewBox="0 0 48 48" fill="none"><path d="M24 40V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M24 16c0-4-4-8-6-10 0 4 2 7 6 10z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/><path d="M24 16c0-4 4-8 6-10 0 4-2 7-6 10z" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1"/><path d="M24 8V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="24" cy="18" r="1.5" fill="currentColor" opacity="0.4"/></svg>
                                            }
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-1">Dakshina Requested</h3>
                                        <p className="text-white/50 text-sm">
                                            {receiverName} has requested{' '}
                                            {dakshinaRequestModal.gift?.name
                                                ? <span className="text-amber-300">{dakshinaRequestModal.gift.name}</span>
                                                : <span className="text-amber-300">Dakshina</span>
                                            }
                                            {dakshinaRequestModal.gift?.price && (
                                                <span className="text-amber-300 font-semibold"> (₹{dakshinaRequestModal.gift.price})</span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="px-6 pb-7 flex gap-3">
                                        <button
                                            onClick={() => setDakshinaRequestModal({ visible: false })}
                                            className="flex-1 py-3.5 rounded-2xl bg-white/[0.06] border border-white/[0.08] text-white/60 text-sm font-semibold hover:bg-white/[0.1] transition-all active:scale-[0.97]"
                                        >
                                            Decline
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const gift = dakshinaRequestModal.gift;
                                                setDakshinaRequestModal({ visible: false });
                                                if (gift && receiverId) {
                                                    try {
                                                        await sendGift(gift, receiverId, receiverName);
                                                        setGiftNotification({ type: 'received', giftName: gift.name, price: gift.price, fromName: 'You' });
                                                        setTimeout(() => setGiftNotification(null), 3000);
                                                    } catch (err) {
                                                        console.log('[CallPage] Error sending requested dakshina:', err);
                                                    }
                                                }
                                            }}
                                            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 48 48" fill="none"><path d="M19 32l-1-10c0-2 1-4 3-5l3-2 3 2c2 1 3 3 3 5l-1 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 22v-4c0-1.5 1.5-3 3-3s3 1.5 3 3v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                                            Send{dakshinaRequestModal.gift?.price ? ` ₹${dakshinaRequestModal.gift.price}` : ''}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <RoomAudioRenderer />
            </LiveKitRoom>
        </div>
    );
}
