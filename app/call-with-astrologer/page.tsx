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

// ✅ Fetch only first page server-side
async function fetchInitialAstrologers(): Promise<Astrologer[]> {
  try {
    const baseUrl = getApiBaseUrl();
<<<<<<< HEAD
    let skip = 0;
    const limit = 10;
    let allData: Astrologer[] = [];
    let hasMore = true;

    while (hasMore) {
      const apiUrl = `${baseUrl}/user/api/users-list?skip=${skip}&limit=${limit}`;
      console.log("Fetching astrologers from:", apiUrl);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        // Add cache options for better performance
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success && data.data?.list) {
        const batch = data.data.list;
        allData = [...allData, ...batch];
        hasMore = batch.length === limit;
        skip += limit;
      } else {
        hasMore = false;
      }
    }

    return allData;
=======
    const limit = 10;
    const apiUrl = `${baseUrl}/user/api/users-list?skip=0&limit=${limit}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    return data.success && data.data?.list ? data.data.list : [];
>>>>>>> 700e6bc (new changes sobhagya)
  } catch (err) {
    console.error("Error fetching astrologers:", err);
    throw new Error("Failed to fetch astrologers");
  }
}

// ✅ Main page component - server component
const AstrologerCallPage = async () => {
  let initialAstrologers: Astrologer[] = [];
  let error: string | null = null;

  try {
    initialAstrologers = await fetchInitialAstrologers();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch astrologers";
  }

<<<<<<< HEAD
  // ✅ You can safely put your header/banner JSX here
  return (
    <div className="w-full bg-white min-h-screen">
      {/* Enhanced Header banner */}
      {/* (your <motion.div> block goes here if you want the banner visible on the page) */}

      {/* Client component */}
      <CallWithAstrologerClient astrologers={allAstrologers} error={error} />
    </div>
=======
  return (
    <CallWithAstrologerClient
      initialAstrologers={initialAstrologers}
      error={error}
    />
>>>>>>> 700e6bc (new changes sobhagya)
  );
};

export default AstrologerCallPage;
