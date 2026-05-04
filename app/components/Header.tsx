"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { Eagle_Lake } from "next/font/google";
import { Menu, X, Phone, User, LogOut, ChevronDown, Wallet, History, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { isAuthenticated, getUserDetails, fetchUserProfile, performLogout, clearAuthData } from '../utils/auth-utils';
import { useWalletBalance } from './astrologers/WalletBalanceContext';
import WhatsAppIcon from "./ui/WhatsAppIcon";
import BackButton from "./ui/BackButton";

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

type HeaderNavigationLink = {
  label: string;
  href: string;
  icon: string;
  bgColor: string;
  hideForPartner?: boolean;
  external?: boolean;
};

const Header = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { walletBalance } = useWalletBalance();
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

  const navigationLinks: HeaderNavigationLink[] = [
    { label: "About Us", href: "/about", icon: "✨", bgColor: "bg-indigo-100" },
    { label: "Services", href: "/services", icon: "🔮", bgColor: "bg-amber-100" },
    { label: "Live Sessions", href: "/live-sessions", icon: "🔴", bgColor: "bg-red-100", hideForPartner: true },
    { label: "Call with Astrologer", href: "/call-with-astrologer", icon: "📞", bgColor: "bg-orange-100", hideForPartner: true },
    { label: "Chat", href: "/chat", icon: "💬", bgColor: "bg-amber-100", hideForPartner: true },
    { label: "Shop", href: "https://www.ramvarna.com", icon: "🛍️", bgColor: "bg-pink-100", external: true },
    { label: "Blog", href: "/blog", icon: "📝", bgColor: "bg-green-100" },
    { label: "Contact Us", href: "/contact", icon: "📧", bgColor: "bg-blue-100" },
  ];

  const visibleNavigationLinks = navigationLinks.filter(
    (link) => !((userProfile?.role === 'astrologer' || userProfile?.role === 'friend') && link.hideForPartner)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, delayBetween);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowProfileDropdown(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.addEventListener('keydown', onEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      document.removeEventListener('keydown', onEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for custom user-auth-changed event for instant header update
  useEffect(() => {
    const handler = () => {
      const authenticated = isAuthenticated();
      setIsAuthenticatedUser(authenticated);
      if (authenticated) {
        let userDetails = getUserDetails();
        setUserProfile(userDetails);
        fetchUserProfile().then(freshProfile => {
          if (freshProfile) setUserProfile(freshProfile);
        });
      } else {
        setUserProfile(null);
      }
    };
    window.addEventListener('user-auth-changed', handler);
    return () => window.removeEventListener('user-auth-changed', handler);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (userProfile) return;
      const authenticated = isAuthenticated();
      setIsAuthenticatedUser(authenticated);
      if (authenticated) {
        let userDetails = getUserDetails();
        setUserProfile(userDetails);
        if (!userDetails || !userDetails.timestamp || Date.now() - userDetails.timestamp > 5 * 60 * 1000) {
          fetchUserProfile().then(freshProfile => {
            if (freshProfile) setUserProfile(freshProfile);
          });
        }
      } else {
        setUserProfile(null);
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

  // Hide header on call pages, active live sessions, and partner dashboard
  if (
    pathname?.startsWith('/video-call') ||
    pathname?.startsWith('/audio-call') ||
    (pathname?.startsWith('/live-sessions/') && pathname !== '/live-sessions') ||
    pathname === '/partner-info' ||
    pathname === '/login'
  ) {
    return null;
  }

  // Show back arrow on every sub-page (anything except home).
  const showBackButton = Boolean(pathname && pathname !== '/');

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] bg-white/75 supports-[backdrop-filter]:bg-white/60 backdrop-blur-2xl backdrop-saturate-150 border-b border-white/40 shadow-[0_8px_32px_-8px_rgba(247,148,29,0.12)] transition-all duration-300 animate-fadeIn font-sans">
      {/* DESKTOP HEADER — two-row layout with logo spanning full height */}
      <div className="hidden lg:block bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
          <div className="flex">
            {/* Left: Logo spanning both rows */}
            <div className="flex items-center gap-3 pr-10 border-r border-gray-200 py-3 self-stretch">
              {showBackButton && <BackButton />}
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
              <div className="flex items-center justify-end gap-3 py-3 border-b border-gray-100">
                {/* Direct contact: call + WhatsApp */}
                <a
                  href="tel:+919211994461"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-sm"
                  title="Call +91 92119 94461"
                  aria-label="Call +91 92119 94461"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/919211994461"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366] text-white hover:brightness-95 transition-all shadow-sm"
                  title="WhatsApp +91 92119 94461"
                  aria-label="WhatsApp +91 92119 94461"
                >
                  <WhatsAppIcon size={16} />
                </a>
                {!isAuthenticatedUser ? (
                  <Link href="/login" className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm hover:shadow-md">
                    <User className="w-4 h-4" />
                    Signup/Login
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                  <Link
                    href="/wallet"
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 hover:border-green-400 hover:shadow-md transition-all group"
                    title="Go to Wallet"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left leading-tight">
                      <p className="text-[10px] text-gray-500 font-medium">Wallet</p>
                      <p className="text-sm font-bold text-green-700">₹{Number(walletBalance || 0).toFixed(2)}</p>
                    </div>
                    <span className="ml-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full group-hover:bg-orange-100">
                      + Recharge
                    </span>
                  </Link>
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
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {showProfileDropdown && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-[999]" style={{ animation: 'fadeInDown 0.2s ease-out' }}>
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
                          {/* Wallet Balance — click to recharge */}
                          <Link
                            href="/wallet"
                            onClick={() => setShowProfileDropdown(false)}
                            className="mt-3 flex items-center gap-2 bg-white/80 hover:bg-white rounded-xl px-3 py-2 border border-orange-100/60 hover:border-orange-300 transition-colors"
                          >
                            <Wallet className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-gray-500">Wallet</span>
                            <span className="ml-auto text-sm font-bold text-green-700">₹{Number(walletBalance || 0).toFixed(2)}</span>
                            <span className="text-xs text-orange-600 font-semibold">Recharge →</span>
                          </Link>
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
                  </div>
                )}
              </div>

              {/* Bottom row: Navigation links */}
              <div className="flex items-center justify-between py-3">
                <nav className="flex items-center gap-3 lg:gap-4 xl:gap-6 2xl:gap-8 text-sm font-medium text-gray-600">
                  {visibleNavigationLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
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
            {/* Left: Back + Logo */}
            <div className="flex items-center gap-2 min-w-0">
              {showBackButton && <BackButton />}
              <Link href="/" className="flex items-center gap-2 min-w-0">
                <Image
                  src="/sobhagya-logo.svg"
                  alt="Sobhagya"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain flex-shrink-0"
                  priority
                />
                <span className={`text-xl font-bold text-orange-500 truncate ${eagleLake.className}`}>
                  Sobhagya
                </span>
              </Link>
            </div>

            {/* Right: User Action */}
            <div className="flex items-center gap-3">
              {isAuthenticatedUser && (
                <Link
                  href="/wallet"
                  className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md hover:border-green-400 transition-all"
                  title="Wallet — tap to recharge"
                >
                  <Wallet className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold text-green-700">
                    ₹{Number(walletBalance || 0).toFixed(0)}
                  </span>
                </Link>
              )}
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

      {/* MOBILE HEADER — progressive disclosure, no clipping, refined motion */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 px-3 xs:px-4 py-1.5 xs:py-2 min-w-0">
          {/* Back arrow (sub-pages only) */}
          {showBackButton && (
            <BackButton className="flex-shrink-0" />
          )}

          {/* Mobile Logo — can shrink so the hamburger never gets pushed off */}
          <Link
            href="/"
            className="group flex items-center gap-2 min-w-0 flex-1"
            aria-label="Sobhagya — Home"
          >
            <div className="relative flex-shrink-0">
              <Image
                src="/sobhagya-logo.svg"
                alt="Sobhagya"
                width={36}
                height={36}
                className="w-9 h-9 xs:w-10 xs:h-10 object-contain drop-shadow-sm transition-transform duration-500 group-hover:rotate-[8deg] group-active:scale-95"
                priority
                quality={100}
              />
              {/* Subtle saffron halo */}
              <span className="pointer-events-none absolute inset-0 rounded-full bg-orange-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
            <span
              className={`text-base xs:text-lg font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-brand-shine truncate ${eagleLake.className}`}
            >
              Sobhagya
            </span>
          </Link>

          {/* Action cluster — wallet + hamburger only on mobile.
              Call/WhatsApp removed from header bar (still in hamburger menu)
              to keep the hamburger reachable on 375px iPhones. */}
          <div className="flex items-center gap-1.5 xs:gap-2 flex-shrink-0 ml-auto">
            {/* Wallet pill — compact, with subtle live glow */}
            {mounted && isAuthenticatedUser && (
              <Link
                href="/wallet"
                aria-label={`Wallet balance ₹${Number(walletBalance || 0).toFixed(0)}, tap to recharge`}
                className="group relative flex items-center gap-1 h-9 px-2.5 xs:px-3 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/80 shadow-sm hover:shadow-md active:scale-95 transition-all duration-300 overflow-hidden"
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms]" />
                <Wallet size={13} className="text-green-600 flex-shrink-0" strokeWidth={2.5} />
                <span className="text-[11px] xs:text-xs font-extrabold text-green-700 tabular-nums">
                  ₹{Number(walletBalance || 0).toFixed(0)}
                </span>
              </Link>
            )}

            {/* Menu — the everything-else home; animates Menu→X */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu-panel"
              className="relative flex items-center justify-center w-9 h-9 rounded-full bg-white border border-orange-200/70 text-gray-700 shadow-sm hover:shadow-md hover:border-orange-300 hover:text-orange-600 active:scale-90 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-1 touch-manipulation"
            >
              <span className="relative inline-flex w-[18px] h-[18px] items-center justify-center">
                <Menu
                  size={18}
                  strokeWidth={2.5}
                  className={`absolute transition-all duration-300 ease-out ${isOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'}`}
                />
                <X
                  size={18}
                  strokeWidth={2.5}
                  className={`absolute transition-all duration-300 ease-out ${isOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'}`}
                />
              </span>
              {/* Unread/new dot when logged out — nudges login */}
              {mounted && !isAuthenticatedUser && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-white animate-pulse" />
              )}
            </button>
          </div>
        </div>
        {/* Thin saffron accent line — on-brand bottom border */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-orange-300/60 to-transparent" />



        {/* MOBILE MENU with enhanced animations and improved scroll behavior */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile menu */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden"
            />
            <motion.div
              id="mobile-menu-panel"
              role="dialog"
              aria-modal="true"
              className="fixed top-0 left-0 w-full z-[9999] flex flex-col bg-white shadow-2xl rounded-b-[2rem] border-b border-orange-100"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: 'auto',
                maxHeight: '100dvh',
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
              <div className="px-4 py-6 space-y-6 bg-white pb-20 safe-bottom">
                {/* Quick-contact row — always accessible, especially for <xs screens */}
                <div className="xs:hidden grid grid-cols-2 gap-3">
                  <a
                    href="tel:+919211994461"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-bold text-sm shadow-md shadow-orange-500/25 active:scale-95 transition-transform"
                    aria-label="Call +91 92119 94461"
                  >
                    <Phone size={16} strokeWidth={2.5} />
                    Call Now
                  </a>
                  <a
                    href="https://wa.me/919211994461"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 h-12 rounded-2xl bg-[#25D366] text-white font-bold text-sm shadow-md shadow-green-500/25 active:scale-95 transition-transform"
                    aria-label="WhatsApp"
                  >
                    <WhatsAppIcon size={16} />
                    WhatsApp
                  </a>
                </div>

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
                      
                      {/* Wallet Balance — tap to recharge */}
                      <Link
                        href="/wallet"
                        onClick={() => setIsOpen(false)}
                        className="block bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 shadow-sm mb-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md">
                            <Wallet className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-green-700 font-medium">Wallet Balance</p>
                            <p className="text-xl font-bold text-green-800">₹{Number(walletBalance || 0).toFixed(2)}</p>
                          </div>
                          <span className="text-sm font-semibold text-white bg-orange-500 px-3 py-1.5 rounded-full shadow">
                            + Recharge
                          </span>
                        </div>
                      </Link>
                      
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
                          className="flex items-center gap-3 w-full py-4 px-4 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-300 group text-base font-medium border border-gray-100 hover:border-orange-200"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                            <History className="w-5 h-5 text-white" />
                          </div>
                          <span className="flex-1">Transaction History</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-orange-500">
                            →
                          </div>
                        </Link>
                        <Link
                          href="/history/call-history"
                          className="flex items-center gap-3 w-full py-4 px-4 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-300 group text-base font-medium border border-gray-100 hover:border-orange-200"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-300 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <span className="flex-1">Call History</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-orange-500">
                            →
                          </div>
                        </Link>
                        <Link
                          href="/chat"
                          className="flex items-center gap-3 w-full py-4 px-4 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-2xl transition-all duration-300 group text-base font-medium border border-gray-100 hover:border-orange-200"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-md">
                            <MessageSquare className="w-5 h-5 text-white" />
                          </div>
                          <span className="flex-1">My Chats</span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-orange-500">
                            →
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Navigation</h3>
                  <nav className="space-y-2">
                    {visibleNavigationLinks.map((item, index) => (
                      <Link
                        key={`${item.href}-${index}`}
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className={`flex items-center gap-3 w-full py-4 px-4 rounded-2xl transition-all duration-300 group text-base font-medium border ${
                          isActiveLink(item.href)
                            ? 'text-orange-600 bg-orange-50 border-orange-200 font-bold'
                            : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50 border-gray-100 hover:border-orange-200'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <div className={`w-10 h-10 rounded-full ${item.bgColor} flex items-center justify-center shadow-sm`}>
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
              </div>

              {/* Logout Button - Moved to bottom */}
              {mounted && isAuthenticatedUser && (
                <div className="border-t border-gray-100 pt-6 pb-4">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className={`flex items-center justify-center w-full py-4 rounded-2xl font-bold shadow-sm transition-all duration-300 text-base border-2 ${
                      isLoggingOut
                        ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-100'
                        : 'text-red-600 hover:text-red-700 border-red-500 bg-red-50/30 hover:bg-red-50 hover:border-red-600 active:scale-[0.98]'
                    }`}
                  >
                    <LogOut className={`h-5 w-5 mr-2 transition-transform duration-300 ${isLoggingOut ? 'animate-spin' : ''}`} />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>

              )}
          </motion.div>
        </>
      )}
      </AnimatePresence>
    </div>
    </header>
  );
  };

export default Header;