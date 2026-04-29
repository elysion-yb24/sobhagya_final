'use client';

import React from 'react';

interface EarningsCardProps {
  walletBalance: any;
  dailyEarnings: any;
}

export default function EarningsCard({ walletBalance, dailyEarnings }: EarningsCardProps) {
  const balance = walletBalance?.balance || 0;
  const earnings = dailyEarnings?.data || [];

  // Calculate total earnings from daily earnings
  const totalEarnings = Array.isArray(earnings) 
    ? earnings.reduce((sum: number, day: any) => sum + (day.amountEarned || 0), 0)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 transition-all duration-300 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-[#333333]">
            Earnings Overview
          </h3>
          <p className="text-sm text-[#4D4D4D] mt-1">Your wallet and earnings</p>
        </div>
        <div className="p-2 bg-orange-50 rounded-lg border border-orange-200 shadow-sm">
          <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-10">
        <div className="bg-[#F7941D] rounded-2xl p-6 text-white shadow-sm transition-all duration-300">
          <div className="relative z-10">
            <p className="text-sm text-white/90 mb-2 font-medium">Wallet Balance</p>
            <p className="text-4xl font-bold text-white">₹{balance.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="bg-[#F1B434] rounded-2xl p-6 text-white shadow-sm transition-all duration-300">
          <div className="relative z-10">
            <p className="text-sm text-white/90 mb-2 font-medium">Total Earnings</p>
            <p className="text-4xl font-bold text-white">₹{totalEarnings.toFixed(2)}</p>
            <p className="text-xs text-white/80 mt-1">Last 7 days</p>
          </div>
        </div>
      </div>

      {/* Daily Earnings Breakdown */}
      {Array.isArray(earnings) && earnings.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-bold text-[#F7941D] mb-4 uppercase tracking-wider flex items-center gap-2 relative z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]"></span>
            Daily Earnings
          </h4>
          <div className="space-y-3 relative z-10">
            {earnings.map((earning: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200 hover:border-[#F7941D] transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F8F3ED] flex items-center justify-center text-[#F7941D] font-bold text-sm border border-gray-200 group-hover:bg-[#F7941D] group-hover:border-[#F7941D] group-hover:text-white transition-colors">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {new Date(earning.date || earning.createdAt).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-lg font-bold text-emerald-600">
                  ₹{earning.amountEarned?.toFixed(2) || '0.00'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
