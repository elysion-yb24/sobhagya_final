'use client'

import React from "react";

const RefundPolicy = () => {
  return (
    <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white/80 py-0">
      <div className="relative max-w-5xl mx-auto p-6 sm:p-10 bg-white/90 shadow-2xl rounded-3xl border-t-8 border-orange-200 animate-fade-in-up mt-10 mb-10 z-30 backdrop-blur-md">
        {/* Faded Monk Logo */}
        <div className="absolute inset-0 flex justify-center items-center opacity-10 z-0 pointer-events-none select-none">
          <div style={{width: '320px', height: '320px', background: "url('/monk logo.png') center/contain no-repeat"}} />
        </div>
        <h1 className="relative z-10 text-4xl md:text-5xl font-extrabold text-[#745802] text-center mb-6 tracking-tight">
          Return & Refund Policy
          <span className="block w-24 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></span>
        </h1>
        {/* Sections */}
        <section className="mb-10 mt-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">Return & Replacement Policy</h2>
          <p className="text-lg md:text-xl font-normal text-gray-700 leading-relaxed">At <span className="font-semibold">Sobhagya</span>, we take pride in offering handcrafted natural gemstones and jewelry. Due to the nature of our products, please review our return/exchange policy before making a request.</p>
        </section>
        <section className="mb-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">Return & Exchange Policy</h2>
          <p className="text-lg md:text-xl font-normal text-gray-700 leading-relaxed">Return, refund, or exchange requests will be evaluated based on the conditions below:</p>
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="text-lg font-medium text-orange-700">Eligibility</h3>
              <p className="text-lg md:text-xl font-normal text-gray-700 leading-relaxed">Returns or exchanges are only accepted for orders damaged during transit or if an incorrect product was received. Videographic proof is required.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-orange-700">Timeframe</h3>
              <p className="text-lg md:text-xl font-normal text-gray-700 leading-relaxed">Requests must be made within <span className="font-semibold">7 days</span> of receiving the product. The item must be returned in its original condition.</p>
            </div>
          </div>
        </section>
        <section className="mb-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">Non-Returnable Categories</h2>
          <ul className="mt-3 space-y-3 text-gray-700 text-lg md:text-xl">
            {['Custom Jewelry','Beads Bracelets','Rudraksha','Crystal Trees','Rakhi Products','Gift Cards'].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-orange-50 rounded-xl px-4 py-2 shadow-sm font-medium text-gray-800">
                <span className="text-orange-500 text-lg">•</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="mb-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">Refund Process</h2>
          <p className="text-lg md:text-xl font-normal text-gray-700 leading-relaxed">If approved, refunds will be credited within <span className="font-semibold">10-12 working days</span> (subject to bank processing times). COD refunds above INR 2,00,000 may require additional details.</p>
        </section>
        <section className="mb-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">Cancellation Policy</h2>
          <p className="text-lg md:text-xl font-normal text-gray-700 leading-relaxed">Once an order is placed, cancellations are <span className="font-semibold">not permitted</span> under any circumstances.</p>
        </section>
        <section className="mb-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">Late or Missing Refunds</h2>
          <p className="text-lg md:text-xl font-normal text-gray-700 leading-relaxed">If you haven't received your refund, check with your bank or credit card provider. For further assistance, contact us at <a href="mailto:support@sobhagya.in" className="text-blue-600">support@sobhagya.in</a>.</p>
        </section>
        <section className="mb-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">Sale Items</h2>
          <p className="text-lg md:text-xl font-normal text-gray-700 leading-relaxed">All sale or discounted items are final and <span className="font-semibold">not eligible</span> for return, exchange, or refund.</p>
        </section>
        <section className="mb-10 relative z-10">
          <h2 className="text-xl md:text-2xl font-semibold text-orange-700 border-l-4 border-orange-400 pl-3 mb-2">Refund Policy for International Orders</h2>
          <p className="text-lg md:text-xl font-normal text-gray-700 leading-relaxed">Refunds for international orders will be processed within <span className="font-semibold">40-45 days</span> in case of a delivery issue.</p>
          <p className="mt-4 text-lg md:text-xl font-normal text-gray-700 leading-relaxed">For further queries, contact us at <a href="mailto:support@sobhagya.in" className="text-blue-600">support@sobhagya.in</a>.</p>
        </section>
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

export default RefundPolicy;
