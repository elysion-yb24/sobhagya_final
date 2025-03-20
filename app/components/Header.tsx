"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Eagle_Lake } from "next/font/google";
import { Menu, X, Phone, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const eagleLake = Eagle_Lake({ subsets: ["latin"], weight: "400" });

const texts = ["Sobhagya", "सौभाग्य"];
const delayBetween = 5000;

const Header = () => {
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
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);

  return (
    <header className="w-full bg-white shadow-sm">
      {/* DESKTOP and TABLET HEADER */}
      <div className="hidden md:block">
        {/* Top Row: Contact & Login (always visible on md+ screens) */}
        <div className="flex justify-between items-center border-b border-gray-200 py-2 px-4 md:px-6 lg:px-8">
          <div className="md:hidden lg:block"></div> {/* Empty div for desktop spacing */}
          
          <div className="flex items-center justify-center md:text-sm lg:text-base">
            <span className="text-[#F7971D] font-semibold font-poppins">
              Talk to Our Astrologers NOW:
            </span>
            <a
              href="tel:+919876543201"
              className="ml-1 text-[#373737] hover:text-orange-500 font-normal font-poppins"
            >
              +91 98765 43201
            </a>
          </div>
          
          <Link
            href="/calls/call1"
            className="text-[#F7971D] hover:text-orange-600 md:text-sm lg:text-base font-semibold font-poppins md:pr-4 lg:pr-20 cursor-pointer"
          >
            Signup/Login
          </Link>
        </div>

        {/* Desktop and Tablet Layout - Flexible */}
        <div className="flex flex-col md:flex-row">
          {/* Logo Section */}
          <div className="md:w-1/4 lg:w-1/5 md:border-r border-gray-200 flex items-center justify-center py-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/monk logo (1).png"
                alt="Sobhagya"
                width={65}
                height={65}
                priority
                className="md:w-[55px] md:h-[55px] lg:w-[70px] lg:h-[70px]"
              />
              <div className="ml-3 md:ml-4 lg:ml-5 overflow-hidden md:w-[150px] lg:w-[170px] h-[40px] flex items-center relative">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={texts[textIndex]}
                    className={`${eagleLake.className} absolute md:text-2xl lg:text-[28px] leading-none`}
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

          {/* Navigation Section for Desktop and Tablet */}
          <div className="md:w-3/4 lg:w-4/5">
            {/* Bottom Row: Navigation Links */}
            <div className="py-4 border-b border-gray-200 text-[#373737] font-poppins">
              <nav className="flex flex-wrap items-center justify-center md:space-x-4 lg:space-x-10 text-[13px] lg:text-[14px]">
                <Link href="/about" className="hover:text-orange-500 py-1 md:py-0">
                  About Us
                </Link>
                <Link href="/services" className="hover:text-orange-500 py-1 md:py-0">
                  Services
                </Link>
                <Link href="/live-sessions" className="hover:text-orange-500 py-1 md:py-0">
                  Live Sessions
                </Link>
                <Link href="/call-with-astrologer" className="hover:text-orange-500 py-1 md:py-0">
                  Call with Astrologer
                </Link>
                <Link href="https://store.sobhagya.in" target="_blank" className="hover:text-orange-500 py-1 md:py-0">
                  Shop
                </Link>
                <Link href="/blog" className="hover:text-orange-500 py-1 md:py-0">
                  Blog
                </Link>
                <Link href="/contact" className="hover:text-orange-500 py-1 md:py-0">
                  Contact Us
                </Link>
                <div className="flex items-center cursor-pointer hover:text-orange-500 py-1 md:py-0">
                  <span>EN</span>
                  <span className="ml-1">▼</span>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden flex w-full justify-between items-center py-3 px-4 border-b border-gray-200">
        <Link href="/" className="flex items-center">
          <Image
            src="/monk logo (1).png"
            alt="Sobhagya"
            width={50}
            height={50}
            priority
            className="w-[50px] h-auto"
          />
          <div className="ml-3 overflow-hidden w-[120px] h-[30px] flex items-center relative">
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

        <div className="flex items-center gap-3">
          <a
            href="tel:+919876543201"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-500"
          >
            <Phone size={18} />
          </a>
          <Link
            href="/calls/call1"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-500"
          >
            <User size={18} />
          </Link>
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU - Animated Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed top-0 left-0 w-full h-full bg-white z-40 flex flex-col items-center pt-20 text-gray-700 font-medium overflow-y-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 focus:outline-none"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            <div className="w-full max-w-sm px-6 space-y-6">
              {/* Phone number in mobile menu */}
              <div className="flex items-center justify-center py-2 border-b border-gray-100">
                <span className="text-[#F7971D] text-sm font-semibold mr-2">
                  Talk to Our Astrologers:
                </span>
                <a
                  href="tel:+919876543201"
                  className="text-[#373737] hover:text-orange-500 text-sm font-normal"
                >
                  +91 98765 43201
                </a>
              </div>
              
              <Link
                href="/calls/call1"
                className="block w-full text-center text-[#F7971D] hover:text-orange-600 py-3 border border-orange-300 rounded-md"
                onClick={() => setIsOpen(false)}
              >
                Signup/Login
              </Link>

              <nav className="space-y-4">
                {[
                  { name: "About Us", path: "/about" },
                  { name: "Services", path: "/services" },
                  { name: "Live Sessions", path: "/live-sessions" },
                  { name: "Call with Astrologer", path: "/call-with-astrologer" },
                  { name: "Shop", path: "https://store.sobhagya.in", external: true },
                  { name: "Blog", path: "/blog" },
                  { name: "Contact Us", path: "/contact" }
                ].map((item, idx) => (
                  <Link 
                    key={idx} 
                    href={item.path}
                    target={item.external ? "_blank" : undefined}
                    className="block text-center hover:text-orange-500 py-2 border-b border-gray-100" 
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center justify-center py-3 cursor-pointer hover:text-orange-500">
                <span>English</span>
                <span className="ml-1">▼</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;