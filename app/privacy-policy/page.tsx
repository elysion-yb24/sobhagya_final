'use client'

import React from "react";

const PrivacyPolicy = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white/80 py-0">
      <div className="relative max-w-5xl mx-auto p-6 sm:p-10 bg-white/90 shadow-2xl rounded-3xl border-t-8 border-orange-200 animate-fade-in-up mt-10 mb-10 z-30 backdrop-blur-md">
        {/* Faded Monk Logo */}
        <div className="absolute inset-0 flex justify-center items-center opacity-10 z-0 pointer-events-none select-none">
          <div style={{width: '320px', height: '320px', background: "url('/monk logo.png') center/contain no-repeat"}} />
        </div>
        {/* Title Section */}
        <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-[#745802] text-center mb-6 tracking-tight">
          Privacy Policy
          <span className="block w-24 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></span>
        </h1>
        <p className="text-gray-700 text-lg md:text-xl leading-relaxed relative z-10 font-normal mb-6">
          www.sobhagya.in (“we”, “Elysion Softwares Services Private Limited”, “Sobhagya”) is committed to protecting the privacy of users, including astrologers and buyers/customers, whether registered or not. Please read this privacy policy carefully to understand how we use your information.
        </p>
        {/* Sections */}
        {[
          { title: "User's Consent", content: "By accessing and using this website, you indicate that you understand and consent to the terms of this Privacy Policy. If you do not agree, please do not use this website." },
          { title: "Collection of Personal Information", content: "Creating a user profile with Sobhagya requires providing your phone number for OTP verification. Your first name, last name, and date of birth (DOB) are optional." },
          { title: "Purpose and Use of Data", content: "We collect this information to personalize user profiles and cater to specific needs. Users can still access services without providing DOB." },
          { title: "Data Deletion", content: "To delete your profile, navigate to the settings menu, click 'Delete your account,' and follow the instructions." },
          { title: "Voice Recording and Microphone Permission", content: "Our app allows users to send voice messages instead of typing. We request microphone access to enable this feature." },
          { title: "Commitment", content: "We protect user privacy and ensure no sale or rent of personal information. We do not provide mental health solutions and may share necessary information with law enforcement when required." },
        ].map((section, index) => (
          <div key={index} className="mt-8 relative z-10">
            <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">
              {section.title}
            </h2>
            <p className="mt-1 text-gray-700 text-lg md:text-xl leading-relaxed font-normal">
              {section.content}
            </p>
          </div>
        ))}
        {/* Information Collected Section */}
        <div className="mt-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">
            Information Collected
          </h2>
          <ul className="mt-3 space-y-3 text-gray-700 text-lg md:text-xl">
            {[
              "Personal Identifiable Information: Name, email, phone number, etc.",
              "Booking details for paid services, including payment info.",
              "Log files, IP addresses, and cookies.",
              "Public comments, feedback, and other shared content.",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-2 bg-orange-50 rounded-xl px-4 py-2 shadow-sm font-medium text-gray-800">
                <span className="text-orange-500 text-lg">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {/* Security Measures */}
        <div className="mt-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">
            Security Measures
          </h2>
          <p className="mt-1 text-gray-700 text-lg md:text-xl leading-relaxed font-normal">
            We take necessary security measures to protect user data but cannot guarantee absolute security.
          </p>
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
      </div>
    </section>
  );
};

export default PrivacyPolicy;
