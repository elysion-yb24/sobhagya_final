import React from "react";

const RefundPolicy = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl p-6 sm:p-8 md:p-10 text-gray-800 mt-5 mb-5 relative">
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

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 text-[#745802] underline">
          Return & Refund Policy
        </h1>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-orange-700">
            Return & Replacement Policy
          </h2>
          <p className="text-sm sm:text-base">
            At <span className="font-semibold">Sobhagya</span>, we take pride in
            offering handcrafted natural gemstones and jewelry. Due to the
            nature of our products, please review our return/exchange policy
            before making a request.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-orange-700">
            Return & Exchange Policy
          </h2>
          <p className="text-sm sm:text-base">
            Return, refund, or exchange requests will be evaluated based on the
            conditions below:
          </p>
          <div className="mt-3 sm:mt-4 space-y-3">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-orange-700">
                Eligibility
              </h3>
              <p className="text-sm sm:text-base">
                Returns or exchanges are only accepted for orders damaged during
                transit or if an incorrect product was received. Videographic
                proof is required.
              </p>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-medium text-orange-700">
                Timeframe
              </h3>
              <p className="text-sm sm:text-base">
                Requests must be made within{" "}
                <span className="font-semibold">7 days</span> of receiving the
                product. The item must be returned in its original condition.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-orange-700">
            Non-Returnable Categories
          </h2>
          <ul className="list-disc pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base">
            <li>Custom Jewelry</li>
            <li>Beads Bracelets</li>
            <li>Rudraksha</li>
            <li>Crystal Trees</li>
            <li>Rakhi Products</li>
            <li>Gift Cards</li>
          </ul>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-orange-700">
            Refund Process
          </h2>
          <p className="text-sm sm:text-base">
            If approved, refunds will be credited within{" "}
            <span className="font-semibold">10-12 working days</span> (subject
            to bank processing times). COD refunds above INR 2,00,000 may
            require additional details.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-orange-700">
            Cancellation Policy
          </h2>
          <p className="text-sm sm:text-base">
            Once an order is placed, cancellations are{" "}
            <span className="font-semibold">not permitted</span> under any
            circumstances.
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-orange-700">
            Late or Missing Refunds
          </h2>
          <p className="text-sm sm:text-base">
            If you haven't received your refund, check with your bank or credit
            card provider. For further assistance, contact us at{" "}
            <a href="mailto:support@sobhagya.in" className="text-blue-600">
              support@sobhagya.in
            </a>
            .
          </p>
        </section>

        <section className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-orange-700">
            Sale Items
          </h2>
          <p className="text-sm sm:text-base">
            All sale or discounted items are final and{" "}
            <span className="font-semibold">not eligible</span> for return,
            exchange, or refund.
          </p>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-3 text-orange-700">
            Refund Policy for International Orders
          </h2>
          <p className="text-sm sm:text-base">
            Refunds for international orders will be processed within{" "}
            <span className="font-semibold">40-45 days</span> in case of a
            delivery issue.
          </p>
          <p className="mt-4">
            For further queries, contact us at{" "}
            <a href="mailto:support@sobhagya.in" className="text-blue-600">
              support@sobhagya.in
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
};

export default RefundPolicy;
