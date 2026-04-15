import React, { useState, useEffect } from 'react';

interface GiftConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  giftName: string;
  giftIcon: string;
  isLoading?: boolean;
  giftPrice?: number;
}

const GiftConfirmationDialog: React.FC<GiftConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  giftName,
  giftIcon,
  isLoading = false,
  giftPrice,
}) => {
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!isOpen) setSent(false);
  }, [isOpen]);

  const handleConfirm = async () => {
    await onConfirm();
    setSent(true);
    setTimeout(() => {
      onClose();
      setSent(false);
    }, 1800);
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-orange-950/20 backdrop-blur-md" onClick={onClose} />
      <div className="bg-white rounded-[40px] p-8 shadow-2xl max-w-sm w-full relative z-10 border-4 border-orange-100 overflow-hidden">
        {/* Sacred pattern overlay */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <div className="text-4xl italic font-serif">ॐ</div>
        </div>

        <div className="flex flex-col items-center">
          {!sent ? (
            <>
              <div className="w-24 h-24 rounded-3xl bg-orange-50 p-4 border-2 border-orange-100 mb-6 shadow-inner animate-scale-in">
                <img src={giftIcon} alt={giftName} className="w-full h-full object-contain" />
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight text-center">Sacred Dakshina</h2>
              <p className="mb-4 text-center text-gray-500 font-medium leading-relaxed">
                Confirm your offering of <span className="text-orange-600 font-extrabold">{giftName}</span> to the guide.
              </p>
              
              {giftPrice !== undefined && (
                <div className="mb-8 px-6 py-2 rounded-full bg-orange-50 border border-orange-200 shadow-sm animate-pulse">
                  <span className="text-2xl font-black text-orange-600 tracking-tighter">₹{giftPrice}</span>
                </div>
              )}
              
              <div className="flex flex-col gap-3 w-full">
                <button
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 active:scale-95 transition-all disabled:opacity-50"
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? 'INITIATING...' : 'OFFER DAKSHINA'}
                </button>
                <button
                  className="w-full py-3 rounded-2xl bg-white text-gray-400 font-bold hover:bg-gray-50 transition-colors text-xs uppercase tracking-widest"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border-4 border-green-100 shadow-sm animate-scale-in">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Offering Accepted</h2>
              <p className="text-gray-500 font-medium">Your dakshina has been divineley sent.</p>
              <div className="mt-6 flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-200 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftConfirmationDialog; 