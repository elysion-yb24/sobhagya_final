import React from 'react';

export default function CallInitiatedModal({ visible, onClose }: { visible: boolean, onClose?: () => void }) {
  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10 flex flex-col items-center relative min-w-[320px] max-w-xs w-full">
        {/* Animated phone icon */}
        <div className="mb-6">
          <div className="relative flex items-center justify-center">
            <div className="absolute animate-ping-slow rounded-full bg-green-200 opacity-60 w-20 h-20" />
            <div className="absolute animate-ping-slower rounded-full bg-green-100 opacity-40 w-28 h-28" />
            <svg className="relative z-10 w-16 h-16 text-green-500 animate-bounce-slow" fill="none" viewBox="0 0 48 48">
              <rect width="48" height="48" rx="24" fill="#ECFDF5" />
              <path d="M32.5 29.5l-3.2-3.2a2.1 2.1 0 00-2.7-.3l-1.2.9a15.1 15.1 0 01-6.7-6.7l.9-1.2a2.1 2.1 0 00-.3-2.7l-3.2-3.2a2.1 2.1 0 00-2.9 0l-1.2 1.2c-1.1 1.1-1.4 2.8-.7 4.2 2.2 4.5 5.7 8 10.2 10.2 1.4.7 3.1.4 4.2-.7l1.2-1.2a2.1 2.1 0 000-2.9z" fill="#10B981" />
            </svg>
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Call is initiated...</h2>
          <p className="text-gray-700 text-base">Pickup the call once received</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
        )}
      <style jsx>{`
        .animate-ping-slow {
          animation: ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-ping-slower {
          animation: ping 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-bounce-slow {
          animation: bounce 1.4s infinite;
        }
        @keyframes ping {
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
      </div>
    </div>
  );
} 