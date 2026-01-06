"use client"; // Because we'll use onClick for navigation in a client component

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getAuthToken, getUserDetails, isAuthenticated } from "../../utils/auth-utils";
import { Video } from "lucide-react";
import { getApiBaseUrl } from "../../config/api";
import InsufficientBalanceModal from "../../components/ui/InsufficientBalanceModal";
import ChatConnectingModal from "../../components/ui/ChatConnectingModal";
import CallConfirmationDialog from "../../components/ui/CallConfirmationDialog";
import { useWalletBalance } from "./WalletBalanceContext";
import { useSessionManager } from "./SessionManager";
import { initiateCall } from "../../utils/call-utils";

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

  // Call confirmation dialog state
  const [showCallConfirmDialog, setShowCallConfirmDialog] = useState(false);
  const [selectedCallType, setSelectedCallType] = useState<'audio' | 'video'>('audio');
  const [isCallProcessing, setIsCallProcessing] = useState(false);

  // Free call check
  const [hasCompletedFreeCall, setHasCompletedFreeCall] = useState(false);

  // Navigation guard to prevent multiple rapid clicks
  const isNavigatingRef = useRef(false);
  const navigationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { walletBalance } = useWalletBalance();
  const { createOrJoinSession, isConnected } = useSessionManager();

  // Cleanup navigation timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, []);


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
    hasVideo,
    isVideoCallAllowed,
    isVideoCallAllowedAdmin,
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

  // ✅ Listen for call status changes
  useEffect(() => {
    const handleCallStatusChange = () => {
      const hasCalledBefore = localStorage.getItem("userHasCalledBefore");
      if (hasCalledBefore === "true") {
        setHasCompletedFreeCall(true);
      }
    };

    window.addEventListener('user-call-status-changed', handleCallStatusChange);
    return () => {
      window.removeEventListener('user-call-status-changed', handleCallStatusChange);
    };
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

  // ✅ Handle immediate call if redirected from login
  useEffect(() => {
    const immediateIntent = localStorage.getItem("immediateCallIntent");
    const immediateAstroId = localStorage.getItem("immediateCallAstrologerId");

    if (immediateIntent && immediateAstroId === _id && isAuthenticated()) {
      localStorage.removeItem("immediateCallIntent");
      localStorage.removeItem("immediateCallAstrologerId");

      initiateCall({
        astrologerId: _id,
        callType: immediateIntent as 'audio' | 'video',
        router,
        setLoading: setIsCallProcessing
      });
    }
  }, [_id, router]);

  // ✅ Call handlers
  const handleAudioCallButtonClick = (e: React.MouseEvent) => {
    setIsCallMenuOpen(false);

    if (isAuthenticated()) {
      initiateCall({
        astrologerId: _id,
        callType: 'audio',
        router,
        setLoading: setIsCallProcessing
      });
    } else {
      localStorage.setItem("callIntent", "audio");
      localStorage.setItem("selectedAstrologerId", _id);
      localStorage.setItem("callSource", source || "astrologerCard");
      router.push("/login");
    }
  };

  const handleVideoCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setIsCallMenuOpen(false);

    if (isAuthenticated()) {
      initiateCall({
        astrologerId: _id,
        callType: 'video',
        router,
        setLoading: setIsCallProcessing
      });
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
  const handleCardClick = (e?: React.MouseEvent) => {
    // Prevent multiple rapid clicks
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    // Always use the new design profile page
    const isAuthValid = isAuthenticated();
    if (isAuthValid) {
      router.push(`/call-with-astrologer/profile/${_id}`);
    } else {
      // Store astrologer ID and redirect to login for profile view
      localStorage.setItem("selectedAstrologerId", _id);
      router.push("/login");
    }

    // Reset after navigation (longer timeout to prevent double navigation)
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current);
    }
    navigationTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 2000);
  };

  // ✅ Chat handler
  const handleChatClick = async (e?: React.MouseEvent) => {
    // Prevent multiple rapid clicks
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    if (isAuthenticated()) {
      const profile = getUserDetails();
      const currentUserId = profile?.id || profile?._id;
      const currentUserName = profile?.displayName || profile?.name || "User";

      if (!currentUserId) {
        localStorage.setItem("initiateChatWithAstrologerId", _id);
        router.push("/login");
        // Reset after navigation
        if (navigationTimeoutRef.current) {
          clearTimeout(navigationTimeoutRef.current);
        }
        navigationTimeoutRef.current = setTimeout(() => {
          isNavigatingRef.current = false;
        }, 2000);
        return;
      }

      // Show loading modal
      setShowChatConnectingModal(true);

      if (!isConnected) {
        // Go directly to chat page
        setTimeout(() => {
          setShowChatConnectingModal(false);
          router.push('/chat');
          // Reset after navigation
          if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
          }
          navigationTimeoutRef.current = setTimeout(() => {
            isNavigatingRef.current = false;
          }, 2000);
        }, 1500); // Show loading for at least 1.5 seconds
        return;
      }

      try {
        // Use createSession which will handle both creating and checking
        const sessionId = await createOrJoinSession(_id);

        if (sessionId) {
          setTimeout(() => {
            setShowChatConnectingModal(false);
            router.push(`/chat?sessionId=${sessionId}`);
            // Reset after navigation
            if (navigationTimeoutRef.current) {
              clearTimeout(navigationTimeoutRef.current);
            }
            navigationTimeoutRef.current = setTimeout(() => {
              isNavigatingRef.current = false;
            }, 2000);
          }, 1500); // Show loading for at least 1.5 seconds
        } else {
          setTimeout(() => {
            setShowChatConnectingModal(false);
            router.push('/chat');
            // Reset after navigation
            if (navigationTimeoutRef.current) {
              clearTimeout(navigationTimeoutRef.current);
            }
            navigationTimeoutRef.current = setTimeout(() => {
              isNavigatingRef.current = false;
            }, 2000);
          }, 1500);
        }
      } catch (error) {
        setTimeout(() => {
          setShowChatConnectingModal(false);
          router.push('/chat');
          // Reset after navigation
          if (navigationTimeoutRef.current) {
            clearTimeout(navigationTimeoutRef.current);
          }
          navigationTimeoutRef.current = setTimeout(() => {
            isNavigatingRef.current = false;
          }, 2000);
        }, 1500);
      }

    } else {
      localStorage.setItem("selectedAstrologerId", _id);
      localStorage.setItem("chatIntent", "1");
      router.push(`/calls/call1?astrologerId=${_id}`);
      // Reset after navigation
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
      navigationTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false;
      }, 2000);
    }
  };

  return (
    <>
      <div
        className="relative bg-white rounded-xl border pt-4 px-4 pb-1 cursor-pointer transition-all duration-300 hover:shadow-xl flex flex-col w-full mx-auto overflow-hidden"
        style={{
          borderColor: "#F7971E",
          boxShadow: "0 4px 16px rgba(247,151,30,0.15)",
        }}
        onClick={(e) => {
          // Only navigate if clicking directly on the card, not on buttons
          if ((e.target as HTMLElement).closest('button')) {
            return;
          }
          handleCardClick(e);
        }}
      >
        {/* 🎁 Free Call Banner - Show for non-logged-in users OR new logged-in users who haven't called */}
        {(!isAuthenticated() || (isAuthenticated() && !hasCompletedFreeCall)) && (
          <div
            className="absolute top-3 -right-10 w-[160px] bg-[#F7971E] text-white text-[11px] text-center font-bold py-[2px] rotate-[45deg] flex items-center justify-center shadow-md z-10 whitespace-normal leading-tight"
            style={{ transformOrigin: "center" }}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 1st Free Call
            {/* OFFER: <br /> FREE 1st CALL */}
          </div>
        )}

        {/* ⭐ Main Content */}
        <div className="flex gap-4 mb-3 relative z-10">
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
                borderColor: partner.status === "online"
                  ? "#10B981"
                  : partner.status === "busy"
                    ? "#F97316"
                    : partner.status === "offline"
                      ? "#EF4444"
                      : "#F7971E",
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  name
                )}&background=F7971E&color=fff&size=70`;
              }}
            />

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
            {/* Experience */}
            <div className="text-xs text-gray-500 mt-1">
              Exp: {age || experience || "1"} years
            </div>
            {/* Orders */}
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
            {/* Status Text */}
            {partner.status && (
              <div className="flex items-center gap-1 mt-1">
                <div
                  className={`w-2 h-2 rounded-full ${partner.status === "online"
                    ? "bg-green-500"
                    : partner.status === "busy"
                      ? "bg-orange-500"
                      : partner.status === "offline"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                ></div>
                <span
                  className={`text-xs font-medium capitalize ${partner.status === "online"
                    ? "text-green-600"
                    : partner.status === "busy"
                      ? "text-orange-600"
                      : partner.status === "offline"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                >
                  {partner.status}
                </span>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
              {partner.talksAbout?.slice(0, 3).join(", ") ||
                specializations?.join(", ") ||
                "Numerology, Vedic, Vastu"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(languages || partner.language)?.join(", ") || "Hindi, Bhojpuri"}
            </p>
            {isAuthenticated() && hasCompletedFreeCall && (
              <div className="text-sm font-bold text-gray-900 mt-1">₹ {rpm || 18}/min.</div>
            )}

            {/* 🎯 Action Buttons */}
            <div className="flex gap-3 mt-2 relative z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleChatClick(e);
                }}
                className="flex-[1.4] border border-[#F7971D] text-[#F7971D] rounded-md py-2 font-medium flex items-center justify-center gap-1.5 hover:bg-orange-50 transition"
                style={{ fontSize: '0.75rem' }}
                title="Chat"
              >
                <img src="/message.png" alt="Chat" className="w-[16px] h-[16px]" />
                Chat
              </button>

              {/* Call Dropdown */}
              <div className="relative flex-[0.8] flex">
                <button
                  ref={callButtonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (source === "callWithAstrologer") {
                      handleCallModalClick(e);
                    } else if (isAuthenticated() && hasCompletedFreeCall) {
                      // After first call, directly trigger audio call
                      handleAudioCallButtonClick(e);
                    } else {
                      // Before first call or not logged in, show dropdown menu
                      setIsCallMenuOpen((prev) => !prev);
                    }
                  }}
                  className="w-full rounded-lg py-2 text-xs font-medium flex items-center justify-center gap-1.5 text-white shadow-md transition"
                  style={{
                    background: "linear-gradient(90deg, #F9A43A 0%, #F7971E 100%)",
                  }}
                  title={isAuthenticated() && hasCompletedFreeCall ? "Audio Call" : "1st FREE Call"}
                >
                  {isAuthenticated() && hasCompletedFreeCall ? (
                    <img src="/call-icon.svg" alt="Audio Call" className="w-4 h-4" />
                  ) : (
                    <span>FREE 1st Call</span>
                  )}
                </button>

                {isCallMenuOpen && (!isAuthenticated() || !hasCompletedFreeCall) && (
                  <div
                    ref={callMenuRef}
                    className="absolute bottom-full left-0 mb-2 w-full bg-white border rounded-lg shadow-lg z-50 overflow-hidden"
                  >
                    <button
                      onClick={handleAudioCallButtonClick}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                    >
                      <img src="/call-icon.svg" alt="Call" className="w-4 h-4" />
                      Audio Call
                    </button>
                    {(partner.isVideoCallAllowed || partner.isVideoCallAllowedAdmin) && (
                      <button
                        onClick={handleVideoCall}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 flex items-center gap-2"
                      >
                        <Video className="w-4 h-4 text-blue-500" />
                        Video Call
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Video Call Button - Shows after first call (only for logged-in users who have called and if astrologer supports video) */}
              {isAuthenticated() && hasCompletedFreeCall && (partner.isVideoCallAllowed || partner.isVideoCallAllowedAdmin) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVideoCall(e);
                  }}
                  className="flex-[0.8] rounded-lg py-2 text-xs font-medium flex items-center justify-center text-white shadow-md transition"
                  style={{
                    background: "linear-gradient(90deg, #F9A43A 0%, #F7971E 100%)",
                  }}
                  title="Video Call"
                >
                  <Video className="w-4 h-4" />
                </button>
              )}
            </div>
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
