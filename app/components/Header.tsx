"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Eagle_Lake } from "next/font/google";
import { Menu, X, Phone, User, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { getAuthToken, isAuthenticated, getUserDetails, fetchUserProfile, performLogout, clearAuthData } from '../utils/auth-utils';
import { fetchWalletBalance as simpleFetchWalletBalance } from '../utils/production-api';

const eagleLake = Eagle_Lake({ subsets: ["latin"], weight: "400" });

const texts = ["Sobhagya", "सौभाग्य"];
const delayBetween = 5000;

const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);


  // Helper function to check if a link is active
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(href) || false;
  };
  

  
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, delayBetween);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.log('No auth token found in Header, setting wallet balance to 0');
        setWalletBalance(0);
        return;
      }

      // Use simple API function (works same in dev and production)
      console.log('Fetching wallet balance in Header...');
      const balance = await simpleFetchWalletBalance();
      setWalletBalance(balance);
      
    } catch (error: any) {
      console.error('Error fetching wallet balance in Header:', error);
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        console.log('401 error in Header - clearing auth data');
        clearAuthData();
        setWalletBalance(0);
        // Trigger auth change event
        window.dispatchEvent(new CustomEvent('user-auth-changed'));
      } else {
        setWalletBalance(0);
      }
    }
  };



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
        // Fetch wallet balance
        fetchWalletBalance();
      } else {
        console.log('❌ Event handler - Not authenticated, clearing profile');
        setUserProfile(null);
        setWalletBalance(0);
      }
    };
    window.addEventListener('user-auth-changed', handler);
    return () => window.removeEventListener('user-auth-changed', handler);
  }, []);

  // Always check auth state on mount to ensure correct display after redirects
  useEffect(() => {
    if (mounted) {
      // Prevent duplicate fetch if already loaded
      if (userProfile) return;
      const authenticated = isAuthenticated();
      setIsAuthenticatedUser(authenticated);
      if (authenticated) {
        let userDetails = getUserDetails();
        setUserProfile(userDetails);
        // Only fetch if not present or outdated (older than 5 min)
        if (!userDetails || !userDetails.timestamp || Date.now() - userDetails.timestamp > 5 * 60 * 1000) {
          fetchUserProfile().then(freshProfile => {
            if (freshProfile) setUserProfile(freshProfile);
          });
        }
        fetchWalletBalance();
      } else {
        setUserProfile(null);
        setWalletBalance(0);
      }
    }
  }, [mounted, userProfile]);

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

  // Check if user needs profile completion
  const needsProfileCompletion = () => {
    if (!userProfile) return false;
    return !userProfile.name && !userProfile.firstName && !userProfile.profileCompleted;
  };

  const getDisplayName = () => {
    if (!userProfile) return 'User';
    
    // Use enhanced displayName if available
    if (userProfile.displayName && userProfile.displayName !== 'User') {
      return userProfile.displayName;
    }
    
    // Fallback priority: name > firstName lastName > firstName > phoneNumber
    if (userProfile.name && userProfile.name.trim() !== '') {
      return userProfile.name;
    }
    
    if (userProfile.firstName && userProfile.firstName.trim() !== '') {
      const lastName = userProfile.lastName ? ` ${userProfile.lastName}` : '';
      return `${userProfile.firstName}${lastName}`;
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

  const handleProfileCompletion = () => {
    // Redirect to call pages flow for profile completion
    window.location.href = '/calls/call2?profile=complete';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-lg transition-all duration-300 animate-fadeIn">
      {/* DESKTOP HEADER */}
      <div className="hidden lg:block">
        <div className="max-w-8xl mx-auto px-4 lg:px-8">
          <div className="flex items-center h-20 justify-between">
            {/* Left: Logo/Brand, responsive width */}
            <Link href="/" className={`flex items-center gap-3 flex-shrink-0 min-w-[170px] justify-start transition-all duration-200 cursor-pointer ${
              isActiveLink('/') ? 'scale-105' : 'hover:scale-105'
            }`}>
              <Image
                src="/sobhagya-logo.svg"
                alt="Sobhagya"
                width={56}
                height={56}
                className="w-14 h-14 object-contain"
                priority
                quality={100}
              />
              <div className="flex flex-col justify-center">
                <span className={`text-2xl font-extrabold text-orange-500 tracking-tight ${eagleLake.className}`} style={{ letterSpacing: '0.01em' }}>
                  Sobhagya
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-wide mt-0.5" style={{ letterSpacing: '0.02em' }}>
                  Your Trusted Astrology Platform
                </span>
              </div>
            </Link>
            {/* Center: Navigation, flex-1, centered */}
            <nav className="flex-1 flex items-center justify-center gap-6 lg:gap-8">
              <Link
                href="/call-with-astrologer"
                className={`relative text-base font-semibold px-3 py-1 transition-all duration-200 focus:outline-none group whitespace-nowrap max-w-[200px] text-center ${
                  isActiveLink('/call-with-astrologer') 
                    ? 'text-orange-600 font-bold' 
                    : 'text-gray-700 hover:text-orange-600'
                }`}
                style={{ lineHeight: '1.2' }}
              >
                <span className="block w-full">Call with Astrologer</span>
                <span className={`absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 transition-transform origin-left duration-200 rounded-full ${
                  isActiveLink('/call-with-astrologer') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
              
              <Link
                href="/about"
                className={`relative text-base font-semibold px-3 py-1 transition-all duration-200 focus:outline-none group whitespace-nowrap max-w-[200px] text-center ${
                  isActiveLink('/about') 
                    ? 'text-orange-600 font-bold' 
                    : 'text-gray-700 hover:text-orange-600'
                }`}
                style={{ lineHeight: '1.2' }}
              >
                <span className="block w-full">About</span>
                <span className={`absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 transition-transform origin-left duration-200 rounded-full ${
                  isActiveLink('/about') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
              
              <Link
                href="/services"
                className={`relative text-base font-semibold px-3 py-1 transition-all duration-200 focus:outline-none group whitespace-nowrap max-w-[200px] text-center ${
                  isActiveLink('/services') 
                    ? 'text-orange-600 font-bold' 
                    : 'text-gray-700 hover:text-orange-600'
                }`}
                style={{ lineHeight: '1.2' }}
              >
                <span className="block w-full">Services</span>
                <span className={`absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 transition-transform origin-left duration-200 rounded-full ${
                  isActiveLink('/services') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
              

              

              
              <Link
                href="/blog"
                className={`relative text-base font-semibold px-3 py-1 transition-all duration-200 focus:outline-none group whitespace-nowrap max-w-[200px] text-center ${
                  isActiveLink('/blog') 
                    ? 'text-orange-600 font-bold' 
                    : 'text-gray-700 hover:text-orange-600'
                }`}
                style={{ lineHeight: '1.2' }}
              >
                <span className="block w-full">Blog</span>
                <span className={`absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 transition-transform origin-left duration-200 rounded-full ${
                  isActiveLink('/blog') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
              

            </nav>
            {/* Right: User/Login, responsive width */}
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
                    href="/login"
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold text-base shadow-md hover:from-orange-500 hover:to-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    Signup/Login
                  </Link>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLET HEADER */}
      <div className="hidden md:block lg:hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center h-16 justify-between">
            {/* Left: Logo/Brand */}
            <Link href="/" className={`flex items-center gap-2 flex-shrink-0 min-w-[140px] justify-start transition-all duration-200 cursor-pointer ${
              isActiveLink('/') ? 'scale-105' : 'hover:scale-105'
            }`}>
              <Image
                src="/sobhagya-logo.svg"
                alt="Sobhagya"
                width={48}
                height={48}
                className="w-12 h-12 object-contain"
                priority
                quality={100}
              />
              <div className="flex flex-col justify-center">
                <span className={`text-xl font-extrabold text-orange-500 tracking-tight ${eagleLake.className}`} style={{ letterSpacing: '0.01em' }}>
                  Sobhagya
                </span>
              </div>
            </Link>
            {/* Center: Navigation */}
            <nav className="flex-1 flex items-center justify-center gap-4">
              <Link
                href="/call-with-astrologer"
                className={`relative text-sm font-semibold px-2 py-1 transition-all duration-200 focus:outline-none group whitespace-nowrap max-w-[160px] text-center ${
                  isActiveLink('/call-with-astrologer') 
                    ? 'text-orange-600 font-bold' 
                    : 'text-gray-700 hover:text-orange-600'
                }`}
                style={{ lineHeight: '1.2' }}
              >
                <span className="block w-full">Call with Astrologer</span>
                <span className={`absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 transition-transform origin-left duration-200 rounded-full ${
                  isActiveLink('/call-with-astrologer') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`} />
              </Link>
              
              <Link
                href="/about"
                className="relative text-sm font-semibold text-gray-700 px-2 py-1 transition-colors duration-200 hover:text-orange-600 focus:outline-none group whitespace-nowrap max-w-[160px] text-center"
                style={{ lineHeight: '1.2' }}
              >
                <span className="block w-full">About</span>
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
              </Link>
              
              <Link
                href="/services"
                className="relative text-sm font-semibold text-gray-700 px-2 py-1 transition-colors duration-200 hover:text-orange-600 focus:outline-none group whitespace-nowrap max-w-[160px] text-center"
                style={{ lineHeight: '1.2' }}
              >
                <span className="block w-full">Services</span>
                <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 rounded-full" />
              </Link>
              

            </nav>
            {/* Right: User/Login */}
            <div className="flex items-center gap-2 flex-shrink-0 min-w-[160px] justify-end">
              {isAuthenticatedUser ? (
                <div className="flex items-center gap-1 bg-orange-50/70 border border-orange-100 rounded-full px-2 py-1.5 shadow-sm">
                  <div className="w-6 h-6 rounded-full bg-orange-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-600" />
                </div>
                  <span className="text-gray-700 font-medium text-xs max-w-[80px] truncate">{getDisplayName()}</span>
                    <button
                      onClick={handleLogout}
                    className="ml-1 p-1 rounded-full border border-red-100 text-red-500 bg-white hover:bg-red-50 transition-colors duration-200 flex items-center"
                      disabled={isLoggingOut}
                    title="Logout"
                    >
                    <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                  className="px-3 py-2 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold text-sm shadow-md hover:from-orange-500 hover:to-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
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
        <div className="flex items-center justify-between px-4 py-3">
          {/* Mobile Logo */}
          <Link href="/" className={`group flex items-center gap-2 transition-all duration-300 ${
            isActiveLink('/') ? 'scale-105' : 'hover:scale-105'
          }`}>
          <Image
              src="/sobhagya-logo.svg"
            alt="Sobhagya"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
              priority
              quality={100}
            />
            <span className={`text-xl font-bold text-orange-500 ${eagleLake.className}`}>
              Sobhagya
            </span>
        </Link>

          {/* Mobile Action Buttons */}
          <div className="flex items-center gap-2">
          <Link
            href="/call-with-astrologer"
              className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-all duration-300 hover:scale-110"
          >
              <Phone size={16} />
          </Link>
          
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
              className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 hover:scale-110 focus:outline-none"
            aria-label="Toggle menu"
          >
              {isOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

        {/* MOBILE MENU with enhanced animations and improved scroll behavior */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed top-0 left-0 w-full z-[9999] flex flex-col bg-white shadow-2xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ 
              height: 'auto',
              maxHeight: '100vh',
              overflowY: 'auto'
            }}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
              <Link href="/" className={`flex items-center gap-2 ${isActiveLink('/') ? 'scale-105' : ''}`} onClick={() => setIsOpen(false)}>
                <Image src="/sobhagya-logo.svg" alt="Sobhagya" width={36} height={36} className="w-9 h-9 object-contain" priority quality={100} />
                <span className={`text-xl font-bold text-orange-500 ${eagleLake.className}`}>
                  Sobhagya
                </span>
              </Link>
              <button 
                onClick={() => setIsOpen(false)} 
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="px-4 py-6 space-y-6 bg-white">
              {/* User Authentication Section */}
              {mounted && isAuthenticatedUser ? (
                <div className="space-y-4">
                  {/* User Profile Card */}
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-orange-700 font-medium">Welcome back!</p>
                        <p className="text-lg font-bold text-orange-900 truncate">
                          {getDisplayName()}
                        </p>
                        {needsProfileCompletion() && (
                          <button
                            onClick={handleProfileCompletion}
                            className="text-xs text-orange-600 hover:text-orange-700 underline mt-1"
                          >
                            Complete profile
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-2xl text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  Signup/Login
                </Link>
              )}

              {/* My Account Section (only when authenticated) */}
              {mounted && isAuthenticatedUser && (
                <div className="space-y-4">
                  <div className="border-t border-gray-100 pt-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">My Account</h3>
                    
                    {/* Wallet Balance */}
                    <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 shadow-sm mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-green-700 font-medium">Wallet Balance</p>
                          <p className="text-xl font-bold text-green-800">₹{walletBalance?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Account Menu Items */}
                    <div className="space-y-3">
                      <Link 
                        href="/astrologers?openHistory=transactions"
                        className="flex items-center gap-3 w-full py-4 px-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300 group text-base font-medium border border-gray-100 hover:border-blue-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="flex-1">Transaction History</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-blue-500">
                          →
                        </div>
                      </Link>
                      
                      <Link 
                        href="/astrologers?openHistory=calls"
                        className="flex items-center gap-3 w-full py-4 px-4 text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all duration-300 group text-base font-medium border border-gray-100 hover:border-green-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <span className="flex-1">Call History</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-green-500">
                          →
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Navigation</h3>
                <nav className="space-y-2">
                  {[
                    { href: "/call-with-astrologer", label: "Call with Astrologer", icon: "/Call with Astrologer.svg" },
                    { href: "/about", label: "About", icon: "/About Us.svg" },
                    { href: "/services", label: "Services", icon: "/Services.svg" },
                    { href: "/blog", label: "Blog", icon: "/Blog.svg" },
                  ].map((item, index) => (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 w-full py-4 px-4 rounded-2xl transition-all duration-300 group text-base font-medium border transition-all duration-300 ${
                        isActiveLink(item.href)
                          ? 'text-orange-600 bg-orange-50 border-orange-200 font-bold'
                          : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50 border-gray-100 hover:border-orange-200'
                      }`}
                      onClick={() => setIsOpen(false)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-10 h-10 flex items-center justify-center">
                        <Image 
                          src={item.icon} 
                          alt={item.label} 
                          width={24} 
                          height={24} 
                          className="w-6 h-6" 
                        />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      <div className={`transition-opacity duration-300 ${
                        isActiveLink(item.href) ? 'opacity-100 text-orange-500' : 'opacity-0 group-hover:opacity-100 text-orange-500'
                      }`}>
                        →
                      </div>
                    </Link>
                  ))}
                  

                </nav>
              </div>

              {/* Logout Button - Moved to bottom */}
              {mounted && isAuthenticatedUser && (
                <div className="border-t border-gray-100 pt-4">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className={`flex items-center justify-center w-full py-4 rounded-2xl font-medium transition-all duration-300 text-base border-2 ${
                      isLoggingOut
                        ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-100'
                        : 'text-red-600 hover:text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400'
                    }`}
                  >
                    <LogOut className={`h-5 w-5 mr-2 transition-transform duration-300 ${isLoggingOut ? 'animate-spin' : ''}`} />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>


    </header>
  );
  };
  
export default Header;