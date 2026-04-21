'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { userAPI, transactionAPI, authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import StatusToggle from '@/components/StatusToggle';
import TransactionsList from '@/components/TransactionsList';
import EarningsCard from '@/components/EarningsCard';
import ProfileCard from '@/components/ProfileCard';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<any>(null);
  const [dailyEarnings, setDailyEarnings] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [transactionCount, setTransactionCount] = useState(0);
  const [openTransactionModal, setOpenTransactionModal] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchData();
    
    // Set up polling for live updates every 10 seconds
    const interval = setInterval(() => {
      fetchData();
    }, 10000);

    return () => clearInterval(interval);
  }, [isAuthenticated, refreshKey]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile
      const userResponse = await userAPI.getUserData();
      if (userResponse.success) {
        const userData = userResponse.data;
        const userRole = userData?.role;
        const allowedRoles = ['friend', 'astrologer'];
        
        // Verify user is still a partner (in case role changed)
        if (!userRole || !allowedRoles.includes(userRole)) {
          // User is not a partner - logout immediately
          toast.error('You are not a partner. Access denied.');
          logout();
          router.push('/login');
          return;
        }
        
        setUser(userData);
      }

      // Fetch wallet balance
      const balanceResponse = await transactionAPI.getWalletBalance();
      if (balanceResponse.success) {
        setWalletBalance(balanceResponse.data);
      }

      // Fetch daily earnings (last 7 days)
      const earningsResponse = await transactionAPI.getDailyEarnings(7);
      if (earningsResponse.success) {
        setDailyEarnings(earningsResponse.data);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        logout();
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    toast.success('Refreshing data...');
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/sobhagya.png" 
              alt="Sobhagya Logo" 
              className="h-24 w-auto object-contain"
            />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/sobhagya.png" 
                alt="Sobhagya Logo" 
                className="h-10 w-auto object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Partner Dashboard
                </h1>
                <p className="text-xs text-gray-500">Welcome back, {user?.name || 'Partner'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Transactions Button */}
              <button
                onClick={() => setOpenTransactionModal(prev => prev + 1)}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm hover:shadow-md transform hover:scale-105 border border-gray-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Transactions</span>
              </button>
              <button
                onClick={handleRefresh}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all shadow-sm hover:shadow-md transform hover:scale-105 border border-gray-200"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </span>
              </button>
              <button
                onClick={async () => {
                  try {
                    await authAPI.logout();
                    logout();
                    router.push('/login');
                    toast.success('Logged out successfully');
                  } catch (error) {
                    logout();
                    router.push('/login');
                    toast.error('Failed to logout');
                  }
                }}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all shadow-sm hover:shadow-md transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile and Controls */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCard user={user} />
            
            {/* Astrology Tools - Moved Up */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Astrology Tools
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Professional astrological calculations</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/tools/kundli')}
                  className="group w-full relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3 py-3.5 px-4">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="text-sm font-bold">Generate Kundli</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button
                  onClick={() => router.push('/tools/gun-milan')}
                  className="group w-full relative overflow-hidden bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3 py-3.5 px-4">
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.682a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm font-bold">Gun Milan Calculator</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-pink-700 to-rose-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column - Earnings and Status Controls */}
          <div className="lg:col-span-2 space-y-6">
            <EarningsCard 
              walletBalance={walletBalance} 
              dailyEarnings={dailyEarnings}
            />
            <StatusToggle user={user} onUpdate={fetchData} />
          </div>
        </div>

        {/* Hidden Transactions List - Modal Only */}
        <TransactionsList 
          refreshKey={refreshKey} 
          isModalOnly={true}
          onTransactionCountChange={setTransactionCount}
          openModalTrigger={openTransactionModal}
        />
      </main>
    </div>
  );
}

