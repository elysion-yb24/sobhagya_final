'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { saveKundliCalculation } from '@/lib/storage';
import { downloadKundliPDF } from '@/lib/pdfUtils';

const states = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function KundliGeneratorPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: ''
  });
  const [kundliData, setKundliData] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.dateOfBirth || !formData.timeOfBirth || !formData.placeOfBirth) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/kundli/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (result.success) {
        setKundliData(result.data);
        setShowResults(true);
        // Save to storage (keeps only last 3)
        saveKundliCalculation(formData, result.data);
        toast.success('Kundli generated successfully!');
      } else {
        toast.error(result.error || 'Failed to generate Kundli');
      }
    } catch (error: any) {
      console.error('Error generating Kundli:', error);
      toast.error('Failed to generate Kundli. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      gender: '',
      dateOfBirth: '',
      timeOfBirth: '',
      placeOfBirth: ''
    });
    setKundliData(null);
    setShowResults(false);
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating PDF...', { id: 'pdf-loading' });
      await downloadKundliPDF('kundli-results', `Kundli_${formData.name || 'Report'}`);
      toast.success('PDF downloaded successfully!', { id: 'pdf-loading' });
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF. Please try again.', { id: 'pdf-loading' });
    }
  };

  if (showResults && kundliData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Kundli Results</h1>
              <div className="flex gap-3">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center gap-2"
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
                  New Kundli
                </button>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>

            <div id="kundli-results" className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h2 className="font-bold text-gray-900 mb-2">Personal Information</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-900 font-medium">Name:</span>
                    <span className="ml-2 font-bold text-gray-900">{kundliData.personalInfo?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">Gender:</span>
                    <span className="ml-2 font-bold text-gray-900">{kundliData.personalInfo?.gender || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">Date of Birth:</span>
                    <span className="ml-2 font-bold text-gray-900">{kundliData.personalInfo?.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-gray-900 font-medium">Time of Birth:</span>
                    <span className="ml-2 font-bold text-gray-900">{kundliData.personalInfo?.timeOfBirth}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-900 font-medium">Place of Birth:</span>
                    <span className="ml-2 font-bold text-gray-900">{kundliData.personalInfo?.placeOfBirth}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h2 className="font-bold text-gray-900 mb-4">Planetary Positions</h2>
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
                      {kundliData.planetaryPositions?.map((planet: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-bold text-gray-900">{planet.planet}</td>
                          <td className="p-2 font-semibold text-gray-900">{planet.sign}</td>
                          <td className="p-2 font-semibold text-gray-900">{planet.signLord || 'N/A'}</td>
                          <td className="p-2 font-semibold text-gray-900">{planet.degree}</td>
                          <td className="p-2 font-semibold text-gray-900">{planet.nakshatra}</td>
                          <td className="p-2 font-semibold text-gray-900">{planet.nakshatraLord || 'N/A'}</td>
                          <td className="p-2 font-bold text-gray-900">{planet.house}</td>
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

              {/* House Positions */}
              {kundliData.housePositions && kundliData.housePositions.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h2 className="font-bold text-gray-900 mb-4">House Positions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kundliData.housePositions.map((house: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900">
                            {house.houseName || `House ${house.houseNumber}`}
                          </h3>
                          <span className="text-xs font-semibold text-gray-900">H{house.houseNumber}</span>
                        </div>
                        <div className="space-y-1">
                          <div>
                            <span className="text-xs font-medium text-gray-900">Rashi:</span>
                            <span className="ml-2 font-bold text-sm text-gray-900">{house.rashi}</span>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-900">Planets:</span>
                            <span className="ml-2 font-bold text-sm text-gray-900">
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

              {/* House Analysis */}
              {kundliData.houseAnalysis && kundliData.houseAnalysis.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h2 className="font-bold text-gray-900 mb-4">House Analysis</h2>
                  <div className="space-y-3">
                    {kundliData.houseAnalysis.map((analysis: any, index: number) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-2">{analysis.house}</h3>
                        <p className="text-sm font-medium text-gray-900">{analysis.analysis}</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-neutral-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Kundli Generator</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
            >
              Back to Dashboard
            </button>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400 font-medium"
                placeholder="Enter full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
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
                value={formData.timeOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Place of Birth (State) *
              </label>
              <select
                name="placeOfBirth"
                value={formData.placeOfBirth}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 font-medium"
                required
              >
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-4 rounded-xl font-bold transition-all duration-200 shadow-lg ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {loading ? 'Generating Kundli...' : 'Generate Kundli'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

