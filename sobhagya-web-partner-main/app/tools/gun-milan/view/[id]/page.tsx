'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getGunMilanCalculationById } from '@/lib/storage';

export default function ViewGunMilanPage() {
  const router = useRouter();
  const params = useParams();
  const [calculation, setCalculation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      const calc = getGunMilanCalculationById(id);
      if (calc) {
        setCalculation(calc);
      } else {
        router.push('/tools/history');
      }
    }
    setLoading(false);
  }, [params.id, router]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-rose-600"></div>
      </div>
    );
  }

  if (!calculation) {
    return null;
  }

  const { boyData, girlData, result } = calculation;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Gun Milan Results</h1>
            <button
              onClick={() => router.push('/tools/history')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            >
              Back to History
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-pink-100">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {result.totalScore}/36
                </h2>
                <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold mb-4 ${
                  result.totalScore >= 32 ? 'bg-green-100 text-green-700' :
                  result.totalScore >= 28 ? 'bg-blue-100 text-blue-700' :
                  result.totalScore >= 24 ? 'bg-yellow-100 text-yellow-700' :
                  result.totalScore >= 20 ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {result.compatibilityLevel}
                </div>
                <p className="text-gray-700">{result.compatibilityDescription}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Calculated: {new Date(calculation.timestamp).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-4 text-center">Boy's Details</h3>
                <div className="space-y-2">
                  <div><span className="text-gray-600">Name:</span> <span className="font-semibold">{boyData.name}</span></div>
                  <div><span className="text-gray-600">Date of Birth:</span> <span className="font-semibold">{formatDate(boyData.dateOfBirth)}</span></div>
                  <div><span className="text-gray-600">Time of Birth:</span> <span className="font-semibold">{boyData.timeOfBirth}</span></div>
                  <div><span className="text-gray-600">State:</span> <span className="font-semibold">{boyData.state}</span></div>
                </div>
                {result.birthCharts?.boy && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold mb-2">Birth Chart:</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-600">Nakshatra:</span> <span className="font-semibold">{result.birthCharts.boy.nakshatra?.name}</span></div>
                      <div><span className="text-gray-600">Rashi:</span> <span className="font-semibold">{result.birthCharts.boy.rashi?.name}</span></div>
                      <div><span className="text-gray-600">Ascendant:</span> <span className="font-semibold">{result.birthCharts.boy.ascendant?.name}</span></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-4 text-center">Girl's Details</h3>
                <div className="space-y-2">
                  <div><span className="text-gray-600">Name:</span> <span className="font-semibold">{girlData.name}</span></div>
                  <div><span className="text-gray-600">Date of Birth:</span> <span className="font-semibold">{formatDate(girlData.dateOfBirth)}</span></div>
                  <div><span className="text-gray-600">Time of Birth:</span> <span className="font-semibold">{girlData.timeOfBirth}</span></div>
                  <div><span className="text-gray-600">State:</span> <span className="font-semibold">{girlData.state}</span></div>
                </div>
                {result.birthCharts?.girl && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold mb-2">Birth Chart:</h4>
                    <div className="space-y-1 text-sm">
                      <div><span className="text-gray-600">Nakshatra:</span> <span className="font-semibold">{result.birthCharts.girl.nakshatra?.name}</span></div>
                      <div><span className="text-gray-600">Rashi:</span> <span className="font-semibold">{result.birthCharts.girl.rashi?.name}</span></div>
                      <div><span className="text-gray-600">Ascendant:</span> <span className="font-semibold">{result.birthCharts.girl.ascendant?.name}</span></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-800 mb-4">Gun Milan Details (36-Point Analysis)</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.gunDetails?.map((gun: any, index: number) => (
                  <div key={index} className="bg-white p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-sm">{gun.name}</span>
                      <span className={`text-lg font-bold ${
                        gun.score > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {gun.score}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{gun.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {(result.recommendations || result.remedies) && (
              <div className="grid md:grid-cols-2 gap-6">
                {result.recommendations && result.recommendations.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-800 mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.remedies && result.remedies.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-800 mb-3">Remedies</h3>
                    <ul className="space-y-2">
                      {result.remedies.map((remedy: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-600 mt-1">•</span>
                          <span className="text-sm text-gray-700">{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

