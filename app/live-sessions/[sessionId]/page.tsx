'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useLiveSocket, ChatMessage, QueueItem } from '../../hooks/useLiveSocket';
import { isAuthenticated, getUserDetails, getAuthToken } from '../../utils/auth-utils';
import { getApiBaseUrl } from '../../config/api';
import { fetchWalletBalance as simpleFetchWalletBalance } from '../../utils/production-api';
import GiftConfirmationDialog from '../../components/ui/GiftConfirmationDialog';
import {
  ArrowLeft, Send, Heart, Lock, Globe, X,
  MessageCircle, List, Phone, Loader2, AlertCircle, Eye, Gift,
  Share2, Wallet, Mic, MicOff, PhoneOff
} from 'lucide-react';
import Link from 'next/link';
import { LiveKitRoom, VideoTrack, useTracks, RoomAudioRenderer } from '@livekit/components-react';
import { Track } from 'livekit-client';

/* ────────────────────────────────────────────────────────────────────── */
/*  Types                                                                */
/* ────────────────────────────────────────────────────────────────────── */
interface GiftItem {
  _id: string;
  name: string;
  icon: string;
  price: number;
  description?: string;
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Floating Hearts                                                      */
/* ────────────────────────────────────────────────────────────────────── */
function FloatingHearts({ count }: { count: number }) {
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);

  useEffect(() => {
    if (count <= 0) return;
    const h = { id: Date.now() + Math.random(), x: Math.random() * 36 - 18 };
    setHearts(prev => [...prev.slice(-8), h]);
  }, [count]);

  return (
    <div className="absolute bottom-0 right-0 w-16 h-44 pointer-events-none overflow-hidden">
      {hearts.map(h => (
        <div key={h.id} className="absolute bottom-0 animate-float-heart" style={{ right: `${8 + h.x}px` }}>
          <Heart className="w-5 h-5 text-red-500 fill-red-500 drop-shadow-lg" />
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Gift Toast                                                           */
/* ────────────────────────────────────────────────────────────────────── */
function GiftToast({ gift, senderName, onDone }: { gift: GiftItem; senderName: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);

  return (
    <div className="animate-slide-in-left flex items-center gap-3 bg-white/95 backdrop-blur-xl rounded-2xl pl-2 pr-5 py-2.5 border border-orange-200 shadow-2xl">
      <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 p-1">
        <img src={gift.icon} alt={gift.name} className="w-full h-full object-contain" />
      </div>
      <div>
        <p className="text-gray-900 text-xs font-extrabold">{senderName}</p>
        <p className="text-orange-600 text-[11px] font-bold">offered {gift.name} <span className="text-gray-400">&#8226; ₹{gift.price}</span></p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Broadcaster Video                                                    */
/* ────────────────────────────────────────────────────────────────────── */
function BroadcasterVideo({ broadcasterName, broadcasterAvatar }: { broadcasterName: string; broadcasterAvatar: string }) {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: true });
  const videoTrack = tracks.find(t => t.publication?.kind === 'video');

  if (!videoTrack) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 via-white to-amber-50/40">
        <div className="relative">
          {broadcasterAvatar ? (
            <img src={broadcasterAvatar} alt={broadcasterName} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-orange-200/60 shadow-2xl" />
          ) : (
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center border-4 border-white shadow-2xl">
              <span className="text-5xl sm:text-6xl font-bold text-white">{broadcasterName?.charAt(0)?.toUpperCase()}</span>
            </div>
          )}
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full border-2 border-orange-300/40 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
        <p className="text-orange-400 text-sm mt-6 font-semibold animate-pulse tracking-wide">Connecting to stream...</p>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black">
      <VideoTrack trackRef={videoTrack} className="w-full h-full object-cover" />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Call Timer helper                                                    */
/* ────────────────────────────────────────────────────────────────────── */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Main Page                                                            */
/* ────────────────────────────────────────────────────────────────────── */
export default function LiveSessionViewPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params?.sessionId as string;

  const {
    isConnected, joinSession, leaveSession, fetchSessionToken,
    getChats, sendChat, joinQueue, leaveQueue, getQueue,
    getActiveCall, addLike, getLikes, joinRoomParticipant, endCall,
    onChatUpdate, onViewerUpdate, onViewerLeft, onSessionEnded,
    onCallStarted, onCallEnd, onQueueJoined, onLikeUpdate, onGiftReceived, emitSendGift,
  } = useLiveSocket();

  /* ── core state ── */
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── livekit ── */
  const [livekitToken, setLivekitToken] = useState<string | null>(null);
  const [livekitUrl, setLivekitUrl] = useState<string | null>(null);

  /* ── chat ── */
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* ── queue ── */
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [inQueue, setInQueue] = useState(false);
  const [queueType, setQueueType] = useState<'private' | 'public' | null>(null);
  const [joiningQueue, setJoiningQueue] = useState(false);
  const [leavingQueue, setLeavingQueue] = useState(false);

  /* ── active call ── */
  const [activeCall, setActiveCall] = useState<any>(null);

  /* ── ui ── */
  const [viewers, setViewers] = useState(0);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeAnimCount, setLikeAnimCount] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showCallTypeModal, setShowCallTypeModal] = useState(false);
  const [showQueuePanel, setShowQueuePanel] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(true);

  /* ── dakshina ── */
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [showGiftConfirm, setShowGiftConfirm] = useState(false);
  const [isSendingGift, setIsSendingGift] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [giftToast, setGiftToast] = useState<{ gift: GiftItem; senderName: string } | null>(null);

  /* ── call invite & in-call state ── */
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteCallType, setInviteCallType] = useState<'private' | 'public'>('public');
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [callToken, setCallToken] = useState<string | null>(null);
  const [callWsUrl, setCallWsUrl] = useState<string | null>(null);
  const [callChannelId, setCallChannelId] = useState<string | null>(null);
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [callBalance, setCallBalance] = useState(0);
  const [callSessionTime, setCallSessionTime] = useState(0);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ════════════════════════════════════════════════════════════════════ */
  /*  Data fetchers                                                      */
  /* ════════════════════════════════════════════════════════════════════ */
  const fetchGifts = useCallback(async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${getApiBaseUrl()}/calling/api/gift/get-gifts`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) { const d = await res.json(); setGifts(d.data || []); }
    } catch (err) { console.error('Error fetching gifts:', err); }
  }, []);

  const fetchBalance = useCallback(async () => {
    try {
      if (!getAuthToken()) return;
      const b = await simpleFetchWalletBalance();
      setWalletBalance(b);
    } catch (err) { console.error('Error fetching wallet:', err); }
  }, []);

  /* ════════════════════════════════════════════════════════════════════ */
  /*  Gift handling                                                      */
  /* ════════════════════════════════════════════════════════════════════ */
  const handleSendGift = async (gift: GiftItem) => {
    setIsSendingGift(true);
    try {
      const token = getAuthToken();
      const ud = getUserDetails();
      if (!token || !ud?.id) throw new Error('Authentication required');
      const res = await fetch(`${getApiBaseUrl()}/calling/api/gift/send-gift`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: gift._id, receiverUserId: sessionData?.broadcasterId, giftId: gift._id, amount: gift.price }),
        credentials: 'include',
      });
      if (!res.ok) {
        let msg = 'Failed to send gift';
        try { const d = await res.json(); msg = d.message || d.error || msg; } catch {}
        throw new Error(msg);
      }
      
      // Emit real-time effect
      emitSendGift(sessionId, gift, sessionData?.broadcasterName || 'Astrologer');

      setWalletBalance(prev => prev - gift.price);
      setGiftToast({ gift, senderName: 'You' });
    } catch (err: any) {
      console.error('Error sending gift:', err);
      alert(err?.message || 'Failed to send gift');
    } finally { setIsSendingGift(false); }
  };

  /* ════════════════════════════════════════════════════════════════════ */
  /*  Call invite detection & handlers                                    */
  /* ════════════════════════════════════════════════════════════════════ */
  const handleAcceptInvite = useCallback(async (callType: 'private' | 'public') => {
    if (isJoiningCall || isInCall) return;
    setIsJoiningCall(true);
    try {
      const isPrivateAudio = callType === 'private';
      const rate = isPrivateAudio ? (sessionData?.privateAudioRpm || 5) : (sessionData?.publicAudioRpm || 11);

      const resp = await joinRoomParticipant(sessionId, rate, isPrivateAudio);

      if (resp?.error) {
        const msg = resp?.data?.message === 'LOW_BALANCE'
          ? 'Insufficient balance. Please recharge your wallet.'
          : 'Failed to join call. Please try again.';
        alert(msg);
        setIsJoiningCall(false);
        return;
      }

      const newToken = resp?.data?.token || resp?.data?.livekitToken || resp?.data?.currentSessionToken || resp?.data?.joinToken || resp?.data;
      if (newToken && typeof newToken === 'string') {
        setCallToken(newToken);
        setCallWsUrl(resp.data?.livekitSocketURL || livekitUrl);
        setCallBalance(resp.data?.balance || 0);
        setCallSessionTime(resp.data?.sessionTime || 0);
      } else {
        alert('Failed to get valid token for audio call.');
        setIsJoiningCall(false);
        return;
      }

      setIsInCall(true);
      setInQueue(false);
      setCallTimer(0);

      // Start call timer
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      callTimerRef.current = setInterval(() => {
        setCallTimer(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accepting invite:', err);
      alert('Failed to join call.');
    } finally {
      setIsJoiningCall(false);
    }
  }, [isJoiningCall, isInCall, sessionData, sessionId, livekitUrl, joinRoomParticipant]);

  useEffect(() => {
    if (isInCall) return;
    const ud = getUserDetails();
    if (!ud) return;
    const myId = String(ud.id || ud._id || ud.userId);
    
    // Check queue
    const mineInQueue = Array.isArray(queue) ? queue.find(q => 
       String(q.userId) === myId && ['notified', 'started', 'accepted', 'active', 'connecting'].includes(q.status)
    ) : null;
    
    // Check activeCall
    let amIActive = false;
    const ac = Array.isArray(activeCall) ? activeCall : [activeCall].filter(Boolean);
    for (const c of ac) {
      if (String(c?.userId) === myId || String(c?.user?._id) === myId || String(c?.callerId) === myId) {
        amIActive = true;
        break;
      }
    }
    
    // Auto-join if qualifies
    const qualifies = mineInQueue || amIActive;
    if (qualifies && !isInCall && !isJoiningCall) {
      const isPrivate = mineInQueue ? mineInQueue.isPrivate : (ac.find(c => String(c?.userId) === myId || String(c?.callerId) === myId)?.isPrivate || false);
      const cType = isPrivate ? 'private' : 'public';
      setInviteCallType(cType);
      handleAcceptInvite(cType);
    }
  }, [queue, activeCall, isInCall, isJoiningCall, handleAcceptInvite]);
  const handleEndCall = async () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (callChannelId) {
      await endCall(sessionId, callChannelId);
    }
    setIsInCall(false);
    setCallToken(null);
    setCallWsUrl(null);
    setCallChannelId(null);
    setCallTimer(0);
    setIsMuted(false);
    setInQueue(false);
    setQueueType(null);
    
    // Refresh queue & active call
    const q = await getQueue(sessionId);
    setQueue(Array.isArray(q) ? q : []);
    const ac = await getActiveCall(sessionId);
    setActiveCall(ac);
    fetchBalance();
  };

  // cleanup timer on unmount
  useEffect(() => {
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, []);

  /* ════════════════════════════════════════════════════════════════════ */
  /*  Session init                                                       */
  /* ════════════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!isConnected || !sessionId) return;

    const init = async () => {
      setLoading(true);
      try {
        const resp = await joinSession(sessionId);
        if (resp?.error) {
          setError(resp.status === 'ended' ? 'This session has ended.' : 'Session not found or has ended.');
          setLoading(false);
          return;
        }
        if (resp?.data) {
          setSessionData(resp.data);
          if (resp.data.maxViewers) setViewers(Number(resp.data.maxViewers) || 0);
        }

        const tokenResp = await fetchSessionToken(sessionId);
        if (tokenResp && !tokenResp.error && tokenResp.data) {
          setLivekitToken(tokenResp.data.currentSessionToken);
          setLivekitUrl(tokenResp.data.livekitSocketURL);
        }

        const [chatData, queueData, activeCallData, likesData] = await Promise.all([
          getChats(sessionId), getQueue(sessionId), getActiveCall(sessionId), getLikes(sessionId),
        ]);

        setChats(chatData);
        if (Array.isArray(queueData)) {
          setQueue(queueData);
          const ud = getUserDetails();
          const uid = String(ud?.id || ud?._id || ud?.userId);
          const mine = queueData.find((q: QueueItem) => String(q.userId) === uid && q.status !== 'completed');
          if (mine) { setInQueue(true); setQueueType(mine.isPrivate ? 'private' : 'public'); }
        }
        if (activeCallData) setActiveCall(activeCallData);
        if (likesData?.data) {
          setLikes(likesData.data.totalLikes || 0);
          setIsLiked(likesData.data.isLikedByUser || false);
        }
        fetchGifts();
        fetchBalance();
      } catch (err) {
        console.error('[LiveSession] Init error:', err);
        setError('Failed to join session.');
      } finally { setLoading(false); }
    };

    init();
    return () => { leaveSession(sessionId); };
  }, [isConnected, sessionId]);

  /* ── real-time listeners ── */
  useEffect(() => {
    if (!isConnected) return;
    const unsubs = [
      onChatUpdate((msg: ChatMessage) => setChats(prev => [...prev, msg])),
      onViewerUpdate((d: any) => { if (d.viewers !== undefined) setViewers(Number(d.viewers)); }),
      onViewerLeft(() => {}),
      onSessionEnded(() => setSessionEnded(true)),
      onCallStarted((d: any) => {
        setActiveCall(d.sessionCall || d);
        // Store channelId if this call involves us
        const ud = getUserDetails();
        const myId = String(ud?.id || ud?._id || ud?.userId);
        const callData = d.sessionCall || d;
        if (callData && (String(callData.userId) === myId || String(callData.callerId) === myId || String(callData.user?._id) === myId)) {
          setCallChannelId(callData.channelId || null);
        }
      }),
      onCallEnd(() => {
        setActiveCall(null);
        // If we were in an active call from our perspective, terminate.
        if (isInCall) {
          if (callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null; }
          setIsInCall(false);
          setCallToken(null);
          setCallWsUrl(null);
          setCallChannelId(null);
          setCallTimer(0);
          setIsMuted(false);
          setInQueue(false);
          setQueueType(null);
          fetchBalance();
        }
        getQueue(sessionId).then(q => setQueue(Array.isArray(q) ? q : []));
      }),
      onQueueJoined((d: any) => { if (d.data) setQueue(Array.isArray(d.data) ? d.data : []); }),
      onLikeUpdate((d: any) => { if (d.data?.totalLikes !== undefined) setLikes(d.data.totalLikes); }),
      onGiftReceived((d: any) => { if (d?.gift) setGiftToast({ gift: d.gift, senderName: d.fromName || 'Someone' }); }),
    ];
    return () => unsubs.forEach(u => { if (typeof u === 'function') u(); });
  }, [isConnected, sessionId, isInCall]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chats]);

  /* ════════════════════════════════════════════════════════════════════ */
  /*  Chat / Like / Queue handlers                                       */
  /* ════════════════════════════════════════════════════════════════════ */
  const handleSendChat = async () => {
    if (!chatInput.trim() || sendingChat) return;
    if (!isAuthenticated()) { alert('Please login to chat.'); return; }
    setSendingChat(true);
    const msg = chatInput.trim();
    setChatInput('');
    const result = await sendChat(sessionId, msg);
    if (result) setChats(prev => [...prev, result]);
    setSendingChat(false);
  };

  const handleLike = async () => {
    if (!isAuthenticated()) return;
    setIsLiked(true);
    setLikeAnimCount(prev => prev + 1);
    const resp = await addLike(sessionId);
    if (resp?.data) setLikes(resp.data.totalLikes || likes + 1);
  };

  const handleJoinQueue = async (isPrivate: boolean) => {
    if (!isAuthenticated()) { alert('Please login to request a call.'); return; }
    setJoiningQueue(true);
    setShowCallTypeModal(false);
    const resp = await joinQueue(sessionId, isPrivate);
    if (resp?.error) {
      alert(resp.message === 'LOW_BALANCE' ? 'Insufficient balance. Please recharge your wallet.' : resp.message || 'Failed to join queue.');
    } else {
      setInQueue(true);
      setQueueType(isPrivate ? 'private' : 'public');
      if (resp.data) setQueue(Array.isArray(resp.data) ? resp.data : []);
    }
    setJoiningQueue(false);
  };

  const handleLeaveQueue = async () => {
    setLeavingQueue(true);
    await leaveQueue(sessionId);
    setInQueue(false);
    setQueueType(null);
    const q = await getQueue(sessionId);
    setQueue(Array.isArray(q) ? q : []);
    setLeavingQueue(false);
  };

  /* ════════════════════════════════════════════════════════════════════ */
  /*  LOADING                                                            */
  /* ════════════════════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-orange-200 rounded-full" />
            <div className="absolute inset-0 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="mt-5 text-orange-400 text-sm font-semibold animate-pulse">Joining live session...</p>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════ */
  /*  ERROR / ENDED                                                      */
  /* ════════════════════════════════════════════════════════════════════ */
  if (error || sessionEnded) {
    return (
      <div className="fixed inset-0 z-[200] bg-gradient-to-b from-orange-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6 border border-orange-200">
            <AlertCircle className="w-10 h-10 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {sessionEnded ? 'Session Has Ended' : 'Session Not Available'}
          </h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            {sessionEnded ? 'Thank you for watching. May your path be illuminated.' : error}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/live-sessions" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-full font-bold text-sm shadow-lg shadow-orange-200 active:scale-95 transition-all">
              Browse Live
            </Link>
            <Link href="/call-with-astrologer" className="bg-white border border-orange-200 text-orange-600 px-6 py-3 rounded-full font-bold text-sm hover:bg-orange-50 transition-all">
              Astrologers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════ */
  /*  MAIN RENDER                                                        */
  /* ════════════════════════════════════════════════════════════════════ */
  const broadcasterName = sessionData?.broadcasterName || 'Astrologer';
  const broadcasterAvatar = sessionData?.broadcasterProfilePicture || '';
  const privateRpm = sessionData?.privateAudioRpm;
  const publicRpm = sessionData?.publicAudioRpm;
  const activeQueueCount = queue.filter(q => q.status !== 'completed').length;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">

      {/* ═══════ FULL-SCREEN VIDEO & AUDIO ═══════ */}
      <div className="absolute inset-0">
        {livekitToken && livekitUrl ? (
          <LiveKitRoom 
            serverUrl={isInCall && callWsUrl ? callWsUrl : livekitUrl} 
            token={isInCall && callToken ? callToken : livekitToken} 
            connect={true} 
            audio={isInCall ? !isMuted : false} 
            video={false}
          >
            <BroadcasterVideo broadcasterName={broadcasterName} broadcasterAvatar={broadcasterAvatar} />
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 via-white to-amber-50/40">
            {broadcasterAvatar ? (
              <img src={broadcasterAvatar} alt={broadcasterName} className="w-32 h-32 rounded-full object-cover border-4 border-orange-200/60 shadow-2xl" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center border-4 border-white shadow-2xl">
                <span className="text-5xl font-bold text-white">{broadcasterName?.charAt(0)?.toUpperCase()}</span>
              </div>
            )}
            <p className="text-orange-400 text-sm mt-6 font-semibold animate-pulse">Connecting to stream...</p>
          </div>
        )}
      </div>

      {/* ═══════ IN-CALL OVERLAY ═══════ */}
      {isInCall && (
        <div className="absolute top-0 left-0 right-0 z-[205] safe-top">
          <div className="mx-3 mt-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl px-4 py-3 shadow-xl shadow-green-500/20 border border-green-400/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                <div>
                  <p className="text-white text-xs font-bold">
                    {inviteCallType === 'private' ? '🔒 Private' : '🌐 Public'} Call with {broadcasterName}
                  </p>
                  <p className="text-white/70 text-[11px] font-medium mt-0.5">
                    {formatTime(callTimer)}
                    {callSessionTime > 0 && <span className="text-white/50"> / max {formatTime(callSessionTime)}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mute toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500' : 'bg-white/20'}`}
                >
                  {isMuted ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-white" />}
                </button>
                {/* End call */}
                <button
                  onClick={handleEndCall}
                  className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30 active:scale-90 transition-transform"
                >
                  <PhoneOff className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ TOP BAR ═══════ */}
      {!isInCall && (
        <div className="relative z-10 flex items-center justify-between px-3 pt-3 pb-2 safe-top" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.5) 65%, transparent 100%)' }}>
          <div className="flex items-center gap-2.5">
            <button onClick={() => router.push('/live-sessions')} className="w-9 h-9 rounded-full bg-white shadow-md border border-orange-100 flex items-center justify-center text-orange-600 active:scale-90 transition-transform">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-orange-100 rounded-full pl-0.5 pr-3.5 py-0.5 shadow-sm">
              <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  {broadcasterAvatar ? (
                    <img src={broadcasterAvatar} alt={broadcasterName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                      <span className="text-white text-[10px] font-bold">{broadcasterName?.charAt(0)?.toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="leading-none">
                <p className="text-gray-900 text-[12px] font-bold">{broadcasterName}</p>
                <p className="text-gray-400 text-[10px] mt-0.5 font-medium">{viewers} watching</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-md shadow-red-500/20">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              LIVE
            </span>
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md border border-orange-100 rounded-lg px-2 py-1 shadow-sm">
              <Eye className="w-3 h-3 text-orange-500" />
              <span className="text-gray-800 text-[11px] font-bold">{viewers}</span>
            </div>
            <button onClick={() => router.push('/live-sessions')} className="w-8 h-8 rounded-full bg-white shadow-md border border-orange-100 flex items-center justify-center text-gray-400 active:scale-90 transition-transform hover:text-red-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ═══════ ACTIVE CALL BANNER (when someone else is in call) ═══════ */}
      {activeCall && !isInCall && (
        <div className="relative z-10 mx-3 mt-1">
          <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-green-200 shadow-lg">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-400/50" />
            <span className="text-gray-800 text-xs font-bold">
              {activeCall.isPrivate ? '🔒 Private' : '🌐 Public'} call in progress
              {activeCall.userName && <span className="text-orange-600 font-extrabold ml-1">with {activeCall.userName}</span>}
            </span>
          </div>
        </div>
      )}

      {/* ═══════ GIFT TOAST ═══════ */}
      <div className="absolute left-3 top-24 z-30">
        {giftToast && <GiftToast gift={giftToast.gift} senderName={giftToast.senderName} onDone={() => setGiftToast(null)} />}
      </div>

      {/* ═══════ RIGHT SIDE ACTIONS ═══════ */}
      <div className="absolute right-3 bottom-[170px] sm:bottom-[190px] z-20 flex flex-col items-center gap-3">
        <div className="relative">
          <FloatingHearts count={likeAnimCount} />
          <button onClick={handleLike} className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
            <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${isLiked ? 'bg-red-500 shadow-red-300/40 scale-110' : 'bg-white/90 backdrop-blur-md border border-orange-100'}`}>
              <Heart className={`w-5 h-5 transition-all ${isLiked ? 'text-white fill-white' : 'text-red-500'}`} />
            </div>
            <span className="text-white text-[10px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{likes}</span>
          </button>
        </div>

        <button onClick={() => { if (!isAuthenticated()) { alert('Please login to send dakshina.'); return; } setShowGiftModal(true); }}
          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-300/40">
            <Gift className="w-5 h-5 text-white" />
          </div>
          <span className="text-orange-300 text-[10px] font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Dakshina</span>
        </button>

        <button onClick={() => setShowQueuePanel(!showQueuePanel)} className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-orange-100 flex items-center justify-center relative shadow-lg">
            <List className="w-5 h-5 text-amber-600" />
            {activeQueueCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">{activeQueueCount}</span>}
          </div>
          <span className="text-white text-[10px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Queue</span>
        </button>

        <button onClick={() => setChatExpanded(!chatExpanded)} className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all ${chatExpanded ? 'bg-orange-500 shadow-orange-300/40' : 'bg-white/90 backdrop-blur-md border border-orange-100'}`}>
            <MessageCircle className={`w-5 h-5 ${chatExpanded ? 'text-white' : 'text-orange-500'}`} />
          </div>
          <span className="text-white text-[10px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Chat</span>
        </button>

        <button onClick={() => { if (navigator.share) navigator.share({ title: `${broadcasterName} is LIVE`, url: window.location.href }); }}
          className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform">
          <div className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-orange-100 flex items-center justify-center shadow-lg">
            <Share2 className="w-5 h-5 text-gray-600" />
          </div>
          <span className="text-white text-[10px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Share</span>
        </button>
      </div>

      {/* ═══════ QUEUE PANEL ═══════ */}
      {showQueuePanel && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setShowQueuePanel(false)} />
          <div className="absolute right-3 bottom-[380px] sm:bottom-[400px] z-30 w-72 max-h-80 bg-white/95 backdrop-blur-xl rounded-2xl border border-orange-100 overflow-hidden shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-orange-50 bg-orange-50/50">
              <h4 className="text-gray-900 font-bold text-sm">Call Queue ({activeQueueCount})</h4>
              <button onClick={() => setShowQueuePanel(false)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="overflow-y-auto max-h-60 p-3 space-y-2">
              {activeQueueCount === 0 ? (
                <div className="text-center py-8">
                  <List className="w-8 h-8 text-orange-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-xs font-medium">Queue is empty</p>
                </div>
              ) : (
                queue.filter(q => q.status !== 'completed').map((item, idx) => {
                  const ud = getUserDetails();
                  const isMe = String(item.userId) === String(ud?.id || ud?._id || ud?.userId);
                  return (
                    <div key={item._id || idx} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all ${isMe ? 'bg-orange-500 text-white' : 'bg-orange-50/60 border border-orange-100'}`}>
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${isMe ? 'bg-white text-orange-500' : 'bg-white text-orange-400 shadow-inner'}`}>{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold truncate ${isMe ? 'text-white' : 'text-gray-800'}`}>
                          {item.userName || 'User'}{isMe && <span className="opacity-80 ml-1">(You)</span>}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          {item.isPrivate
                            ? <span className={`flex items-center gap-0.5 text-[9px] font-semibold ${isMe ? 'text-white/80' : 'text-purple-600'}`}><Lock className="w-2.5 h-2.5" /> Private</span>
                            : <span className={`flex items-center gap-0.5 text-[9px] font-semibold ${isMe ? 'text-white/80' : 'text-amber-600'}`}><Globe className="w-2.5 h-2.5" /> Public</span>
                          }
                          {['notified', 'active', 'connecting', 'accepted'].includes(item.status) && <span className={`text-[9px] font-bold animate-pulse ${isMe ? 'text-white' : 'text-green-600'}`}>Connecting...</span>}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══════ BOTTOM: CHAT + INPUT ═══════ */}
      <div className="relative z-10 mt-auto" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)' }}>
        {chatExpanded && (
          <div className="px-3 pb-2 max-h-[30vh] overflow-y-auto space-y-1 scrollbar-hide" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%)' }}>
            {chats.slice(-30).map((chat, idx) => {
              const ud = getUserDetails();
              const isMe = String(chat.userId) === String(ud?.id || ud?._id || ud?.userId);
              const isBroadcaster = chat.userId === sessionData?.broadcasterId;
              return (
                <div key={idx} className="flex items-start gap-2 max-w-[85%]">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${isBroadcaster ? 'ring-[1.5px] ring-orange-400' : ''}`}>
                    {chat.profilePicture
                      ? <img src={chat.profilePicture} alt="" className="w-full h-full rounded-full object-cover" />
                      : <div className={`w-full h-full flex items-center justify-center ${isBroadcaster ? 'bg-orange-500' : 'bg-white/20'}`}><span className="text-[9px] text-white font-bold">{chat.name?.charAt(0)?.toUpperCase()}</span></div>
                    }
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold mr-1.5 ${isBroadcaster ? 'text-orange-400' : isMe ? 'text-blue-300' : 'text-white/50'}`}>{chat.name}{isBroadcaster && ' ✦'}</span>
                    <span className="text-white text-xs leading-relaxed">{chat.message}</span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}

        {inQueue && !isInCall && (
          <div className="mx-3 mb-2 flex items-center justify-between bg-orange-500 rounded-2xl px-4 py-2.5 shadow-lg">
            <div className="flex items-center gap-2.5">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
              <div>
                <p className="text-white text-xs font-bold">You're in queue</p>
                <p className="text-white/70 text-[10px] font-medium flex items-center gap-1">
                  {queueType === 'private' ? <><Lock className="w-2.5 h-2.5" /> Private call</> : <><Globe className="w-2.5 h-2.5" /> Public call</>}
                </p>
              </div>
            </div>
            <button onClick={handleLeaveQueue} disabled={leavingQueue}
              className="px-4 py-1.5 bg-white text-orange-600 rounded-full text-[11px] font-bold active:scale-95 transition-all">
              {leavingQueue ? 'Leaving...' : 'Leave'}
            </button>
          </div>
        )}

        <div className="px-3 pb-4 pt-1 flex items-center gap-2 safe-bottom">
          <div className="flex-1 flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/10 rounded-full px-4 py-2.5">
            <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              placeholder="Ask a question..." className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none" />
            {chatInput.trim() && (
              <button onClick={handleSendChat} disabled={sendingChat} className="text-orange-400 hover:text-orange-300 active:scale-90 transition-all">
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
          {!inQueue && !isInCall && (
            <button onClick={() => setShowCallTypeModal(true)} disabled={joiningQueue}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30 active:scale-90 transition-all flex-shrink-0">
              {joiningQueue ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>



      {/* ═══════ CALL TYPE MODAL ═══════ */}
      {showCallTypeModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[210]" onClick={() => setShowCallTypeModal(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[210] animate-slide-up max-w-lg mx-auto">
            <div className="bg-white rounded-t-3xl p-6 shadow-2xl">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <h3 className="text-lg font-bold text-gray-900 mb-1">Request a Call</h3>
              <p className="text-gray-500 text-sm mb-5">Choose how you'd like to connect with {broadcasterName}</p>
              <div className="space-y-3">
                <button onClick={() => handleJoinQueue(true)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-purple-100 bg-purple-50/30 hover:bg-purple-50 hover:border-purple-300 transition-all text-left group">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-purple-100 shadow-sm">
                    <Lock className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-gray-900 font-bold">Private Call</h4>
                      {privateRpm && <span className="text-purple-600 text-[11px] font-bold bg-purple-100 px-2 py-0.5 rounded-full">₹{privateRpm}/min</span>}
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">Only you and the astrologer can hear. Confidential.</p>
                  </div>
                </button>
                <button onClick={() => handleJoinQueue(false)}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-orange-100 bg-orange-50/30 hover:bg-orange-50 hover:border-orange-300 transition-all text-left group">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform border border-orange-100 shadow-sm">
                    <Globe className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-gray-900 font-bold">Public Call</h4>
                      {publicRpm && <span className="text-orange-600 text-[11px] font-bold bg-orange-100 px-2 py-0.5 rounded-full">₹{publicRpm}/min</span>}
                    </div>
                    <p className="text-gray-500 text-xs mt-0.5">Everyone in the live session can listen along.</p>
                  </div>
                </button>
              </div>
              <button onClick={() => setShowCallTypeModal(false)} className="w-full mt-4 py-3 rounded-xl text-gray-400 font-medium hover:bg-gray-50 transition-colors text-sm">Cancel</button>
            </div>
          </div>
        </>
      )}

      {/* ═══════ DAKSHINA MODAL ═══════ */}
      {showGiftModal && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[210]" onClick={() => setShowGiftModal(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-[210] animate-slide-up max-w-lg mx-auto">
            <div className="bg-white rounded-t-3xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-5 py-5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <div className="absolute top-1 right-4 text-4xl">🙏</div>
                  <div className="absolute bottom-1 left-4 text-2xl">✨</div>
                </div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="text-white font-bold text-lg">Send Dakshina</h3>
                    <p className="text-white/80 text-xs mt-0.5">Offer blessings to {broadcasterName}</p>
                  </div>
                  <button onClick={() => setShowGiftModal(false)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all">
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-5 max-h-[55vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-5 px-4 py-3 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-orange-100"><Wallet className="w-4 h-4 text-orange-500" /></div>
                    <span className="text-gray-500 text-sm font-medium">Balance</span>
                  </div>
                  <span className="font-bold text-lg text-gray-900">₹{walletBalance}</span>
                </div>
                {gifts.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {gifts.map(gift => {
                      const canAfford = walletBalance >= gift.price;
                      return (
                        <button key={gift._id} onClick={() => { if (!canAfford) return; setSelectedGift(gift); setShowGiftConfirm(true); setShowGiftModal(false); }}
                          disabled={!canAfford}
                          className={`p-4 rounded-2xl border transition-all duration-200 ${canAfford ? 'border-orange-100 bg-white hover:bg-orange-50 hover:border-orange-300 hover:scale-[1.02] active:scale-95 cursor-pointer shadow-sm' : 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed'}`}>
                          <div className="flex flex-col items-center text-center">
                            <img src={gift.icon} alt={gift.name} className="w-12 h-12 mb-2" />
                            <h4 className="font-bold text-gray-900 text-sm mb-0.5">{gift.name}</h4>
                            <p className="font-bold text-sm text-orange-600">₹{gift.price}</p>
                            {!canAfford && <p className="text-red-500 text-[10px] mt-1 font-semibold">Low balance</p>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-orange-100"><Gift className="w-8 h-8 text-orange-200" /></div>
                    <p className="text-gray-400 text-sm">No offerings available yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══════ GIFT CONFIRM ═══════ */}
      {showGiftConfirm && selectedGift && (
        <GiftConfirmationDialog isOpen={showGiftConfirm}
          onClose={() => { setShowGiftConfirm(false); setSelectedGift(null); }}
          onConfirm={async () => { await handleSendGift(selectedGift); }}
          giftName={selectedGift.name} giftIcon={selectedGift.icon} giftPrice={selectedGift.price} isLoading={isSendingGift} />
      )}

      {/* ═══════ CSS ═══════ */}
      <style jsx>{`
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes scale-in { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes float-heart { 0% { transform: translateY(0) scale(1); opacity: 1; } 50% { transform: translateY(-70px) scale(1.15); opacity: 0.8; } 100% { transform: translateY(-140px) scale(0.7); opacity: 0; } }
        .animate-float-heart { animation: float-heart 1.5s ease-out forwards; }
        @keyframes slide-in-left { from { transform: translateX(-120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in-left { animation: slide-in-left 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes wiggle { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-15deg); } 75% { transform: rotate(15deg); } }
        .animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .safe-top { padding-top: max(0.75rem, env(safe-area-inset-top)); }
        .safe-bottom { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
      `}</style>
    </div>
  );
}
