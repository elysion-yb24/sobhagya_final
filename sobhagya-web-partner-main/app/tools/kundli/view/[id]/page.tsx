'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getKundliCalculationById } from '@/lib/storage';

export default function ViewKundliPage() {
  const router = useRouter();
  const params = useParams();
  const [kundliData, setKundliData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    if (id) {
      const calculation = getKundliCalculationById(id);
      if (calculation) {
        setKundliData(calculation);
      } else {
        router.push('/tools/history');
      }
    }
    setLoading(false);
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!kundliData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Kundli Results</h1>
            <button
              onClick={() => router.push('/tools/history')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            >
              Back to History
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="font-bold text-gray-800 mb-2">Personal Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-semibold">{kundliData.formData?.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <span className="ml-2 font-semibold">{kundliData.formData?.gender || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date of Birth:</span>
                  <span className="ml-2 font-semibold">{kundliData.formData?.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-gray-600">Time of Birth:</span>
                  <span className="ml-2 font-semibold">{kundliData.formData?.timeOfBirth}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Place of Birth:</span>
                  <span className="ml-2 font-semibold">{kundliData.formData?.placeOfBirth}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Generated:</span>
                  <span className="ml-2 font-semibold">{new Date(kundliData.timestamp).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <h2 className="font-bold text-gray-800 mb-4">Planetary Positions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="p-2 text-left">Planet</th>
                      <th className="p-2 text-left">Sign</th>
                      <th className="p-2 text-left">Sign Lord</th>
                      <th className="p-2 text-left">Degree</th>
                      <th className="p-2 text-left">Nakshatra</th>
                      <th className="p-2 text-left">Nakshatra Lord</th>
                      <th className="p-2 text-left">House</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kundliData.kundliData?.planetaryPositions?.map((planet: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-semibold">{planet.planet}</td>
                        <td className="p-2">{planet.sign}</td>
                        <td className="p-2 text-gray-600">{planet.signLord || 'N/A'}</td>
                        <td className="p-2">{planet.degree}</td>
                        <td className="p-2">{planet.nakshatra}</td>
                        <td className="p-2 text-gray-600">{planet.nakshatraLord || 'N/A'}</td>
                        <td className="p-2 font-semibold">{planet.house}</td>
                        <td className="p-2">
                          <div className="flex flex-wrap gap-1">
                            <span className={`px-2 py-1 rounded text-xs ${
                              planet.status === 'Exalted' ? 'bg-green-100 text-green-700' :
                              planet.status === 'Debilitated' ? 'bg-red-100 text-red-700' :
                              planet.status === 'Owned' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {planet.status}
                            </span>
                            {planet.isRetrograde && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs" title="Retrograde">R</span>
                            )}
                            {planet.isCombust && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs" title="Combust">C</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {kundliData.kundliData?.housePositions && kundliData.kundliData.housePositions.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h2 className="font-bold text-gray-800 mb-4">House Positions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kundliData.kundliData.housePositions.map((house: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-800">
                          {house.houseName || `House ${house.houseNumber}`}
                        </h3>
                        <span className="text-xs text-gray-500">H{house.houseNumber}</span>
                      </div>
                      <div className="space-y-1">
                        <div>
                          <span className="text-xs text-gray-600">Rashi:</span>
                          <span className="ml-2 font-semibold text-sm">{house.rashi}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-600">Planets:</span>
                          <span className="ml-2 font-semibold text-sm">
                            {house.planets && house.planets.length > 0 
                              ? house.planets.join(', ') 
                              : 'None'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {kundliData.kundliData?.houseAnalysis && kundliData.kundliData.houseAnalysis.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h2 className="font-bold text-gray-800 mb-4">House Analysis</h2>
                <div className="space-y-3">
                  {kundliData.kundliData.houseAnalysis.map((analysis: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <h3 className="font-semibold text-gray-800 mb-2">{analysis.house}</h3>
                      <p className="text-sm text-gray-700">{analysis.analysis}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

