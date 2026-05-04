"use client"; // Because we'll use onClick for navigation in a client component

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getAuthToken, getUserDetails, isAuthenticated } from "../../utils/auth-utils";
import { Phone, Video, CheckCircle, Star, Languages, GraduationCap, MessageSquare } from "lucide-react";
import { getApiBaseUrl } from "../../config/api";
import InsufficientBalanceModal from "../../components/ui/InsufficientBalanceModal";
import ChatConnectingModal from "../../components/ui/ChatConnectingModal";
import OfflineAstrologerModal from "./OfflineAstrologerModal";
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

  // Offline-astrologer modal — shown when user tries to chat/call someone
  // who isn't currently online (Issue 6).
  const [showOfflineModal, setShowOfflineModal] = useState(false);

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

  // Treat anything that isn't explicitly online/busy as offline.
  const isOffline = () => {
    const s = (partner.status || '').toLowerCase();
    return s !== 'online' && s !== 'busy' && s !== 'available';
  };

  // ✅ Call handlers
  const handleAudioCallButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCallMenuOpen(false);

    if (isOffline()) {
      setShowOfflineModal(true);
      return;
    }

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

    if (isOffline()) {
      setShowOfflineModal(true);
      return;
    }

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
    if (isOffline()) {
      setShowOfflineModal(true);
      return;
    }
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
    // Gate: if astrologer is offline, surface the suggestions modal
    // instead of letting the backend reject with a generic error.
    if (isOffline()) {
      setShowOfflineModal(true);
      return;
    }

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
        className="group relative bg-white rounded-2xl cursor-pointer transition-all duration-300 flex flex-col w-full mx-auto overflow-hidden border border-orange-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-orange-300 active:scale-[0.99]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={handleCardClick}
      >
        {/* Saffron accent bar */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500" />

        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Header: Avatar + Identity */}
          <div className="flex gap-3.5 sm:gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative w-[72px] h-[72px] sm:w-[78px] sm:h-[78px] rounded-2xl overflow-hidden ring-2 ring-orange-100 shadow-sm">
                <img
                  src={
                    (partner.avatar && partner.avatar.startsWith('http')) ||
                    (partner.profileImage && partner.profileImage.startsWith('http'))
                      ? partner.avatar || partner.profileImage
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F7941D&color=fff&size=120`
                  }
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              {/* Status dot */}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ring-2 ring-white ${
                  partner.status === 'online'
                    ? 'bg-green-500'
                    : partner.status === 'busy'
                      ? 'bg-orange-500'
                      : 'bg-gray-400'
                }`}
                aria-label={partner.status || 'offline'}
              >
                {partner.status === 'online' && (
                  <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
                )}
              </span>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              {/* Name row */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[16px] sm:text-[17px] font-bold text-gray-900 truncate leading-tight">
                      {name}
                    </h3>
                    <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  </div>
                  {/* Rating + orders inline */}
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {typeof rating === 'number' ? rating : rating?.avg || 4.8}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500 font-medium">
                      {calls || callsCount || '12k+'} orders
                    </span>
                  </div>
                </div>

                {/* Free call pill (replaces overlapping ribbon) */}
                {!hasCompletedFreeCall && (
                  <span className="flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider border border-orange-200">
                    <Star className="w-2.5 h-2.5 fill-current" />
                    Free
                  </span>
                )}
              </div>

              {/* Specialization chips */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(partner.talksAbout?.slice(0, 2) ||
                  specializations?.slice(0, 2) || ['Vedic', 'Numerology']).map((tag, i) => (
                  <span
                    key={`${tag}-${i}`}
                    className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[11px] font-semibold capitalize border border-orange-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Meta row: language · experience */}
          <div className="mt-3.5 flex items-center gap-3 text-[11.5px] text-gray-600">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <Languages className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
              <span className="truncate">
                {(languages || partner.language)?.slice(0, 3).join(', ') || 'English, Hindi'}
              </span>
            </span>
            <span className="text-gray-200">|</span>
            <span className="inline-flex items-center gap-1.5 flex-shrink-0">
              <GraduationCap className="w-3.5 h-3.5 text-orange-400" />
              <span className="font-semibold text-gray-700">{age || experience || '5'} yrs</span>
            </span>
          </div>

          {/* Price strip */}
          <div className="mt-3.5 flex items-center justify-between rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-orange-700">
              Consultation
            </span>
            <span className="flex items-baseline gap-0.5">
              <span className="text-lg font-extrabold text-gray-900">₹{rpm || 15}</span>
              <span className="text-[10px] text-gray-500 font-semibold">/min</span>
            </span>
          </div>

          {/* Actions */}
          <div className="mt-3.5 flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleChatClick();
              }}
              className="flex-1 min-h-[42px] bg-white border border-orange-200 text-orange-600 rounded-xl text-[13px] font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-orange-50 hover:border-orange-300 active:scale-95 transition-all duration-200"
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>

            <div className="relative flex-1">
              <button
                ref={callButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isOffline()) {
                    setShowOfflineModal(true);
                    return;
                  }
                  if (source === 'callWithAstrologer') {
                    handleCallModalClick(e);
                  } else {
                    setIsCallMenuOpen((prev) => !prev);
                  }
                }}
                className="w-full min-h-[42px] bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-[13px] font-bold inline-flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/25 active:scale-95 transition-all duration-200"
              >
                {isInitiatingCall ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Phone className="w-4 h-4" />
                    {hasCompletedFreeCall ? 'Call Now' : 'Free 1st Call'}
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
                    className="w-full px-4 py-3 text-left hover:bg-orange-50 text-gray-700 flex items-center gap-3 transition-colors duration-150 text-sm font-semibold"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shadow-sm">
                      <Phone className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    Audio Call
                  </button>
                  <div className="h-px bg-gray-100 mx-3" />
                  <button
                    onClick={handleVideoCall}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-3 transition-colors duration-150 text-sm font-semibold"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center shadow-sm">
                      <Video className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    Video Call
                  </button>
                </div>
              )}
            </div>
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

      {/* Offline astrologer modal — Issue 6 */}
      <OfflineAstrologerModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
        offlineAstrologerName={name}
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
