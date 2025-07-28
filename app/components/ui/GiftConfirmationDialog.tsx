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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-xs w-full">
        <div className="flex flex-col items-center">
          {!sent ? (
            <>
              <img src={giftIcon} alt={giftName} className="w-16 h-16 mb-2" />
              <h2 className="text-lg font-bold mb-2">Send Gift</h2>
              <p className="mb-2 text-center">
                Are you sure you want to send the gift <b>{giftName}</b>?
              </p>
              {giftPrice !== undefined && (
                <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-orange-600">
                  <span>₹{giftPrice}</span>
                </div>
              )}
              <div className="flex gap-3 w-full mt-2">
                <button
                  className="flex-1 px-4 py-2 rounded bg-gray-200 text-gray-700"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded bg-orange-500 text-white"
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Gift'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="bg-green-100 rounded-full p-4 mb-2">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-green-700 font-bold text-lg mb-1">Gift Sent Successfully</div>
              <div className="text-gray-600 text-sm">Your gift has been sent to the astrologer.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GiftConfirmationDialog; 