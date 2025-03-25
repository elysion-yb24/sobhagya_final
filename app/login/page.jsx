"use client";
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import OtpVerificationScreen from '../components/auth/OtpVerificationScreen';

const countries = [
  { code: 'IN', name: 'India', dial_code: '+91', flag: '/flags/in.png' },
  { code: 'US', name: 'United States', dial_code: '+1', flag: '/flags/us.png' },
  // Other countries can be uncommented as needed
];

export default function Page({ isOpen = false, onClose = () => {}, onAuthenticated = () => {} }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countries.find(c => c.code === 'IN'));
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentScreen, setCurrentScreen] = useState('phone-input'); // 'phone-input' or 'otp-verification'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null); // Store the session ID from the OTP request
  
  const dropdownRef = useRef(null);
  
  const filteredCountries = searchTerm 
    ? countries.filter(country => 
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        country.dial_code.includes(searchTerm))
    : countries;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const fullPhoneNumber = `${selectedCountry.dial_code}${phoneNumber}`;
      const response = await fetch('https://micro.sobhagya.in/auth/api/signup-login/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          country_code: selectedCountry.dial_code // Ensure country code is sent separately
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store the session ID if it's returned from the API
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

  const handleVerifyOtp = async (otp) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://micro.sobhagya.in/auth/api/signup-login/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          country_code: selectedCountry.dial_code,
          otp: otp,
          session_id: sessionId // Include session ID if your API requires it
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save token to localStorage for persistence
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          
          // Also save in a cookie for additional backup
          document.cookie = `authToken=${data.token}; path=/; max-age=${60*60*24*7}`; // 7 days
          
          console.log("Token saved successfully:", data.token);
        } else {
          console.error("No token found in response:", data);
          setError("Authentication succeeded but no token was received.");
        }
        
        // Pass the full userData to the callback
        if (onAuthenticated) {
          onAuthenticated(data);
        }
        
        onClose();
      } else {
        setError(data.message || 'Failed to verify OTP. Please try again.');
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
      const response = await fetch('https://micro.sobhagya.in/auth/api/signup-login/send-otp', {
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
        // Update session ID if a new one is provided
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

  const selectCountry = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };
  
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg overflow-hidden relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-700 hover:text-gray-900 z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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