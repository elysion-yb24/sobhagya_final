'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { performLogout } from '../../utils/auth-utils';
import toast from 'react-hot-toast';

interface DashboardHeaderProps {
  user: any;
  onRefresh: () => void;
}

export default function DashboardHeader({ user, onRefresh }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (!confirmed) return;

    try {
      await performLogout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const getPartnerDisplayName = () => {
    return user?.name || user?.displayName || 'Partner';
  };

  const getPartnerInitial = () => {
    return getPartnerDisplayName().charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-[50] bg-white/70 backdrop-blur-xl border-b border-gray-100 shadow-sm px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2" onClick={() => router.push('/')}>
             <Image 
                src="/logo.png" 
                alt="Sobhagya" 
                width={40} 
                height={40} 
                className="cursor-pointer hover:rotate-12 transition-transform h-8 w-auto sm:h-10"
                priority
             />
             <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent hidden sm:inline-block">
                Sobhagya Partner
             </span>
          </div>
          <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-gray-800 leading-tight">Dashboard</h1>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Hello, {getPartnerDisplayName()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onRefresh}
            className="p-2 sm:px-4 sm:py-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all flex items-center gap-2 text-sm font-semibold group"
            title="Refresh Data"
          >
            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <div className="h-6 w-[1px] bg-gray-200"></div>

          <button 
            onClick={handleLogout}
            className="p-2 sm:px-4 sm:py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2 text-sm font-bold group"
          >
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>

          <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-100 ml-1 sm:ml-2">
            <div className="relative group cursor-pointer">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 border-2 border-white shadow-md flex items-center justify-center text-white font-bold group-hover:rotate-6 transition-transform overflow-hidden">
                {user?.avatar ? (
                  <Image src={user.avatar} alt="P" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  getPartnerInitial()
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
