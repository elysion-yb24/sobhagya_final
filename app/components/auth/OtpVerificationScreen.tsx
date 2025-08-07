"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'universal-cookie';
import { motion, AnimatePresence } from 'framer-motion';
import { storeAuthToken, storeUserDetails } from "../../utils/auth-utils";
import { buildApiUrl, API_CONFIG } from '../../config/api';

interface OtpVerificationScreenProps {
  phoneNumber: string;
  countryCode: string;
  onVerify: (data: any) => void;
  onResend: () => void;
  onBack: () => void;
 
  isLoading?: boolean;
  error?: string | null;
  userData?: any;
}


function updateAccessToken(res:any) {
  const authToken = res.headers.get("auth-token");
  const cookies = new Cookies(null, { path: '/' })
  if (authToken) cookies.set('access_token', authToken)
  return
}

export default function OtpVerificationScreen({
  phoneNumber,
  countryCode,
  onVerify,
  onResend,
  onBack,
  
  userData,
  isLoading: parentIsLoading = false,
  error: parentError = null,
}: OtpVerificationScreenProps) {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(parentError);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const cookies = new Cookies(null, { path: '/' });

  useEffect(() => {
    // Lock background scroll when OTP screen is open
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  useEffect(() => {
    setError(parentError);
  }, [parentError]);

  // Auto-submit when all 4 digits are entered
  useEffect(() => {
    const isComplete = otp.every(digit => digit !== '');
    if (isComplete && !isLoading && !parentIsLoading && verificationStatus === 'idle') {
      // Small delay to ensure smooth UX
      setTimeout(() => {
        handleVerify();
      }, 300);
    }
  }, [otp, isLoading, parentIsLoading, verificationStatus]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.split('').slice(0, 4);
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 3);
      document.getElementById(`otp-input-${nextIndex}`)?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 3) {
        document.getElementById(`otp-input-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setVerificationStatus('error');
      setError("Please enter a complete 4-digit OTP");
      return;
    }

    setVerificationStatus('loading');
    setIsLoading(true);
    setError(null);

    try {
      console.log("Verifying OTP:", otpValue, "for phone:", phoneNumber, "with session ID:",);
      console.log("Making request to:", "/api/auth/verify-otp");

      let notifyToken = "";
      try {
        notifyToken = localStorage.getItem('fcmToken') || "placeholder_token";
      } catch (e) {
        console.warn("Could not access localStorage for FCM token:", e);
        notifyToken = "placeholder_token";
      }

      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otpValue,
          notifyToken: notifyToken
        }),
      });

      console.log("OTP verification response status:", response.status);
      console.log("Response headers auth-token:", response.headers.get('auth-token'));
      
      let headerToken = response.headers.get('auth-token');
      let data;
      try {
        data = await response.json();
      } catch (e) {
        setVerificationStatus('error');
        setError("Invalid response from server. Please try again.");
        return;
      }
      let finalToken = headerToken || data.token;
      if (response.ok && finalToken) {
        setVerificationStatus('success');
        
        console.log("OTP verification successful");
        console.log("Full Response data:", JSON.stringify(data, null, 2));
        
        // Store token in localStorage for all future API calls
        localStorage.setItem('authToken', finalToken);
        localStorage.setItem('access_token', finalToken);
          localStorage.setItem('tokenTimestamp', Date.now().toString());
        // Also save token in cookies for SSR or server access
        // document.cookie = `authToken=${finalToken}; path=/; max-age=${60*60*24*7}; SameSite=None; Secure`;
        // document.cookie = `access_token=${finalToken}; path=/; max-age=${60*60*24*7}; SameSite=None; Secure`;
        storeAuthToken(finalToken);
        
        
        // Log the data structure we're working with
        console.log("User ID from data.data?._id:", data.data?._id);
        console.log("User ID from data.user?.id:", data.user?.id);
        console.log("User ID from data._id:", data._id);
        console.log("User ID from data.id:", data.id);
        
        // Check if we have a captured name from call flow
        const capturedName = sessionStorage.getItem('capturedUserName');
        let firstName = '';
        let lastName = '';
        let fullName = data.data?.name || data.user?.name || data.name || capturedName || "";
        
        if (fullName) {
          const nameParts = fullName.split(' ');
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
        }

        const userDetails = {
          id: data.data?._id || data.user?.id || data._id || data.id || data.data?.id || "",
          phoneNumber,
          countryCode,
          timestamp: new Date().getTime(),
          role: data.data?.role || data.user?.role || data.role || "user",
          name: fullName,
          firstName: firstName,
          lastName: lastName,
          displayName: fullName,
          email: data.data?.email || data.user?.email || data.email || "",
          profileCompleted: !!fullName
        };
        
        // Clear the captured name from session storage
        if (capturedName) {
          sessionStorage.removeItem('capturedUserName');
        }
        
        console.log("Storing user details:", userDetails);
        storeUserDetails(userDetails);
        // Dispatch event for instant header update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-auth-changed'));
        }
        // Call onVerify only to notify success, don't pass data that would trigger another verification
        console.log("Calling onVerify - parent will handle redirect...");
        onVerify({ success: true, verified: true });
        
        // Let the parent component handle the redirect based on stored astrologer ID
      } else {
        setVerificationStatus('error');
        setError(data.message || "Invalid OTP. Please check the code and try again.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus('error');
      
      // Check if it's a CORS or network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError("Network connection error. Please check your internet connection and try again.");
      } else if (error instanceof Error && error.message.includes('CORS')) {
        setError("Connection error. Please try again.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError(null);

    try {
      console.log("Resending OTP for phone:", phoneNumber);
      
      let notifyToken = "";
      try {
        notifyToken = localStorage.getItem('fcmToken') || "placeholder_token";
      } catch (e) {
        console.warn("Could not access localStorage for FCM token:", e);
        notifyToken = "placeholder_token";
      }

      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phoneNumber,
            notifyToken: notifyToken 
          }),
        }
      );

      const data = await response.json();
      console.log("Resend OTP response:", data);

      if (response.ok) {
        setOtp(["", "", "", ""]);
        setTimeLeft(30);
        setVerificationStatus('idle');
        onResend();
      } else {
        console.error("Error resending OTP:", data);
        setError(data.message || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Resend error:", error);
      
      // Check if it's a CORS or network error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError("Network connection error when trying to resend OTP. Please check your internet connection and try again.");
      } else if (error instanceof Error && error.message.includes('CORS')) {
        setError("Connection error when trying to resend OTP. Please try again.");
      } else {
        setError("Network error when trying to resend OTP. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
  };

  const isSubmitDisabled = isLoading || parentIsLoading || isResending || otp.some(digit => !digit);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
      {/* Premium Header */}
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto flex flex-col items-center mb-4 sm:mb-6">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-2">
            <img 
              src="/sobhagya_logo.avif" 
              alt="Astrology Logo" 
              className="object-cover w-full h-full rounded-full" 
            />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 mb-1 text-center leading-tight">
            Verify Your Phone
          </h1>
          <p className="text-orange-700 text-sm sm:text-base font-medium text-center mb-2 px-2">
            Enter the 4-digit verification code sent to
          </p>
          <div className="inline-flex items-center px-3 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
            <span className="text-orange-700 font-semibold text-sm sm:text-base md:text-lg">
              {countryCode} {phoneNumber}
            </span>
          </div>
        </div>
      </div>

      {/* Glassmorphism Card */}
      <motion.div 
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-2xl border-l-4 border-orange-400 p-3 sm:p-4 md:p-6 flex flex-col items-center relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="w-full space-y-3 sm:space-y-4">
          {/* OTP Input Group */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm md:text-base font-semibold text-gray-700 mb-1 text-center">
              Enter 4-digit code
            </label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value.replace(/[^0-9]/g, ""))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-center text-xl sm:text-2xl md:text-3xl bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 font-bold text-gray-900 hover:border-orange-200"
                  style={{fontFamily: 'Poppins', letterSpacing: '0.1em'}}
                />
              ))}
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {(error || parentError) && (
              <motion.div
                className="flex items-start gap-2 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs sm:text-sm leading-relaxed">{error || parentError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resend Section */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
            <div className="text-gray-500 text-xs sm:text-sm order-2 sm:order-1">
              {timeLeft > 0 ? (
                <span className="flex items-center gap-1 sm:gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Resend in {timeLeft}s
                </span>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 0 || isResending}
              className={`text-orange-500 font-semibold text-xs sm:text-sm md:text-base transition-all duration-200 flex items-center gap-1 sm:gap-2 py-2 px-3 sm:px-4 rounded-lg hover:bg-orange-50 order-1 sm:order-2 ${
                timeLeft > 0 || isResending
                  ? "opacity-40 cursor-not-allowed" 
                  : "hover:text-orange-600 hover:scale-105"
              }`}
            >
              {isResending ? (
                <>
                  <svg className="animate-spin w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Resend Code
                </>
              )}
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            onClick={handleVerify}
            disabled={isSubmitDisabled}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 touch-manipulation text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading || parentIsLoading ? (
              <>
                <svg className="animate-spin w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Verify & Continue</span>
              </>
            )}
          </motion.button>

          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-full bg-transparent text-gray-500 py-2 sm:py-3 px-4 sm:px-6 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 text-sm sm:text-base touch-manipulation"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Login</span>
            </span>
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-400 px-4">
        <span>By continuing, you agree to our </span>
        <button className="text-orange-600 hover:underline touch-manipulation">Terms of Service</button>
        <span> and </span>
        <button className="text-orange-600 hover:underline touch-manipulation">Privacy Policy</button>
      </footer>
    </div>
  );
}