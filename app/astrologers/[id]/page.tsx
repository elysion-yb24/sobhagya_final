import { notFound } from "next/navigation";
import astrologersData from "@/app/data/astrologers_data.json";

interface Astrologer {
  ID: string;
  Name: string;
  Languages: string[];
  Specializations: string[];
  Experience: string;
  Calls: number;
  Ratings: number;
  Reviews?: string[];
  "Profile Image"?: string;
  "About Me"?: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function AstrologerDetailsPage({ params }: PageProps) {
  const { id } = params;

  // 1) Find astrologer by ID
  const astrologer = astrologersData.find((ast) => ast.ID === id);

  // 2) If astrologer is not found, return a 404 page
  if (!astrologer) {
    notFound();
    return null; // Ensures TypeScript doesn't complain about further access
  }

  // 3) Extract properties safely
  const {
    Name,
    Languages,
    Specializations,
    Experience,
    Calls,
    Ratings,
    Reviews = [],
    "Profile Image": profileImg = "/default-profile.png", // Default if missing
    "About Me": aboutMe = "No about information available." // Default if missing
  } = astrologer;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-md shadow p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-4">
          <img
            src={profileImg}
            alt={Name}
            className="w-20 h-20 rounded-full object-cover border-2 border-orange-500"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">{Name}</h1>
            <div className="text-yellow-500 text-sm">
              ★ {Ratings?.toFixed(1)} / 5.0
            </div>
            <p className="text-green-600 font-semibold mt-1">ONLINE</p>
          </div>
        </div>

        <hr className="my-4" />

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Experience</h3>
            <p className="text-gray-800">{Experience}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Calls</h3>
            <p className="text-gray-800">{Calls}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Languages</h3>
            <p className="text-gray-800">{Languages?.join(", ") || "N/A"}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase">Specializations</h3>
            <p className="text-gray-800">{Specializations?.join(", ") || "N/A"}</p>
          </div>
        </div>

        {/* About Me */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">About Me</h2>
          <p className="text-gray-700">{aboutMe}</p>
        </div>

        {/* Reviews */}
        {Reviews.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Reviews</h2>
            <div className="space-y-2">
              {Reviews.map((review, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-md text-gray-700"
                >
                  {review}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-md font-semibold">
          Start Call for FREE
        </button>
      </div>
    </div>
  );
}
