'use client';

import React, { useEffect, useState } from 'react';
import { getApiBaseUrl, API_CONFIG } from '../../config/api';
import { getAuthToken, authenticatedFetch } from '../../utils/auth-utils';

interface TransactionsListProps {
  refreshKey: number;
  isModalOnly?: boolean;
  onTransactionCountChange?: (count: number) => void;
  openModalTrigger?: number;
}

export default function TransactionsList({ 
  refreshKey, 
  isModalOnly = false, 
  onTransactionCountChange, 
  openModalTrigger 
}: TransactionsListProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTransactions, setModalTransactions] = useState<any[]>([]);
  const [modalSkip, setModalSkip] = useState(0);
  const [modalHasMore, setModalHasMore] = useState(true);
  
  const limit = 15;
  const initialDisplayCount = 5;



  useEffect(() => {
    setSkip(0);
    setTransactions([]);
    fetchTransactions(0);
  }, [refreshKey]);

  const fetchTransactions = async (currentSkip: number = skip) => {
    try {
      setLoading(true);
      const url = new URL(`${getApiBaseUrl()}${API_CONFIG.ENDPOINTS.PAYMENT.TRANSACTIONS}`);
      const params: any = { 
        skip: currentSkip.toString(), 
        limit: limit.toString(),
        isTransactions: 'false'
      };
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      const res = await authenticatedFetch(url.toString());
      const response = await res.json();
      
      if (response.success) {
        const history = response.data?.list || [];
        if (currentSkip === 0) {
          setTransactions(history);
        } else {
          setTransactions((prev) => [...prev, ...history]);
        }
        setHasMore(history.length === limit);
        if (currentSkip === 0 && onTransactionCountChange) {
          onTransactionCountChange(history.length);
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModalTransactions = async (currentSkip: number = 0) => {
    try {
      setModalLoading(true);
      const url = new URL(`${getApiBaseUrl()}${API_CONFIG.ENDPOINTS.PAYMENT.TRANSACTIONS}`);
      const params: any = { 
        skip: currentSkip.toString(), 
        limit: limit.toString(),
        isTransactions: 'false'
      };
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

      const res = await authenticatedFetch(url.toString());
      const response = await res.json();
      
      if (response.success) {
        const history = response.data?.list || [];
        if (currentSkip === 0) {
          setModalTransactions(history);
        } else {
          setModalTransactions((prev) => [...prev, ...history]);
        }
        setModalHasMore(history.length === limit);
      }
    } catch (error) {
      console.error('Error fetching modal transactions:', error);
    } finally {
      setModalLoading(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setModalSkip(0);
    setModalTransactions([]);
    setModalHasMore(true);
    fetchModalTransactions(0);
  };

  const loadMoreModal = () => {
    if (!modalLoading && modalHasMore) {
      const newSkip = modalSkip + limit;
      setModalSkip(newSkip);
      fetchModalTransactions(newSkip);
    }
  };

  useEffect(() => {
    if (openModalTrigger && openModalTrigger > 0) {
      openModal();
    }
  }, [openModalTrigger]);

  const getTransactionType = (t: any) => {
    if (t.paymentFor === 'gift') return 'Gift Received';
    if (t.paymentFor === 'call') return 'Audio Consultation';
    if (t.paymentFor === 'video') return 'Video Consultation';
    if (t.paymentFor === 'recharge') return 'Wallet Recharge';
    return t.paymentFor ? t.paymentFor.charAt(0).toUpperCase() + t.paymentFor.slice(1) : 'Consultation';
  };

  const getIcon = (type: string) => {
    if (type.includes('Gift')) return (
      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-14L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
    );
    if (type.includes('Video')) return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
    );
    return (
      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </div>
    );
  };

  if (isModalOnly && !showModal) return null;

  return (
    <>
      {!isModalOnly && (
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Recent Activity
              </h3>
              <p className="text-xs text-gray-500 mt-1">Updates on your consultations</p>
            </div>
            {transactions.length > initialDisplayCount && (
              <button 
                onClick={openModal}
                className="text-orange-600 hover:text-orange-700 text-sm font-bold flex items-center gap-1 group"
              >
                View All 
                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
          
          {loading && transactions.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-500">Syncing with treasury...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No consultations yet today.</p>
              <p className="text-xs text-gray-400 mt-1">Go online to start receiving calls!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, initialDisplayCount).map((tx, index) => {
                const type = getTransactionType(tx);
                return (
                  <div key={tx._id || index} className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-orange-100 group">
                    {getIcon(type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{type}</p>
                      <p className="text-[11px] text-gray-500 font-medium truncate">
                        {tx.notes?.callerName || tx.fromUserName || tx.fromUser?.name || 'Anonymous User'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount || 0).toFixed(2)}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal View */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Transaction History</h3>
                <p className="text-sm text-gray-500">Comprehensive list of all Consultations and Gifts</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-full transition-colors text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {modalLoading && modalTransactions.length === 0 ? (
                <div className="py-20 flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  {modalTransactions.map((tx, index) => {
                    const type = getTransactionType(tx);
                    return (
                      <div key={tx._id || index} className="flex items-center gap-4 p-5 bg-gray-50/80 rounded-2xl hover:bg-white hover:shadow-lg transition-all border border-gray-100 hover:border-orange-200">
                        {getIcon(type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-800">{type}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              tx.status === 'done' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>{tx.status || 'Success'}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            From: <span className="font-semibold">{tx.notes?.callerName || tx.fromUserName || tx.fromUser?.name || 'Regular User'}</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xl font-bold ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount || 0).toFixed(2)}
                          </p>
                          {tx.balance !== undefined && (
                            <p className="text-[10px] text-gray-400 font-medium">Bal: ₹{tx.balance.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {modalHasMore && (
                    <button 
                      onClick={loadMoreModal}
                      disabled={modalLoading}
                      className="w-full py-4 rounded-2xl bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 transition-colors disabled:opacity-50"
                    >
                      {modalLoading ? 'Loading more...' : 'Load Older Transactions'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
