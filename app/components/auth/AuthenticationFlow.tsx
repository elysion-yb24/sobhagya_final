"use client";
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Cookies from 'universal-cookie';
import OtpVerificationScreen from '../../components/auth/OtpVerificationScreen'; 
// Adjust the path to wherever your OtpVerificationScreen is located

// Define a type for the country
interface Country {
  code: string;
  name: string;
  dial_code: string;
  flag: string;
}

// Define the shape of the authentication data returned from the server
interface AuthenticationData {
  token?: string;
  [key: string]: any;
}

interface AuthenticationFlowProps {
  /** Controls whether the modal is visible at all */
  isOpen?: boolean;
  /** Called when the user clicks the "X" to close */
  onClose?: () => void;
  /** Called when user is successfully authenticated */
  onAuthenticated?: (data: AuthenticationData) => void;
}

// Example country data
const countries: Country[] = [
  { code: 'IN', name: 'India', dial_code: '+91', flag: '/flags/in.png' },
  { code: 'US', name: 'United States', dial_code: '+1', flag: '/flags/us.png' },
  // ...
];

export default function AuthenticationFlow({
  isOpen = false,
  onClose = () => {},
  onAuthenticated,
}: AuthenticationFlowProps) {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    countries.find(c => c.code === 'IN')!
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentScreen, setCurrentScreen] = useState<'phone-input' | 'otp-verification'>('phone-input');

  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const cookies = new Cookies(null, { path: '/' })
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries for the dropdown search
  const filteredCountries = searchTerm
    ? countries.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dial_code.includes(searchTerm),
      )
    : countries;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Submit phone for OTP */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://micro.sobhagya.in/auth/api/signup-login/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          country_code: selectedCountry.dial_code,
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
    } catch (err) {
      console.error('Error sending OTP:', err);
      setError('An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  /** Handle final OTP verification from OtpVerificationScreen */
  const handleVerifyOtp = async (otpData: any) => {
    // We receive OTP data from the child; 
    // but if you prefer verifying here, you can do so instead.
    // In your code, you actually do the verification in the child,
    // which is also fine. 
    //
    // If you want the child to do all the verifying, you can remove
    // or simplify this. 
    // For example, just set isLoading, etc., or store token from child:

    setIsLoading(false);

    // If the child returned an error, handle it:
    if (otpData?.error) {
      setError(otpData.error);
      return;
    }

    // If success, call onAuthenticated:
    if (onAuthenticated) {
      onAuthenticated(otpData);
    }
    onClose();
  };

  /** Handle resend from OtpVerificationScreen */
  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('https://micro.sobhagya.in/auth/api/signup-login/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          country_code: selectedCountry.dial_code,
        }),
      });

      const data = await response.json();
      const authToken = response.headers.get("auth-token");
      
      if (authToken) cookies.set('access_token', authToken)

      if (response.ok) {
        if (data.session_id) {
          setSessionId(data.session_id);
        }
        setError(null);
      } else {
        setError(data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      console.error('Error resending OTP:', err);
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

  // Hide if not open
  if (!isOpen) return null;

  // If user has moved to the OTP screen
  if (currentScreen === 'otp-verification') {
    return (
      <OtpVerificationScreen
        phoneNumber={phoneNumber}
        countryCode={selectedCountry.dial_code}
        onVerify={handleVerifyOtp}      // Called when OTP is verified
        onResend={handleResendOtp}      // Called when user clicks "Resend OTP"
        onBack={() => setCurrentScreen('phone-input')}
        isLoading={isLoading}           // We pass this down
        error={error}                   // Pass down any error message
      />
    );
  }

  // Otherwise, show the phone-input screen
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg overflow-hidden relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-700 hover:text-gray-900 z-10"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg"
               className="h-5 w-5 sm:h-6 sm:w-6"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        {/* Header */}
        <div className="bg-[#F7971D] py-3 sm:py-4 text-center">
          <h1
            className="text-white text-xl sm:text-2xl md:text-3xl font-medium"
            style={{ fontFamily: 'Poppins', letterSpacing: '1%' }}
          >
            Continue With Phone
          </h1>
        </div>

        {/* Form Content */}
        <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
          <p
            className="text-center text-[#373737] mb-6 sm:mb-8 md:mb-10 font-normal text-base sm:text-lg md:text-xl"
            style={{ fontFamily: 'Poppins' }}
          >
            You&apos;ll receive a 4-digit code to verify your identity
          </p>

          <form onSubmit={handleSubmit}>
            <label
              className="block text-center text-[#373737] font-normal mb-3 sm:mb-4 md:mb-5 text-base sm:text-lg md:text-xl"
              style={{ fontFamily: 'Poppins' }}
            >
              Enter Your phone Number
            </label>

            {error && (
              <div className="mb-4 text-red-500 text-center text-sm sm:text-base">
                {error}
              </div>
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gray-500 ml-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
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
                      <div className="p-3 text-center text-gray-500">
                        No results found
                      </div>
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
