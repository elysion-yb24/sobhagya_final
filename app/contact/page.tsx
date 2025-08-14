'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Contact = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#fff]">
      {/* Enhanced Header Section with Animations */}
      <motion.div
        className="relative h-32 md:h-44 bg-cover bg-center flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "url('/hh.png')" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-10, -30, -10],
                opacity: [0.2, 1, 0.2],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        
        <motion.h1
          className="text-white text-3xl md:text-5xl font-bold drop-shadow-lg relative z-10"
          style={{
            fontFamily: "EB Garamond",
            fontSize: "clamp(40px, 8vw, 80px)",
            lineHeight: "1.2",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Contact Us
        </motion.h1>
      </motion.div>

      {/* Enhanced Contact Section with Animations */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Section - Get In Touch */}
        <motion.div 
          className="space-y-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.h2
            className="text-[#745802]"
            style={{
              fontFamily: "EB Garamond",
              fontSize: "clamp(35px, 5vw, 55px)",
              fontWeight: "700",
              lineHeight: "1.2",
            }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Get In Touch
          </motion.h2>
          <motion.p 
            className="text-[#373737] leading-relaxed text-lg md:w-[80%] mt-8"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <span className="font-medium text-xl">
              Have questions or need astrological guidance?
            </span>
            <br />
            <span className="text-base mt-4 block">
              Our experts are here to help! Reach out for consultations,
              inquiries, or support, and let us assist you on your journey.
            </span>
          </motion.p>

          {/* Enhanced Contact Details with Animations */}
          <div className="space-y-4">
            {/* Contact Us */}
            

            {/* Email */}
            <motion.div 
              className="flex items-center space-x-4 mt-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              whileHover={{ x: 5 }}
            >
              <div className="relative w-12 h-12 flex items-center justify-center">
                <img
                  src="/Ellipse 879.png"
                  alt="Ellipse"
                  className="w-full h-full absolute z-0"
                />
                <img
                  src="/Vector (31).png"
                  alt="Email"
                  className="w-6 h-6 z-10"
                />
              </div>
              <div>
                <p className="text-gray-700 font-medium text-lg">Email</p>
                <p className="text-gray-700 text-base">support@sobhagya.in</p>
              </div>
            </motion.div>
          </div>

          {/* Separator Line */}
          <motion.div 
            className="w-full h-px bg-orange-500 my-10"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          />

          {/* Enhanced Call to Action with Animation */}
          <motion.p 
            className="mt-8 text-gray-700 leading-relaxed text-lg font-medium"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            Connect with us today and discover the wisdom of astrology!
          </motion.p>

          {/* Enhanced Social Media Links with Animations */}
          <motion.div 
            className="flex flex-wrap gap-6 mt-10"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >
            {/* Instagram */}
            <motion.a
              href="https://www.instagram.com/sobhagya.bhakti"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Follow us on Instagram"
            >
              <img src="/Ellipse 879.png" alt="Ellipse" className="absolute w-full h-full z-0" />
              <svg className="w-5 h-5 sm:w-6 sm:h-6 z-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              href="https://linkedin.com/company/sobhagya"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Follow us on LinkedIn"
            >
              <img src="/Ellipse 879.png" alt="Ellipse" className="absolute w-full h-full z-0" />
              <svg className="w-5 h-5 sm:w-6 sm:h-6 z-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </motion.a>

            {/* Google Play */}
            <motion.a
              href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en_IN"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Download Sobhagya app from Google Play Store"
            >
              <img src="/Ellipse 879.png" alt="Ellipse" className="absolute w-full h-full z-0" />
              <img 
                src="/Google Play.png" 
                alt="Google Play" 
                className="w-5 sm:w-6 h-5 sm:h-6 z-10"
              />
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Right Section - Enhanced Contact Form with Animations */}
        <motion.div 
          className="bg-[#fcf4e9] p-6 sm:p-10 md:p-16 shadow-lg rounded-lg"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <motion.h2
            className="text-2xl sm:text-3xl font-bold text-[#745802] mb-4"
            style={{ fontFamily: "EB Garamond" }}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            Send a Message
          </motion.h2>
          <form className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a5815] text-sm sm:text-base transition-all duration-300 hover:border-[#7a5815]"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <input
                type="text"
                placeholder="Phone No./ Email"
                className="w-full px-4 py-3  rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7a5815] text-sm sm:text-base transition-all duration-300 hover:border-[#7a5815]"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <textarea
                placeholder="Message"
                className="w-full px-4 py-3  rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7a5815] h-28 sm:h-32 text-sm sm:text-base transition-all duration-300 hover:border-[#7a5815]"
              />
            </motion.div>
            <motion.div 
              className="flex justify-center"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              <motion.button 
                className="w-full sm:w-[214px] bg-[#fff] text-[#F7971D] py-3 rounded-md font-semibold hover:bg-[#e09e3c] hover:text-white transition"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Submit
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
