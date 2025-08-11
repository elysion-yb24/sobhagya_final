"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call7() {
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isValidCity, setIsValidCity] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Comprehensive list of Indian cities
  const cityList = [
    // Major Metro Cities
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Patna", "Vadodara", "Rajkot",
    "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Kalyan", "Vasai-Virar", "Varanasi", "Srinagar",
    "Aurangabad", "Navi Mumbai", "Solapur", "Ranchi", "Jabalpur", "Gwalior", "Coimbatore", "Vijayawada", "Jodhpur", "Madurai",
    "Raipur", "Kota", "Guwahati", "Chandigarh", "Mysore", "Bareilly", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar",
    "Salem", "Warangal", "Guntur", "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida", "Jamshedpur",
    "Bhilai", "Cuttack", "Firozabad", "Kochi", "Nellore", "Bhavnagar", "Dehradun", "Durgapur", "Asansol", "Rourkela",
    "Nanded", "Kolhapur", "Ajmer", "Akola", "Jamnagar", "Ujjain", "Loni", "Siliguri", "Jhansi", "Ulhasnagar",
    "Jammu", "Mangalore", "Erode", "Belgaum", "Ambattur", "Tirunelveli", "Malegaon", "Gaya", "Jalgaon", "Maheshtala",
    "Tiruppur", "Davangere", "Kozhikode", "Akbarpur", "Bokaro", "Shahjahanpur", "Mirzapur", "Supaul", "Prayagraj", "Haldwani",
    "Bilaspur", "Dhanbad", "Amritsar", "Haora", "New Delhi", "Puducherry", "Shimla", "Puri", "Murtazabad", "Shrirampur",
    "Chandannagar", "Sultanpur Mazra", "Krishnanagar", "Barakpur", "Bhalswa Jahangirpur", "Nangloi Jat", "Balasore", "Dalupura",
    "Yelahanka", "Titagarh", "Dam Dam", "Bansbaria", "Madhavaram", "Abbigeri", "Baj Baj", "Garhi", "Mirpeta", "Nerkunram",
    "Kendrapada", "Sijua", "Manali", "Kankuria", "Chakapara", "Pappakurichchi", "Herohalli", "Madipakkam", "Sabalpur", "Bauria",
    "Salua", "Chik Banavar", "Jalhalli", "Chinnasekkadu", "Jethuli", "Nagtala", "Pakri", "Hunasamaranhalli", "Hesarghatta", "Bommayapalaiyam",
    "Gundur", "Punadih", "Hariladih", "Alawalpur", "Madnaikanhalli", "Bagalur", "Kadiganahalli", "Khanpur Zabti", "Mahuli", "Zeyadah Kot",
    "Arshakunti", "Mirchi", "Sonudih", "Bayandhalli", "Sondekoppa", "Babura", "Madavar", "Kadabgeri", "Nanmangalam", "Taliganja",
    "Tarchha", "Belgharia", "Kammanhalli", "Ambapuram", "Sonnappanhalli", "Kedihati", "Doddajivanhalli", "Simli Murarpur", "Sonawan", "Devanandapur",
    "Tribeni", "Huttanhalli", "Nathupur", "Bali", "Vajarhalli", "Alija Kotla", "Saino", "Shekhpura", "Cachohalli", "Andheri",
    "Narayanpur Kola", "Gyan Chak", "Kasgatpur", "Kitanelli", "Harchandi", "Santoshpur", "Bendravadi", "Kodagihalli", "Harna Buzurg", "Mailanhalli",
    "Sultampur", "Adakimaranhalli", "Secunderabad", "Pallavaram", "Byatarayanpur", "Tiruvottiyur", "Muzaffarpur", "Oulgaret", "Salt Lake City", "Bhatpara",
    "Kukatpalli", "Dasarhalli", "Kalyan-Dombivali", "Pimpri-Chinchwad", "Vishakhapatnam", "Prayagraj", "Nāsik", "Kalyān", "Najafgarh", "Bhayandar"
  ];

  useEffect(() => {
    // Log the stored astrologer ID for debugging
    const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
    if (storedAstrologerId) {
      console.log('Call7: Found stored astrologer ID:', storedAstrologerId);
    } else {
      console.log('Call7: No stored astrologer ID found');
    }
  }, []);

  const handlePlaceChange = (e) => {
    const value = e.target.value;
    setPlaceOfBirth(value);
    
    if (value.trim()) {
      // Filter cities based on input
      const filtered = cityList.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowDropdown(true);
      
      // Check if the entered value matches a city exactly
      const exactMatch = cityList.find(city => 
        city.toLowerCase() === value.toLowerCase()
      );
      setIsValidCity(!!exactMatch);
    } else {
      setFilteredCities([]);
      setShowDropdown(false);
      setIsValidCity(false);
    }
  };

  const handleCitySelect = (city) => {
    setPlaceOfBirth(city);
    setShowDropdown(false);
    setIsValidCity(true);
  };

  const handleNext = () => {
    if (placeOfBirth.trim() && isValidCity) {
      // Store the place of birth in localStorage for the next step
      localStorage.setItem('userPlaceOfBirth', placeOfBirth.trim());
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call8");
      }, 100);
    }
  };

  const handleBack = () => {
    // Check if user knows birth time to determine where to go back
    const knowBirthTime = localStorage.getItem('knowBirthTime');
    if (knowBirthTime === "yes") {
      router.push("/calls/call6");
    } else {
      router.push("/calls/call5");
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-9">
      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call7-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="w-full max-w-[1141px] h-[600px] bg-[#FCF4E9] rounded-lg p-8 shadow-lg"
          >
            <Head>
              <title>Guidance Form</title>
              <meta name="description" content="Guidance request form" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Title */}
            <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-medium font-['Poppins'] text-center text-gray-800 text-2xl mb-8 mt-[50px]"
            >
              Enter Your Details
            </motion.h1>

            {/* Progress Bar with 8 steps */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative mb-10"
            >
              <div className="h-1 bg-gray-300 w-full rounded-full">
                <motion.div 
                  className="h-1 bg-[#F7971D] rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "87.5%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                ></motion.div>
              </div>

              <div className="flex justify-between absolute w-full top-0 transform -translate-y-1/2">
                {[...Array(8)].map((_, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className={`w-3 h-3 rounded-full ${
                      index < 7 ? "bg-[#F7971D]" : "bg-gray-300"
                    }`}
                  ></motion.div>
                ))}
              </div>
            </motion.div>

            {/* Main Question */}
            <motion.h2 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-xl font-normal text-center text-[#373737] mb-10 mt-16"
            >
              What is your place of birth?
            </motion.h2>

            {/* Place Input Field with Dropdown */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="w-full max-w-md mx-auto mb-24 mt-8 relative"
            >
              <input
                type="text"
                value={placeOfBirth}
                onChange={handlePlaceChange}
                onFocus={() => {
                  if (placeOfBirth.trim()) {
                    setShowDropdown(true);
                  }
                }}
                className={`w-full h-16 px-6 py-4 bg-white rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-md text-lg font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-orange-100 ${
                  isValidCity 
                    ? "border-green-500" 
                    : placeOfBirth.trim() 
                    ? "border-red-500" 
                    : "border-gray-200 focus:border-[#F7971D]"
                }`}
                placeholder="Enter your place of birth"
              />
              
              {/* City Dropdown */}
              {showDropdown && filteredCities.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 w-full bg-white border-2 border-gray-200 rounded-xl shadow-xl mt-2 max-h-52 overflow-y-auto z-20"
                >
                  {filteredCities.map((city, index) => (
                    <div
                      key={index}
                      className="px-6 py-3 cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Validation Message */}
              {placeOfBirth.trim() && !isValidCity && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 text-sm mt-2 text-center"
                >
                  Please select a valid city from the dropdown
                </motion.p>
              )}

              {/* Success Message - REMOVED */}
            </motion.div>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex justify-center gap-4"
            >
              <button
                type="button"
                onClick={handleBack}
                className="w-[120px] px-6 py-3 text-[#F7971D] font-semibold rounded-lg border-2 border-[#F7971D] transition-all duration-300 hover:bg-[#F7971D] hover:text-white"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleNext}
                disabled={!placeOfBirth.trim() || !isValidCity}
                className={`w-[203px] px-8 py-4 text-white font-semibold rounded-lg h-[72px] text-[25px] transition-all duration-300 ${
                  placeOfBirth.trim() && isValidCity
                    ? "bg-[#F7971D] hover:bg-[#E88A1A]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


