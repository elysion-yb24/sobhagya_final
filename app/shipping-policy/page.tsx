'use client'

export default function ShippingPolicy() {
    return (
      <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white/80 py-0">
        <div className="relative max-w-5xl mx-auto p-6 sm:p-10 bg-white/90 shadow-2xl rounded-3xl border-t-8 border-orange-200 animate-fade-in-up mt-10 mb-10 z-30 backdrop-blur-md">
          {/* Faded Monk Logo */}
          <div className="absolute inset-0 flex justify-center items-center opacity-10 z-0 pointer-events-none select-none">
            <div style={{width: '320px', height: '320px', background: "url('/monk logo.png') center/contain no-repeat"}} />
          </div>
          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#745802] text-center mb-6 tracking-tight">
              Shipping Policy
              <span className="block w-24 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></span>
            </h1>
            <p className="text-lg md:text-xl mb-6 leading-relaxed font-normal text-gray-700">
              At Sobhagya, your trust in us is paramount, and we're committed to delivering your treasures with the utmost care and reliability. Here's everything you need to know about our shipping process to ensure a smooth and secure experience:
            </p>
            {/* Dynamic Sections */}
            {sections.map(({ title, content }, index) => (
              <div key={index} className="mb-10">
                <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">{title}</h2>
                {Array.isArray(content) ? (
                  <ul className="mt-3 space-y-3 text-gray-700 text-lg md:text-xl">
                    {content.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-orange-50 rounded-xl px-4 py-2 shadow-sm font-medium text-gray-800">
                        <span className="text-orange-500 text-lg">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-lg md:text-xl font-normal text-gray-700 leading-relaxed">{content}</p>
                )}
              </div>
            ))}
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
  }
  
  const sections = [
    {
      title: "Safe & Secure Delivery Packaging",
      content: [
        "Every order is carefully packaged to ensure safe delivery.",
        "Orders are fully insured during transit.",
        "We use trusted couriers like Shiprocket, Bluedart, and Aftership.",
      ],
    },
    {
      title: "Shipping Timeline",
      content: [
        "Orders are processed within 4 business days.",
        "Delivery takes 7-10 days for domestic orders, longer for international shipments.",
      ],
    },
    {
      title: "Order Tracking",
      content: "Once your order is shipped, you'll receive tracking details via email.",
    },
    {
      title: "Delivery Timelines",
      content: [
        "Metro Cities in India: 2-3 days from dispatch.",
        "Other regions: 3-7 days.",
        "International: 30-35 days.",
      ],
    },
    {
      title: "Shipping Costs",
      content: "Shipping charges depend on destination and weight. Free shipping may be available for certain orders.",
    },
    {
      title: "Delivery Location",
      content: "Ensure accurate address details for smooth delivery. Address changes should be communicated promptly.",
    },
    {
      title: "What to Expect at Delivery",
      content: [
        "ID verification may be required for high-value orders.",
        "Courier partners attempt delivery three times before returning the package.",
      ],
    },
    {
      title: "Handling Delays",
      content: "Delays due to unforeseen circumstances (e.g., natural disasters) may occur. Updates will be provided.",
    },
    {
      title: "Non-Delivery & Returns",
      content: "For delivery issues, contact support within 30 days of purchase. Damaged or missing items should be reported immediately.",
    },
    {
      title: "Cancellation Policy",
      content: "Once an order is placed, cancellations are not permitted.",
    },
    {
      title: "Our Commitment to You",
      content: "We strive to make your shopping experience seamless. For any queries, contact our support team.",
    },
  ];
  