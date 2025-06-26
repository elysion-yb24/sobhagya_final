"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { Wallet, Plus, CreditCard, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';

interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  requiredAmount: number;
  astrologerName?: string;
  serviceType?: 'call' | 'gift' | 'consultation';
}

const InsufficientBalanceModal = React.memo(function InsufficientBalanceModal({
  isOpen,
  onClose,
  currentBalance,
  requiredAmount,
  astrologerName,
  serviceType = 'call'
}: InsufficientBalanceModalProps) {
  // Debug logging - only log when modal is actually open
  if (isOpen) {
    console.log('InsufficientBalanceModal opened:', { currentBalance, requiredAmount, astrologerName, serviceType });
  }
  
  if (!isOpen || typeof document === 'undefined') return null;

  const shortfall = requiredAmount - currentBalance;

  const getServiceText = () => {
    switch (serviceType) {
      case 'gift':
        return 'send this gift';
      case 'consultation':
        return 'book this consultation';
      default:
        return 'start this call';
    }
  };

  const getServiceIcon = () => {
    switch (serviceType) {
      case 'gift':
        return '🎁';
      case 'consultation':
        return '📞';
      default:
        return '☎️';
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-bold mb-2">Insufficient Balance</h2>
            <p className="text-orange-100 text-sm">
              You need more funds to {getServiceText()}
              {astrologerName && ` with ${astrologerName}`}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Balance Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Current Balance</span>
              <span className="font-semibold text-gray-900">₹{currentBalance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm">Required Amount</span>
              <span className="font-semibold text-gray-900">₹{requiredAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-red-600 font-medium text-sm">Amount Needed</span>
                <span className="font-bold text-red-600">₹{shortfall.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl">{getServiceIcon()}</div>
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {serviceType === 'gift' ? 'Gift' : 'Service'} Ready to Go!
              </p>
              <p className="text-gray-600 text-xs">
                Add funds and we'll process your request immediately
              </p>
            </div>
          </div>

          {/* Quick Add Options */}
          <div className="mb-6">
            <p className="text-gray-700 font-medium text-sm mb-3">Quick Add Amounts:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                Math.ceil(shortfall / 100) * 100,
                Math.ceil(shortfall / 100) * 100 + 100,
                Math.ceil(shortfall / 100) * 100 + 200
              ].map((amount, index) => (
                <Link
                  key={index}
                  href={`/wallet/recharge?amount=${amount}`}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-3 rounded-lg text-center text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105 shadow-md"
                >
                  +₹{amount}
                </Link>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/wallet/recharge"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 rounded-xl font-semibold text-center flex items-center justify-center gap-2 hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Money to Wallet
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <p className="text-blue-800 text-xs font-medium">
                Secure Payment • Instant Credit • 100% Safe
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
});

export default InsufficientBalanceModal;