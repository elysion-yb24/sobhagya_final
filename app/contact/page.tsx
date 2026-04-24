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
    setSubmitMessage(null);

    // Basic client-side validation
    const name = formData.name.trim();
    const contact = formData.email.trim();
    const message = formData.message.trim();

    if (!name || !contact || !message) {
      setSubmitMessage('💫 Please fill in all fields.');
      setTimeout(() => setSubmitMessage(null), 4000);
      return;
    }

    // Accept either an email or a phone number (7+ digits)
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const looksLikePhone = /^[+()\-\s\d]{7,}$/.test(contact);
    if (!looksLikeEmail && !looksLikePhone) {
      setSubmitMessage('💫 Please enter a valid email or phone number.');
      setTimeout(() => setSubmitMessage(null), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email: contact, message }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setSubmitMessage('✨ Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitMessage(`💫 ${data?.error || 'Failed to send message. Please try again.'}`);
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
            {/* Call */}
            <motion.a
              href="tel:+919211994461"
              className="flex items-center space-x-4 mt-4 group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ x: 5 }}
              aria-label="Call us at +91 92119 94461"
            >
              <div className="relative w-10 h-20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                    <path d="M22 16.92V19.92C22 20.97 21.18 21.85 20.13 21.97C16.66 22.36 13.33 21.72 10.39 20.12C7.62 18.63 5.37 16.38 3.88 13.61C2.28 10.67 1.64 7.34 2.03 3.87C2.15 2.82 3.03 2 4.08 2H7.08C7.85 2 8.54 2.51 8.71 3.27C8.95 4.33 9.3 5.36 9.75 6.33C9.97 6.82 9.83 7.4 9.42 7.73L8.09 9.06C9.51 11.41 11.59 13.49 13.94 14.91L15.27 13.58C15.6 13.17 16.18 13.03 16.67 13.25C17.64 13.7 18.67 14.05 19.73 14.29C20.49 14.46 21 15.15 21 15.92V16.92" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-gray-700 font-medium text-lg">Call</p>
                <p className="text-gray-700 text-base group-hover:text-orange-600 transition-colors">+91 92119 94461</p>
              </div>
            </motion.a>

            {/* WhatsApp */}
            <motion.a
              href="https://wa.me/919211994461"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 mt-4 group"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.95 }}
              whileHover={{ x: 5 }}
              aria-label="Message us on WhatsApp"
            >
              <div className="relative w-10 h-20 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-sm group-hover:shadow-md transition-shadow">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-gray-700 font-medium text-lg">WhatsApp</p>
                <p className="text-gray-700 text-base group-hover:text-[#25D366] transition-colors">+91 92119 94461</p>
              </div>
            </motion.a>

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
              href="https://www.instagram.com/sobhagya.bhaakti"
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
              href="https://apps.apple.com/in/app/sobhagya/id6755958411"
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
                placeholder="Phone No. / Email"
                inputMode="text"
                autoComplete="email"
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
                className="w-full sm:w-[214px] bg-[#F7971D] text-white py-3 rounded-md font-semibold hover:bg-[#e09e3c] hover:text-white transition disabled:opacity-60 disabled:cursor-not-allowed"
                whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              >
                {isSubmitting ? 'Sending…' : 'Submit'}
              </motion.button>
              {submitMessage && (
                <p className="mt-4 text-center text-sm text-gray-700" aria-live="polite">
                  {submitMessage}
                </p>
              )}
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
