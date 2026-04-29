import { notFound } from 'next/navigation';
import { RashiSign } from '@/types';
import Image from 'next/image';
import {
  getDateRange,
  getElement,
  getQuality,
  getOverview,
  getPositiveTraits,
  getChallenges,
  getLoveLife,
  getCompatibleSigns,
  getCareer,
  getRecommendedCareers,
  getHealth,
  getHealthStrengths,
  getHealthConcerns,
  getRulingInfo
} from '@/types/rashiContent';


const rashiSigns: RashiSign[] = [
    { name: 'Aries', hindiName: 'मेष', image: '/Vector (18).png' },
    { name: 'Taurus', hindiName: 'वृषभ', image: '/Vector (19).png' },
    { name: 'Gemini', hindiName: 'मिथुन', image: '/Vector (20).png' },
    { name: 'Cancer', hindiName: 'कर्क', image: '/Vector (21).png' },
    { name: 'Leo', hindiName: 'सिंह', image: '/Vector (22).png' },
    { name: 'Virgo', hindiName: 'कन्या', image: '/Vector (23).png' },
    { name: 'Libra', hindiName: 'तुला', image: '/Vector (24).png' },
    { name: 'Scorpio', hindiName: 'वृश्चिक', image: '/Vector (25).png' },
    { name: 'Sagittarius', hindiName: 'धनु', image: '/Vector (26).png' },
    { name: 'Capricorn', hindiName: 'मकर', image: '/Vector (27).png' },
    { name: 'Aquarius', hindiName: 'कुंभ', image: '/Vector (28).png' },
    { name: 'Pisces', hindiName: 'मीन', image: '/Vector (29).png' },
];

type Props = {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RashiPage({ params, searchParams }: Props) {
  
  
  const [resolvedParams, resolvedSearchParams] = await Promise.all([params, searchParams]);
  
  const rashi = rashiSigns.find(sign => sign.name.toLowerCase() === resolvedParams.name.toLowerCase());

  if (!rashi) {
    notFound();
  }


 


  const rulingInfo = getRulingInfo(rashi.name);

  return (
    <div className="bg-gradient-to-br from-orange-50/40 via-white to-amber-50/30 min-h-screen">
      {/* Premium Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='30' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='40' cy='40' r='18' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='40' cy='40' r='6' fill='white'/%3E%3C/svg%3E")`,
              backgroundSize: "80px 80px",
            }}
          />
        </div>
        {/* Soft blurred orbs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-12 w-80 h-80 rounded-full bg-amber-300/15 blur-3xl pointer-events-none" />

        <div className="relative section-container py-10 sm:py-12 md:py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6 sm:gap-8 text-center sm:text-left">
            {/* Zodiac symbol inside glowing circle */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl">
                <Image
                  src={rashi.image}
                  alt={rashi.name}
                  width={80}
                  height={80}
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain drop-shadow-lg"
                />
              </div>
            </div>

            {/* Title + Date Range */}
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs sm:text-sm md:text-base uppercase tracking-wider mb-1.5 sm:mb-2">
                Zodiac Sign
              </p>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight mb-2"
                style={{ fontFamily: "EB Garamond, serif" }}
              >
                {rashi.name}
                <span className="block sm:inline text-white/90 text-xl sm:text-2xl md:text-3xl lg:text-4xl sm:ml-3 font-medium">
                  ({rashi.hindiName})
                </span>
              </h1>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-200" />
                <span className="text-white/95 text-xs sm:text-sm md:text-base font-medium">
                  {getDateRange(rashi.name)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="section-container py-8 sm:py-10 md:py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-lg shadow-orange-100/40 border border-orange-100/50 p-5 sm:p-7 md:p-10">
          {/* Quick Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-3 sm:p-4 rounded-xl text-center hover:shadow-md transition-shadow">
              <h3 className="text-[#745802] font-semibold text-xs sm:text-sm uppercase tracking-wide mb-1">Element</h3>
              <p className="text-gray-800 text-sm sm:text-base font-medium">{getElement(rashi.name)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-3 sm:p-4 rounded-xl text-center hover:shadow-md transition-shadow">
              <h3 className="text-[#745802] font-semibold text-xs sm:text-sm uppercase tracking-wide mb-1">Quality</h3>
              <p className="text-gray-800 text-sm sm:text-base font-medium">{getQuality(rashi.name)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-3 sm:p-4 rounded-xl text-center hover:shadow-md transition-shadow">
              <h3 className="text-[#745802] font-semibold text-xs sm:text-sm uppercase tracking-wide mb-1">Ruling Planet</h3>
              <p className="text-gray-800 text-sm sm:text-base font-medium">{rulingInfo.planet}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 p-3 sm:p-4 rounded-xl text-center hover:shadow-md transition-shadow">
              <h3 className="text-[#745802] font-semibold text-xs sm:text-sm uppercase tracking-wide mb-1">Lucky Stone</h3>
              <p className="text-gray-800 text-sm sm:text-base font-medium">{rulingInfo.stone}</p>
            </div>
          </div>

          {/* Overview Section */}
          <div className="mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#745802] mb-3 sm:mb-4" style={{ fontFamily: "EB Garamond, serif" }}>Overview</h2>
            <p className="text-gray-700 leading-relaxed text-sm sm:text-base text-justify">
              {getOverview(rashi.name)}
            </p>
          </div>

          {/* Characteristics Grid */}
          <div className="grid md:grid-cols-2 gap-5 sm:gap-6 md:gap-8 mb-10 sm:mb-12">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-5 sm:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-emerald-800 mb-3 sm:mb-4">Positive Traits</h3>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                {getPositiveTraits(rashi.name).map((trait, index) => (
                  <li key={index}>{trait}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-2xl p-5 sm:p-6">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#a35d00] mb-3 sm:mb-4">Challenges</h3>
              <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                {getChallenges(rashi.name).map((challenge, index) => (
                  <li key={index}>{challenge}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Love Section */}
          <section className="mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#745802] mb-3 sm:mb-4" style={{ fontFamily: "EB Garamond, serif" }}>Love & Relationships</h2>
            <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base text-justify">{getLoveLife(rashi.name)}</p>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 rounded-2xl p-5 sm:p-6">
              <h4 className="font-semibold text-rose-700 mb-3 text-sm sm:text-base">Compatible Signs</h4>
              <div className="flex flex-wrap gap-2">
                {getCompatibleSigns(rashi.name).map((sign, index) => (
                  <span key={index} className="bg-white border border-pink-200 shadow-sm px-3 py-1.5 rounded-full text-gray-700 text-xs sm:text-sm font-medium">
                    {sign}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Career Section */}
          <section className="mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#745802] mb-3 sm:mb-4" style={{ fontFamily: "EB Garamond, serif" }}>Career & Finance</h2>
            <p className="text-gray-700 leading-relaxed mb-4 text-sm sm:text-base text-justify">{getCareer(rashi.name)}</p>
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 sm:p-6">
              <h4 className="font-semibold text-[#745802] mb-3 text-sm sm:text-base">Recommended Careers</h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {getRecommendedCareers(rashi.name).map((career, index) => (
                  <div key={index} className="bg-white border border-orange-100 shadow-sm p-3 rounded-xl text-gray-700 text-xs sm:text-sm font-medium text-center">
                    {career}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Health Section */}
          <section>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#745802] mb-3 sm:mb-4" style={{ fontFamily: "EB Garamond, serif" }}>Health & Wellness</h2>
            <p className="text-gray-700 leading-relaxed mb-5 sm:mb-6 text-sm sm:text-base text-justify">{getHealth(rashi.name)}</p>
            <div className="grid md:grid-cols-2 gap-5 sm:gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 sm:p-6">
                <h4 className="font-semibold text-blue-800 mb-3 text-sm sm:text-base">Health Strengths</h4>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                  {getHealthStrengths(rashi.name).map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-5 sm:p-6">
                <h4 className="font-semibold text-amber-800 mb-3 text-sm sm:text-base">Areas of Attention</h4>
                <ul className="list-disc list-inside space-y-1.5 sm:space-y-2 text-gray-700 text-sm sm:text-base">
                  {getHealthConcerns(rashi.name).map((concern, index) => (
                    <li key={index}>{concern}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}