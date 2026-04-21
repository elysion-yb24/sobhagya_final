'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { saveGunMilanCalculation } from '@/lib/storage';
import { downloadGunMilanPDF } from '@/lib/pdfUtils';

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function GunMilanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [boyData, setBoyData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    state: ''
  });
  const [girlData, setGirlData] = useState({
    name: '',
    dateOfBirth: '',
    timeOfBirth: '',
    state: ''
  });
  const [result, setResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleBoyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBoyData(prev => ({ ...prev, [name]: value }));
  };

  const handleGirlInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setGirlData(prev => ({ ...prev, [name]: value }));
  };

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!boyData.name || !boyData.dateOfBirth || !boyData.timeOfBirth || !boyData.state ||
        !girlData.name || !girlData.dateOfBirth || !girlData.timeOfBirth || !girlData.state) {
      toast.error('Please fill in all required fields for both boy and girl');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/gun-milan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boyData: {
            ...boyData,
            placeOfBirth: boyData.state
          },
          girlData: {
            ...girlData,
            placeOfBirth: girlData.state
          }
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
        setShowResults(true);
        // Save to storage (keeps only last 3)
        saveGunMilanCalculation(boyData, girlData, data.data);
        toast.success('Gun Milan calculated successfully!');
      } else {
        toast.error(data.error || 'Failed to calculate Gun Milan');
      }
    } catch (error: any) {
      console.error('Error calculating Gun Milan:', error);
      toast.error('Failed to calculate Gun Milan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBoyData({
      name: '',
      dateOfBirth: '',
      timeOfBirth: '',
      state: ''
    });
    setGirlData({
      name: '',
      dateOfBirth: '',
      timeOfBirth: '',
      state: ''
    });
    setResult(null);
    setShowResults(false);
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-loading' });
      await downloadGunMilanPDF('gun-milan-results', `GunMilan_${boyData.name}_${girlData.name || 'Report'}`);
      toast.success('PDF downloaded successfully!', { id: 'pdf-loading' });
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.', { id: 'pdf-loading' });
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  if (showResults && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Gun Milan Results</h1>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 font-semibold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-semibold"
                >
                  New Calculation
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            <div id="gun-milan-results" className="space-y-6">
              <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl p-6 border border-pink-100">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {result.totalScore}/36
                  </h2>
                  <div className={`inline-block px-4 py-2 rounded-full text-lg font-bold mb-4 ${
                    result.totalScore >= 32 ? 'bg-green-100 text-green-900' :
                    result.totalScore >= 28 ? 'bg-blue-100 text-blue-900' :
                    result.totalScore >= 24 ? 'bg-yellow-100 text-yellow-900' :
                    result.totalScore >= 20 ? 'bg-orange-100 text-orange-900' :
                    'bg-red-100 text-red-900'
                  }`}>
                    {result.compatibilityLevel}
                  </div>
                  <p className="text-gray-900 font-semibold">{result.compatibilityDescription}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-4 text-center">Boy's Details</h3>
                  <div className="space-y-2">
                    <div><span className="text-gray-900 font-medium">Name:</span> <span className="font-bold text-gray-900">{boyData.name}</span></div>
                    <div><span className="text-gray-900 font-medium">Date of Birth:</span> <span className="font-bold text-gray-900">{formatDate(boyData.dateOfBirth)}</span></div>
                    <div><span className="text-gray-900 font-medium">Time of Birth:</span> <span className="font-bold text-gray-900">{boyData.timeOfBirth}</span></div>
                    <div><span className="text-gray-900 font-medium">State:</span> <span className="font-bold text-gray-900">{boyData.state}</span></div>
                  </div>
                  {result.birthCharts?.boy && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-2">Birth Chart:</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-gray-900 font-medium">Nakshatra:</span> <span className="font-bold text-gray-900">{result.birthCharts.boy.nakshatra?.name}</span></div>
                        <div><span className="text-gray-900 font-medium">Rashi:</span> <span className="font-bold text-gray-900">{result.birthCharts.boy.rashi?.name}</span></div>
                        <div><span className="text-gray-900 font-medium">Ascendant:</span> <span className="font-bold text-gray-900">{result.birthCharts.boy.ascendant?.name}</span></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-4 text-center">Girl's Details</h3>
                  <div className="space-y-2">
                    <div><span className="text-gray-900 font-medium">Name:</span> <span className="font-bold text-gray-900">{girlData.name}</span></div>
                    <div><span className="text-gray-900 font-medium">Date of Birth:</span> <span className="font-bold text-gray-900">{formatDate(girlData.dateOfBirth)}</span></div>
                    <div><span className="text-gray-900 font-medium">Time of Birth:</span> <span className="font-bold text-gray-900">{girlData.timeOfBirth}</span></div>
                    <div><span className="text-gray-900 font-medium">State:</span> <span className="font-bold text-gray-900">{girlData.state}</span></div>
                  </div>
                  {result.birthCharts?.girl && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-2">Birth Chart:</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-gray-900 font-medium">Nakshatra:</span> <span className="font-bold text-gray-900">{result.birthCharts.girl.nakshatra?.name}</span></div>
                        <div><span className="text-gray-900 font-medium">Rashi:</span> <span className="font-bold text-gray-900">{result.birthCharts.girl.rashi?.name}</span></div>
                        <div><span className="text-gray-900 font-medium">Ascendant:</span> <span className="font-bold text-gray-900">{result.birthCharts.girl.ascendant?.name}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 mb-4">Gun Milan Details (36-Point Analysis)</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.gunDetails?.map((gun: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-sm text-gray-900">{gun.name}</span>
                        <span className={`text-lg font-bold ${
                          gun.score > 0 ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {gun.score}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-gray-900">{gun.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {(result.recommendations || result.remedies) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {result.recommendations && result.recommendations.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {result.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-700 mt-1 font-bold">•</span>
                            <span className="text-sm font-medium text-gray-900">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.remedies && result.remedies.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-bold text-gray-900 mb-3">Remedies</h3>
                      <ul className="space-y-2">
                        {result.remedies.map((remedy: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-700 mt-1 font-bold">•</span>
                            <span className="text-sm font-medium text-gray-900">{remedy}</span>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Gun Milan Calculator</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            >
              Back to Dashboard
            </button>
          </div>

          <form onSubmit={handleCalculate} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Boy's Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-blue-600">Boy's Details</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={boyData.name}
                    onChange={handleBoyInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 font-medium"
                    placeholder="Enter boy's name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={boyData.dateOfBirth}
                    onChange={handleBoyInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time of Birth *
                  </label>
                  <input
                    type="time"
                    name="timeOfBirth"
                    value={boyData.timeOfBirth}
                    onChange={handleBoyInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={boyData.state}
                    onChange={handleBoyInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Girl's Details */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-pink-600">Girl's Details</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={girlData.name}
                    onChange={handleGirlInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 font-medium"
                    placeholder="Enter girl's name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={girlData.dateOfBirth}
                    onChange={handleGirlInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time of Birth *
                  </label>
                  <input
                    type="time"
                    name="timeOfBirth"
                    value={girlData.timeOfBirth}
                    onChange={handleGirlInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={girlData.state}
                    onChange={handleGirlInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 font-medium"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-4 rounded-xl font-bold transition-all duration-200 shadow-lg ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:from-pink-600 hover:to-orange-600 shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? 'Calculating Gun Milan...' : 'Calculate Gun Milan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

