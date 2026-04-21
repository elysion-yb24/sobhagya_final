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
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Earnings & Wallet
          </h3>
          <p className="text-xs text-gray-500 mt-1">Your financial overview</p>
        </div>
        <div className="p-2 bg-orange-100 rounded-lg">
          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 transform hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 mb-2 font-medium">Wallet Balance</p>
            <p className="text-4xl font-bold drop-shadow-lg">₹{balance.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-200 transform hover:scale-[1.02] transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 mb-2 font-medium">Total Earnings</p>
            <p className="text-4xl font-bold drop-shadow-lg">₹{totalEarnings.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">Last 7 days</p>
          </div>
        </div>
      </div>

      {/* Daily Earnings Breakdown */}
      {Array.isArray(earnings) && earnings.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            Daily Breakdown
          </h4>
          <div className="space-y-3">
            {earnings.map((earning: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:shadow-md hover:border-orange-200 hover:bg-white transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-colors">
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
