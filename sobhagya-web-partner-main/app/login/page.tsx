'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, userAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.sendOtp(phone.trim());
      if (response.success) {
        toast.success('OTP sent successfully');
        setStep('otp');
      } else {
        toast.error(response.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toast.error('Please enter OTP');
      return;
    }

    // Backend validates OTP length: 3-5 characters
    if (otp.trim().length < 3 || otp.trim().length > 5) {
      toast.error('OTP must be 3-5 digits');
      return;
    }

    setLoading(true);
    try {
      // Backend requires notifyToken (non-empty string)
      const response = await authAPI.verifyOtp(phone.trim(), otp.trim(), 'web-portal');
      
      if (response.success) {
        // Check if user is a partner/astrologer BEFORE proceeding
        // Backend returns role in response.data.role
        const userRole = response.data?.role;
        const allowedRoles = ['friend', 'astrologer']; // Partners/astrologers have 'friend' or 'astrologer' role
        
        if (!userRole || !allowedRoles.includes(userRole)) {
          // User is NOT a partner - clear token and reset form
          localStorage.removeItem('auth-token');
          setToken(null);
          setUser(null);
          toast.error('You are not a partner. Be a partner first to access this portal.');
          setStep('phone');
          setPhone('');
          setOtp('');
          return;
        }
        
        // User IS a partner - proceed with login
        // Token is saved by interceptor, wait a moment
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const token = localStorage.getItem('auth-token');
        if (token && token !== 'null') {
          setToken(token);
          
          // Fetch user profile as per backend response format
          const userResponse = await userAPI.getUserData();
          if (userResponse.success) {
            // Double-check role from user data to be extra safe
            const userDataRole = userResponse.data?.role;
            if (!userDataRole || !allowedRoles.includes(userDataRole)) {
              // User data shows they're not a partner - logout immediately
              localStorage.removeItem('auth-token');
              setToken(null);
              setUser(null);
              toast.error('You are not a partner. Be a partner first to access this portal.');
              setStep('phone');
              setPhone('');
              setOtp('');
              return;
            }
            
            setUser(userResponse.data);
            toast.success('Login successful');
            router.push('/dashboard');
          } else {
            toast.error(userResponse.message || 'Failed to fetch user data');
          }
        } else {
          toast.error('Authentication token not received');
        }
      } else {
        // Backend returns { success: false, message: string } format
        toast.error(response.message || 'Invalid OTP');
      }
    } catch (error: any) {
      // Backend validation errors return 400 with ExpressValidatorErr format
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData.errors) {
          // Validation errors object
          const errorMessages = Object.values(errorData.errors).join(', ');
          toast.error(errorMessages || 'Validation error');
        } else {
          toast.error(errorData.message || 'Invalid request');
        }
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to verify OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-md border border-gray-200">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img 
              src="/sobhagya.png" 
              alt="Sobhagya Logo" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Partner Portal
          </h1>
          <p className="text-gray-500 font-medium text-sm">Login to access your dashboard</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2.5">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="w-full px-5 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all bg-gray-50 text-gray-900 placeholder-gray-400 font-medium"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-600 font-medium mb-1">OTP sent to:</p>
                  <p className="text-lg font-bold text-gray-900">{phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setOtp('');
                  }}
                  className="ml-3 p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-all flex items-center gap-1.5 text-sm font-medium"
                  title="Edit phone number"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2.5">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="00000"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none text-center text-2xl tracking-[0.3em] font-bold transition-all bg-gray-50 text-gray-900 placeholder-gray-300"
                maxLength={5}
                minLength={3}
                required
              />
              <p className="text-xs text-gray-500 mt-2 text-center">Enter the 3-5 digit code sent to your phone</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('phone');
                setOtp('');
              }}
              className="w-full text-gray-600 hover:text-gray-700 font-semibold transition-colors text-sm mt-2 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

