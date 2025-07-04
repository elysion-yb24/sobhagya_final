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
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otpValue,
          notifyToken: notifyToken
        }),
      });

      console.log("OTP verification response status:", response.status);
      console.log("Response headers auth-token:", response.headers.get('auth-token'));
      
      updateAccessToken(response)
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
        
        // Store token in localStorage and cookies for consistency
        localStorage.setItem('authToken', finalToken);
        localStorage.setItem('access_token', finalToken);
        localStorage.setItem('tokenTimestamp', Date.now().toString());
        document.cookie = `authToken=${finalToken}; path=/; max-age=${60*60*24*7}`;
        document.cookie = `access_token=${finalToken}; path=/; max-age=${60*60*24*7}`;
        
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
        
        // Call onVerify only to notify success, don't pass data that would trigger another verification
        console.log("Calling onVerify and redirecting...");
        onVerify({ success: true, verified: true });
        router.push("/astrologers");
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
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-md w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg overflow-hidden relative">
        <div className="bg-[#F7971D] py-3 sm:py-4 text-center">
          <h1
            className="text-white text-xl sm:text-2xl md:text-3xl font-medium"
            style={{
              fontFamily: "Poppins",
              letterSpacing: "1%",
            }}
          >
            Verify Phone
          </h1>
        </div>

        <div className="px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-10">
          <p
            className="text-center text-[#373737] mb-6 sm:mb-8 md:mb-10 font-normal text-base sm:text-lg md:text-xl"
            style={{
              fontFamily: "Poppins",
            }}
          >
            Enter the 4-digit code sent to your phone
          </p>

          <div className="text-center mb-6 sm:mb-8">
            <p
              className="text-[#373737] font-medium text-base sm:text-lg md:text-xl"
              style={{
                fontFamily: "Poppins",
              }}
            >
              OTP sent to {countryCode} {phoneNumber}
            </p>
          </div>

          <div className="flex justify-center space-x-2 sm:space-x-3 md:space-x-4 mb-6 sm:mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={digit}
                onChange={(e) =>
                  handleChange(index, e.target.value.replace(/[^0-9]/g, ""))
                }
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-center text-lg sm:text-xl md:text-2xl bg-[#F2F2F2] border border-gray-300 rounded-md focus:outline-[#F7971D] focus:border-[#F7971D]"
                style={{
                  fontFamily: "Poppins",
                }}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 sm:mb-8 gap-y-3">
            <div className="text-gray-600 text-sm sm:text-base">
              {timeLeft > 0 ? (
                <span>Resend OTP in {timeLeft}s</span>
              ) : (
                <span>&nbsp;</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 0 || isResending}
              className={`text-[#F7971D] font-medium text-sm sm:text-base ${
                timeLeft > 0 || isResending
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:text-orange-600"
              }`}
            >
              Resend OTP
            </button>
          </div>

          {(error || parentError) && (
            <div className="text-red-500 text-center mb-4 text-sm sm:text-base">
              {error || parentError}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isSubmitDisabled}
            className={`w-full flex justify-center mx-auto bg-[#F7971D] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-md hover:bg-orange-500 transition-colors font-medium text-sm sm:text-base ${
              isSubmitDisabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading || parentIsLoading ? "Verifying..." : "Login"}
          </button>

          <button
            onClick={onBack}
            className="mt-3 sm:mt-4 w-full flex justify-center mx-auto bg-transparent text-gray-600 py-2 px-6 rounded-md hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            Back
          </button>

          <p className="text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6">
            You agree to our
            <a
              href="/privacy-policy"
              className="text-orange-400 hover:underline ml-1"
            >
              Privacy Policy
            </a>
            <span className="mx-1">&</span>
            <a href="/terms" className="text-orange-400 hover:underline">
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}