'use client';

import { useEffect, useState } from 'react';
import { transactionAPI } from '@/lib/api';

interface TransactionsListProps {
  refreshKey: number;
  isModalOnly?: boolean;
  onTransactionCountChange?: (count: number) => void;
  openModalTrigger?: number;
}

export default function TransactionsList({ refreshKey, isModalOnly = false, onTransactionCountChange, openModalTrigger }: TransactionsListProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTransactions, setModalTransactions] = useState<any[]>([]);
  const [modalSkip, setModalSkip] = useState(0);
  const [modalHasMore, setModalHasMore] = useState(true);
  const limit = 15; // Backend validator max limit is 15
  const initialDisplayCount = 5; // Show only 5 transactions initially

  useEffect(() => {
    // Reset skip and fetch when refreshKey changes
    setSkip(0);
    setTransactions([]);
    fetchTransactions(0);
  }, [refreshKey]);

  const fetchTransactions = async (currentSkip: number = skip) => {
    try {
      setLoading(true);
      console.log('Fetching ALL transactions from backend - skip:', currentSkip, 'limit:', limit);
      // Use isTransactions=false to get ALL transactions (not just Razorpay ones)
      // This includes all transactions since partner joined (gifts, calls, video, etc.)
      // Transactions are fetched dynamically from the backend, NOT static
      const response = await transactionAPI.getTransactions(currentSkip, limit, false);
      console.log('Transactions response from backend:', response);
      
      if (response.success) {
        // Handle null or undefined response - backend can return null if no transactions found
        const history = response.data?.list;
        const newTransactions = Array.isArray(history) ? history : (history === null || history === undefined ? [] : []);
        console.log('Fetched transactions from backend:', newTransactions.length);
        console.log('Transaction data (from backend):', newTransactions);
        
        if (currentSkip === 0) {
          setTransactions(newTransactions);
        } else {
          setTransactions((prev) => [...prev, ...newTransactions]);
        }
        setHasMore(newTransactions.length === limit);
        
        // Notify parent of transaction count
        if (currentSkip === 0 && onTransactionCountChange) {
          onTransactionCountChange(newTransactions.length);
        }
      } else {
        console.error('Transactions API returned success: false', response);
        if (currentSkip === 0) {
          setTransactions([]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      if (currentSkip === 0) {
        setTransactions([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const newSkip = skip + limit;
      setSkip(newSkip);
      fetchTransactions(newSkip);
    }
  };

  const openModal = async () => {
    setShowModal(true);
    setModalSkip(0);
    setModalTransactions([]);
    setModalHasMore(true);
    fetchModalTransactions(0);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalTransactions([]);
    setModalSkip(0);
  };

  const fetchModalTransactions = async (currentSkip: number = 0) => {
    try {
      setModalLoading(true);
      console.log('Fetching modal transactions - skip:', currentSkip, 'limit:', limit);
      const response = await transactionAPI.getTransactions(currentSkip, limit, false);
      console.log('Modal transactions response:', response);
      
      if (response.success) {
        const history = response.data?.list;
        const newTransactions = Array.isArray(history) ? history : (history === null || history === undefined ? [] : []);
        console.log('Fetched modal transactions:', newTransactions.length);
        
        if (currentSkip === 0) {
          setModalTransactions(newTransactions);
        } else {
          setModalTransactions((prev) => [...prev, ...newTransactions]);
        }
        setModalHasMore(newTransactions.length === limit);
      } else {
        if (currentSkip === 0) {
          setModalTransactions([]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching modal transactions:', error);
      if (currentSkip === 0) {
        setModalTransactions([]);
      }
    } finally {
      setModalLoading(false);
    }
  };

  const loadMoreModal = () => {
    if (!modalLoading && modalHasMore) {
      const newSkip = modalSkip + limit;
      setModalSkip(newSkip);
      fetchModalTransactions(newSkip);
    }
  };

  const getTransactionType = (transaction: any) => {
    if (transaction.paymentFor === 'gift') return 'Gift';
    if (transaction.paymentFor === 'call') return 'Audio Call';
    if (transaction.paymentFor === 'video') return 'Video Call';
    if (transaction.paymentFor === 'recharge') return 'Recharge';
    return 'Other';
  };

  const getTransactionColor = (transaction: any) => {
    if (transaction.amount > 0) return 'text-green-600';
    return 'text-red-600';
  };

  // Open modal when trigger changes (only when button is clicked)
  useEffect(() => {
    if (openModalTrigger !== undefined && openModalTrigger > 0) {
      setShowModal(true);
      setModalSkip(0);
      setModalTransactions([]);
      setModalHasMore(true);
      fetchModalTransactions(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModalTrigger]);

  // If modal-only mode, don't render the card, just the modal
  if (isModalOnly) {
    return (
      <>
        {/* Modal for all transactions */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={closeModal}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    All Transactions
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Complete transaction history since you joined</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-gray-700 p-2.5 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {modalLoading && modalTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading transactions...</p>
                  </div>
                ) : modalTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No transactions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {modalTransactions.map((transaction, index) => (
                        <div
                          key={transaction._id || index}
                          className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
                        >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <p className="font-bold text-gray-800">{getTransactionType(transaction)}</p>
                          </div>
                          {(transaction.notes?.callerName || transaction.fromUserName || transaction.fromUser?.name || transaction.senderName || transaction.notes?.receiverName) && (
                            <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                              From: {transaction.notes?.callerName || transaction.fromUserName || transaction.fromUser?.name || transaction.senderName || transaction.notes?.receiverName || 'User'}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {transaction.status && (
                            <span className={`inline-block mt-2 px-2.5 py-1 text-xs rounded-full font-semibold ${
                              transaction.status === 'done' 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : transaction.status === 'progress'
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                              {transaction.status}
                            </span>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className={`text-xl font-bold ${
                            transaction.amount > 0 
                              ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' 
                              : 'text-red-500'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount || 0).toFixed(2)}
                          </p>
                          {transaction.balance !== undefined && (
                            <p className="text-xs text-gray-500 mt-1">Bal: ₹{transaction.balance.toFixed(2)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {modalHasMore && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <button
                    onClick={loadMoreModal}
                    disabled={modalLoading}
                    className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {modalLoading ? 'Loading...' : 'Load More Transactions'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            Transaction History
          </h3>
          <p className="text-xs text-gray-500 mt-1">Showing all transactions since you joined</p>
        </div>
      </div>
      
      {loading && transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No transactions found</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {transactions.slice(0, initialDisplayCount).map((transaction, index) => (
              <div
                key={transaction._id || index}
                className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <p className="font-bold text-gray-800">{getTransactionType(transaction)}</p>
                  </div>
                  {(transaction.notes?.callerName || transaction.fromUserName || transaction.fromUser?.name || transaction.senderName || transaction.notes?.receiverName) && (
                    <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                      From: {transaction.notes?.callerName || transaction.fromUserName || transaction.fromUser?.name || transaction.senderName || transaction.notes?.receiverName || 'User'}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  {transaction.status && (
                    <span className={`inline-block mt-2 px-2.5 py-1 text-xs rounded-full font-semibold ${
                      transaction.status === 'done' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : transaction.status === 'progress'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}>
                      {transaction.status}
                    </span>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className={`text-xl font-bold ${
                    transaction.amount > 0 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' 
                      : 'text-red-500'
                  }`}>
                    {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount || 0).toFixed(2)}
                  </p>
                  {transaction.balance !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">Bal: ₹{transaction.balance.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {transactions.length > initialDisplayCount && (
            <button
              onClick={openModal}
              className="mt-6 w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              View All Transactions ({transactions.length - initialDisplayCount} more)
            </button>
          )}
        </>
      )}

      {/* Modal for all transactions */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={closeModal}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  All Transactions
                </h3>
                <p className="text-sm text-gray-500 mt-1">Complete transaction history since you joined</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-600 hover:text-gray-700 p-2.5 hover:bg-gray-100 rounded-xl transition-all hover:scale-110"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalLoading && modalTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600 font-medium">Loading transactions...</p>
                </div>
              ) : modalTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {modalTransactions.map((transaction, index) => (
                      <div
                        key={transaction._id || index}
                        className="flex justify-between items-center p-5 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200"
                      >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <p className="font-bold text-gray-800">{getTransactionType(transaction)}</p>
                        </div>
                        {(transaction.notes?.callerName || transaction.fromUserName || transaction.fromUser?.name || transaction.senderName || transaction.notes?.receiverName) && (
                          <p className="text-sm font-medium text-gray-600 mb-1 truncate">
                            From: {transaction.notes?.callerName || transaction.fromUserName || transaction.fromUser?.name || transaction.senderName || transaction.notes?.receiverName || 'User'}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {transaction.status && (
                          <span className={`inline-block mt-2 px-2.5 py-1 text-xs rounded-full font-semibold ${
                            transaction.status === 'done' 
                              ? 'bg-green-100 text-green-700 border border-green-200' 
                              : transaction.status === 'progress'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {transaction.status}
                          </span>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className={`text-xl font-bold ${
                          transaction.amount > 0 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent' 
                            : 'text-red-500'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount || 0).toFixed(2)}
                        </p>
                        {transaction.balance !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">Bal: ₹{transaction.balance.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {modalHasMore && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={loadMoreModal}
                  disabled={modalLoading}
                  className="w-full py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {modalLoading ? 'Loading...' : 'Load More Transactions'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

