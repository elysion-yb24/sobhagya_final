export default function ShippingPolicy() {
    return (
      <div className="flex justify-center px-4 sm:px-6 lg:px-8 py-6 bg-gray-100 min-h-screen">
        <div className="relative bg-white shadow-lg rounded-lg p-6 sm:p-8 max-w-4xl w-full overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/sobhagya-logo.png')",
              opacity: 0.05,
              zIndex: -1,
            }}
          ></div>
  
          {/* Content */}
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-[#745802] underline">
              Shipping Policy
            </h1>
            <p className="text-sm sm:text-base mb-4 leading-relaxed">
              At Sobhagya, your trust in us is paramount, and we're committed to delivering your treasures with the utmost care and reliability. Here's everything you need to know about our shipping process to ensure a smooth and secure experience:
            </p>
  
            {/* Dynamic Sections */}
            {sections.map(({ title, content }, index) => (
              <div key={index} className="mb-6">
                <h2 className="text-lg sm:text-xl font-semibold text-orange-700">{title}</h2>
                {Array.isArray(content) ? (
                  <ul className="list-disc pl-5 mt-2 text-sm sm:text-base">
                    {content.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm sm:text-base">{content}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
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
  