"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Eagle_Lake } from "next/font/google";
import { Menu, X, Phone, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isAuthenticated, getUserDetails, fetchUserProfile, performLogout, clearAuthData } from "../utils/auth-utils";

const eagleLake = Eagle_Lake({ subsets: ["latin"], weight: "400" });

const texts = ["Sobhagya", "सौभाग्य"];
const delayBetween = 5000;

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, delayBetween);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);
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

  // Listen for custom user-auth-changed event for instant header update
  useEffect(() => {
    const handler = () => {
      console.log('📡 Header received user-auth-changed event');
      // Re-run auth check
      const authenticated = isAuthenticated();
      console.log('🔐 Event handler - Is authenticated:', authenticated);
      setIsAuthenticatedUser(authenticated);
      if (authenticated) {
        let userDetails = getUserDetails();
        console.log('👤 Event handler - User details:', userDetails);
          setUserProfile(userDetails);
        fetchUserProfile().then(freshProfile => {
          console.log('🔄 Event handler - Fresh profile:', freshProfile);
          if (freshProfile) setUserProfile(freshProfile);
        });
      } else {
        console.log('❌ Event handler - Not authenticated, clearing profile');
        setUserProfile(null);
      }
    };
    window.addEventListener('user-auth-changed', handler);
    return () => window.removeEventListener('user-auth-changed', handler);
  }, []);

  // Always check auth state on mount to ensure correct display after redirects
  useEffect(() => {
    if (mounted) {
      console.log('🔍 Header checking auth state on mount...');
      const authenticated = isAuthenticated();
      console.log('🔐 Is authenticated:', authenticated);
      setIsAuthenticatedUser(authenticated);
      if (authenticated) {
        let userDetails = getUserDetails();
        console.log('👤 User details from localStorage:', userDetails);
        setUserProfile(userDetails);
        fetchUserProfile().then(freshProfile => {
          console.log('🔄 Fresh profile from fetchUserProfile:', freshProfile);
          if (freshProfile) setUserProfile(freshProfile);
        });
      } else {
        console.log('❌ Not authenticated, clearing user profile');
        setUserProfile(null);
      }
    }
  }, [mounted]);

  const handleLogout = async () => {
    try {
      console.log('🚪 User initiated logout...');
      
      // Show loading state
      setIsLoggingOut(true);
      
      // Perform complete logout
      await performLogout();
      
      // Update state
      setIsAuthenticatedUser(false);
      setUserProfile(null);
      
      // Redirect to home page
      console.log('🏠 Redirecting to home page...');
      window.location.href = '/';
      
    } catch (error) {
      console.error('❌ Error during logout:', error);
      
      // Fallback: clear local data and redirect anyway
      clearAuthData();
      setIsAuthenticatedUser(false);
      setUserProfile(null);
      setIsLoggingOut(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user-auth-changed'));
      }
      window.location.href = '/';
    }
  };

  const getDisplayName = () => {
    if (!userProfile) return 'User';
    
    // Use enhanced displayName if available
    if (userProfile.displayName) {
      return userProfile.displayName;
    }
    
    // Fallback priority: name > firstName > phoneNumber
    if (userProfile.name) {
      return userProfile.name;
    }
    
    if (userProfile.firstName) {
      return userProfile.firstName;
    }
    
    if (userProfile.phoneNumber) {
      // Format phone number for display
      const phone = userProfile.phoneNumber.toString();
      if (phone.length >= 10) {
        return `+91 ${phone.slice(-10).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}`;
      }
      return phone;
    }
    
    return 'User';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-orange-100/60 shadow-md transition-all duration-300 animate-fadeIn">
      {/* Progress bar */}
      <div 
        className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-300 ease-out rounded-full"
        style={{ width: `${scrollProgress}%` }}
      />
      
      {/* DESKTOP HEADER */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center h-20">
            {/* Left: Logo/Brand, fixed width, shifted left */}
            <div className="flex items-center gap-3 flex-shrink-0 min-w-[170px] -ml-2 justify-start">
              <Image
                src="/monk logo.png"
                alt="Sobhagya"
                width={54}
                height={54}
                className="w-14 h-14 object-contain"
                
              />
              <div className="flex flex-col justify-center">
                <span className="text-2xl font-extrabold text-orange-500 tracking-tight" style={{ fontFamily: 'EB Garamond', letterSpacing: '0.01em' }}>
                  Sobhagya
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-wide mt-0.5" style={{ letterSpacing: '0.02em' }}>
                  Your Trusted Astrology Platform
                </span>
              </div>
          </div>
            {/* Center: Navigation, flex-1, centered */}
            <nav className="flex-1 flex items-center justify-center gap-6">
              {[
                { href: "/", label: "Home" },
                { href: "/call-with-astrologer", label: "Call with Astrologers" },
                { href: "/about", label: "About" },
                { href: "/services", label: "Services" },
                { href: "/contact", label: "Contact" },
                { href: "/live-session", label: "Live Session" },
                { href: "/Blog", label: "Blog" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-base font-semibold text-gray-700 px-3 py-1 rounded transition-colors duration-200 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-200 group whitespace-nowrap max-w-[170px] truncate text-center"
                  style={{ lineHeight: '1.2' }}
                >
                  <span className="block w-full overflow-hidden text-ellipsis">{item.label}</span>
                  <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
                </Link>
              ))}
            </nav>
            {/* Right: User/Login, fixed width, matches left */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-[210px] justify-end">
              {isAuthenticatedUser ? (
                <div className="flex items-center gap-2 bg-orange-50/70 border border-orange-100 rounded-full px-3 py-1.5 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-600" />
                </div>
                  <span className="text-gray-700 font-medium text-sm max-w-[100px] truncate">{getDisplayName()}</span>
                    <button
                      onClick={handleLogout}
                    className="ml-1 p-2 rounded-full border border-red-100 text-red-500 bg-white hover:bg-red-50 transition-colors duration-200 flex items-center"
                      disabled={isLoggingOut}
                    title="Logout"
                    >
                    <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/calls/call1"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold text-base shadow-md hover:from-orange-500 hover:to-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    Signup/Login
                  </Link>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE HEADER with enhanced animations */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Mobile Logo */}
          <Link href="/" className="group flex items-center gap-2 transition-all duration-300 hover:scale-105">
          <Image
              src="/monk logo.png"
            alt="Sobhagya"
              width={40}
              height={40}
              className="w-40 h-20 object-contain"
            />
            <span className="text-xl font-bold text-orange-500" style={{ fontFamily: 'EB Garamond' }}>
              Sobhagya
            </span>
        </Link>

          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-2">
          <a
            href="tel:+919876543201"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-300 hover:scale-110"
          >
              <Phone size={16} />
          </a>
          
          {mounted && isAuthenticatedUser ? (
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
                className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 hover:scale-110 ${
                isLoggingOut 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-100 text-red-600 hover:bg-red-200'
              }`}
              title={isLoggingOut ? "Logging out..." : "Logout"}
            >
                <LogOut size={16} className={isLoggingOut ? 'animate-spin' : ''} />
            </button>
          ) : (
            <Link
                href="/login"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-300 hover:scale-110"
            >
                <User size={16} />
            </Link>
          )}
          
          <button 
            onClick={() => setIsOpen(!isOpen)} 
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500"
            aria-label="Toggle menu"
          >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

        {/* MOBILE MENU with enhanced animations */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
              className="fixed top-0 left-0 w-full h-full bg-white/95 z-40 flex flex-col overflow-y-auto"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
          >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <Image src="/monk logo.png" alt="Sobhagya" width={36} height={36} />
                  <span className="text-xl font-bold text-orange-500" style={{ fontFamily: 'EB Garamond' }}>
                    Sobhagya
                  </span>
                </Link>
            <button 
              onClick={() => setIsOpen(false)} 
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300"
              aria-label="Close menu"
            >
                  <X size={18} />
            </button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 px-6 py-6 space-y-6">
                {/* Phone number section */}
                <div className="flex items-center justify-center py-3 bg-orange-50 rounded-xl border border-orange-200">
                  <div className="text-center">
                    <span className="text-orange-600 text-xs font-semibold block mb-1">
                  Talk to Our Astrologers:
                </span>
                <a
                  href="tel:+919876543201"
                      className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors duration-300 justify-center text-sm"
                >
                      <Phone className="w-4 h-4" />
                      <span className="font-medium">+91 98765 43201</span>
                </a>
                  </div>
              </div>
              
              {/* User Authentication Section */}
              {mounted && isAuthenticatedUser ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center py-3 bg-orange-50 rounded-xl border border-orange-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium text-sm max-w-[100px] truncate">
                      Hello, {getDisplayName()}
                    </span>
                      </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    disabled={isLoggingOut}
                      className={`flex items-center justify-center w-full py-3 rounded-xl font-medium transition-all duration-300 text-base ${
                      isLoggingOut
                          ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-100'
                          : 'text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50 border-2'
                    }`}
                  >
                      <LogOut className={`h-5 w-5 mr-2 transition-transform duration-300 ${isLoggingOut ? 'animate-spin' : ''}`} />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              ) : (
                <Link
                    href="/login"
                    className="block w-full text-center btn-primary py-3 rounded-xl text-base font-bold"
                  onClick={() => setIsOpen(false)}
                >
                  Signup/Login
                </Link>
              )}

                {/* Navigation Links */}
                <nav className="space-y-2">
                {[
                    { href: "/", label: "Home", icon: "🏠" },
                    { href: "/astrologers", label: "Astrologers", icon: "🔮" },
                    { href: "/about", label: "About", icon: "ℹ️" },
                    { href: "/contact", label: "Contact", icon: "📞" },
                  ].map((item, index) => (
                  <Link 
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 w-full py-3 px-4 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-300 group text-base font-medium"
                    onClick={() => setIsOpen(false)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        →
                      </div>
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;