"use client"; // Because we'll use onClick for navigation in a client component

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getAuthToken, getUserDetails, isAuthenticated } from "../../utils/auth-utils";
import { Phone, Video, CheckCircle, Star, Languages, GraduationCap, MessageSquare } from "lucide-react";
import { getApiBaseUrl } from "../../config/api";
import InsufficientBalanceModal from "../../components/ui/InsufficientBalanceModal";
import ChatConnectingModal from "../../components/ui/ChatConnectingModal";
import { useWalletBalance } from "./WalletBalanceContext";
import { useSessionManager } from "./SessionManager";
import { initiateCall } from "../../utils/calling-utils";
import { fetchThreads, declineSession, type BackendThread } from "../../utils/chat-api";

interface Astrologer {
  _id: string;
  name: string;
  languages: string[];
  specializations: string[];
  experience: string;
  callsCount: number;
  rating: number | { avg: number; count: number; max: number; min: number };
  profileImage: string;
  hasVideo?: boolean;
  about?: string;
  age?: number;
  avatar?: string;
  blockReason?: string;
  blockedReason?: string;
  callMinutes?: number;
  callType?: string;
  calls?: number;
  createdAt?: string;
  hasBlocked?: boolean;
  isBlocked?: boolean;
  isLive?: boolean;
  isLiveBlocked?: boolean;
  isRecommended?: boolean;
  isVideoCallAllowed?: boolean;
  isVideoCallAllowedAdmin?: boolean;
  language?: string[];
  numericId?: number;
  offerRpm?: number;
  payoutAudioRpm?: number;
  payoutVideoRpm?: number;
  phone?: string;
  priority?: number;
  reportCount?: number;
  role?: string;
  rpm?: number;
  sample?: string;
  status?: string;
  talksAbout?: string[];
  upi?: string;
  videoRpm?: number;
}

interface Props {
  astrologer: Astrologer;
  compactButtons?: boolean;
  showVideoButton?: boolean;
  source?: string;
  onCallModalOpen?: (astrologer: Astrologer) => void;
}

const AstrologerCard = React.memo(function AstrologerCard({
  astrologer,
  compactButtons = false,
  showVideoButton = false,
  source,
  onCallModalOpen,
}: Props) {
  const router = useRouter();
  const [isCallMenuOpen, setIsCallMenuOpen] = useState(false);
  const callMenuRef = useRef<HTMLDivElement | null>(null);
  const callButtonRef = useRef<HTMLButtonElement | null>(null);

  // Insufficient balance modal state
  const [showInsufficientBalanceModal, setShowInsufficientBalanceModal] = useState(false);
  const [insufficientBalanceData, setInsufficientBalanceData] = useState<{
    requiredAmount: number;
    serviceType: "call" | "gift" | "consultation";
  } | null>(null);

  // Chat connecting modal state
  const [showChatConnectingModal, setShowChatConnectingModal] = useState(false);

  // Chat error message (e.g. "Astrologer is busy") shown as a transient toast
  const [chatErrorMessage, setChatErrorMessage] = useState<string | null>(null);
  // When the error is about an existing session, we surface a CTA that
  // navigates to the user's active chat instead.
  const [activeChatCta, setActiveChatCta] = useState<{
    threadId: string;
    sessionId: string | null;
    label: string;
  } | null>(null);

  // Free call check
  const [hasCompletedFreeCall, setHasCompletedFreeCall] = useState(false);
  // Direct call initiation state
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const { walletBalance } = useWalletBalance();
  const { createOrJoinSession, isConnected } = useSessionManager();


  const partner = astrologer;
  const {
    _id,
    name,
    languages,
    specializations,
    experience,
    callsCount,
    calls,
    rating,
    profileImage,
    rpm,
    videoRpm,
    age,
    talksAbout,
  } = partner;

  // ✅ Check free call history
  useEffect(() => {
    const runCheck = () => {
      if (!isAuthenticated()) {
        setHasCompletedFreeCall(false);
        return;
      }

      const cachedHasCalledBefore = localStorage.getItem("userHasCalledBefore");
      const lastCheckTime = localStorage.getItem("lastCallHistoryCheck");
      const now = Date.now();

      if (cachedHasCalledBefore === "true") {
        setHasCompletedFreeCall(true);
      } else if (!lastCheckTime || now - parseInt(lastCheckTime) > 300000) {
        checkCallHistory();
        localStorage.setItem("lastCallHistoryCheck", now.toString());
      }
    };

    runCheck();

    // Re-check automatically if authentication state changes in this session
    window.addEventListener('user-auth-changed', runCheck);
    return () => window.removeEventListener('user-auth-changed', runCheck);
  }, []);

  const checkCallHistory = async () => {
    try {
      const token = getAuthToken();
      const userDetails = getUserDetails();

      if (!token || !userDetails?.id) return;

      const response = await fetch(
        `/api/calling/call-log?skip=0&limit=10&role=user`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        let totalCalls = 0;
        
        if (data.data?.list && Array.isArray(data.data.list)) totalCalls = data.data.list.length;
        else if (data.list && Array.isArray(data.list)) totalCalls = data.list.length;
        else if (Array.isArray(data.data)) totalCalls = data.data.length;
        else if (Array.isArray(data)) totalCalls = data.length;

        if (totalCalls > 0) {
          setHasCompletedFreeCall(true);
          localStorage.setItem("userHasCalledBefore", "true");
        }
      }
    } catch {
      // fallback check
      const hasCalledBefore = localStorage.getItem("userHasCalledBefore");
      if (hasCalledBefore === "true") setHasCompletedFreeCall(true);
    }
  };

  // ✅ Close call menu when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (!isCallMenuOpen) return;
      const target = e.target as Node;
      if (callMenuRef.current?.contains(target)) return;
      if (callButtonRef.current?.contains(target)) return;
      setIsCallMenuOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isCallMenuOpen]);

  // ✅ Direct call initiation (skip profile page & confirmation)
  const initiateDirectCall = async (callType: 'audio' | 'video') => {
    try {
      setIsInitiatingCall(true);
      
      const avatarUrl = (partner as any).avatar || profileImage || '';
      const currentRpm = callType === 'audio' ? (rpm || 15) : (videoRpm || 20);

      await initiateCall({
        astrologerId: _id,
        astrologerName: name,
        callType,
        avatarUrl,
        rpm: currentRpm
      });
      
    } catch (err: any) {
      setIsInitiatingCall(false);
      
      if (err.message === 'DONT_HAVE_ENOUGH_BALANCE') {
        const currentRpm = callType === 'audio' ? (rpm || 15) : (videoRpm || 20);
        setInsufficientBalanceData({ 
          requiredAmount: Number(currentRpm) * 2, 
          serviceType: 'call' 
        });
        setShowInsufficientBalanceModal(true);
      } else {
        // Already alerted in utility
      }
    }
  };

  // ✅ Call handlers
  const handleAudioCallButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCallMenuOpen(false);

    if (isAuthenticated()) {
      initiateDirectCall('audio');
    } else {
      localStorage.setItem("callIntent", "audio");
      localStorage.setItem("selectedAstrologerId", _id);
      localStorage.setItem("callSource", source || "astrologerCard");
      router.push("/login");
    }
  };

  const handleVideoCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCallMenuOpen(false);

    if (isAuthenticated()) {
      initiateDirectCall('video');
    } else {
      localStorage.setItem("callIntent", "video");
      localStorage.setItem("selectedAstrologerId", _id);
      localStorage.setItem("callSource", source || "astrologerCard");
      router.push("/login");
    }
  };

  // ✅ Modal-based call handlers (for call-with-astrologer source)
  const handleCallModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCallModalOpen) {
      onCallModalOpen(astrologer);
    }
  };


  // ✅ Card click handler for profile view
  const handleCardClick = () => {
    // For call-with-astrologer source, go to the new profile page
    if (source === "callWithAstrologer") {
      router.push(`/call-with-astrologer/profile/${_id}`);
      return;
    }

    // For other sources, check authentication
    const isAuthValid = isAuthenticated();
    if (isAuthValid) {
      router.push(`/astrologers/${_id}`);
    } else {
      // Store astrologer ID and redirect to login for profile view
      localStorage.setItem("selectedAstrologerId", _id);
      router.push("/login");
    }
  };

  /**
   * Look up the user's active chat thread (if any) so we can offer a
   * "Open active chat" CTA when create-session is blocked. Prefers an
   * exact match on this astrologer's id; falls back to any thread with
   * `isActiveSession`.
   */
  const findActiveThread = async (
    preferredProviderId: string
  ): Promise<{ threadId: string; sessionId: string | null; matchesProvider: boolean } | null> => {
    try {
      const { threads } = await fetchThreads({ limit: 30 });
      const list = threads as BackendThread[];
      const exact = list.find(
        (t) => String(t.providerId) === String(preferredProviderId) && t.isActiveSession
      );
      if (exact) {
        return {
          threadId: String(exact._id),
          sessionId: exact.lastSessionId ? String(exact.lastSessionId) : null,
          matchesProvider: true,
        };
      }
      const anyActive = list.find((t) => t.isActiveSession);
      if (anyActive) {
        return {
          threadId: String(anyActive._id),
          sessionId: anyActive.lastSessionId ? String(anyActive.lastSessionId) : null,
          matchesProvider: false,
        };
      }
      return null;
    } catch {
      return null;
    }
  };

  /** Treats any backend message that signals "you already have a session" */
  const isExistingSessionError = (msg: string | undefined): boolean => {
    if (!msg) return false;
    const m = msg.toLowerCase();
    return (
      m.includes('ongoing session already exists') ||
      m.includes('complete your existing call or chat') ||
      m.includes('existing session')
    );
  };

  // ✅ Chat handler
  // Strategy: let the user start a chat with anyone, anytime.
  // If the backend reports an existing active session for this user (either
  // with this same astrologer or with a different one), we auto-resolve it:
  //   - same astrologer → navigate to that thread
  //   - different astrologer → end the old session via REST, then retry once
  const handleChatClick = async () => {
    if (!isAuthenticated()) {
      localStorage.setItem('selectedAstrologerId', _id);
      localStorage.setItem('chatIntent', '1');
      router.push(`/calls/call1?astrologerId=${_id}`);
      return;
    }

    const profile = getUserDetails();
    const currentUserId = profile?.id || profile?._id;
    if (!currentUserId) {
      localStorage.setItem('initiateChatWithAstrologerId', _id);
      router.push('/login');
      return;
    }

    // Reset any previous error/CTA state
    setChatErrorMessage(null);
    setActiveChatCta(null);
    setShowChatConnectingModal(true);

    try {
      // 1. Pre-check: if user already has an active thread with THIS astrologer,
      //    skip create-session and navigate directly. Avoids the backend's
      //    "An ongoing session already exists for this thread" 400.
      const preExisting = await findActiveThread(_id);
      if (preExisting && preExisting.matchesProvider) {
        const qs = new URLSearchParams({ threadId: preExisting.threadId });
        if (preExisting.sessionId) qs.set('sessionId', preExisting.sessionId);
        setShowChatConnectingModal(false);
        router.push(`/chat?${qs.toString()}`);
        return;
      }

      // 2. Attempt to create/resume a session.
      let result = await createOrJoinSession(_id);

      // 3. If the backend blocked us due to an existing session with a
      //    different astrologer, auto-end that session and retry once.
      if (!result.ok && isExistingSessionError(result.message)) {
        const active = preExisting || (await findActiveThread(_id));
        if (active && active.sessionId) {
          // Fire-and-forget the decline; backend marks session completed and
          // resets the user's status so create-session will succeed on retry.
          await declineSession(active.threadId, active.sessionId);
          // Small delay to let backend status propagate (Redis + Mongo).
          await new Promise((r) => setTimeout(r, 400));
          result = await createOrJoinSession(_id);
        }
      }

      setShowChatConnectingModal(false);

      if (result.ok) {
        const qs = new URLSearchParams({ threadId: result.threadId });
        if (result.sessionId) qs.set('sessionId', result.sessionId);
        router.push(`/chat?${qs.toString()}`);
        return;
      }

      // 4. Anything still failing → surface the backend message.
      setChatErrorMessage(result.message || 'Could not start chat. Please try again.');
      setTimeout(() => setChatErrorMessage(null), 4000);
    } catch (error: any) {
      console.warn('Error in chat session management:', error);
      setShowChatConnectingModal(false);
      setChatErrorMessage(error?.message || 'Could not start chat. Please try again.');
      setTimeout(() => setChatErrorMessage(null), 4000);
    }
  };

  const handleActiveChatCtaClick = () => {
    if (!activeChatCta) return;
    const qs = new URLSearchParams({ threadId: activeChatCta.threadId });
    if (activeChatCta.sessionId) qs.set('sessionId', activeChatCta.sessionId);
    setActiveChatCta(null);
    setChatErrorMessage(null);
    router.push(`/chat?${qs.toString()}`);
  };

  return (
    <>
      <motion.div
        className="relative bg-white rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all duration-300 flex flex-col w-full mx-auto overflow-hidden border border-orange-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 active:scale-[0.99]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleCardClick}
      >
        {/* 🎁 Free Call Banner */}
        {/* 🎁 Free Call Banner - Premium Ribbon Style */}
        {!hasCompletedFreeCall && (
          <div className="absolute top-0 right-0 z-20">
            <div className="bg-gradient-to-l from-orange-600 to-orange-400 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-2xl shadow-md flex items-center gap-1.5 uppercase tracking-wider border-b border-l border-white/20">
              <Star className="w-3 h-3 fill-white" />
              1st Free Call
            </div>
          </div>
        )}

        {/* ⭐ Main Content */}
        <div className="flex gap-4 mb-4 relative z-10">
          {/* Avatar Section */}
          <div className="relative flex-shrink-0">
            <div className="relative group/avatar">
              <img
                src={
                  (partner.avatar && partner.avatar.startsWith('http')) ||
                  (partner.profileImage && partner.profileImage.startsWith('http'))
                    ? partner.avatar || partner.profileImage
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F7941D&color=fff&size=80`
                }
                alt={name}
                className="w-20 h-20 rounded-2xl object-cover border-2 shadow-inner transition-transform duration-500 group-hover/avatar:scale-105"
                style={{
                  borderColor: partner.status === "online" 
                    ? "#10B981" 
                    : partner.status === "busy" 
                    ? "#F97316" 
                    : partner.status === "offline" 
                    ? "#EF4444" 
                    : "#F7941D",
                }}
              />
              {/* Online/Busy Indicator Ping */}
              {partner.status === "online" && (
                <span className="absolute -top-1 -left-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-white"></span>
                </span>
              )}
            </div>

            {/* ⭐ Rating Badge */}
            <div className="mt-3 flex flex-col items-center">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 shadow-sm">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span className="text-xs font-bold text-amber-700">
                  {typeof rating === "number" ? rating : rating?.avg || 4.8}
                </span>
              </div>
              <div className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-tighter">
                {calls || callsCount || "12k+"} orders
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-1.5 mb-1">
              <h3 className="text-[17px] font-bold text-gray-900 truncate tracking-tight">{name}</h3>
              <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-50/10" />
            </div>

            {/* Status Pill */}
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 border ${
              partner.status === "online" 
                ? "bg-green-50 text-green-600 border-green-100" 
                : partner.status === "busy" 
                ? "bg-orange-50 text-orange-600 border-orange-100" 
                : "bg-gray-50 text-gray-500 border-gray-100"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                partner.status === "online" ? "bg-green-500" : partner.status === "busy" ? "bg-orange-500" : "bg-gray-400"
              }`} />
              {partner.status || 'Offline'}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-start gap-2 text-gray-600">
                <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-orange-400 flex-shrink-0" />
                <p className="text-xs font-medium line-clamp-1 leading-tight">
                  {partner.talksAbout?.slice(0, 2).join(", ") || specializations?.slice(0, 2).join(", ") || "Vedic, Numerology"}
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-gray-500">
                <Languages className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <p className="text-[11px] truncate">
                  {(languages || partner.language)?.slice(0, 3).join(", ") || "English, Hindi"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-gray-500">
                <GraduationCap className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                <p className="text-[11px]">
                  Exp: <span className="font-bold text-gray-700">{age || experience || "5"} Years</span>
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-xl font-black text-gray-900">₹{rpm || 15}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">/min</span>
            </div>
          </div>
        </div>

        {/* 🎯 Action Buttons */}
        <div className="flex gap-2.5 mt-auto relative z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleChatClick();
            }}
            className="flex-1 min-h-[44px] bg-gray-50 border border-gray-200 text-gray-700 rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-2 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600 active:scale-95 transition-all duration-300"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>

          {/* Call Dropdown */}
          <div className="relative flex-1">
            <button
              ref={callButtonRef}
              onClick={(e) => {
                e.stopPropagation();
                if (source === "callWithAstrologer") {
                  handleCallModalClick(e);
                } else {
                  setIsCallMenuOpen((prev) => !prev);
                }
              }}
              className="w-full min-h-[44px] bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 bg-[length:200%_auto] hover:bg-right text-white rounded-xl py-3 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95 transition-all duration-500"
            >
              {isInitiatingCall ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Phone className="w-3.5 h-3.5" />
                  {hasCompletedFreeCall ? "Call" : "FREE 1st Call"}
                </>
              )}
            </button>

            {isCallMenuOpen && (
              <div
                ref={callMenuRef}
                className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-xl shadow-xl z-50 overflow-hidden border border-gray-100"
              >
                <button
                  onClick={handleAudioCallButtonClick}
                  className="w-full px-4 py-3 text-left hover:bg-orange-50 text-gray-700 flex items-center gap-3 transition-colors duration-150 text-sm font-bold"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F7941D] flex items-center justify-center shadow-sm">
                    <Phone className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  Audio Call
                </button>
                <div className="h-px bg-gray-100 mx-3" />
                <button
                  onClick={handleVideoCall}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-3 transition-colors duration-150 text-sm font-bold"
                >
                  <div className="w-8 h-8 rounded-full bg-[#333333] flex items-center justify-center shadow-sm">
                    <Video className="w-4 h-4 text-white" strokeWidth={2.5} />
                  </div>
                  Video Call
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Insufficient Balance Modal */}
      {showInsufficientBalanceModal && insufficientBalanceData && (
        <InsufficientBalanceModal
          isOpen={showInsufficientBalanceModal}
          onClose={() => setShowInsufficientBalanceModal(false)}
          requiredAmount={insufficientBalanceData.requiredAmount}
          currentBalance={walletBalance}
          serviceType={insufficientBalanceData.serviceType}
        />
      )}

      {/* Chat Connecting Modal */}
      <ChatConnectingModal
        isOpen={showChatConnectingModal}
        astrologerName={name}
      />

      {/* Chat error toast (e.g. "Astrologer is busy") */}
      {chatErrorMessage && (
        <div
          className="fixed left-1/2 -translate-x-1/2 bottom-6 z-[9999] max-w-[92%] sm:max-w-md px-4 py-3 rounded-xl bg-gray-900 text-white shadow-2xl border border-gray-800 flex items-start gap-3"
          role="alert"
        >
          <svg className="w-5 h-5 mt-0.5 text-orange-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.732-3L13.732 4a2 2 0 00-3.464 0L3.34 16a2 2 0 001.732 3z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-tight">{chatErrorMessage}</p>
            {!activeChatCta && (
              <p className="text-xs text-gray-300 mt-0.5">Try another astrologer or wait a moment.</p>
            )}
            {activeChatCta && (
              <button
                onClick={handleActiveChatCtaClick}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {activeChatCta.label}
              </button>
            )}
          </div>
          <button
            onClick={() => {
              setChatErrorMessage(null);
              setActiveChatCta(null);
            }}
            className="text-gray-400 hover:text-white p-1 -mr-1 -mt-1"
            aria-label="Dismiss"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

    </>
  );
});

export default AstrologerCard;
