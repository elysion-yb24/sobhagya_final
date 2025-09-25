"use client"; // Because we'll use onClick for navigation in a client component

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getAuthToken, getUserDetails, isAuthenticated } from "../../utils/auth-utils";
import { Phone, Video } from "lucide-react";
import { getApiBaseUrl } from "../../config/api";
import InsufficientBalanceModal from "../../components/ui/InsufficientBalanceModal";
import ChatConnectingModal from "../../components/ui/ChatConnectingModal";
import { useWalletBalance } from "./WalletBalanceContext";
import { useSessionManager } from "./SessionManager";

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

  // Free call check
  const [hasCompletedFreeCall, setHasCompletedFreeCall] = useState(false);
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
    // For non-logged-in users, always show the free call offer
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
  }, []);

  const checkCallHistory = async () => {
    try {
      const token = getAuthToken();
      const userDetails = getUserDetails();

      if (!token || !userDetails?.id) return;

      const response = await fetch(
        `${getApiBaseUrl()}/calling/api/call/call-log?skip=0&limit=10&role=user`,
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
        const callHistory = await response.json();
        const totalCalls = callHistory.data?.list?.length || 0;

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

  // ✅ Call handlers
  const handleAudioCallButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCallMenuOpen(false);

    if (isAuthenticated()) {
      router.push(`/astrologers/${_id}?callType=audio`);
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
      router.push(`/astrologers/${_id}?callType=video`);
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

  // ✅ Chat handler
  const handleChatClick = async () => {
    if (isAuthenticated()) {
      const profile = getUserDetails();
      const currentUserId = profile?.id || profile?._id;
      const currentUserName = profile?.displayName || profile?.name || "User";

      console.log('User details:', { currentUserId, currentUserName });

      if (!currentUserId) {
        localStorage.setItem("initiateChatWithAstrologerId", _id);
        router.push("/login");
        return;
      }

      // Show loading modal
      setShowChatConnectingModal(true);

      if (!isConnected) {
        console.error('Session manager not connected, going to chat page');
        // Go directly to chat page
        setTimeout(() => {
          setShowChatConnectingModal(false);
          router.push('/chat');
        }, 1500); // Show loading for at least 1.5 seconds
        return;
      }

      try {
        console.log('Creating/updating session with provider:', _id);
        // Use createSession which will handle both creating and checking
        const sessionId = await createOrJoinSession(_id);
        console.log('Session result:', sessionId);
        
        if (sessionId) {
          console.log('Session created/found:', sessionId);
          setTimeout(() => {
            setShowChatConnectingModal(false);
            router.push(`/chat?sessionId=${sessionId}`);
          }, 1500); // Show loading for at least 1.5 seconds
        } else {
          console.error('Failed to create session');
          setTimeout(() => {
            setShowChatConnectingModal(false);
            router.push('/chat');
          }, 1500);
        }
      } catch (error) {
        console.error('Error in chat session management:', error);
        setTimeout(() => {
          setShowChatConnectingModal(false);
          router.push('/chat');
        }, 1500);
      }

    } else {
      console.log('User not authenticated, redirecting to login');
      localStorage.setItem("selectedAstrologerId", _id);
      localStorage.setItem("chatIntent", "1");
      router.push(`/calls/call1?astrologerId=${_id}`);
    }
  };

  return (
    <>
      <div
        className="relative bg-white rounded-xl border p-4 cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col w-full mx-auto overflow-hidden"
        style={{
          borderColor: "#F7971E",
          boxShadow: "0 4px 16px rgba(247,151,30,0.15)",
        }}
        onClick={handleCardClick}
      >
        {/* 🎁 Free Call Banner */}
        {!hasCompletedFreeCall && (
          <div
            className="absolute top-3 -right-10 w-[160px] bg-[#F7971E] text-white text-[11px] text-center font-bold py-[2px] rotate-[45deg] flex items-center justify-center shadow-md z-50 whitespace-normal leading-tight"
            style={{ transformOrigin: "center" }}
          >
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1st Free Call
            {/* OFFER: <br /> FREE 1st CALL */}
          </div>
        )}

        {/* ⭐ Main Content */}
        <div className="flex gap-4 mb-4 relative z-10">
          {/* Avatar */}
          <div className="relative flex flex-col items-center">
            <img
              src={
                (partner.avatar && partner.avatar.startsWith('http')) ||
                (partner.profileImage && partner.profileImage.startsWith('http'))
                  ? partner.avatar || partner.profileImage
                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      name
                    )}&background=F7971E&color=fff&size=70`
              }
              alt={name}
              className="w-[70px] h-[70px] rounded-full object-cover border-2"
              style={{
                borderColor: partner.status === "online" ? "#10B981" : "#F7971E",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  name
                )}&background=F7971E&color=fff&size=70`;
              }}
            />
            {/* Online Badge */}
            {/* {partner.status === "online" && (
              <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )} */}

            {/* ⭐ Rating */}
            <div className="mt-2 flex items-center text-yellow-500 text-sm">
              {[...Array(5)].map((_, i) => {
                const value = typeof rating === "number" ? rating : rating?.avg || 4.5;
                return (
                  <span key={i} className={i < Math.floor(value) ? "" : "text-gray-300"}>
                    ★
                  </span>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {calls || callsCount || "12986"} orders
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="text-lg font-bold text-gray-900 truncate">{name}</h3>
              <img src="/orange_tick.png" alt="Verified" className="w-4 h-4" />
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
              {partner.talksAbout?.slice(0, 3).join(", ") ||
                specializations?.join(", ") ||
                "Numerology, Vedic, Vastu"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(languages || partner.language)?.join(", ") || "Hindi, Bhojpuri"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Exp:- {age || experience || "1"} year
            </p>
            <div className="text-lg font-bold text-gray-900 mt-2">₹ {rpm || 18}/min.</div>
          </div>
        </div>

        {/* 🎯 Action Buttons */}
        <div className="flex gap-3 mt-auto relative z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleChatClick();
            }}
            className="flex-1 border border-[#F7971D] text-[#F7971D] rounded-md py-2 text-xs font-medium flex items-center justify-center gap-2 hover:bg-orange-50 transition"
          >
            <img src="/message.png" alt="Chat" className="w-[10px] h-[10px]" />
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
              className="w-full rounded-lg py-2 text-xs font-medium flex items-center justify-center gap-2 text-black shadow-md transition"
              style={{
                background: "linear-gradient(90deg, #F9A43A 0%, #F7971E 100%)",
              }}
            >
              {hasCompletedFreeCall ? "Call" : "OFFER: 1st FREE Call"}
            </button>

            {isCallMenuOpen && (
              <div
                ref={callMenuRef}
                className="absolute bottom-full left-0 mb-2 w-full bg-white border rounded-lg shadow-lg z-50 overflow-hidden"
              >
                <button
                  onClick={handleAudioCallButtonClick}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                >
                  <Phone className="w-4 h-4 text-green-500" />
                  Audio Call
                </button>
                <button
                  onClick={handleVideoCall}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                >
                  <Video className="w-4 h-4 text-blue-500" />
                  Video Call
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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

    </>
  );
});

export default AstrologerCard;
