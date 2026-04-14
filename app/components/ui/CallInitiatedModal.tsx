import React from 'react';

export default function CallInitiatedModal({ visible, onClose }: { visible: boolean, onClose?: () => void }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-10 flex flex-col items-center relative min-w-[320px] max-w-xs w-full border border-gray-100">
        {/* Animated phone icon with brand colors */}
        <div className="mb-7">
          <div className="relative flex items-center justify-center">
            <div className="absolute animate-ping-slow rounded-full bg-orange-200 opacity-50 w-20 h-20" />
            <div className="absolute animate-ping-slower rounded-full bg-amber-100 opacity-30 w-28 h-28" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 animate-bounce-slow">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92V19.92C22 20.97 21.18 21.85 20.13 21.97C16.66 22.36 13.33 21.72 10.39 20.12C7.62 18.63 5.37 16.38 3.88 13.61C2.28 10.67 1.64 7.34 2.03 3.87C2.15 2.82 3.03 2 4.08 2H7.08C7.85 2 8.54 2.51 8.71 3.27" />
              </svg>
            </div>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Call is initiated...</h2>
          <p className="text-gray-500 text-sm">Pick up the call once received</p>
        </div>
        {/* Animated dots */}
        <div className="flex items-center gap-1.5 mt-5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors text-lg font-bold">×</button>
        )}
      <style jsx>{`
        .animate-ping-slow {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slower {
          animation: ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-bounce-slow {
          animation: bounce 1.6s infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
      </div>
    </div>
  );
}