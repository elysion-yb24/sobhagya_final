"use client";
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

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
import { getAuthToken, clearAuthData, isAuthenticated, getUserDetails } from '../utils/auth-utils';
import { buildApiUrl, API_CONFIG } from '../config/api';
import { getApiBaseUrl } from '../config/api';
import { isValidMobileNumber, getPhoneValidationError, sanitizePhoneInput } from '../utils/phone-validation';
import { initiateCall } from '../utils/call-utils';


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
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    setMounted(true);

    const checkAuthAndRedirect = async () => {
      try {
        // Don't run this check if we're currently verifying OTP
        if (isVerifyingOtp) {
          return;
        }

        const isAuthValid = isAuthenticated();
        if (isAuthValid) {

          // Check if there's a stored astrologer ID from the call flow
          const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
          const callIntent = localStorage.getItem('callIntent');
          const callSource = localStorage.getItem('callSource');

          // Check user role first
          const user = getUserDetails();

          // Check if user is new (no name) and redirect to profile completion
          const hasName = user && (user.name || user.firstName || user.displayName) &&
            (user.name || user.firstName || user.displayName).trim() !== '';
          const isPhoneNumber = (str: string): boolean => {
            if (!str) return false;
            const phonePattern = /^[\d\s\+\-\(\)]+$/;
            const digitCount = (str.match(/\d/g) || []).length;
            return phonePattern.test(str) && digitCount >= 10;
          };
          const displayNameIsPhone = user?.displayName && isPhoneNumber(user.displayName);
          const userNeedsProfile = !hasName || displayNameIsPhone;

          // If user is new (no name) and no call intent, redirect to profile completion
          if (userNeedsProfile && !callIntent && !storedAstrologerId) {
            router.push('/profile/complete');
            return;
          }

          if (user && user.role === 'friend') {
            // Check if there's a call intent - show modal if user was trying to make a call
            if (callIntent) {
              // Clear call-related localStorage items
              localStorage.removeItem('selectedAstrologerId');
              localStorage.removeItem('callIntent');
              localStorage.removeItem('callSource');
              setShowPartnerRestrictionModal(true);
              return;
            } else {
              router.push('/partner-info');
              return;
            }
          }

          if (storedAstrologerId && callIntent && callSource === 'callWithAstrologer') {
            // Clear the original intent data
            localStorage.removeItem('selectedAstrologerId');
            localStorage.removeItem('callIntent');
            localStorage.removeItem('callSource');
            // Directly initiate call and navigate to call page
            await initiateCall({
              astrologerId: storedAstrologerId,
              callType: callIntent === 'video' ? 'video' : 'audio',
              router
            });
            return;
          } else if (storedAstrologerId && callIntent && callSource === 'astrologerCard') {
            // Store the call intent for immediate call initiation
            localStorage.setItem('immediateCallIntent', callIntent);
            localStorage.setItem('immediateCallAstrologerId', storedAstrologerId);
            // Clear the original intent data
            localStorage.removeItem('selectedAstrologerId');
            localStorage.removeItem('callIntent');
            // Redirect to astrologers page for immediate call initiation
            router.push('/astrologers');
          } else if (storedAstrologerId) {
            localStorage.removeItem('selectedAstrologerId');
            // Redirect to the specific astrologer profile
            router.push(`/astrologers/${storedAstrologerId}`);
          } else {
            router.push('/astrologers');
          }
        }
      } catch (error) {

      }
    };

    checkAuthAndRedirect();
  }, [router, isVerifyingOtp]);

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

    // Validate phone number before submitting
    const phoneValidationError = getPhoneValidationError(phoneNumber);
    if (phoneValidationError) {
      setError(phoneValidationError);
      setIsLoading(false);
      return;
    }

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


      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP), {
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



  const handleVerifyOtp = async (data: any) => {
    setIsVerifyingOtp(true);
    // If this is just a success notification from OtpVerificationScreen, don't re-verify
    if (data && data.verified === true) {
      setError(null);

      // Add a small delay to ensure localStorage and user details are properly set
      setTimeout(async () => {
        try {
          // Check user role first
          const user = getUserDetails();

          if (user && user.role === 'friend') {
            setIsVerifyingOtp(false);

            // Check if there was a call intent - only show modal if user was trying to make a call
            const callIntent = localStorage.getItem('callIntent');
            const callSource = localStorage.getItem('callSource');

            // For debugging: Always show modal for friend users if there was any call intent
            if (callIntent) {
              // Clear call-related localStorage items
              localStorage.removeItem('selectedAstrologerId');
              localStorage.removeItem('callIntent');
              localStorage.removeItem('callSource');

              // Show the partner restriction modal
              setShowPartnerRestrictionModal(true);
              return;
            } else {
              // If no call intent, redirect to partner info page
              router.push('/partner-info');
              return;
            }
          }


          // After OTP success, route based on intent
          const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
          const chatIntent = localStorage.getItem('chatIntent');
          const callIntent = localStorage.getItem('callIntent');
          const callSource = localStorage.getItem('callSource');

          // Check if user details are present in database response
          const userDetails = getUserDetails();
          const isPhoneNumber = (str: string): boolean => {
            if (!str) return false;
            const phonePattern = /^[\d\s\+\-\(\)]+$/;
            const digitCount = (str.match(/\d/g) || []).length;
            return phonePattern.test(str) && digitCount >= 10;
          };
          const hasUserDetails = userDetails && (userDetails.name || userDetails.firstName) &&
            (userDetails.name || userDetails.firstName).trim() !== '' &&
            !isPhoneNumber(userDetails.name || userDetails.firstName || '');
          const displayNameIsPhone = userDetails?.displayName && isPhoneNumber(userDetails.displayName);
          const userNeedsProfile = !hasUserDetails || displayNameIsPhone;

          // If user details are not present, redirect to profile completion
          if (userNeedsProfile) {
            setIsVerifyingOtp(false);
            router.push('/profile/complete');
            return;
          }

          if (storedAstrologerId) {
            if (chatIntent === '1') {
              // Open chat with deterministic room id
              const profile = getUserDetails();
              const currentUserId = profile?.id || profile?._id || '';
              const currentUserName = profile?.displayName || profile?.name || 'User';
              if (currentUserId) {
                const a = currentUserId;
                const b = storedAstrologerId;
                const roomId = a < b ? `chat-${a}-${b}` : `chat-${b}-${a}`;
                // Clear intent keys
                localStorage.removeItem('selectedAstrologerId');
                localStorage.removeItem('chatIntent');
                setIsVerifyingOtp(false);
                window.location.href = `/chat-room/${encodeURIComponent(roomId)}?userId=${encodeURIComponent(currentUserId)}&userName=${encodeURIComponent(currentUserName)}&role=user&autoDetails=1&astrologerId=${encodeURIComponent(storedAstrologerId)}`;
                return;
              }
            } else if (callIntent) {
              localStorage.removeItem('selectedAstrologerId');
              localStorage.removeItem('callIntent');
              localStorage.removeItem('callSource');
              await initiateCall({
                astrologerId: storedAstrologerId,
                callType: callIntent === 'video' ? 'video' : 'audio',
                router
              });
              setIsVerifyingOtp(false);
              return;
            } else {
              // No specific intent, just go to profile
              localStorage.removeItem('selectedAstrologerId');
              router.push(`/astrologers/${storedAstrologerId}`);
              setIsVerifyingOtp(false);
              return;
            }
          }

          // Default fallback
          setIsVerifyingOtp(false);
          router.push('/astrologers');
        } catch (error) {
          console.error('❌ Error in post-OTP routing:', error);
          setIsVerifyingOtp(false);
          router.push('/astrologers');
        }
      }, 300); // Reduced delay for faster redirect
      return;
    }

    // Legacy OTP verification (if needed for backwards compatibility)
    const otp = typeof data === 'string' ? data : null;
    if (!otp) {
      console.error("Invalid OTP data received:", data);
      setError("Invalid OTP format");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otp,
          session_id: sessionId
        }),
      });

      const responseData: AuthenticationData = await response.json();

      if (response.ok) {
        if (responseData.token) {
          localStorage.setItem('authToken', responseData.token);

          document.cookie = `authToken=${responseData.token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
        } else {
          console.error("No token found in response:", responseData);
          setError("Authentication succeeded but no token was received.");
        }

        // Post-OTP: handle call intent and chat intent
        const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
        const callIntent = localStorage.getItem('callIntent');
        const chatIntent = localStorage.getItem('chatIntent');
        const callSource = localStorage.getItem('callSource');

        const user = getUserDetails();
        if (user && user.role === 'friend') {
          router.push('/partner-info');
          return;
        }

        // Check if user details are present in database response (legacy)
        const isPhoneNumber = (str: string): boolean => {
          if (!str) return false;
          const phonePattern = /^[\d\s\+\-\(\)]+$/;
          const digitCount = (str.match(/\d/g) || []).length;
          return phonePattern.test(str) && digitCount >= 10;
        };
        const hasUserDetails = user && (user.name || user.firstName) &&
          (user.name || user.firstName).trim() !== '' &&
          !isPhoneNumber(user.name || user.firstName || '');
        const displayNameIsPhone = user?.displayName && isPhoneNumber(user.displayName);
        const userNeedsProfile = !hasUserDetails || displayNameIsPhone;

        // If user details are not present, redirect to profile completion
        if (userNeedsProfile) {
          router.push('/profile/complete');
          return;
        }

        // Handle chat intent first
        if (storedAstrologerId && chatIntent === '1') {
          const profile = getUserDetails();
          const currentUserId = profile?.id || profile?._id || '';
          const currentUserName = profile?.displayName || profile?.name || 'User';
          if (currentUserId) {
            const a = currentUserId;
            const b = storedAstrologerId;
            const roomId = a < b ? `chat-${a}-${b}` : `chat-${b}-${a}`;
            localStorage.removeItem('selectedAstrologerId');
            localStorage.removeItem('chatIntent');
            window.location.href = `/chat-room/${encodeURIComponent(roomId)}?userId=${encodeURIComponent(currentUserId)}&userName=${encodeURIComponent(currentUserName)}&role=user&autoDetails=1&astrologerId=${encodeURIComponent(storedAstrologerId)}`;
            return;
          }
        }

        // Handle call intent from astrologer card or Call with Astrologer page
        if (storedAstrologerId && callIntent && callSource === 'callWithAstrologer') {

          // Clear the original intent data
          localStorage.removeItem('selectedAstrologerId');
          localStorage.removeItem('callIntent');
          localStorage.removeItem('callSource');

          // Directly initiate call and navigate to call page
          await initiateCall({
            astrologerId: storedAstrologerId,
            callType: callIntent === 'video' ? 'video' : 'audio',
            router
          });
          return;
        } else if (storedAstrologerId && callIntent && callSource === 'astrologerCard') {

          // Store the call intent for immediate call initiation
          localStorage.setItem('immediateCallIntent', callIntent);
          localStorage.setItem('immediateCallAstrologerId', storedAstrologerId);

          // Clear the original intent data
          localStorage.removeItem('selectedAstrologerId');
          localStorage.removeItem('callIntent');
          localStorage.removeItem('callSource');

          // Redirect to astrologers page where immediate call will be initiated
          router.push('/astrologers');
          return;
        }

        // Handle regular astrologer navigation
        if (storedAstrologerId) {
          localStorage.removeItem('selectedAstrologerId');
          router.push(`/astrologers/${storedAstrologerId}`);
        } else {
          router.push('/astrologers');
        }
      } else {
        setError(responseData.message || 'Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP), {
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
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-2 sm:px-4 lg:px-6">
      {/* Premium Header */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto flex flex-col items-center mt-4 sm:mt-6 md:mt-8 mb-3 sm:mb-4 md:mb-6">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-2 sm:mb-3">
            <Image
              src="/sobhagya-logo.svg"
              alt="Astrology Logo"
              width={80}
              height={80}
              className="object-cover w-full h-full rounded-full"
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
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border-l-4 border-orange-400 p-4 sm:p-6 md:p-8 lg:p-10 flex flex-col items-center relative z-10"
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
            <div className="flex rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-200 focus-within:border-orange-400 bg-white">
              {/* Country Selector */}
              <div className="relative flex items-center bg-gray-50 px-2 sm:px-3 border-r border-gray-200 cursor-pointer select-none min-w-0" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 focus:outline-none min-w-0 py-3 sm:py-2"
                >
                  <span className="w-5 h-4 sm:w-6 sm:h-4 mr-1 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={selectedCountry.flag}
                      alt={selectedCountry.code}
                      width={24}
                      height={16}
                      className="object-contain rounded-sm"
                    />
                  </span>
                  <span className="text-sm sm:text-base font-medium text-gray-700 whitespace-nowrap">
                    {selectedCountry.dial_code}
                  </span>
                  <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute top-full left-0 mt-2 w-56 sm:w-64 md:w-72 bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-xl z-50 max-h-60 overflow-auto"
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
                          />
                        </div>
                      </div>
                      <div className="max-h-40 overflow-y-auto">
                        {filteredCountries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => selectCountry(country)}
                            className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 hover:bg-orange-50 transition-colors text-left touch-manipulation"
                          >
                            <span className="w-5 h-4 sm:w-6 sm:h-4 flex items-center justify-center flex-shrink-0">
                              <Image
                                src={country.flag}
                                alt={country.code}
                                width={24}
                                height={16}
                                className="object-contain rounded-sm"
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
                onChange={(e) => setPhoneNumber(sanitizePhoneInput(e.target.value))}
                placeholder="Enter 10-digit mobile number"
                className="flex-1 px-3 sm:px-4 py-3 sm:py-3 bg-transparent outline-none text-base sm:text-lg font-medium text-gray-700 min-w-0"
                maxLength={10}
                required
              />
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="flex items-start gap-2 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading || !phoneNumber}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 touch-manipulation text-sm sm:text-base"
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
      <footer className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto mt-4 sm:mt-6 md:mt-8 mb-4 text-center text-xs sm:text-sm text-gray-400 px-4">
        <span>By continuing, you agree to our </span>
        <button className="text-orange-600 hover:underline touch-manipulation">Terms of Service</button>
        <span> and </span>
        <button className="text-orange-600 hover:underline touch-manipulation">Privacy Policy</button>
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
    </div>
  );
}