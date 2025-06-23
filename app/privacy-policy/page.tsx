import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4 sm:px-6 md:px-10 lg:px-16">
      <div className="relative bg-white shadow-xl rounded-xl p-5 sm:p-8 md:p-10 max-w-4xl w-full border border-gray-200">
        
        {/* Blurred Monk Logo in Center */}
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#745802] text-center mb-6 underline relative z-10">
          Privacy Policy
        </h1>

        <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed relative z-10">
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
          <div key={index} className="mt-6 sm:mt-8 relative z-10">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-500 pl-3">
              {section.title}
            </h2>
            <p className="mt-2 text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}

        {/* Information Collected Section */}
        <div className="mt-6 sm:mt-8 relative z-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-500 pl-3">
            Information Collected
          </h2>
          <ul className="mt-3 space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base md:text-lg">
            {[
              "Personal Identifiable Information: Name, email, phone number, etc.",
              "Booking details for paid services, including payment info.",
              "Log files, IP addresses, and cookies.",
              "Public comments, feedback, and other shared content.",
            ].map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="text-orange-600 font-medium mr-2">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Security Measures */}
        <div className="mt-6 sm:mt-8 relative z-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-500 pl-3">
            Security Measures
          </h2>
          <p className="mt-2 text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed">
            We take necessary security measures to protect user data but cannot guarantee absolute security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
