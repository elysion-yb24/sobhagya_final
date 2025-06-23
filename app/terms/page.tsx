import React from "react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8 lg:p-10 max-w-3xl w-full border border-gray-200 relative">
        {/* Background Logo */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/sobhagya-logo.png')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>

        {/* Title Section */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#745802] text-center mb-6 underline">
          Terms of Services
        </h1>

        <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
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
          <div key={index} className="mt-6">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-orange-700 border-l-4 border-orange-500 pl-3">
              {section.title}
            </h2>
            <p className="mt-2 text-gray-700 text-sm sm:text-base leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}

        {/* User Responsibilities Section */}
        <div className="mt-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-orange-700 border-l-4 border-orange-500 pl-3">
            User Responsibilities
          </h2>
          <ul className="mt-3 space-y-2 text-gray-700 text-sm sm:text-base">
            {[
              "Ensure the accuracy of personal information provided.",
              "Do not share account credentials with others.",
              "Comply with all applicable laws when using our services.",
              "Report any security breaches or unauthorized activity immediately.",
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-600 font-medium mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Governing Law */}
        <div className="mt-8">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-orange-700 border-l-4 border-orange-500 pl-3">
            Governing Law
          </h2>
          <p className="mt-2 text-gray-700 text-sm sm:text-base leading-relaxed">
            These Terms of Service are governed by and interpreted in accordance with the laws of India. Any disputes arising will be subject to the jurisdiction of Indian courts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
