"use client";
import React from "react";

const TermsOfService = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white/80 py-0">
      <div className="relative max-w-5xl mx-auto p-6 sm:p-10 bg-white/90 shadow-2xl rounded-3xl border-t-8 border-orange-200 animate-fade-in-up mt-10 mb-10 z-30 backdrop-blur-md">
        {/* Faded Monk Logo */}
        <div className="absolute inset-0 flex justify-center items-center opacity-10 z-0 pointer-events-none select-none">
          <div style={{width: '320px', height: '320px', background: "url('/monk logo.png') center/contain no-repeat"}} />
        </div>
        {/* Title Section */}
        <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-[#745802] text-center mb-6 tracking-tight">
          Terms of Services
          <span className="block w-24 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></span>
        </h1>
        <p className="text-gray-700 text-lg md:text-xl leading-relaxed relative z-10 font-normal mb-6">
          Welcome to <strong>www.sobhagya.in</strong>. By accessing or using our platform, you agree to comply with and be bound by these Terms of Service. If you do not agree, please refrain from using our services.
        </p>
        {/* Sections */}
        {[
          {
            title: "Acceptance of Terms",
            content:
              "By using this website, you agree to these terms. We may update them from time to time, and continued use of our services constitutes acceptance of the changes.",
          },
          {
            title: "User Accounts",
            content:
              "To access certain features, you may need to create an account. You are responsible for maintaining account security and ensuring the accuracy of your information.",
          },
          {
            title: "Prohibited Activities",
            content:
              "Users must not engage in fraudulent, abusive, or illegal activities. Any violation may result in suspension or termination of your account.",
          },
          {
            title: "Intellectual Property",
            content:
              "All content, including logos, text, and images, is the property of Sobhagya and protected by intellectual property laws. Unauthorized use is strictly prohibited.",
          },
          {
            title: "Payment & Refund Policy",
            content:
              "Payments for services are non-refundable unless otherwise stated. Users must review the pricing and terms before making a purchase.",
          },
          {
            title: "Limitation of Liability",
            content:
              "We are not responsible for any direct or indirect damages resulting from the use of our platform. Users access the services at their own risk.",
          },
          {
            title: "Termination of Services",
            content:
              "We reserve the right to suspend or terminate access to our services for any user who violates these terms or engages in harmful activities.",
          },
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
        {/* User Responsibilities Section */}
        <div className="mt-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">
            User Responsibilities
          </h2>
          <ul className="mt-3 space-y-3 text-gray-700 text-lg md:text-xl">
            {[
              "Ensure the accuracy of personal information provided.",
              "Do not share account credentials with others.",
              "Comply with all applicable laws when using our services.",
              "Report any security breaches or unauthorized activity immediately.",
            ].map((item, index) => (
              <li key={index} className="flex items-start gap-2 bg-orange-50 rounded-xl px-4 py-2 shadow-sm font-medium text-gray-800">
                <span className="text-orange-500 text-lg">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        {/* Governing Law */}
        <div className="mt-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">
            Governing Law
          </h2>
          <p className="mt-1 text-gray-700 text-lg md:text-xl leading-relaxed font-normal">
            These Terms of Service are governed by and interpreted in accordance with the laws of India. Any disputes arising will be subject to the jurisdiction of Indian courts.
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

export default TermsOfService;
