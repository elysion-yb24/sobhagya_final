import { getApiBaseUrl } from "../config/api";
import CallWithAstrologerClient from "./CallWithAstrologerClient";

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


async function fetchInitialAstrologers(): Promise<Astrologer[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const limit = 10; 
    const apiUrl = `${baseUrl}/user/api/users-list?skip=0&limit=${limit}`;
    
    console.log("Server: Fetching initial astrologers from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store", // Don't cache to always get fresh data
    });

    if (!response.ok) {
      console.error(`Server: HTTP error! status: ${response.status}`);
      return []; // Return empty array instead of throwing
    }

    const data = await response.json();
    console.log("Server: API Response:", data);

    if (data.success && data.data?.list) {
      return data.data.list;
    } else {
      console.warn("Server: Unexpected response format:", data);
      return [];
    }
  } catch (err) {
    console.error("Server: Failed to fetch astrologers:", err);
    // Return empty array instead of throwing - let client handle fetching
    return [];
  }
}


const AstrologerCallPage = async () => {
  // Try to fetch initial astrologers on server, but don't fail if it doesn't work
  // The client component will handle fetching if server fetch fails
  const initialAstrologers = await fetchInitialAstrologers();

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Client component */}
      <CallWithAstrologerClient
        initialAstrologers={initialAstrologers}
        error={initialAstrologers.length === 0 ? null : null} // Let client handle errors
      />
    </div>
  );

};

export default AstrologerCallPage;
