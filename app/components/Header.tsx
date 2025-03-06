"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Eagle_Lake } from "next/font/google";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const eagleLake = Eagle_Lake({ subsets: ["latin"], weight: "400" });

const texts = ["Sobhagya", "सौभाग्य"];
const delayBetween = 5000; 

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, delayBetween);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <>
      {/* Desktop Header - Only visible on large screens */}
      <div className="hidden lg:flex flex-col w-full justify-center">
        <div className="flex justify-center">
          <div className="w-[415px] border-r border-gray-200 flex items-center justify-center py-2">
            <Link href="/" className="flex items-center">
              <Image
                src="/monk logo (1).png"
                alt="Sobhagya"
                width={65}
                height={65}
                priority
                className="w-[90px] h-[90px]" 
              />
              <div className="ml-3 overflow-hidden w-[170px] h-[10px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={texts[textIndex]}
                    className={`${eagleLake.className} absolute text-[28px] leading-none`}
                    style={{ color: "#F7971D" }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    {texts[textIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </Link>
          </div>
          
          {/* These elements only visible on large screens */}
          <div className="flex-1 flex justify-center items-center border-b border-gray-200 py-6">
            <span className="text-[#F7971D] font-medium text-sm">Talk to Our Astrologers NOW:</span>
            <a href="tel:+919876543201" className="ml-2 text-[#373737] hover:text-orange-500 text-sm">+91 98765 43201</a>
          </div>
          
          <div className="w-[200px] flex justify-center items-center border-b border-gray-200 py-2">
            <Link href="/login" className="text-[#F7971D] hover:text-orange-600 text-sm">Signup/Login</Link>
          </div>
        </div>
        
        <div className="flex border-b border-gray-200">
          <div className="w-[415px] border-r border-gray-200"></div>
          
          <div className="flex-1 py-6 text-[#373737] font-poppins">
            <nav className="flex items-center justify-center space-x-6 text-[#373737] text-[14px]">
              <Link href="/about" className="hover:text-orange-500 text-[#373737]">About Us</Link>
              <Link href="/services" className="hover:text-orange-500">Services</Link>
              <Link href="/live-sessions" className="hover:text-orange-500">Live Sessions</Link>
              <Link href="/call-with-astrologer" className="hover:text-orange-500">Call with Astrologer</Link>
              <Link href="/shop" className="hover:text-orange-500">Shop</Link>
              <Link href="/blog" className="hover:text-orange-500">Blog</Link>
              <Link href="/contact" className="hover:text-orange-500">Contact Us</Link>
              <div className="flex items-center">
                <span>EN</span>
                <span className="ml-1">▼</span>
              </div>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Mobile/Tablet Header - Only visible on medium and small screens */}
      <div className="lg:hidden flex w-full justify-between items-center py-3 px-4 border-b border-gray-200">
        <Link href="/" className="flex items-center">
          <Image
            src="/monk logo (1).png"
            alt="Sobhagya"
            width={50}
            height={50}
            priority
            className="w-[50px] h-auto" 
          />
          <div className="ml-3 overflow-hidden w-[120px] h-[10px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={texts[textIndex]}
                className={`${eagleLake.className} absolute text-[22px] leading-none`}
                style={{ color: "#F7971D" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                {texts[textIndex]}
              </motion.span>
            </AnimatePresence>
          </div>
        </Link>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus:outline-none"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-white z-40 pt-16 flex flex-col items-center space-y-5 text-gray-700 font-medium text-lg transition-all duration-300 lg:hidden ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 focus:outline-none"
          aria-label="Close Menu"
        >
          <X size={24} />
        </button>
        
        <Link href="/" className="flex items-center mb-6">
          <Image
            src="/monk logo (1).png"
            alt="Sobhagya"
            width={60}
            height={60}
            priority
            className="w-[60px] h-auto"
          />
          <span className={`${eagleLake.className} ml-3 text-[28px]`} style={{ color: "#F7971D" }}>
            {texts[0]}
          </span>
        </Link>
        
        <Link href="/about" className="hover:text-orange-500 text-[#373737] py-2" onClick={() => setIsOpen(false)}>About Us</Link>
        <Link href="/services" className="hover:text-orange-500 text-[#373737] py-2" onClick={() => setIsOpen(false)}>Services</Link>
        <Link href="/live-sessions" className="hover:text-orange-500 text-[#373737] py-2" onClick={() => setIsOpen(false)}>Live Sessions</Link>
        <Link href="/call-with-astrologer" className="hover:text-orange-500 text-[#373737] py-2" onClick={() => setIsOpen(false)}>Call with Astrologer</Link>
        <Link href="/shop" className="hover:text-orange-500 text-[#373737] py-2" onClick={() => setIsOpen(false)}>Shop</Link>
        <Link href="/blog" className="hover:text-orange-500 text-[#373737] py-2" onClick={() => setIsOpen(false)}>Blog</Link>
        <Link href="/contact" className="hover:text-orange-500 text-[#373737] py-2" onClick={() => setIsOpen(false)}>Contact Us</Link>
        <div className="hover:text-orange-500 py-2">EN ▼</div>
        
        <div className="mt-6 border-t border-gray-200 pt-4 w-4/5 text-center">
          <div className="mb-4">
            <span className="text-orange-500 font-medium">Talk to Our Astrologers:</span>
            <a href="tel:+919876543201" className="ml-2 text-gray-700 hover:text-orange-500">+91 98765 43201</a>
          </div>
          <Link href="/login" className="text-orange-500 hover:text-orange-600">Signup/Login</Link>
        </div>
      </div>

      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 h-[3px] bg-orange-600 z-50"
        style={{ width: `${scrollProgress}%` }}
        transition={{ ease: "easeOut", duration: 0.2 }}
      />
    </>
  );
};

export default Header;
