"use client";
import { useState, useRef, useEffect } from 'react';
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
import { getAuthToken, clearAuthData, isAuthenticated } from '../utils/auth-utils';
import { buildApiUrl, API_CONFIG } from '../config/api';

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
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    setMounted(true);
    
    try {
      const isAuthValid = isAuthenticated();
      if (isAuthValid) {
        console.log('✅ User already authenticated, checking for stored astrologer ID');
        // Check if there's a stored astrologer ID from the call flow
        const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
        const callType = localStorage.getItem('callType');
        
        if (storedAstrologerId) {
          console.log('Found stored astrologer ID:', storedAstrologerId, 'call type:', callType);
          
          if (callType === 'audio' || callType === 'video') {
            // Redirect to astrologer profile with call type for direct call initiation
            console.log('Redirecting to astrologer profile for direct call initiation');
            router.push(`/astrologers/${storedAstrologerId}?callType=${callType}`);
          } else {
            // Redirect to the specific astrologer profile
            router.push(`/astrologers/${storedAstrologerId}`);
          }
        } else {
          console.log('No stored astrologer ID, redirecting to astrologers page');
          router.push('/astrologers');
        }
      }
    } catch (error) {
      console.log('❌ Authentication check failed on login page:', error);
      
    }
  }, [router]);
  
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
    // If this is just a success notification from OtpVerificationScreen, don't re-verify
    if (data && data.verified === true) {
      console.log("OTP verification completed successfully by child component");
      setError(null);
      
      // Check if there's a stored astrologer ID from the call flow
      const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
      
      if (storedAstrologerId) {
        console.log('Found stored astrologer ID, redirecting to profile:', storedAstrologerId);
        // Clear the stored ID to avoid future conflicts
        localStorage.removeItem('selectedAstrologerId');
        // Redirect to the specific astrologer profile
        router.push(`/astrologers/${storedAstrologerId}`);
      } else {
        // Redirect to astrologers page after successful authentication
        router.push('/astrologers');
      }
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
          
          document.cookie = `authToken=${responseData.token}; path=/; max-age=${60*60*24*7}`; // 7 days
          
          console.log("Token saved successfully:", responseData.token);
        } else {
          console.error("No token found in response:", responseData);
          setError("Authentication succeeded but no token was received.");
        }
        
        // Check if there's a stored astrologer ID from the call flow
        const storedAstrologerId = localStorage.getItem('selectedAstrologerId');
        const callType = localStorage.getItem('callType');
        
        if (storedAstrologerId) {
          console.log('Found stored astrologer ID:', storedAstrologerId, 'call type:', callType);
          
          // Clear the stored data to avoid future conflicts
          localStorage.removeItem('selectedAstrologerId');
          localStorage.removeItem('callType');
          
          if (callType === 'audio' || callType === 'video') {
            // Redirect to astrologer profile with call type for direct call initiation
            console.log('Redirecting to astrologer profile for direct call initiation');
            router.push(`/astrologers/${storedAstrologerId}?callType=${callType}`);
          } else {
            // Redirect to the specific astrologer profile
            router.push(`/astrologers/${storedAstrologerId}`);
          }
        } else {
          // Redirect to astrologers page after successful authentication
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
              src="/sobhagya_logo.avif" 
              alt="Astrology Logo" 
              width={80} 
              height={80} 
              className="object-cover w-full h-full rounded-full" 
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-1 text-center leading-tight">
            Sign in to Sobhagya
          </h1>
          <p className="text-orange-700 text-sm sm:text-base md:text-lg font-medium text-center mb-2 px-2">
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
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                className="flex-1 px-3 sm:px-4 py-3 sm:py-3 bg-transparent outline-none text-base sm:text-lg font-medium text-gray-700 min-w-0"
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
    </div>
  );
}