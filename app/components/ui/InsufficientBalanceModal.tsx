"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Wallet, Plus, CreditCard, ArrowRight, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { getAuthToken } from '../../utils/auth-utils';
import { getApiBaseUrl } from '../../config/api';
import { fetchTransactionHistory } from '../../utils/production-api';
import { isProduction } from '../../utils/environment-check';

interface RechargeOption {
  amount: number;
  bonus?: number;
  label?: string;
  bonusPercentage?: number;
  additional?: number;
}

interface WalletPageData {
  rechargeOptions?: RechargeOption[];
  recharge_options?: RechargeOption[];
  packages?: RechargeOption[];
  plans?: RechargeOption[];
  currentBalance?: number;
  bonusOffers?: any[];
  balances?: any[];
}

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
  const [walletData, setWalletData] = useState<WalletPageData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [rechargeOptions, setRechargeOptions] = useState<RechargeOption[]>([]);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<null | 'pending' | 'success' | 'failed' | 'timeout'>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Debug logging - only log when modal is actually open
  if (isOpen) {
    console.log('InsufficientBalanceModal opened:', { currentBalance, requiredAmount, astrologerName, serviceType });
  }

  const fetchWalletPageData = async () => {
    try {
      setIsLoadingData(true);
      const token = getAuthToken();
      if (!token) {
        console.error('No auth token available');
        setRechargeOptions(getDefaultRechargeOptions());
        return;
      }

      let apiResponse;

      // Use production-safe API wrapper
      if (isProduction()) {
        console.log('Using production-safe transaction API');
        const data = await fetchTransactionHistory();
        apiResponse = { success: true, data };
      } else {
        // Development: Use Next.js API route instead of direct backend call
        const response = await fetch('/api/payment/wallet-page-data', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          apiResponse = await response.json();
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      }

      console.log('Wallet page data from backend:', apiResponse);
      
      // Handle the real API response structure
      if (apiResponse.success && apiResponse.data) {
        const { rechargeOptions: backendRechargeOptions, walletBalance } = apiResponse.data;
        
        if (backendRechargeOptions && Array.isArray(backendRechargeOptions)) {
          setRechargeOptions(backendRechargeOptions);
        } else {
          console.warn('Backend recharge options not found or invalid, using defaults');
          setRechargeOptions(getDefaultRechargeOptions());
        }
        
        if (typeof walletBalance === 'number') {
          // setCurrentBalance(walletBalance); // This line was removed from the new_code, so it's removed here.
        }
      } else {
        console.warn('Backend response not successful, using default recharge options');
        setRechargeOptions(getDefaultRechargeOptions());
      }
    } catch (error) {
      console.error('Error fetching wallet page data:', error);
      setRechargeOptions(getDefaultRechargeOptions());
    } finally {
      setIsLoadingData(false);
    }
  };

  const getDefaultRechargeOptions = (): RechargeOption[] => {
    const shortfall = requiredAmount - currentBalance;
    return [
      { amount: Math.ceil(shortfall / 100) * 100 },
      { amount: Math.ceil(shortfall / 100) * 100 + 100 },
      { amount: Math.ceil(shortfall / 100) * 100 + 200 }
    ];
  };

  useEffect(() => {
    if (isOpen) {
      fetchWalletPageData();
    }
  }, [isOpen]);

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

  // PhonePe Payment Integration — all signing happens server-side in
  // /api/payment/phonepe/pay. The client never sees the merchant salt key.
  const handlePhonePePayment = async (option: RechargeOption) => {
    setIsPaying(true);
    setPaymentStatus(null);
    setPaymentError(null);
    try {
      const token = getAuthToken();
      if (!token) throw new Error('Authentication required');

      const idempotencyKey =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `recharge-${Date.now()}-${Math.random()}`;

      // Step 1: create a transaction record on our backend.
      const response = await fetch('/api/payment/phonepe/initiate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: option.amount,
          extra: option.additional || 0,
          paymentFor: serviceType || 'recharge',
          isWeb: false,
          chatPlanName: '',
          idempotencyKey,
        }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to initiate payment');
      const data = await response.json();
      if (!data.success || !data.data?.transactionId) {
        throw new Error(data.message || 'Payment initiation failed');
      }

      const { transactionId, amount: amountWithGst, userId } = data.data;

      // Step 2: ask our secure server route to sign + call PhonePe and return
      // the redirect URL. The salt key lives only on the server.
      const payResp = await fetch('/api/payment/phonepe/pay', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          amount: amountWithGst,
          userId,
          extra: option.additional || 0,
        }),
        credentials: 'include',
      });
      const payJson = await payResp.json();
      if (!payJson.success || !payJson.redirectUrl) {
        throw new Error(payJson.message || 'Failed to get payment URL from PhonePe');
      }

      // Step 3: open the PhonePe payment page.
      const paymentUrl = payJson.redirectUrl;
      const paymentWindow = window.open(
        paymentUrl,
        '_blank',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );
      if (!paymentWindow) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      // Step 4: poll for payment status.
      await pollPhonePeStatus(transactionId);
    } catch (err) {
      if (err instanceof Error) {
        setPaymentError(err.message || 'Payment failed');
      } else {
        setPaymentError('Payment failed');
      }
    } finally {
      setIsPaying(false);
    }
  };

  const pollPhonePeStatus = async (transactionId: string) => {
    const token = getAuthToken();
    let attempts = 0;
    const maxAttempts = 15;
    const delay = 2000;
    setPaymentStatus('pending');
    while (attempts < maxAttempts) {
      await new Promise((res) => setTimeout(res, delay));
      try {
        const resp = await fetch('/api/payment/phonepe/status-check', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transactionId }),
          credentials: 'include',
        });
        const statusData = await resp.json();
        if (statusData.success && statusData.data?.status === 'SUCCESS') {
          setPaymentStatus('success');
          // Optionally, refresh wallet data here
          fetchWalletPageData();
          return;
        } else if (statusData.success && statusData.data?.status === 'FAILED') {
          setPaymentStatus('failed');
          setPaymentError('Payment failed.');
          return;
        }
      } catch (e) {
        // Ignore errors and continue polling
      }
      attempts++;
    }
    setPaymentStatus('timeout');
    setPaymentError('Payment status check timed out.');
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 font-sans">
      <div className="bg-white rounded-[1.75rem] max-w-md w-full p-0 overflow-hidden shadow-[0_8px_40px_rgba(255,140,0,0.2)] text-[#4A3B32]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6A00] to-[#FF8C00] p-6 text-white relative">
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
          <div className="flex items-center gap-3 mb-6 p-3 bg-[#FFFAF0] border border-orange-50 rounded-lg">
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
            {isLoadingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#FF8C00]" />
                <span className="ml-2 text-gray-600">Loading recharge options...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {rechargeOptions.slice(0, 3).map((option, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <Link
                      href={`/wallet/recharge?amount=${option.amount}`}
                      className="bg-gradient-to-r from-[#FF6A00] to-[#FFD200] text-white p-3 rounded-xl text-center text-sm font-semibold hover:to-[#FF8C00] transition-all duration-300 hover:scale-105 shadow-[0_4px_15px_rgba(255,106,0,0.3)] w-full"
                    >
                      <div className="font-semibold">₹{option.amount}</div>
                      {/* Always show bonus as 'additional' from API if present */}
                      {typeof option.additional !== 'undefined' ? (
                        <div className="text-xs opacity-90 mt-1">+₹{option.additional} bonus</div>
                      ) : option.bonus ? (
                        <div className="text-xs opacity-90 mt-1">+₹{option.bonus} bonus</div>
                      ) : null}
                      {option.label && (
                        <div className="text-xs opacity-80 mt-1">{option.label}</div>
                      )}
                    </Link>
                    <button
                      className="w-full bg-[#4A3B32] text-white rounded-lg py-2 px-2 text-xs font-semibold hover:bg-[#5a4a3f] transition disabled:opacity-50"
                      onClick={() => handlePhonePePayment(option)}
                      disabled={isPaying}
                    >
                      {isPaying ? 'Processing...' : 'Pay with PhonePe'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Show more options if available */}
            {!isLoadingData && rechargeOptions.length > 3 && (
              <div className="mt-3">
                <p className="text-gray-600 text-xs text-center">
                  {rechargeOptions.length - 3} more options available in wallet
                </p>
              </div>
            )}
            {/* Payment status notification */}
            {paymentStatus === 'success' && (
              <div className="mt-3 text-green-600 text-center text-sm font-semibold">Payment successful! Wallet will update shortly.</div>
            )}
            {paymentStatus === 'failed' && (
              <div className="mt-3 text-red-600 text-center text-sm font-semibold">Payment failed. Please try again.</div>
            )}
            {paymentStatus === 'timeout' && (
              <div className="mt-3 text-yellow-600 text-center text-sm font-semibold">Payment status check timed out.</div>
            )}
            {paymentError && (
              <div className="mt-3 text-red-500 text-center text-xs">{paymentError}</div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/wallet"
              className="w-full bg-gradient-to-r from-[#FF6A00] to-[#FFD200] text-white py-3 px-4 rounded-2xl font-bold text-center flex items-center justify-center gap-2 hover:to-[#FF8C00] transition-all duration-300 hover:scale-105 shadow-[0_4px_15px_rgba(255,106,0,0.3)]"
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