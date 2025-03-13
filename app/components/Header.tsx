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
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", updateScrollProgress);
    return () => window.removeEventListener("scroll", updateScrollProgress);
  }, []);



  return (
    <>
      {/* DESKTOP HEADER (only on large screens) */}
      <div className="hidden lg:flex w-full">
        {/* Left section: Logo */}
        <div className="w-1/5 border-r border-gray-200 flex items-center justify-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/monk logo (1).png"
              alt="Sobhagya"
              width={65}
              height={65}
              priority
              className="w-[70px] h-[70px]"
            />
            <div className="ml-5 overflow-hidden w-[170px] h-[40px] flex items-center relative">
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

        {/* Right section: Navigation */}
        <div className="w-4/5 flex flex-col">
          {/* Top Row: Contact & Login */}
          <div className="flex justify-between items-center border-b border-gray-200 py-4 px-4">
            <div></div>
            <div className="flex items-center">
              <span className="text-[#F7971D] text-[17px] leading-[30px] font-semibold text-center font-poppins">
                Talk to Our Astrologers NOW:
              </span>
              <a
                href="tel:+919876543201"
                className="ml-1 text-[#373737] hover:text-orange-500 text-[16px] leading-[30px] font-normal text-center font-poppins"
              >
                +91 98765 43201
              </a>
            </div>
            {/* Change the signup/login to Link component with href to "call-1" */}
            <Link
              href="/calls/call1"
              className="text-[#F7971D] hover:text-orange-600 text-[15px] leading-[30px] font-semibold text-center font-poppins pr-20 cursor-pointer"
            >
              Signup/Login
            </Link>
          </div>

          {/* Bottom Row: Navigation Links */}
          <div className="py-5 border-b border-gray-200 text-[#373737] font-poppins">
            <nav className="flex items-center justify-center space-x-10 text-[14px]">
              <Link href="/about" className="hover:text-orange-500">
                About Us
              </Link>
              <Link href="/services" className="hover:text-orange-500">
                Services
              </Link>
              <Link href="/live-sessions" className="hover:text-orange-500">
                Live Sessions
              </Link>
              <Link href="/call-with-astrologer" className="hover:text-orange-500">
                Call with Astrologer
              </Link>
              <Link href="https://store.sobhagya.in" target="_blank" className="hover:text-orange-500">
                Shop
              </Link>
              <Link href="/blog" className="hover:text-orange-500">
                Blog
              </Link>
              <Link href="/contact" className="hover:text-orange-500">
                Contact Us
              </Link>
              <div className="flex items-center cursor-pointer hover:text-orange-500">
                <span>EN</span>
                <span className="ml-1">▼</span>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* MOBILE HEADER */}
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
          <div className="ml-3 overflow-hidden w-[120px] h-[10px] flex items-center relative">
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

        <button onClick={() => setIsOpen(!isOpen)} className="focus:outline-none">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-full h-full bg-white z-40 pt-16 flex flex-col items-center space-y-5 text-gray-700 font-medium text-lg transition-all duration-300">
          <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4">
            <X size={24} />
          </button>

          {/* Change the mobile signup/login to Link component */}
          <Link
            href="/calls/call1"
            className="hover:text-orange-500 py-2"
            onClick={() => setIsOpen(false)}
          >
            Signup/Login
          </Link>

          {["About Us", "Services", "Live Sessions", "Call with Astrologer", "Shop", "Blog", "Contact Us"].map((item, idx) => (
            <Link key={idx} href={`/${item.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-orange-500 py-2" onClick={() => setIsOpen(false)}>
              {item}
            </Link>
          ))}

          <div className="hover:text-orange-500 py-2">EN ▼</div>
        </div>
      )}

      {/* Remove the Phone Verification Modal since we're redirecting instead */}
    </>
  );
};

export default Header;