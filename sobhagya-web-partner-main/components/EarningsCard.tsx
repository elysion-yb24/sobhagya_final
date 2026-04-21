'use client';

interface EarningsCardProps {
  walletBalance: any;
  dailyEarnings: any;
}

export default function EarningsCard({ walletBalance, dailyEarnings }: EarningsCardProps) {
  const balance = walletBalance?.balance || 0;
  const earnings = dailyEarnings?.data || [];

  // Calculate total earnings from daily earnings
  const totalEarnings = earnings.reduce((sum: number, day: any) => sum + (day.amountEarned || 0), 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Earnings & Wallet
          </h3>
          <p className="text-xs text-gray-500 mt-1">Your financial overview</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 mb-2 font-medium">Wallet Balance</p>
            <p className="text-4xl font-bold drop-shadow-lg">₹{balance.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-[1.02] transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <p className="text-sm opacity-90 mb-2 font-medium">Total Earnings</p>
            <p className="text-4xl font-bold drop-shadow-lg">₹{totalEarnings.toFixed(2)}</p>
            <p className="text-xs opacity-75 mt-1">Last 7 days</p>
          </div>
        </div>
      </div>

      {/* Daily Earnings Breakdown */}
      {earnings.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">Daily Breakdown</h4>
          <div className="space-y-3">
            {earnings.map((earning: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md hover:border-gray-200 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
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
                <p className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
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

