'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getUserDetails, getAuthToken, storeUserDetails, authenticatedFetch } from '../utils/auth-utils';
import { getApiBaseUrl, API_CONFIG } from '../config/api';
import DashboardHeader from '../components/partner/DashboardHeader';
import EarningsCard from '../components/partner/EarningsCard';
import StatusToggle from '../components/partner/StatusToggle';
import TransactionsList from '../components/partner/TransactionsList';

export default function PartnerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [dailyEarnings, setDailyEarnings] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);



  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // 1. Fetch Fresh User Data
      const userRes = await authenticatedFetch(`${getApiBaseUrl()}${API_CONFIG.ENDPOINTS.USER.DATA}`);
      const userResponse = await userRes.json();
      
      if (userResponse.success) {
        const userData = userResponse.data;
        const userRole = userData?.role;
        const allowedRoles = ['friend', 'astrologer'];
        
        if (!userRole || !allowedRoles.includes(userRole)) {
          toast.error('Partner access restricted.');
          router.push('/login');
          return;
        }
        
        setUser(userData);
        storeUserDetails(userData);
      }

      // 2. Fetch Wallet Balance
      const balanceRes = await authenticatedFetch(`${getApiBaseUrl()}${API_CONFIG.ENDPOINTS.PAYMENT.WALLET_BALANCE}`);
      const balanceResponse = await balanceRes.json();
      if (balanceResponse.success) {
        setWalletBalance(balanceResponse.data);
      }

      // 3. Fetch Daily Earnings (Last 7 days)
      const earningsUrl = new URL(`${getApiBaseUrl()}${API_CONFIG.ENDPOINTS.PAYMENT.STATS}`);
      earningsUrl.searchParams.append('days', '7');
      const earningsRes = await authenticatedFetch(earningsUrl.toString());
      const earningsResponse = await earningsRes.json();
      
      if (earningsResponse.success) {
        setDailyEarnings(earningsResponse.data);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      if (error.message === 'Unauthorized') {
        router.push('/login');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [authenticatedFetch, router]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    fetchData();
    toast.success('Dashboard Updated', {
        icon: '🔄',
        style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
        },
    });
  };

  useEffect(() => {
    setMounted(true);
    const initialUser = getUserDetails();
    if (!initialUser || (initialUser.role !== 'friend' && initialUser.role !== 'astrologer')) {
       // Check token before redirecting
       if (!getAuthToken()) {
         router.push('/login');
         return;
       }
    }
    
    fetchData();

    // Set up polling for live updates every 30 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData, router]);

  if (!mounted || (loading && !user)) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-orange-800 font-bold animate-pulse">Initializing Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf8] selection:bg-orange-200">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-100/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-red-50/30 rounded-full blur-[100px]"></div>
      </div>

      <DashboardHeader user={user} onRefresh={handleRefresh} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Controls and Profile */}
          <div className="lg:col-span-4 space-y-8">
            <StatusToggle user={user} onUpdate={() => fetchData(true)} />
            
            {/* Quick Actions / Tools */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a2 2 0 002 2 2 2 0 110 4M5 8v2a2 2 0 002 2h2m10 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Professional Tools</h3>
              </div>
              
              <div className="space-y-3">
                <button 
                   onClick={() => router.push('/free-kundli')}
                   className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">🕉️</span>
                    <span className="font-bold text-gray-700 text-sm italic font-serif">Generate Kundli</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>

                <button 
                   onClick={() => router.push('/services/gun-milan')}
                   className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-orange-200 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">💞</span>
                    <span className="font-bold text-gray-700 text-sm">Gun Milan Analysis</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                 <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest text-center">Sobhagya Premium Partner Portal</p>
              </div>
            </div>
          </div>

          {/* Right Column - Financials and Activity */}
          <div className="lg:col-span-8 space-y-8">
            <EarningsCard 
              walletBalance={walletBalance} 
              dailyEarnings={dailyEarnings}
            />
            
            <TransactionsList 
              refreshKey={refreshKey} 
              onTransactionCountChange={() => {}}
            />
          </div>
          
        </div>
      </main>
      
      {/* Footer Branding */}
      <footer className="py-10 text-center opacity-30 select-none pointer-events-none">
          <Image src="/logo.png" alt="" width={30} height={30} className="mx-auto mb-2 grayscale" />
          <p className="text-[10px] font-bold tracking-tighter text-gray-900 uppercase">Trusted by millions of souls</p>
      </footer>
    </div>
  );
}