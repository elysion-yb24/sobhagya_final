'use client'

const WhyConsult: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden">
      {/* Faded astrology icon background (optional) */}
      <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none select-none z-0">
        <img src="/sobhagya_logo.avif" alt="Astrology Icon" width={400} height={400} className="object-contain" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-center mb-6 text-[#745802] text-5xl font-extrabold tracking-tight" style={{ fontFamily: 'EB Garamond' }}>
          Why Consult an Astrologer?
          <span className="block w-24 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></span>
        </h2>
        <p className="text-center mb-12 text-[#745802] text-lg font-medium">
          Unlock the Secrets of Your Destiny!
        </p>
        <div className="max-w-4xl mx-auto bg-white/90 rounded-3xl shadow-2xl border-t-8 border-orange-200 p-8 md:p-12 animate-fade-in-up">
          <div className="space-y-6 text-justify text-gray-700 text-lg leading-relaxed font-medium">
            {/* Main content paragraphs */}
            <p>Life is full of uncertainties, challenges, and crossroads where we seek guidance to make the right decisions. Astrology, an ancient science based on planetary movements and cosmic energies, offers profound insights into various aspects of life. Consulting an astrologer can help you navigate challenges, understand your strengths and weaknesses, and make informed choices for a better future. An astrologer analyzes your birth chart (kundli) based on planetary positions at the time of your birth. This provides valuable information about your personality, relationships, career, health, finances, and overall life path. Whether you are facing difficulties in love and marriage, struggling with career growth, or dealing with financial instability, an astrologer can help you find solutions and remedies.One of the key benefits of astrology is self-awareness. By understanding your zodiac sign, planetary influences, and astrological aspects, you gain a deeper insight into your emotions, behavior, and decision-making patterns. This self-knowledge empowers you to take control of your life and make choices that align with your destiny.</p>
            <p>Astrology also plays a crucial role in relationships. Many people consult astrologers to check love compatibility, resolve misunderstandings, and find harmony in marriage. By analyzing the compatibility of two individuals based on their birth charts, astrologers can predict the strengths and challenges in a relationship and suggest remedies to improve bonding and happiness</p>
            <p>Career and financial matters are another important area where astrology can be beneficial. If you are struggling to find the right career path, facing setbacks at work, or experiencing financial losses, an astrologer can analyze your planetary positions and suggest the best course of action. Many business owners and professionals rely on astrology to make important decisions, such as selecting auspicious dates for investments, job changes, or business expansions.</p>
            <p>Astrology is also a guiding light in health and wellness. By studying planetary influences on your physical and mental well-being, astrologers can predict potential health issues and suggest preventive measures. Certain planetary combinations can indicate periods of vulnerability, and with the right remedies, you can minimize their negative impact.</p>
            <p>In addition to predictions, astrology provides effective remedies to overcome life's challenges. Astrologers may recommend chanting mantras, wearing gemstones, performing pujas, or following specific rituals to balance negative planetary effects and attract positive energy. These remedies are based on ancient wisdom and have helped countless people improve their lives.</p>
            <p>Astrology is not just about predicting the future; it is about understanding the energies that influence your life and aligning yourself with them for growth and success. It helps you choose the right time for important life events like marriage, childbirth, travel, or new ventures, ensuring a higher chance of success.</p>
            <p>For those seeking spiritual growth, astrology is a powerful tool. It helps individuals understand their karmic patterns, past life influences, and soul purpose. By aligning with cosmic energies, one can achieve inner peace, personal growth, and spiritual enlightenment.In today's fast-paced world, many people feel lost, anxious, or confused about their future. Consulting an astrologer provides clarity, reassurance, and a sense of direction. Whether you need help with love, career, finances, health, or spiritual growth, astrology offers a guiding light to help you make the right choices.</p>
          </div>
          <div className="mt-8 space-y-6">
            <h3 className="text-[#373737] text-xl font-bold mb-2">Online Astrology Consulting Services – Expert Guidance Anytime, Anywhere!</h3>
            <div className="space-y-4 text-[#333333] text-base font-medium">
              <p>Astrology offers deep insights into various aspects of life, and with online astrology consulting services, you can now access expert guidance from the comfort of your home. Whether you're facing challenges in love, career, health, finances, or personal growth, professional astrologers analyze your birth chart and planetary influences to provide accurate predictions and practical solutions. Through live consultations via chat, call, or video, you can get instant answers to your concerns.</p>
              <p>Personalized horoscope readings help you stay informed about daily, weekly, and yearly planetary movements, while love and marriage compatibility analysis ensures harmony in relationships.</p>
              <p>Astrology also provides valuable career and business guidance, helping you make informed financial decisions. Additionally, health insights based on planetary influences allow for preventive care and wellness planning. Effective astrological remedies such as mantras, gemstones, and rituals help balance energies and remove obstacles. Whether you seek Vedic astrology, KP astrology, or numerology-based predictions, online consulting services offer comprehensive solutions tailored to your needs. Connect with expert astrologers today and unlock the wisdom of the stars!</p>
            </div>
          </div>
        </div>
      </div>
      {/* Fade-in animation keyframes */}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default WhyConsult;
