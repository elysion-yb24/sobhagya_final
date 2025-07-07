"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'universal-cookie';
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
    if (timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft]);

  useEffect(() => {
    setError(parentError);
  }, [parentError]);

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
        
        const userDetails = {
          id: data.data?._id || data.user?.id || data._id || data.id || data.data?.id || "",
          phoneNumber,
          countryCode,
          timestamp: new Date().getTime(),
          role: data.data?.role || data.user?.role || data.role || "user",
          name: data.data?.name || data.user?.name || data.name || "",
          email: data.data?.email || data.user?.email || data.email || ""
        };
        
        console.log("Storing user details:", userDetails);
        storeUserDetails(userDetails);
        // Dispatch event for instant header update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('user-auth-changed'));
        }
        // Call onVerify only to notify success, don't pass data that would trigger another verification
        console.log("Calling onVerify and redirecting...");
        onVerify({ success: true, verified: true });
        
        // Small delay to ensure header updates before redirect
        setTimeout(() => {
        router.push("/astrologers");
        }, 100);
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
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-gradient-to-br from-orange-50 via-white to-orange-50/30 backdrop-blur-sm p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/20 to-orange-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-orange-100/20 to-orange-200/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main card */}
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-orange-100/50 animate-fade-in">
        {/* Header section */}
        <div className="relative px-8 pt-10 pb-6 text-center">
          {/* Decorative top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400"></div>
          
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl shadow-lg mb-6 transform hover:scale-105 transition-transform duration-200">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" className="text-white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Verify Your Phone
          </h1>
          
          {/* Subtitle */}
          <p className="text-gray-600 text-base mb-4 leading-relaxed">
            Enter the 4-digit verification code sent to
          </p>
          
          {/* Phone number display */}
          <div className="inline-flex items-center px-4 py-2 bg-orange-50 rounded-xl border border-orange-200/50">
            <span className="text-orange-600 font-semibold text-lg">
              {countryCode} {phoneNumber}
            </span>
          </div>
          </div>

        {/* OTP Input Section */}
        <div className="px-8 pb-6">
          <div className="flex justify-center gap-3 mb-6">
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
                className="w-14 h-14 text-center text-2xl bg-white border-2 border-orange-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all duration-200 font-bold text-gray-900 hover:border-orange-300"
                style={{fontFamily: 'Poppins', letterSpacing: '0.1em'}}
              />
            ))}
          </div>

          {/* Error message */}
          {(error || parentError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium text-center">
              {error || parentError}
            </div>
          )}

          {/* Resend section */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-gray-500 text-sm">
              {timeLeft > 0 ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className={`text-orange-500 font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                timeLeft > 0 || isResending
                  ? "opacity-40 cursor-not-allowed" 
                  : "hover:text-orange-600 hover:scale-105"
              }`}
            >
              {isResending ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Resend Code
                </>
              )}
            </button>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
          <button
            onClick={handleVerify}
            disabled={isSubmitDisabled}
              className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-xl shadow-lg font-bold text-lg transition-all duration-200 transform ${
                isSubmitDisabled 
                  ? "opacity-50 cursor-not-allowed" 
                  : "hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
              {isLoading || parentIsLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                "Verify & Continue"
              )}
          </button>

          <button
            onClick={onBack}
              className="w-full bg-transparent text-gray-500 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 text-base font-medium hover:text-gray-700"
          >
              ← Back to Login
          </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6">
          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/privacy-policy" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}