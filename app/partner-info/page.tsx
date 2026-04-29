'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { getUserDetails, getAuthToken, storeUserDetails } from '../utils/auth-utils';
import DashboardHeader from '../components/partner/DashboardHeader';
import EarningsCard from '../components/partner/EarningsCard';
import StatusToggle from '../components/partner/StatusToggle';
import TransactionsList from '../components/partner/TransactionsList';

import IncomingCallPopup from '../components/partner/IncomingCallPopup';

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
      const userRes = await fetch('/api/user/profile', { credentials: 'include' });
      if (userRes.status === 401) {
        router.push('/login');
        return;
      }
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
      const balanceRes = await fetch('/api/wallet-balance', { credentials: 'include' });
      const balanceResponse = await balanceRes.json();
      if (balanceResponse.success) {
        setWalletBalance(balanceResponse.data);
      }

      // 3. Fetch Daily Earnings (Last 7 days)
      const earningsRes = await fetch('/api/payment/stats?days=7', { credentials: 'include' });
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
  }, [router]);

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
      <div className="min-h-screen w-full bg-[#F8F3ED] flex flex-col items-center justify-center relative">
        <div className="flex flex-col items-center z-10">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-[#F7941D] rounded-full animate-spin"></div>
            <p className="mt-6 text-[#333333] font-medium text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F3ED] text-[#333333] selection:bg-[#F7941D]/20 font-sans relative">

      <IncomingCallPopup enabled={!!user} />

      <DashboardHeader user={user} onRefresh={handleRefresh} />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column - Controls and Profile */}
          <div className="lg:col-span-4 space-y-8">
            <StatusToggle user={user} onUpdate={() => fetchData(true)} />
            
            {/* Quick Actions / Tools */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#F8F3ED] flex items-center justify-center text-[#F7941D]">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a2 2 0 002 2 2 2 0 110 4M5 8v2a2 2 0 002 2h2m10 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2" /></svg>
                </div>
                <h3 className="text-xl font-bold text-[#333333]">Astrologer Tools</h3>
              </div>
              
              <div className="space-y-4">
                <button 
                   onClick={() => router.push('/free-kundli')}
                   className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-[#F8F3ED] hover:border-[#F7941D] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F8F3ED] flex items-center justify-center border border-gray-200 group-hover:border-[#F7941D] transition-colors">
                      <span className="text-xl group-hover:scale-110 transition-transform">🕉️</span>
                    </div>
                    <span className="font-semibold text-[#4D4D4D] group-hover:text-[#F7941D] transition-colors">Generate Kundli</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#F7941D] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>

                <button 
                   onClick={() => router.push('/services/gun-milan')}
                   className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:bg-[#F8F3ED] hover:border-[#F7941D] transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#F8F3ED] flex items-center justify-center border border-gray-200 group-hover:border-[#F7941D] transition-colors">
                      <span className="text-xl group-hover:scale-110 transition-transform">💞</span>
                    </div>
                    <span className="font-semibold text-[#4D4D4D] group-hover:text-[#F7941D] transition-colors">Gun Milan Analysis</span>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-[#F7941D] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                 <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider text-center">Sobhagya Partner Portal</p>
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
      <footer className="py-12 text-center select-none pointer-events-none">
          <Image src="/logo.png" alt="" width={40} height={40} className="mx-auto mb-3" />
          <p className="text-xs text-gray-400">Powered by Sobhagya</p>
      </footer>
    </div>
  );
}