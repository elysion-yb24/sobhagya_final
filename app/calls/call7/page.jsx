"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter, useSearchParams } from "next/navigation";

export default function Call7() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [location, setLocation] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetching Indian cities dynamically from an API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/population/cities");
        const data = await response.json();
        if (data && data.data) {
          const indianCities = data.data
            .filter((city) => city.country === "India")
            .map((city) => city.city);
          setLocationOptions(indianCities);
          setFilteredOptions(indianCities);
        }
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    fetchLocations();
  }, []);

  // Filter locations dynamically based on user input
  const handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setLocation(e.target.value);
    if (searchQuery.length > 0) {
      setShowDropdown(true);
      const filtered = locationOptions.filter((city) =>
        city.toLowerCase().includes(searchQuery)
      );
      setFilteredOptions(filtered);
    } else {
      setShowDropdown(false);
    }
  };

  // Check for astrologer ID from query params or localStorage
  useEffect(() => {
    const astrologerId = searchParams.get('astrologerId');
    if (astrologerId) {
      console.log('Call7: Found astrologer ID in query params:', astrologerId);
      localStorage.setItem('selectedAstrologerId', astrologerId);
    } else {
      // Check localStorage as fallback
      const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
      if (storedAstrologerId) {
        console.log('Call7: Found stored astrologer ID:', storedAstrologerId);
      } else {
        console.log('Call7: No astrologer ID found');
      }
    }
  }, [searchParams]);

  // Select a city and close the dropdown
  const handleSelectCity = (city) => {
    setLocation(city);
    setShowDropdown(false);
  };

  const handleNext = () => {
    if (location) {
      setIsExiting(true);
      setTimeout(() => {
        // Check if we have a stored astrologer ID and pass it to call8
        const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
        if (storedAstrologerId) {
          console.log('Call7: Passing astrologer ID to call8:', storedAstrologerId);
          router.push(`/calls/call8?astrologerId=${storedAstrologerId}`);
        } else {
          router.push("/calls/call8");
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-orange-100/50 to-white"></div>
      
      {/* Subtle Astrology Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-400 rounded-full blur-xl"></div>
        <div className="absolute top-1/4 right-20 w-16 h-16 bg-orange-300 rounded-full blur-lg"></div>
        <div className="absolute bottom-1/3 left-1/4 w-12 h-12 bg-orange-200 rounded-full blur-md"></div>
      </div>

      <AnimatePresence mode="wait">
        {!isExiting && (
          <motion.div
            key="call7-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: "-100%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative z-10"
          >
            <Head>
              <title>Guidance Form</title>
              <meta name="description" content="Guidance request form" />
              <link rel="icon" href="/favicon.ico" />
            </Head>

            {/* Premium Card Container */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl 
                         px-6 sm:px-8 md:px-10 lg:px-12 
                         py-8 sm:py-10 md:py-12
                         bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-200/50 
                         flex flex-col relative overflow-hidden"
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 to-transparent rounded-2xl"></div>
              
            {/* Title */}
              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="font-bold text-center text-gray-800 
                          mb-8 sm:mb-10 
                          text-2xl sm:text-3xl md:text-4xl
                          relative z-10"
              >
              Enter Your Details
              </motion.h1>

              {/* Enhanced Progress Bar */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="relative mb-10 flex items-center"
              >
                <div className="h-2 bg-gray-200 w-full rounded-full shadow-inner">
                  <motion.div 
                    className="h-2 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"
                    initial={{ width: "0%" }}
                    animate={{ width: "71.4%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                  ></motion.div>
              </div>
                <div className="flex justify-between absolute w-full top-1 transform -translate-y-1/2">
                {[...Array(7)].map((_, index) => (
                    <motion.div
                    key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                      className={`w-3 h-3 rounded-full shadow-sm ${
                        index < 5 ? "bg-orange-500" : "bg-gray-300"
                    }`}
                    ></motion.div>
                ))}
              </div>
              </motion.div>

              <form className="flex flex-col flex-grow items-center justify-center relative z-10">
                <motion.h2 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="text-2xl sm:text-3xl font-semibold text-center text-gray-700 mb-8"
                >
                Where were you Born?
                </motion.h2>

                {/* Enhanced Location Input */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="mb-10 flex justify-center relative w-full max-w-md"
                >
                <input
                  type="text"
                  value={location}
                  onChange={handleSearch}
                  placeholder="Type your city name..."
                    className="w-full h-14 px-6 py-4 bg-white rounded-xl border-2 border-gray-200 
                             focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none 
                             text-lg font-medium text-gray-700 placeholder-gray-400
                             transition-all duration-300 shadow-sm hover:shadow-md"
                />
                  {/* Enhanced Dropdown Results */}
                {showDropdown && filteredOptions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 w-full bg-white border-2 border-orange-200 rounded-xl shadow-xl mt-2 max-h-52 overflow-y-auto z-20"
                    >
                    {filteredOptions.map((city, index) => (
                      <div
                        key={index}
                          className="px-6 py-3 cursor-pointer hover:bg-orange-50 hover:text-orange-600 transition-all duration-200 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSelectCity(city)}
                      >
                        {city}
                      </div>
                    ))}
                    </motion.div>
                )}
                </motion.div>

                {/* Enhanced Next Button */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="flex justify-center w-full"
                >
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!location}
                    className={`w-full sm:w-72 px-8 py-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                    location
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:scale-105 active:scale-95"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
                </motion.div>
            </form>
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
