"use client";
import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { 
  Phone, 
  ChevronDown, 
  Search, 
  ArrowLeft, 
  Sparkles, 
  Shield, 
  Zap, 
  Star,
  Globe,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import OtpVerificationScreen from '../components/auth/OtpVerificationScreen';
import { getAuthToken, clearAuthData, isAuthenticated, getUserDetails, storeAuthToken } from '../utils/auth-utils';
import { buildApiUrl, API_CONFIG } from '../config/api';
import { getApiBaseUrl } from '../config/api';


// Define types for country and authentication data
interface Country {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

interface AuthenticationData {
  token?: string;
  [key: string]: any;
}

const countries: Country[] = [
  { code: 'IN', name: 'India', dial_code: '+91', flag: '/flags/in.png' },
  { code: 'US', name: 'United States', dial_code: '+1', flag: '/flags/us.png' },
  // Other countries can be uncommented as needed
];

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries.find(c => c.code === 'IN')!);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentScreen, setCurrentScreen] = useState<'phone-input' | 'otp-verification'>('phone-input');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const [showPartnerRestrictionModal, setShowPartnerRestrictionModal] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // `didHandleAuthRef` ensures the mount-time redirect, and any post-OTP
  // redirect, each fire exactly once. Using a ref instead of state means
  // flipping it doesn't schedule another render or re-run the effect below.
  const didHandleAuthRef = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setMounted(true);

    const checkAuthAndRedirect = async () => {
      try {
        if (didHandleAuthRef.current) return;

        const isAuthValid = isAuthenticated();
        if (isAuthValid) {
          didHandleAuthRef.current = true;
          setIsFinalizing(true);
        console.log('✅ User already authenticated, checking for stored astrologer ID');
        
        // Check if there's a stored astrologer ID from the call flow
        const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
        const callIntent = localStorage.getItem('callIntent');
        const callSource = localStorage.getItem('callSource');
        
        // Check user role first
        const user = getUserDetails();
        
        if (user && user.role === 'friend') {
          console.log('👥 checkAuthAndRedirect - User is a friend, checking for call intent');
          
          // Check if there's a call intent - show modal if user was trying to make a call
          if (callIntent) {
            console.log('✅ checkAuthAndRedirect - Friend user has call intent, showing restriction modal');
            console.log('checkAuthAndRedirect call intent details:', { storedAstrologerId, callIntent, callSource });
            // Clear call-related localStorage items
            localStorage.removeItem('selectedAstrologerId');
            localStorage.removeItem('callIntent');
            localStorage.removeItem('callSource');
            setShowPartnerRestrictionModal(true);
            return;
          } else {
            console.log('❌ checkAuthAndRedirect - Friend user without valid call intent, redirecting to partner info page');
            console.log('Missing data - storedAstrologerId:', storedAstrologerId, 'callIntent:', callIntent, 'callSource:', callSource);
            router.push('/partner-info');
            return;
          }
        }
        
        console.log('🔍 Checking stored data:', { storedAstrologerId, callIntent, callSource });
        
        if (storedAstrologerId && callIntent && (callSource === 'callWithAstrologer' || callSource === 'astrologerCard' || callSource === 'consultAstrologer')) {
          localStorage.removeItem('selectedAstrologerId');
          localStorage.removeItem('callIntent');
          localStorage.removeItem('callSource');
          await initiateDirectCall(storedAstrologerId, callIntent === 'video' ? 'video' : 'audio');
          return;
        } else if (storedAstrologerId) {
          localStorage.removeItem('selectedAstrologerId');
          router.replace(`/astrologers/${storedAstrologerId}`);
        } else {
          router.replace('/call-with-astrologer');
        }
      }
    } catch (error) {
      console.log('❌ Authentication check failed on login page:', error);
      didHandleAuthRef.current = false;
    }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Scroll to top when OTP screen becomes active
  useEffect(() => {
    if (currentScreen === 'otp-verification') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentScreen]);
  
  const filteredCountries = searchTerm 
    ? countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        country.dial_code.includes(searchTerm))
    : countries;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we have user details from call flow
      const capturedName = sessionStorage.getItem('capturedUserName');
      const capturedGender = sessionStorage.getItem('capturedUserGender');
      const capturedDob = sessionStorage.getItem('capturedUserDob');
      const capturedPlaceOfBirth = sessionStorage.getItem('capturedUserPlaceOfBirth');
      const capturedTimeOfBirth = sessionStorage.getItem('capturedUserTimeOfBirth');
      const capturedLanguages = sessionStorage.getItem('capturedUserLanguages');
      const capturedInterests = sessionStorage.getItem('capturedUserInterests');

      const requestBody: any = {
        phone: phoneNumber,
        country_code: selectedCountry.dial_code
      };

      // Add user details if available from call flow
      if (capturedName) requestBody.name = capturedName;
      if (capturedGender) requestBody.gender = capturedGender;
      if (capturedDob) requestBody.dob = capturedDob;
      if (capturedPlaceOfBirth) requestBody.placeOfBirth = capturedPlaceOfBirth;
      if (capturedTimeOfBirth) requestBody.timeOfBirth = capturedTimeOfBirth;
      if (capturedLanguages) requestBody.languages = capturedLanguages;
      if (capturedInterests) requestBody.interests = capturedInterests;


      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.session_id) {
          setSessionId(data.session_id);
        }
        // Ensure user sees OTP screen at top of view
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentScreen('otp-verification');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to fetch astrologer name for URL display
  const fetchAstrologerName = async (astrologerId: string, token: string): Promise<string> => {
    try {
      const response = await fetch(`${getApiBaseUrl()}/user/api/users/${astrologerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) return 'Astrologer';
      const data = await response.json();
      return data?.data?.name || data?.name || 'Astrologer';
    } catch {
      return 'Astrologer';
    }
  };

  
  const initiateDirectCall = async (astrologerId: string, callType: 'audio' | 'video') => {
    try {
      const token = getAuthToken();
      const user = getUserDetails();
      if (!token || !user?.id) {
        router.replace('/astrologers');
        return;
      }

      // Check if user role is 'friend' (partner)
      if (user.role === 'friend') {
        console.log('Call blocked: User is a partner (friend role)');
        setShowPartnerRestrictionModal(true);
        return;
      }

      console.log('🔄 Resolving numericId for astrologer:', astrologerId);
      let numericId = '';
      let astrologerName = 'Astrologer';

      // 1. Try direct fetch
      try {
        const profileRes = await fetch(`${getApiBaseUrl()}/user/api/users/${astrologerId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          numericId = profileData?.data?.numericId?.toString() || '';
          astrologerName = profileData?.data?.name || 'Astrologer';
        }
      } catch (err) {
        console.warn('Direct profile fetch failed, using fallback search');
      }

      // 2. Fallback to list search if direct fetch failed to find numericId
      if (!numericId) {
        try {
          const listRes = await fetch(`${getApiBaseUrl()}/user/api/users-list?skip=0&limit=50`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (listRes.ok) {
            const listData = await listRes.json();
            const foundHead = (listData.data?.users || []).find((u: any) => u._id === astrologerId);
            if (foundHead) {
              numericId = foundHead.numericId?.toString() || '';
              astrologerName = foundHead.name || 'Astrologer';
            }
          }
        } catch (err) {
          console.warn('Fallback search failed');
        }
      }

      // If we still don't have a numericId, we might have to use the original ID and hope for the best, 
      // but the backend usually returns ERROR for MongoDB IDs.
      // IMPORTANT: Calling backend uses getUserData(_id) from user-service, so we MUST send the MongoDB ID.
      const receiverId = astrologerId; 
      console.log('🎯 Using MongoDB ID for call initiation:', receiverId);

      const channelId = Date.now().toString();
      const livekitUrl = `/api/calling/call-token-livekit?channel=${encodeURIComponent(channelId)}`;
      const body = {
        receiverUserId: receiverId,
        type: callType === 'audio' ? 'call' : 'video',
        appVersion: '1.0.0'
      };

      const response = await fetch(livekitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok || !data?.data?.token || !data?.data?.channel) {
        throw new Error(data?.message || 'Failed to initiate call');
      }

      // Keep source for back nav, drop intent keys
      localStorage.setItem('lastAstrologerId', astrologerId);
      localStorage.setItem('callSource', 'callWithAstrologer');
      localStorage.removeItem('selectedAstrologerId');
      localStorage.removeItem('callIntent');

      const dest = callType === 'audio'
        ? `/audio-call?token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(astrologerName)}&astrologerId=${encodeURIComponent(astrologerId)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}`
        : `/video-call?token=${encodeURIComponent(data.data.token)}&room=${encodeURIComponent(data.data.channel)}&astrologer=${encodeURIComponent(astrologerName)}&astrologerId=${encodeURIComponent(astrologerId)}&wsURL=${encodeURIComponent(data.data.livekitSocketURL || '')}`;

      router.replace(dest);
    } catch (err) {
      console.error('❌ Direct call initiation failed:', err);
      router.replace('/call-with-astrologer');
    }
  };

  // OtpVerificationScreen owns the actual OTP-verify request, token storage,
  // and user-details persistence. By the time it invokes `onVerify`, the user
  // is authenticated. All we do here is pick the destination and navigate —
  // exactly once — while showing a "Signing you in…" overlay so no earlier
  // screen can flash behind the transition.
  const handleVerifyOtp = useCallback(async (data: any) => {
    if (!data || data.verified !== true) {
      // Nothing else ever sends a non-verified payload today; ignore defensively.
      return;
    }

    // Claim the single navigation slot so the mount effect can't race us.
    didHandleAuthRef.current = true;
    setIsFinalizing(true);
    setError(null);

    try {
      const user = getUserDetails();
      const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
      const callIntent = localStorage.getItem('callIntent');
      const chatIntent = localStorage.getItem('chatIntent');
      const callSource = localStorage.getItem('callSource');

      // Partners can't initiate calls — route them accordingly.
      if (user?.role === 'friend') {
        if (callIntent) {
          localStorage.removeItem('selectedAstrologerId');
          localStorage.removeItem('callIntent');
          localStorage.removeItem('callSource');
          setShowPartnerRestrictionModal(true);
          setIsFinalizing(false);
          return;
        }
        router.replace('/partner-info');
        return;
      }

      // First-time users without a saved name go through the onboarding form.
      const hasName =
        !!(user && ((user.name && String(user.name).trim()) ||
          (user.displayName && String(user.displayName).trim())));
      if (!hasName) {
        router.replace('/calls/call1');
        return;
      }

      // Chat intent — drop them into the chat page for the chosen astrologer.
      if (storedAstrologerId && chatIntent === '1') {
        localStorage.removeItem('selectedAstrologerId');
        localStorage.removeItem('chatIntent');
        router.replace('/chat');
        return;
      }

      // Call intent from any entry point — initiate and navigate to the call.
      if (
        storedAstrologerId &&
        callIntent &&
        (callSource === 'callWithAstrologer' ||
          callSource === 'astrologerCard' ||
          callSource === 'consultAstrologer')
      ) {
        localStorage.removeItem('selectedAstrologerId');
        localStorage.removeItem('callIntent');
        localStorage.removeItem('callSource');
        await initiateDirectCall(
          storedAstrologerId,
          callIntent === 'video' ? 'video' : 'audio'
        );
        return;
      }

      // Plain astrologer selection (no explicit call/chat intent).
      if (storedAstrologerId) {
        localStorage.removeItem('selectedAstrologerId');
        router.replace(`/astrologers/${storedAstrologerId}`);
        return;
      }

      router.replace('/call-with-astrologer');
    } catch (err) {
      console.error('Post-OTP routing failed:', err);
      router.replace('/call-with-astrologer');
    }
    // Note: we intentionally leave isFinalizing=true so the overlay stays up
    // until the new route mounts. Resetting it would let the login UI paint
    // again during the navigation frame.
  }, [router]);

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          country_code: selectedCountry.dial_code
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.session_id) {
          setSessionId(data.session_id);
        }
        setError(null);
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Full-screen overlay while post-OTP routing happens. Prevents the phone
  // input or any other login UI from painting during the navigation frame.
  const finalizingOverlay = isFinalizing ? (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col items-center justify-center">
      <div className="w-14 h-14 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-700 font-medium">Signing you in…</p>
    </div>
  ) : null;

  if (currentScreen === 'otp-verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        <OtpVerificationScreen
          phoneNumber={phoneNumber}
          countryCode={selectedCountry.dial_code}
          onVerify={handleVerifyOtp}
          onResend={handleResendOtp}
          onBack={() => setCurrentScreen('phone-input')}
        />
        {finalizingOverlay}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 lg:px-6">
      {/* Premium Header */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto flex flex-col items-center mt-4 sm:mt-6 md:mt-8 mb-3 sm:mb-4 md:mb-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-2 sm:mb-3 overflow-hidden">
            <Image 
              src="/sobhagya-logo.svg" 
              alt="Astrology Logo" 
              width={96}
              height={96}
              className="object-cover rounded-full w-full h-full"
              priority
              quality={100}
            />
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 text-center leading-tight`}>
            Sign in to Sobhagya
          </h1>
          <p className="text-[#F7971D] text-sm sm:text-base md:text-lg font-medium text-center mb-2 px-2">
            Connect instantly with expert astrologers
          </p>
        </div>
      </div>

      {/* Glassmorphism Card */}
      <motion.div 
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border-l-4 border-orange-400 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center relative z-10 animate-fade-in"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <form onSubmit={handleSubmit} className="w-full space-y-4 sm:space-y-5 md:space-y-6">
          {/* Phone Input Group */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="flex rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-orange-500 bg-white transition-all duration-200 shadow-sm focus-within:shadow-lg">
              {/* Country Selector */}
              <div className="relative flex items-center bg-gray-50 px-2 sm:px-3 border-r border-gray-200 cursor-pointer select-none min-w-0 focus-within:ring-2 focus-within:ring-orange-400" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 focus:outline-none min-w-0 py-3 sm:py-2 focus-visible:ring-2 focus-visible:ring-orange-400 transition-all duration-150"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                >
                  <span className="w-5 h-4 sm:w-6 sm:h-4 mr-1 flex items-center justify-center flex-shrink-0 drop-shadow-sm">
                    <Image 
                      src={selectedCountry.flag} 
                      alt={selectedCountry.code} 
                      width={24} 
                      height={16} 
                      className="object-contain rounded-sm" 
                    />
                  </span>
                  <span className="text-sm sm:text-base font-medium text-gray-700 whitespace-nowrap select-none">
                    {selectedCountry.dial_code}
                  </span>
                  <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute top-full left-0 mt-2 w-56 sm:w-64 md:w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-60 overflow-auto animate-fade-in"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search countries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm sm:text-base"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => selectCountry(country)}
                            className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-orange-100 focus:bg-orange-200 transition-colors text-left touch-manipulation rounded-lg"
                            tabIndex={0}
                          >
                            <span className="w-5 h-4 sm:w-6 sm:h-4 flex items-center justify-center flex-shrink-0 drop-shadow-sm">
                              <Image 
                                src={country.flag} 
                                alt={country.code} 
                                className="w-6 h-4 object-contain rounded-sm"
                                fill
                              />
                            </span>
                            <span className="flex-1 text-xs sm:text-sm text-gray-700 truncate">
                              {country.name}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500 flex-shrink-0">
                              {country.dial_code}
                            </span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {/* Phone Input */}
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Enter your phone number"
                aria-label="Phone Number"
                className="flex-1 px-3 sm:px-4 py-3 sm:py-3 bg-transparent outline-none text-base sm:text-lg font-medium text-gray-700 min-w-0 focus:ring-2 focus:ring-orange-400 transition-all duration-150"
                required
                autoFocus
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={15}
              />
            </div>
          </div>
          
          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="flex items-start gap-2 p-3 sm:p-4 bg-red-100 border border-red-300 rounded-lg text-red-800 mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                role="alert"
              >
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span className="text-xs sm:text-sm leading-relaxed font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading || !phoneNumber}
            aria-disabled={isLoading || !phoneNumber}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white min-h-[48px] py-3 sm:py-4 px-4 sm:px-6 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 touch-manipulation text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-orange-400"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Send OTP</span>
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Trust/Benefits Section */}
      {/* <div className="w-full max-w-lg mx-auto mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Star, title: "Expert Astrologers", desc: "Verified professionals" },
          { icon: Shield, title: "Secure & Private", desc: "Your data is protected" },
          { icon: Zap, title: "Instant Connect", desc: "Available 24/7" }
        ].map((benefit, index) => (
          <div
            key={index}
            className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center flex flex-col items-center shadow border border-orange-100"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-2">
              <benefit.icon className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 text-base">{benefit.title}</h3>
            <p className="text-sm text-gray-600">{benefit.desc}</p>
          </div>
        ))}
      </div> */}

      {/* Footer */}
      <footer className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto mt-4 sm:mt-6 md:mt-8 mb-4 text-center text-xs sm:text-sm text-gray-400 px-4 select-none">
        <span>By continuing, you agree to our </span>
        <button className="text-orange-600 hover:underline touch-manipulation min-h-[44px] px-1 focus:outline-none focus:ring-2 focus:ring-orange-200 rounded">Terms of Service</button>
        <span> and </span>
        <button className="text-orange-600 hover:underline touch-manipulation min-h-[44px] px-1 focus:outline-none focus:ring-2 focus:ring-orange-200 rounded">Privacy Policy</button>
      </footer>

      {/* Partner Restriction Modal */}
      {showPartnerRestrictionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-4">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Call Not Available
              </h3>
              <p className="text-gray-600 mb-6 text-sm">
                You Are a Partner At Sobhagya, So Call Cannot Be Initiated
              </p>
              <button
                onClick={() => {
                  setShowPartnerRestrictionModal(false);
                  router.push('/astrologers');
                }}
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Continue to Astrologers
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {finalizingOverlay}
    </div>
  );
}