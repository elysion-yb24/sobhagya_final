import { getApiBaseUrl } from "../config/api";
import CallWithAstrologerClient from "./CallWithAstrologerClient";
import { getSampleAstrologersResponse } from "../data/sampleAstrologers";

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
    
    console.log("Fetching initial astrologers from:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      
      next: { revalidate: 300 }, 
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log("API Response:", data);

    if (data.success && data.data?.list) {
      return data.data.list;
    } else {
      return [];
    }
  } catch (err) {
    console.error("API failed, using sample data:", err);
    
    // Use sample data when API fails
    try {
      const sampleResponse = getSampleAstrologersResponse(0, 10);
      const sampleAstrologers = sampleResponse.data.list;
      
      // Convert sample data to match the expected format
      return sampleAstrologers.map(astrologer => ({
        ...astrologer,
        experience: astrologer.experience.toString(),
        callsCount: Math.floor(Math.random() * 1000) + 100, // Random call count
        rating: {
          avg: astrologer.rating,
          count: astrologer.totalReviews,
          max: 5,
          min: 1
        },
        hasVideo: true,
        about: astrologer.bio,
        age: Math.floor(Math.random() * 30) + 35 // Random age between 35-65
      }));
    } catch (sampleErr) {
      console.error("Sample data also failed:", sampleErr);
      throw new Error("Failed to fetch astrologers");
    }
  }
}


const AstrologerCallPage = async () => {
  let initialAstrologers: Astrologer[] = [];
  let error: string | null = null;

  try {
    initialAstrologers = await fetchInitialAstrologers();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch astrologers";
  }

  return (
    <div className="w-full bg-white min-h-screen">
      {/* 🔮 Header / Banner */}
    

      {/* Client component */}
      <CallWithAstrologerClient
        initialAstrologers={initialAstrologers}
        error={error}
      />
    </div>
  );

};

export default AstrologerCallPage;
