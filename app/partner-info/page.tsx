"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { getUserDetails, getAuthToken } from '../utils/auth-utils';
import { getApiBaseUrl } from '../config/api';

interface PartnerData {
  _id: string;
  name: string;
  avatar?: string;
  profileImage?: string;
  rating?: { avg: number; count: number };
  calls?: number;
  callMinutes?: number;
  rpm?: number;
  status?: string;
  phone?: string;
  about?: string;
  experience?: string;
  specializations?: string[];
  languages?: string[];
}

export default function PartnerInfoPage() {
  const [user, setUser] = useState<any>(null);
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const userData = getUserDetails();
    console.log('User data retrieved:', userData);
    setUser(userData);

    // If user is a partner (role: friend), fetch their partner profile
    if (userData && userData.role === 'friend' && userData.id) {
      fetchPartnerData(userData.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchPartnerData = async (partnerId: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token found');
        setLoading(false);
        return;
      }

      console.log('Fetching partner data for ID:', partnerId);
      let foundPartner = null;

      // Try specific partner endpoint first
      try {
        const specificResponse = await fetch(`${getApiBaseUrl()}/user/api/users/${partnerId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (specificResponse.ok) {
          const specificResult = await specificResponse.json();
          if (specificResult?.data) {
            foundPartner = specificResult.data;
          } else if (specificResult && specificResult._id) {
            foundPartner = specificResult;
          }
          console.log('Partner data received from specific endpoint:', foundPartner);
        }
      } catch (specificError) {
        console.log("Specific endpoint not available, falling back to search");
      }

      // If specific endpoint didn't work, search through all users
      if (!foundPartner) {
        let currentSkip = 0;
        const limit = 50;
        let searchCompleted = false;

        while (!searchCompleted && !foundPartner) {
          console.log(`🔍 Searching for partner ${partnerId} in batch starting at ${currentSkip}`);
          
          const response = await fetch(
            `${getApiBaseUrl()}/user/api/users?skip=${currentSkip}&limit=${limit}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            }
          );

          if (!response.ok) {
            console.error('Failed to fetch users list:', response.status);
            break;
          }

          const result = await response.json();
          let users: any[] = [];
          
          if (result?.data?.list && Array.isArray(result.data.list)) {
            users = result.data.list;
          } else if (result?.list && Array.isArray(result.list)) {
            users = result.list;
          }

          // Search for the partner in current batch
          foundPartner = users.find(user => 
            user._id === partnerId || 
            user.id === partnerId || 
            user.numericId?.toString() === partnerId
          );

          // If found or no more results, stop searching
          if (foundPartner || users.length < limit) {
            searchCompleted = true;
          } else {
            currentSkip += limit;
          }
        }
      }

      if (foundPartner) {
        console.log('✅ Found partner:', foundPartner.name);
        setPartnerData(foundPartner);
      } else {
        console.error('Partner not found in the system');
      }
    } catch (error) {
      console.error('Error fetching partner data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading state while mounting or fetching data
  if (!mounted || loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Get partner display name
  const getPartnerDisplayName = () => {
    if (partnerData?.name) return partnerData.name;
    if (user?.name) return user.name;
    if (user?.displayName) return user.displayName;
    return 'Partner';
  };

  // Get partner initial
  const getPartnerInitial = () => {
    const name = getPartnerDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Get partner avatar
  const getPartnerAvatar = () => {
    return partnerData?.avatar || partnerData?.profileImage || null;
  };

  // Get partner rating
  const getPartnerRating = () => {
    if (partnerData?.rating?.avg) return partnerData.rating.avg;
    return 4.8; // fallback
  };

  // Get partner call count
  const getPartnerCallCount = () => {
    if (partnerData?.calls) return partnerData.calls;
    return 150; // fallback
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl"></div>
      </div>

      {/* Main content - Landscape Layout */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 max-w-6xl w-full mx-auto flex flex-col lg:flex-row items-center p-8 sm:p-12 gap-8">
          
          {/* Left Side - Partner Profile */}
          <div className="flex-1 text-center lg:text-left">
            {/* Partner Avatar */}
            <div className="relative mx-auto lg:mx-0 mb-6 group w-fit">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-orange-300 flex items-center justify-center shadow-xl shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                {getPartnerAvatar() ? (
                  <Image 
                    src={getPartnerAvatar()!} 
                    alt="Partner Avatar" 
                    width={128} 
                    height={128} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-orange-600">
                    {getPartnerInitial()}
                  </span>
                )}
              </div>
              {/* Partner Badge */}
              <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-sm font-bold px-3 py-1 rounded-full border-2 border-white">
                Partner
              </div>
            </div>

            {/* Partner Name */}
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              {getPartnerDisplayName()}
            </h2>

            {/* Partner Rating */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xl font-semibold text-gray-700">{getPartnerRating().toFixed(1)}</span>
              </div>
              <span className="text-gray-500">({getPartnerCallCount()}+ calls)</span>
            </div>

            {/* Partner Phone */}
            <div className="inline-flex items-center gap-3 bg-gray-50 px-6 py-3 rounded-xl border border-gray-200">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-gray-700 font-medium text-lg">
                {partnerData?.phone || user?.phoneNumber || '+91 ••••• •••••'}
              </span>
            </div>

            {/* Partner Specializations */}
            {partnerData?.specializations && partnerData.specializations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Specializations:</p>
                <div className="flex flex-wrap gap-2">
                  {partnerData.specializations.slice(0, 3).map((spec, index) => (
                    <span key={index} className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Content */}
          <div className="flex-1">
            {/* Main Message */}
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-6 tracking-tight">
                Welcome Back! 👋
              </h1>
              <p className="text-gray-600 text-xl leading-relaxed font-medium">
                You're logged in as a <span className="text-orange-600 font-bold">Partner</span>. 
                To receive calls, please use the{' '}
                <span className="text-orange-600 font-bold">Sobhagya App</span> on your phone.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center shadow-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">{getPartnerCallCount()}+</div>
                <div className="text-sm text-gray-500">Total Calls</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center shadow-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">{getPartnerRating().toFixed(1)}★</div>
                <div className="text-sm text-gray-500">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 