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
    <header className="sticky top-0 z-[50] bg-white border-b border-gray-200 shadow-sm px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center relative z-10">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
             <Image 
                src="/logo.png" 
                alt="Sobhagya" 
                width={40} 
                height={40} 
                className="h-8 w-auto sm:h-10"
                priority
             />
             <span className="text-xl font-bold text-[#F7941D] hidden sm:inline-block">
                Sobhagya Partner
             </span>
          </div>
          <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#333333] leading-tight">Partner Dashboard</h1>
            <p className="text-[10px] sm:text-xs text-[#4D4D4D] font-medium">Welcome, {getPartnerDisplayName()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={onRefresh}
            className="p-2 sm:px-4 sm:py-2 text-gray-500 hover:text-[#F7941D] hover:bg-[#F8F3ED] rounded-xl transition-all flex items-center gap-2 text-sm font-semibold group border border-transparent hover:border-gray-200"
            title="Refresh Connections"
          >
            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden sm:inline">Sync</span>
          </button>

          <div className="h-6 w-[1px] bg-gray-200"></div>

          <button 
            onClick={handleLogout}
            className="p-2 sm:px-4 sm:py-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all flex items-center gap-2 text-sm font-bold group border border-transparent hover:border-red-200"
          >
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>

          <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-gray-200 ml-1 sm:ml-2">
            <div className="relative group cursor-pointer">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#F8F3ED] border-2 border-[#F7941D] flex items-center justify-center text-[#F7941D] font-bold overflow-hidden">
                {user?.avatar ? (
                  <Image src={user.avatar} alt="P" width={40} height={40} className="w-full h-full object-cover" />
                ) : (
                  getPartnerInitial()
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
