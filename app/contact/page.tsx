'use client';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Contact = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage('✨ Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitMessage('💫 Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitMessage('💫 Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitMessage(null), 5000);
    }
  };

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
        style={{ backgroundImage: "url('/contact-us.jpg')" }}
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
              <div className="relative w-10 h-20 flex items-center justify-center">

                <img
                  src="/gmail.svg"
                  alt="Gmail"
                  className="w-12 h-12 z-10"
                />
              </div>
              <div>
                <p className="text-gray-700 font-medium text-lg">Email</p>
                <p className="text-gray-700 text-base">info@sobhagya.in</p>
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
            className="flex flex-wrap gap-0 mt-0"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.3 }}
          >

            {/* Instagram */}
            <motion.a
              href="https://www.instagram.com/sobhagya.bhakti"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Follow us on Instagram"
            >

              <img
                src="/instagram.svg"
                alt="Instagram"
                className="w-8 h-8 sm:w-10 sm:h-10 z-10"
              />
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              href="https://linkedin.com/company/sobhagya"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Follow us on LinkedIn"
            >
              <img
                src="/linkedin.svg"
                alt="LinkedIn"
                className="w-8 h-8 sm:w-10 sm:h-10 z-10"
              />
            </motion.a>

            {/* Play Store */}
            <motion.a
              href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en_IN"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Download Sobhagya app from Google Play Store"
            >
              <img
                src="/play-store-small.svg"
                alt="Google Play Store"
                className="w-8 h-8 sm:w-10 sm:h-10 z-10"
              />
            </motion.a>

            {/* App Store */}
            <motion.a
              href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en_IN"
              target="_blank"
              rel="noopener noreferrer"
              className="relative w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Download Sobhagya app from App Store"
            >
              <img
                src="/app-store-small.svg"
                alt="App Store"
                className="w-8 h-8 sm:w-10 sm:h-10 z-10"
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#7a5815] text-sm sm:text-base transition-all duration-300 hover:border-[#7a5815]"
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
            >
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Phone No./ Email"
                className="w-full px-4 py-3  rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7a5815] text-sm sm:text-base transition-all duration-300 hover:border-[#7a5815]"
                required
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Message"
                className="w-full px-4 py-3  rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7a5815] h-28 sm:h-32 text-sm sm:text-base transition-all duration-300 hover:border-[#7a5815]"
                required
              />
            </motion.div>
            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
            >
              <motion.button
                type="submit"
                disabled={isSubmitting}
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
