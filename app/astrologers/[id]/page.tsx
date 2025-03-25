
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Update interface based on the actual API response structure
interface Astrologer {
  _id: string;
  name: string;
  languages?: string[];
  specializations?: string[];
  experience?: string;
  callsCount?: number;
  rating?: number;
  reviews?: Array<{ content: string; userId: string; rating: number }>;
  profileImage?: string;
  about?: string;
  isOnline?: boolean;
  // Add any other fields from the API
}

// Type for the page params
type PageParams = {
  id: string;
};

// Function to fetch astrologer data from API
async function getAstrologer(id: string): Promise<Astrologer> {
  const apiUrl = process.env.API_URL || 'https://micro.sobhagya.in';
  const authToken = process.env.API_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmM1YjBiNWRmMDczYTEwNjZiNmU0NTQiLCJpYXQiOjE3MjY0NzM1MTMsImV4cCI6MTcyNjQ3NDQxM30.e6R7FyWux3eTDafvBDQmcgVjz1fWiUAxo4_PCT6dLHQ';
  
  // In a production app, you'd use a secure way to manage tokens
  // For this endpoint, we might need to adjust the URL to get a specific astrologer
  const res = await fetch(`${apiUrl}/user/api/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store', // Disable caching for now until we understand the API better
  });
  
  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    // Handle other errors
    throw new Error(`Failed to fetch astrologer: ${res.status}`);
  }
  
  return res.json();
}

// Generate the type for the params
export async function generateStaticParams(): Promise<PageParams[]> {
  // In a real app, you might fetch the list of astrologers and return their IDs
  // For now, just return an empty array to satisfy the type system
  return [];
}

export default async function AstrologerDetailsPage({
  params,
}: {
  params: PageParams;
}) {
  const { id } = params;
  
  // Fetch data from API
  const astrologer = await getAstrologer(id);
  
  // Extract properties safely with new field names from API
  const {
    name,
    languages = [],
    specializations = [],
    experience = "Not specified",
    callsCount = 0,
    rating = 0,
    reviews = [],
    profileImage = "/default-profile.png",
    about = "No information available.",
    isOnline = false,
  } = astrologer;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-md shadow p-6">
        {/* Back button */}
        <Link 
          href="/astrologers"
          className="mb-4 flex items-center text-orange-500 hover:text-orange-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Astrologers
        </Link>
        
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative w-20 h-20">
            <Image
              src={profileImage}
              alt={name}
              fill
              className="rounded-full object-cover border-2 border-orange-500"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{name}</h1>
            <div className="text-yellow-500 text-sm">
              ★ {rating?.toFixed(1)} / 5.0
            </div>
            <p className={`${isOnline ? 'text-green-600' : 'text-gray-500'} font-semibold mt-1`}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </p>
          </div>
        </div>

        <hr className="my-4" />

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Experience</h3>
            <p className="text-gray-800">{experience}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Calls</h3>
            <p className="text-gray-800">{callsCount.toLocaleString()}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Languages</h3>
            <p className="text-gray-800">{languages?.join(", ") || "N/A"}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Specializations</h3>
            <p className="text-gray-800">{specializations?.join(", ") || "N/A"}</p>
          </div>
        </div>

        {/* About Me */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">About Me</h2>
          <p className="text-gray-700">{about}</p>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Reviews</h2>
            <div className="space-y-2">
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center mb-1">
                    <div className="text-yellow-500 mr-2">
                      {"★".repeat(Math.round(review.rating))}
                      {"☆".repeat(5 - Math.round(review.rating))}
                    </div>
                    <span className="text-sm text-gray-500">User: {review.userId}</span>
                  </div>
                  <p className="text-gray-700">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Button */}
        <StartCallButton astrologerId={id} astrologerName={name} isOnline={isOnline} />
      </div>
    </div>
  );
}

// Client component for the button
"use client";
function StartCallButton({ 
  astrologerId, 
  astrologerName, 
  isOnline 
}: { 
  astrologerId: string, 
  astrologerName: string,
  isOnline: boolean
}) {
  const handleStartCall = () => {
    if (!isOnline) {
      alert("This astrologer is currently offline. Please try again later.");
      return;
    }
    
    // Implement call functionality or redirect to call page
    console.log(`Starting call with ${astrologerName} (ID: ${astrologerId})`);
    // You could redirect to a call page
    // window.location.href = `/call/${astrologerId}`;
  };

  return (
    <button 
      onClick={handleStartCall}
      className={`w-full py-3 rounded-md font-semibold transition ${
        isOnline 
          ? 'bg-orange-500 hover:bg-orange-600 text-white' 
          : 'bg-gray-300 text-gray-600 cursor-not-allowed'
      }`}
      aria-label={`Start a call with ${astrologerName}`}
      disabled={!isOnline}
    >
      {isOnline ? "Start Call for FREE" : "Astrologer Offline"}
    </button>
  );
}