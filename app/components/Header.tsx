"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Eagle_Lake } from "next/font/google";
import { Menu, X, Phone, User, LogOut, ChevronDown, Wallet, History, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { getAuthToken, isAuthenticated, getUserDetails, fetchUserProfile, performLogout, clearAuthData } from '../utils/auth-utils';
import { fetchWalletBalance as simpleFetchWalletBalance } from '../utils/production-api';

// Inlined to avoid webpack import resolution issues
function looksLikePhone(value: string | undefined | null): boolean {
  if (!value) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

function maskPhone(phone: string | number | undefined | null): string {
  if (!phone) return '';
  const str = phone.toString().replace(/\D/g, '');
  if (str.length < 4) return '••••';
  return `+91 ••••••••${str.slice(-2)}`;
}

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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

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
          setUserProfile(userDetails);
        fetchUserProfile().then(freshProfile => {
            if (freshProfile) setUserProfile(freshProfile);
        });
        // Fetch wallet balance
        fetchWalletBalance();
      } else {
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
    
    // Use enhanced displayName if available, but mask if it looks like a phone number
    if (userProfile.displayName && userProfile.displayName !== 'User') {
      if (looksLikePhone(userProfile.displayName)) {
        return maskPhone(userProfile.displayName);
      }
      return userProfile.displayName;
    }
    
    // Fallback priority: name > firstName lastName > firstName > masked phone
    if (userProfile.name && userProfile.name.trim() !== '') {
      if (looksLikePhone(userProfile.name)) {
        return maskPhone(userProfile.name);
      }
      return userProfile.name;
    }
    
    if (userProfile.firstName && userProfile.firstName.trim() !== '') {
      if (looksLikePhone(userProfile.firstName)) {
        return maskPhone(userProfile.firstName);
      }
      const lastName = userProfile.lastName ? ` ${userProfile.lastName}` : '';
      return `${userProfile.firstName}${lastName}`;
    }
    
    if (userProfile.phoneNumber) {
      return maskPhone(userProfile.phoneNumber);
    }
    
    return 'User';
  };

  const getAvatarInitial = () => {
    const name = getDisplayName();
    const ch = name.charAt(0);
    // If masked phone (starts with +) or 'User', show 'U'
    if (ch === '+' || ch === '•') return 'U';
    return ch.toUpperCase();
  };

  // Hide header on call pages and active live sessions
  if (pathname?.startsWith('/video-call') || pathname?.startsWith('/audio-call') || (pathname?.startsWith('/live-sessions/') && pathname !== '/live-sessions')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white shadow-sm transition-all duration-300 animate-fadeIn font-sans">
      {/* DESKTOP HEADER — two-row layout with logo spanning full height */}
      <div className="hidden lg:block bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex">
            {/* Left: Logo spanning both rows */}
            <div className="flex items-center pr-10 border-r border-gray-200 py-3 self-stretch">
              <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <Image
                  src="/sobhagya-logo.svg"
                  alt="Sobhagya"
                  width={64}
                  height={64}
                  className="w-14 h-14 object-contain"
                  priority
                />
                <span className={`text-2xl font-medium text-orange-500 tracking-tight ${eagleLake.className}`}>
                  Sobhagya
                </span>
              </Link>
            </div>

            {/* Right: Two stacked rows */}
            <div className="flex-1 flex flex-col pl-10">
              {/* Top row: User Profile / Signup */}
              <div className="flex items-center justify-end py-3 border-b border-gray-100">
                {!isAuthenticatedUser ? (
                  <Link href="/login" className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm hover:shadow-md">
                    <User className="w-4 h-4" />
                    Signup/Login
                  </Link>
                ) : (
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center gap-3 px-4 py-2 rounded-full border border-gray-200 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-bold">
                          {getAvatarInitial()}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{getDisplayName()}</p>
                        <p className="text-[11px] text-gray-400 leading-tight">₹{walletBalance?.toFixed(0) || '0'} Balance</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[999] animate-fadeIn">
                        {/* User Info Header */}
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-5 py-4 border-b border-orange-100/60">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                              <span className="text-white text-lg font-bold">{getAvatarInitial()}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{getDisplayName()}</p>
                              <p className="text-xs text-gray-500 truncate">{userProfile?.email || (userProfile?.phoneNumber ? `+91 •••••••${userProfile.phoneNumber.toString().slice(-2)}` : '')}</p>
                            </div>
                          </div>
                          {/* Wallet Balance */}
                          <div className="mt-3 flex items-center gap-2 bg-white/80 rounded-xl px-3 py-2 border border-orange-100/60">
                            <Wallet className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-gray-500">Wallet</span>
                            <span className="ml-auto text-sm font-bold text-green-700">₹{walletBalance?.toFixed(2) || '0.00'}</span>
                          </div>
                        </div>
                        {/* Menu Items */}
                        <div className="py-2 px-2">
                          <Link
                            href="/my-profile"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                          >
                            <User className="w-4 h-4" />
                            <span className="text-sm font-medium">My Profile</span>
                          </Link>
                          <Link
                            href="/history/Transaction-history"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                          >
                            <History className="w-4 h-4" />
                            <span className="text-sm font-medium">Transaction History</span>
                          </Link>
                          <Link
                            href="/history/call-history"
                            onClick={() => setShowProfileDropdown(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            <span className="text-sm font-medium">Call History</span>
                          </Link>
                        </div>
                        {/* Logout */}
                        <div className="border-t border-gray-100 px-2 py-2">
                          <button
                            onClick={() => { setShowProfileDropdown(false); handleLogout(); }}
                            disabled={isLoggingOut}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom row: Navigation links */}
              <div className="flex items-center justify-between py-3">
                <nav className="flex items-center gap-3 lg:gap-4 xl:gap-6 2xl:gap-8 text-sm font-medium text-gray-600">
                  {[
                    { label: "About Us", href: "/about" },
                    { label: "Services", href: "/services" },
                    { label: "Live Sessions", href: "/live-sessions" },
                    { label: "Call with Astrologer", href: "/call-with-astrologer" },
                    { label: "Shop", href: "/services" },
                    { label: "Blog", href: "/blog" },
                    { label: "Contact Us", href: "/contact" },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className={`relative py-1 transition-colors hover:text-orange-500 ${
                        isActiveLink(link.href)
                          ? "text-orange-600 font-semibold"
                          : ""
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                {/* Language selector */}
                <div className="flex items-center gap-1 cursor-pointer group text-orange-500 hover:text-orange-600 transition-colors text-sm font-medium">
                  <span>EN</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom border for entire header */}
        <div className="border-b border-gray-200" />
      </div>

      {/* TABLET HEADER */}
      <div className="hidden md:block lg:hidden bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center h-16 justify-between">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/sobhagya-logo.svg"
                alt="Sobhagya"
                width={40}
                height={40}
                className="w-10 h-10 object-contain"
                priority
              />
              <span className={`text-xl font-bold text-orange-500 ${eagleLake.className}`}>
                Sobhagya
              </span>
            </Link>

            {/* Right: User Action */}
            <div className="flex items-center gap-4">
              {isAuthenticatedUser ? (
                <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-full px-3 py-1 shadow-sm">
                  <Link href="/my-profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <User className="w-4 h-4 text-orange-600" />
                    <span className="text-gray-700 font-medium text-xs truncate max-w-[100px]">
                      {getDisplayName()}
                    </span>
                  </Link>
                  <button onClick={handleLogout} className="text-red-500 hover:scale-110 transition-transform">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-bold shadow-sm hover:bg-orange-600 transition-colors"
                >
                  Login
                </Link>
              )}
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-2 rounded-full bg-gray-50 text-gray-700"
              >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE HEADER with enhanced animations */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-3 xs:px-4 py-2.5 xs:py-3">
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
                  <Link
                    href="/my-profile"
                    className="block bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200 shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => setIsOpen(false)}
                  >
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
                          <p className="text-xs text-orange-600 underline mt-1">
                            Complete profile
                          </p>
                        )}
                      </div>
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
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
                        href="/my-profile"
                        className="flex items-center gap-3 w-full py-4 px-4 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-300 group text-base font-medium border border-gray-100 hover:border-orange-200"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <span className="flex-1">My Profile</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-orange-500">
                          →
                        </div>
                      </Link>

                      <Link
                        href="/history/Transaction-history"
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
                        href="/history/call-history"
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
                    { href: "/about", label: "About Us", icon: "✨", bgColor: "bg-indigo-100" },
                    { href: "/services", label: "Services", icon: "🔮", bgColor: "bg-purple-100" },
                    { href: "/live-sessions", label: "Live Sessions", icon: "🔴", bgColor: "bg-red-100" },
                    { href: "/call-with-astrologer", label: "Call with Astrologer", icon: "📞", bgColor: "bg-orange-100" },
                    { href: "/services", label: "Shop", icon: "🛍️", bgColor: "bg-pink-100" },
                    { href: "/blog", label: "Blog", icon: "📝", bgColor: "bg-green-100" },
                    { href: "/contact", label: "Contact Us", icon: "📧", bgColor: "bg-blue-100" },
                  ].map((item, index) => (
                    <Link 
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 w-full py-4 px-4 rounded-2xl transition-all duration-300 group text-base font-medium border ${
                        isActiveLink(item.href)
                          ? 'text-orange-600 bg-orange-50 border-orange-200 font-bold'
                          : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50 border-gray-100 hover:border-orange-200'
                      }`}
                      onClick={() => setIsOpen(false)}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className={`w-10 h-10 ${item.bgColor} rounded-full flex items-center justify-center`}>
                        <span className="text-lg">{item.icon}</span>
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