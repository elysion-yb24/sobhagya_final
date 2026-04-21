'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { 
  getKundliCalculations, 
  getGunMilanCalculations,
  deleteKundliCalculation,
  deleteGunMilanCalculation,
  type KundliCalculation,
  type GunMilanCalculation
} from '@/lib/storage';
import Link from 'next/link';

export default function HistoryPage() {
  const router = useRouter();
  const [kundliHistory, setKundliHistory] = useState<KundliCalculation[]>([]);
  const [gunMilanHistory, setGunMilanHistory] = useState<GunMilanCalculation[]>([]);
  const [activeTab, setActiveTab] = useState<'kundli' | 'gun-milan'>('kundli');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const kundlis = getKundliCalculations();
    const gunMilans = getGunMilanCalculations();
    setKundliHistory(kundlis);
    setGunMilanHistory(gunMilans);
  };

  const handleDeleteKundli = (id: string) => {
    deleteKundliCalculation(id);
    loadHistory();
    toast.success('Kundli deleted successfully');
  };

  const handleDeleteGunMilan = (id: string) => {
    deleteGunMilanCalculation(id);
    loadHistory();
    toast.success('Gun Milan deleted successfully');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calculation History</h1>
              <p className="text-sm text-gray-900 font-medium mt-1">View your last 3 Kundli and Gun Milan calculations</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-semibold"
            >
              Back to Dashboard
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('kundli')}
              className={`px-6 py-3 font-semibold transition-all relative ${
                activeTab === 'kundli'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-900 hover:text-gray-900'
              }`}
            >
              Kundli ({kundliHistory.length})
            </button>
            <button
              onClick={() => setActiveTab('gun-milan')}
              className={`px-6 py-3 font-semibold transition-all relative ${
                activeTab === 'gun-milan'
                  ? 'text-rose-600 border-b-2 border-rose-600'
                  : 'text-gray-900 hover:text-gray-900'
              }`}
            >
              Gun Milan ({gunMilanHistory.length})
            </button>
          </div>

          {/* Kundli History */}
          {activeTab === 'kundli' && (
            <div className="space-y-4">
              {kundliHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-900">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-bold text-gray-900">No Kundli calculations found</p>
                  <p className="text-sm mt-2 font-medium text-gray-900">Generate a Kundli to see it here</p>
                  <Link
                    href="/tools/kundli"
                    className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                  >
                    Generate Kundli
                  </Link>
                </div>
              ) : (
                kundliHistory.map((calculation) => (
                  <div key={calculation.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                            {calculation.formData.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{calculation.formData.name}</h3>
                            <p className="text-xs font-medium text-gray-900">{formatDate(calculation.timestamp)}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                          <div>
                            <span className="text-gray-900 font-medium">DOB:</span>
                            <span className="ml-2 font-bold text-gray-900">{calculation.formData.dateOfBirth}</span>
                          </div>
                          <div>
                            <span className="text-gray-900 font-medium">Time:</span>
                            <span className="ml-2 font-bold text-gray-900">{calculation.formData.timeOfBirth}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-900 font-medium">Place:</span>
                            <span className="ml-2 font-bold text-gray-900">{calculation.formData.placeOfBirth}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/tools/kundli/view/${calculation.id}`}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteKundli(calculation.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Gun Milan History */}
          {activeTab === 'gun-milan' && (
            <div className="space-y-4">
              {gunMilanHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-900">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.682a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <p className="text-lg font-bold text-gray-900">No Gun Milan calculations found</p>
                  <p className="text-sm mt-2 font-medium text-gray-900">Calculate Gun Milan to see it here</p>
                  <Link
                    href="/tools/gun-milan"
                    className="inline-block mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-all"
                  >
                    Calculate Gun Milan
                  </Link>
                </div>
              ) : (
                gunMilanHistory.map((calculation) => (
                  <div key={calculation.id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            ❤️
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {calculation.boyData.name} & {calculation.girlData.name}
                            </h3>
                            <p className="text-xs font-medium text-gray-900">{formatDate(calculation.timestamp)}</p>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-3 mt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-900 font-bold">Compatibility Score:</span>
                            <span className={`text-2xl font-bold ${
                              calculation.result.totalScore >= 32 ? 'text-green-600' :
                              calculation.result.totalScore >= 28 ? 'text-blue-600' :
                              calculation.result.totalScore >= 24 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {calculation.result.totalScore}/36
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                              calculation.result.totalScore >= 32 ? 'bg-green-100 text-green-700' :
                              calculation.result.totalScore >= 28 ? 'bg-blue-100 text-blue-700' :
                              calculation.result.totalScore >= 24 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {calculation.result.compatibilityLevel}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link
                          href={`/tools/gun-milan/view/${calculation.id}`}
                          className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-all text-sm font-semibold"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeleteGunMilan(calculation.id)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

