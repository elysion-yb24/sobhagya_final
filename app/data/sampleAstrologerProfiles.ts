// Sample astrologer profile data for frontend development and testing
export interface SampleAstrologerProfile {
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
  age?: number;
  gender?: string;
  location?: string;
  education?: string[];
  certifications?: string[];
  callCount?: number;
  responseTime?: string;
  availability?: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  reviews?: Array<{
    _id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
    callType: string;
  }>;
  gifts?: Array<{
    _id: string;
    name: string;
    price: number;
    image: string;
    description: string;
  }>;
  similarAstrologers?: string[];
}

export const sampleAstrologerProfiles: { [key: string]: SampleAstrologerProfile } = {
  "sample_1": {
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
    skills: ["Birth Chart Analysis", "Career Prediction", "Marriage Matching", "Remedial Solutions", "Muhurta Selection"],
    achievements: ["Gold Medal in Astrology", "1000+ Successful Predictions", "Featured in Astrology Magazine", "Certified Vedic Astrologer"],
    age: 45,
    gender: "Male",
    location: "Delhi, India",
    education: ["M.A. in Sanskrit", "Diploma in Vedic Astrology", "Certificate in Jyotish"],
    certifications: ["Certified Vedic Astrologer", "Member of Astrological Society of India"],
    callCount: 580,
    responseTime: "Within 2 hours",
    availability: {
      monday: { start: "09:00", end: "21:00", available: true },
      tuesday: { start: "09:00", end: "21:00", available: true },
      wednesday: { start: "09:00", end: "21:00", available: true },
      thursday: { start: "09:00", end: "21:00", available: true },
      friday: { start: "09:00", end: "21:00", available: true },
      saturday: { start: "10:00", end: "18:00", available: true },
      sunday: { start: "10:00", end: "18:00", available: true }
    },
    reviews: [
      {
        _id: "review_1",
        userName: "Priya Sharma",
        rating: 5,
        comment: "Excellent guidance for my career decisions. Very accurate predictions!",
        date: "2024-01-15",
        callType: "video"
      },
      {
        _id: "review_2",
        userName: "Rahul Kumar",
        rating: 4,
        comment: "Great marriage compatibility analysis. Helped me understand my relationship better.",
        date: "2024-01-10",
        callType: "audio"
      },
      {
        _id: "review_3",
        userName: "Sneha Patel",
        rating: 5,
        comment: "Amazing astrologer! His predictions about my job change were spot on.",
        date: "2024-01-05",
        callType: "chat"
      }
    ],
    gifts: [
      {
        _id: "gift_1",
        name: "Virtual Rose",
        price: 10,
        image: "/gifts/rose.png",
        description: "Send a beautiful virtual rose to show appreciation"
      },
      {
        _id: "gift_2",
        name: "Virtual Diamond",
        price: 100,
        image: "/gifts/diamond.png",
        description: "Premium virtual diamond gift"
      }
    ],
    similarAstrologers: ["sample_2", "sample_3"]
  },
  
  "sample_2": {
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
    about: "With expertise in numerology and palmistry, I provide accurate predictions about health, career, and personal life. My clients appreciate my detailed analysis and practical advice. I combine ancient wisdom with modern understanding to help people navigate life's challenges.",
    skills: ["Numerology", "Palm Reading", "Health Predictions", "Life Path Analysis", "Name Correction"],
    achievements: ["PhD in Numerology", "500+ Health Predictions", "TV Astrologer", "Best Palmist Award 2023"],
    age: 38,
    gender: "Female",
    location: "Mumbai, India",
    education: ["PhD in Numerology", "M.Sc. in Mathematics", "Certificate in Palmistry"],
    certifications: ["Certified Numerologist", "Professional Palmist", "Health Astrology Specialist"],
    callCount: 1800,
    responseTime: "Within 1 hour",
    availability: {
      monday: { start: "10:00", end: "22:00", available: true },
      tuesday: { start: "10:00", end: "22:00", available: true },
      wednesday: { start: "10:00", end: "22:00", available: true },
      thursday: { start: "10:00", end: "22:00", available: true },
      friday: { start: "10:00", end: "22:00", available: true },
      saturday: { start: "11:00", end: "19:00", available: true },
      sunday: { start: "11:00", end: "19:00", available: true }
    },
    reviews: [
      {
        _id: "review_4",
        userName: "Amit Singh",
        rating: 5,
        comment: "Dr. Priya's numerology analysis changed my life! Highly recommended.",
        date: "2024-01-12",
        callType: "video"
      },
      {
        _id: "review_5",
        userName: "Kavya Reddy",
        rating: 5,
        comment: "Amazing palm reading session. Very detailed and accurate insights.",
        date: "2024-01-08",
        callType: "audio"
      }
    ],
    gifts: [
      {
        _id: "gift_3",
        name: "Virtual Lotus",
        price: 25,
        image: "/gifts/lotus.png",
        description: "Sacred lotus flower for spiritual blessings"
      }
    ],
    similarAstrologers: ["sample_1", "sample_4"]
  },

  "sample_3": {
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
    about: "I have been practicing astrology for over 20 years and specialize in detailed Kundli analysis. My Vastu consultations have helped many families improve their living conditions and prosperity. I provide comprehensive astrological guidance for all aspects of life.",
    skills: ["Kundli Reading", "Vastu Consultation", "Gemstone Selection", "Remedial Measures", "Muhurta"],
    achievements: ["20+ Years Experience", "Vastu Expert Certification", "2000+ Kundli Analysis", "Gemstone Specialist"],
    age: 52,
    gender: "Male",
    location: "Punjab, India",
    education: ["Acharya in Jyotish", "Vastu Shastra Diploma", "Gemology Certificate"],
    certifications: ["Senior Astrologer", "Vastu Consultant", "Gemstone Expert"],
    callCount: 3500,
    responseTime: "Within 3 hours",
    availability: {
      monday: { start: "08:00", end: "20:00", available: true },
      tuesday: { start: "08:00", end: "20:00", available: true },
      wednesday: { start: "08:00", end: "20:00", available: true },
      thursday: { start: "08:00", end: "20:00", available: true },
      friday: { start: "08:00", end: "20:00", available: true },
      saturday: { start: "09:00", end: "17:00", available: true },
      sunday: { start: "09:00", end: "17:00", available: true }
    },
    reviews: [
      {
        _id: "review_6",
        userName: "Deepak Verma",
        rating: 5,
        comment: "Excellent Kundli analysis! Acharya Vikram is very knowledgeable and helpful.",
        date: "2024-01-14",
        callType: "video"
      },
      {
        _id: "review_7",
        userName: "Sunita Mehta",
        rating: 4,
        comment: "Great Vastu consultation. Our home energy has improved significantly.",
        date: "2024-01-09",
        callType: "audio"
      }
    ],
    gifts: [
      {
        _id: "gift_4",
        name: "Virtual Rudraksha",
        price: 50,
        image: "/gifts/rudraksha.png",
        description: "Sacred Rudraksha for spiritual protection"
      }
    ],
    similarAstrologers: ["sample_1", "sample_5"]
  },

  "sample_4": {
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
    about: "As a spiritual guide, I help people find inner peace and spiritual growth through meditation, mantra chanting, and spiritual counseling. My guidance is based on ancient wisdom and modern understanding. I have dedicated my life to helping others achieve spiritual enlightenment.",
    skills: ["Spiritual Counseling", "Meditation Guidance", "Mantra Chanting", "Inner Peace", "Chakra Healing"],
    achievements: ["Spiritual Master", "Meditation Teacher", "1500+ Spiritual Consultations", "Yoga Guru"],
    age: 58,
    gender: "Male",
    location: "Rishikesh, India",
    education: ["Spiritual Studies", "Yoga Teacher Training", "Meditation Certification"],
    certifications: ["Spiritual Master", "Yoga Guru", "Meditation Teacher"],
    callCount: 2200,
    responseTime: "Within 4 hours",
    availability: {
      monday: { start: "06:00", end: "18:00", available: true },
      tuesday: { start: "06:00", end: "18:00", available: true },
      wednesday: { start: "06:00", end: "18:00", available: true },
      thursday: { start: "06:00", end: "18:00", available: true },
      friday: { start: "06:00", end: "18:00", available: true },
      saturday: { start: "07:00", end: "16:00", available: true },
      sunday: { start: "07:00", end: "16:00", available: true }
    },
    reviews: [
      {
        _id: "review_8",
        userName: "Ravi Krishnan",
        rating: 5,
        comment: "Swami Ananda's spiritual guidance has transformed my life. Truly blessed!",
        date: "2024-01-13",
        callType: "video"
      }
    ],
    gifts: [
      {
        _id: "gift_5",
        name: "Virtual Incense",
        price: 15,
        image: "/gifts/incense.png",
        description: "Sacred incense for spiritual purification"
      }
    ],
    similarAstrologers: ["sample_2", "sample_6"]
  },

  "sample_5": {
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
    about: "I specialize in relationship astrology and have helped countless couples resolve their differences and strengthen their bonds. My expertise in family astrology helps in understanding family dynamics and creating harmony in relationships.",
    skills: ["Love Predictions", "Marriage Counseling", "Family Astrology", "Child Guidance", "Relationship Healing"],
    achievements: ["Relationship Expert", "Family Counselor", "1000+ Marriage Consultations", "Child Astrology Specialist"],
    age: 42,
    gender: "Female",
    location: "Pune, India",
    education: ["M.A. in Psychology", "Diploma in Family Counseling", "Child Psychology Certificate"],
    certifications: ["Relationship Counselor", "Family Therapist", "Child Astrology Expert"],
    callCount: 1900,
    responseTime: "Within 1.5 hours",
    availability: {
      monday: { start: "09:30", end: "21:30", available: true },
      tuesday: { start: "09:30", end: "21:30", available: true },
      wednesday: { start: "09:30", end: "21:30", available: true },
      thursday: { start: "09:30", end: "21:30", available: true },
      friday: { start: "09:30", end: "21:30", available: true },
      saturday: { start: "10:00", end: "19:00", available: true },
      sunday: { start: "10:00", end: "19:00", available: true }
    },
    reviews: [
      {
        _id: "review_9",
        userName: "Anjali Desai",
        rating: 5,
        comment: "Meera ji helped save my marriage! Her relationship guidance is incredible.",
        date: "2024-01-11",
        callType: "video"
      }
    ],
    gifts: [
      {
        _id: "gift_6",
        name: "Virtual Heart",
        price: 20,
        image: "/gifts/heart.png",
        description: "Symbol of love and affection"
      }
    ],
    similarAstrologers: ["sample_3", "sample_6"]
  },

  "sample_6": {
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
    about: "I help business owners and investors make informed financial decisions through astrological analysis. My predictions focus on business growth, investment timing, and financial planning. I combine traditional astrology with modern business insights.",
    skills: ["Business Predictions", "Financial Astrology", "Investment Timing", "Business Growth", "Wealth Management"],
    achievements: ["Business Astrology Expert", "Financial Advisor", "500+ Business Consultations", "Investment Specialist"],
    age: 48,
    gender: "Male",
    location: "Chennai, India",
    education: ["MBA in Finance", "Diploma in Business Astrology", "Investment Analysis Certificate"],
    certifications: ["Business Astrologer", "Financial Consultant", "Investment Advisor"],
    callCount: 1200,
    responseTime: "Within 2.5 hours",
    availability: {
      monday: { start: "10:00", end: "19:00", available: true },
      tuesday: { start: "10:00", end: "19:00", available: true },
      wednesday: { start: "10:00", end: "19:00", available: true },
      thursday: { start: "10:00", end: "19:00", available: true },
      friday: { start: "10:00", end: "19:00", available: true },
      saturday: { start: "11:00", end: "17:00", available: true },
      sunday: { start: "11:00", end: "17:00", available: true }
    },
    reviews: [
      {
        _id: "review_10",
        userName: "Rajesh Agarwal",
        rating: 5,
        comment: "Pandit Suresh's business predictions helped me make profitable investments!",
        date: "2024-01-07",
        callType: "video"
      }
    ],
    gifts: [
      {
        _id: "gift_7",
        name: "Virtual Gold Coin",
        price: 75,
        image: "/gifts/gold-coin.png",
        description: "Symbol of wealth and prosperity"
      }
    ],
    similarAstrologers: ["sample_4", "sample_5"]
  }
};

// Helper function to get sample astrologer profile
export const getSampleAstrologerProfile = (id: string): SampleAstrologerProfile | null => {
  return sampleAstrologerProfiles[id] || null;
};

// Helper function to get sample reviews
export const getSampleReviews = (astrologerId: string) => {
  const profile = getSampleAstrologerProfile(astrologerId);
  return profile?.reviews || [];
};

// Helper function to get sample gifts
export const getSampleGifts = (astrologerId: string) => {
  const profile = getSampleAstrologerProfile(astrologerId);
  return profile?.gifts || [];
};

// Helper function to get similar astrologers
export const getSimilarAstrologers = (astrologerId: string) => {
  const profile = getSampleAstrologerProfile(astrologerId);
  if (!profile?.similarAstrologers) return [];
  
  return profile.similarAstrologers
    .map(id => getSampleAstrologerProfile(id))
    .filter(Boolean) as SampleAstrologerProfile[];
};
