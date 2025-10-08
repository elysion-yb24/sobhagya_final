// Sample astrologer data for frontend development and testing
export interface SampleAstrologer {
  _id: string;
  name: string;
  profileImage: string;
  specializations: string[];
  languages: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  isOnline: boolean;
  isLive: boolean;
  audioRpm: number;
  videoRpm: number;
  chatRpm: number;
  bio: string;
  about: string;
  skills: string[];
  achievements: string[];
}

export const sampleAstrologers: SampleAstrologer[] = [
  {
    _id: "sample_1",
    name: "Sahil Mehta",
    profileImage: "/astrologer.svg",
    specializations: ["Tarrot reading", "Pranic healing", "Vedic", "Horoscope Readings"],
    languages: ["Hindi", "Sanskrit", "English"],
    experience: 2,
    rating: 4.5,
    totalReviews: 150,
    isOnline: true,
    isLive: false,
    audioRpm: 108,
    videoRpm: 150,
    chatRpm: 15,
    bio: "Astrologer Sahil Mehta is a renowned expert in Tarrot reading, Pranic healing, Vedic astrology, horoscope readings, and spiritual guidance.",
    about: "Astrologer Sahil Mehta is a renowned expert in Tarrot reading, Pranic healing, Vedic astrology, horoscope readings, and spiritual guidance. With years of experience, he provides deep insights into love, career, health, and life challenges. His accurate predictions and effective remedies have helped countless individuals find clarity and success. Whether you seek answers about your future or solutions to obstacles, Sahil Mehta offers personalized consultations to align your life with cosmic energies.",
    skills: ["Birth Chart Analysis", "Career Prediction", "Marriage Matching", "Remedial Solutions"],
    achievements: ["Gold Medal in Astrology", "1000+ Successful Predictions", "Featured in Astrology Magazine"]
  },
  {
    _id: "sample_2",
    name: "Dr. Priya Gupta",
    profileImage: "/astrologer.svg",
    specializations: ["Numerology", "Palmistry", "Health Astrology"],
    languages: ["Hindi", "English", "Gujarati"],
    experience: 12,
    rating: 4.9,
    totalReviews: 892,
    isOnline: true,
    isLive: true,
    audioRpm: 30,
    videoRpm: 60,
    chatRpm: 20,
    bio: "Renowned numerologist and palmist specializing in health predictions and life path guidance.",
    about: "With expertise in numerology and palmistry, I provide accurate predictions about health, career, and personal life. My clients appreciate my detailed analysis and practical advice.",
    skills: ["Numerology", "Palm Reading", "Health Predictions", "Life Path Analysis"],
    achievements: ["PhD in Numerology", "500+ Health Predictions", "TV Astrologer"]
  },
  {
    _id: "sample_3",
    name: "Acharya Vikram Singh",
    profileImage: "/astrologer.svg",
    specializations: ["Kundli Analysis", "Vastu Shastra", "Gemstone Consultation"],
    languages: ["Hindi", "English", "Punjabi"],
    experience: 20,
    rating: 4.7,
    totalReviews: 2156,
    isOnline: false,
    isLive: false,
    audioRpm: 35,
    videoRpm: 70,
    chatRpm: 25,
    bio: "Senior astrologer with expertise in Kundli analysis, Vastu consultation, and gemstone recommendations.",
    about: "I have been practicing astrology for over 20 years and specialize in detailed Kundli analysis. My Vastu consultations have helped many families improve their living conditions and prosperity.",
    skills: ["Kundli Reading", "Vastu Consultation", "Gemstone Selection", "Remedial Measures"],
    achievements: ["20+ Years Experience", "Vastu Expert Certification", "2000+ Kundli Analysis"]
  },
  {
    _id: "sample_4",
    name: "Swami Ananda",
    profileImage: "/astrologer.svg",
    specializations: ["Spiritual Guidance", "Meditation", "Mantra Chanting"],
    languages: ["Hindi", "English", "Sanskrit"],
    experience: 25,
    rating: 4.9,
    totalReviews: 1876,
    isOnline: true,
    isLive: false,
    audioRpm: 40,
    videoRpm: 80,
    chatRpm: 30,
    bio: "Spiritual guide and meditation expert providing deep insights into life's spiritual aspects and inner peace.",
    about: "As a spiritual guide, I help people find inner peace and spiritual growth through meditation, mantra chanting, and spiritual counseling. My guidance is based on ancient wisdom and modern understanding.",
    skills: ["Spiritual Counseling", "Meditation Guidance", "Mantra Chanting", "Inner Peace"],
    achievements: ["Spiritual Master", "Meditation Teacher", "1500+ Spiritual Consultations"]
  },
  {
    _id: "sample_5",
    name: "Jyotishi Meera Joshi",
    profileImage: "/astrologer.svg",
    specializations: ["Love & Relationship", "Family Problems", "Child Astrology"],
    languages: ["Hindi", "English", "Marathi"],
    experience: 18,
    rating: 4.8,
    totalReviews: 1456,
    isOnline: true,
    isLive: true,
    audioRpm: 28,
    videoRpm: 55,
    chatRpm: 18,
    bio: "Specialist in love, relationship, and family astrology with expertise in resolving marital and family issues.",
    about: "I specialize in relationship astrology and have helped countless couples resolve their differences and strengthen their bonds. My expertise in family astrology helps in understanding family dynamics.",
    skills: ["Love Predictions", "Marriage Counseling", "Family Astrology", "Child Guidance"],
    achievements: ["Relationship Expert", "Family Counselor", "1000+ Marriage Consultations"]
  },
  {
    _id: "sample_6",
    name: "Pandit Suresh Kumar",
    profileImage: "/astrologer.svg",
    specializations: ["Business Astrology", "Financial Planning", "Investment Guidance"],
    languages: ["Hindi", "English", "Tamil"],
    experience: 22,
    rating: 4.6,
    totalReviews: 987,
    isOnline: false,
    isLive: false,
    audioRpm: 45,
    videoRpm: 90,
    chatRpm: 35,
    bio: "Business astrologer specializing in financial predictions, investment guidance, and business success strategies.",
    about: "I help business owners and investors make informed financial decisions through astrological analysis. My predictions focus on business growth, investment timing, and financial planning.",
    skills: ["Business Predictions", "Financial Astrology", "Investment Timing", "Business Growth"],
    achievements: ["Business Astrology Expert", "Financial Advisor", "500+ Business Consultations"]
  }
];

// Helper function to simulate API response format
export const getSampleAstrologersResponse = (skip: number = 0, limit: number = 10) => {
  const startIndex = skip;
  const endIndex = skip + limit;
  const paginatedData = sampleAstrologers.slice(startIndex, endIndex);
  
  return {
    success: true,
    data: {
      list: paginatedData,
      total: sampleAstrologers.length,
      hasMore: endIndex < sampleAstrologers.length
    }
  };
};
