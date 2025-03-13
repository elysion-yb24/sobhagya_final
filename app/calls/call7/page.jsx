"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Head from "next/head";
import { useRouter } from "next/navigation";

export default function Call7() {
  const [location, setLocation] = useState("");
  const [isExiting, setIsExiting] = useState(false);
  const [locationOptions, setLocationOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

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

  // Select a city and close the dropdown
  const handleSelectCity = (city) => {
    setLocation(city);
    setShowDropdown(false);
  };

  const handleNext = () => {
    if (location) {
      setIsExiting(true);
      setTimeout(() => {
        router.push("/calls/call8");
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="min-h-screen flex items-center justify-center px-4"
        >
          <Head>
            <title>Guidance Form</title>
            <meta name="description" content="Guidance request form" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          {/* Fixed Width & Height */}
          <div className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-6xl 
                         h-auto md:h-auto lg:h-auto
                         px-4 sm:px-6 md:px-8 lg:px-16 
                         py-6 sm:py-8 md:py-10
                         bg-[#fcf4e9] rounded-lg shadow-sm border border-gray-200 
                         flex flex-col">
            {/* Title */}
            <h1 className="font-medium text-center text-[#373737] 
                          mb-6 sm:mb-8 md:mb-10 
                          text-xl sm:text-2xl md:text-3xl lg:text-4xl">
              Enter Your Details
            </h1>

            {/* Progress Bar (5/7 dots filled) */}
            <div className="relative mb-10 flex items-center">
              <div className="h-[2px] bg-[#b4b4b4] w-full rounded-full">
                <div className="h-[2px] bg-[#F7971E] rounded-full w-[71.4%]"></div>
              </div>

              <div className="flex justify-between absolute w-full top-[-6px]">
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index < 5 ? "bg-[#F7971E]" : "bg-[#b4b4b4]"
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            <form className="flex flex-col flex-grow items-center justify-center">
              <h2 className="text-2xl sm:text-3xl font-normal text-center text-[#373737] mb-8">
                Where were you Born?
              </h2>

              <div className="mb-10 flex justify-center relative w-full md:w-96">
                {/* Searchable Location Input */}
                <input
                  type="text"
                  value={location}
                  onChange={handleSearch}
                  placeholder="Type your city name..."
                  className="w-full h-[50px] sm:h-[55px] px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F7971E]"
                />
                {/* Dropdown Results (Appears Only When Typing) */}
                {showDropdown && filteredOptions.length > 0 && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-md mt-1 max-h-52 overflow-y-auto">
                    {filteredOptions.map((city, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 cursor-pointer hover:bg-[#F7971E] hover:text-white transition-all"
                        onClick={() => handleSelectCity(city)}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!location}
                  className={`w-64 px-12 py-3 text-white font-medium rounded-md transition-all ${
                    location
                      ? "bg-[#F7971E] hover:bg-[#d99845]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
