"use client";
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import OtpVerificationScreen from '../components/auth/OtpVerificationScreen';
import { getAuthToken, clearAuthData, isAuthenticated, initializeAuth } from '../utils/auth-utils';
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
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Check if user is already authenticated
  useEffect(() => {
    // Check if user is already authenticated
    try {
      const isAuthValid = initializeAuth();
      if (isAuthValid) {
        console.log('✅ User already authenticated, redirecting to astrologers');
        router.push('/astrologers');
      }
    } catch (error) {
      console.log('❌ Authentication check failed on login page:', error);
      // Continue to show login page
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
      // Redirect to astrologers page after successful authentication
      router.push('/astrologers');
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
        
        // Redirect to astrologers page after successful authentication
        router.push('/astrologers');
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

  // Render OTP verification screen
  if (currentScreen === 'otp-verification') {
    return (
      <OtpVerificationScreen 
        phoneNumber={phoneNumber}
        countryCode={selectedCountry.dial_code}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        onBack={() => setCurrentScreen('phone-input')}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // Render phone input screen
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg overflow-hidden relative">
        {/* Back to home button */}
        <button 
          onClick={handleBackToHome}
          className="absolute top-2 left-2 sm:top-3 sm:left-3 text-gray-700 hover:text-gray-900 z-10"
          aria-label="Back to home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        
        {/* Header */}
        <div className="bg-[#F7971D] py-3 sm:py-4 text-center">
          <h1 className="text-white text-xl sm:text-2xl md:text-3xl font-medium" style={{
            fontFamily: 'Poppins',
            letterSpacing: '1%',
          }}>Continue With Phone</h1>
        </div>
        
        {/* Form Content */}
        <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
          <p className="text-center text-[#373737] mb-6 sm:mb-8 md:mb-10 font-normal text-base sm:text-lg md:text-xl" style={{
            fontFamily: 'Poppins',
          }}>
            You'll receive a 4-digit code to verify your identity
          </p>
          
          <form onSubmit={handleSubmit}>
            <label className="block text-center text-[#373737] font-normal mb-3 sm:mb-4 md:mb-5 text-base sm:text-lg md:text-xl" style={{
                fontFamily: 'Poppins',
            }}>
              Enter Your phone Number
            </label>
            
            {error && (
              <div className="mb-4 text-red-500 text-center text-sm sm:text-base">{error}</div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-y-3 sm:gap-y-0 sm:gap-x-2 mb-6 sm:mb-8">
              {/* Country Code Selector */}
              <div className="relative w-full sm:w-auto" ref={dropdownRef}>
                <div 
                  className="flex items-center justify-between bg-[#F2F2F2] px-3 py-2 rounded-md sm:rounded-l-md sm:rounded-r-none border border-gray-300 h-12 cursor-pointer w-full sm:w-24 focus:outline-orange-600"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center justify-center w-full">
                    <span className="text-sm mr-1">{selectedCountry.dial_code}</span>
                    <Image 
                      src={selectedCountry.flag} 
                      alt={selectedCountry.name} 
                      width={18} 
                      height={13}
                      className="ml-1"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-1 w-full sm:w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {/* Search input */}
                    <div className="sticky top-0 bg-white p-2 border-b">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Search country or code"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    {filteredCountries.map((country) => (
                      <div 
                        key={country.code}
                        className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectCountry(country)}
                      >
                        <Image 
                          src={country.flag} 
                          alt={country.name} 
                          width={24} 
                          height={16}
                          className="mr-2"
                        />
                        <span className="text-sm">{country.name}</span>
                        <span className="ml-auto text-gray-500 text-sm">{country.dial_code}</span>
                      </div>
                    ))}
                    
                    {filteredCountries.length === 0 && (
                      <div className="p-3 text-center text-gray-500">No results found</div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Phone Number Input */}
              <input
                type="tel"
                placeholder="Enter Your Phone Number"
                className="w-full sm:w-64 px-4 py-2 border border-gray-300 bg-[#F2F2F2] rounded-md sm:rounded-l-none sm:rounded-r-md h-12 focus:outline-[#F7971D]"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                required
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !phoneNumber}
              className={`w-full max-w-full sm:max-w-md flex justify-center mx-auto bg-[#F7971D] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-md hover:bg-orange-500 transition-colors font-medium text-sm sm:text-base ${
                (isLoading || !phoneNumber) ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Sending...' : 'Send OTP on this Phone number'}
            </button>
          </form>
          
          {/* Footer Text */}
          <p className="text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6">
            You agree to our 
            <a href="/privacy-policy" className="text-orange-400 hover:underline ml-1">Privacy Policy</a>
            <span className="mx-1">&</span>
            <a href="/terms" className="text-orange-400 hover:underline">Terms of Service</a>
          </p>
        </div>
      </div>
    </div>
  );
}