import React from 'react';
import Link from 'next/link';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white" style={{ userSelect: 'text' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200" style={{ userSelect: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#745802]">SOBHAGYA</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white" style={{ userSelect: 'text' }}>
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Refund Policy
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: December 2024
            </p>
          </div>

          {/* Refund Policy Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-gray-700 leading-relaxed select-text">

              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Return & Replacement Policy</h2>
                <p className="mb-4">
                  At Sobhagya, we take pride in offering handcrafted natural gemstones and jewelry, making each piece truly unique. However, due to the nature of the products, we implore you to kindly refer to the below-mentioned policy before requesting a return/exchange and/or refund.
                </p>
              </section>

              {/* Return & Exchange Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Return & Exchange Policy</h2>
                <p className="mb-4">
                  While we want to ensure you are satisfied with your purchase, we cannot guarantee that each request for return/refund and/or exchange will be accepted by us. We reserve the right to refuse and/or deny any such request if it is not aligned with the below-mentioned conditions.
                </p>
                <p className="mb-4">
                  <strong>Eligibility:</strong> Returns or exchanges are only accepted if your order is damaged during transit or if you received an incorrect product. Note - The Customer acknowledges and agrees that, due to the nature of the products, the Company requires videographic proof to process any return or exchange request.
                </p>
                <p className="mb-4">
                  <strong>Timeframe:</strong> Requests for a refund or exchange must be made within seven (07) days of receiving your product. The item must be returned in its original condition with its original certification and packaging intact.
                </p>
              </section>

              {/* Categories Not Eligible */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Categories Not Eligible for Return</h2>
                <p className="mb-4">
                  Please note that returns are not possible for the following categories unless the product is damaged:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Customised Jewelry</li>
                  <li>Beads Bracelets</li>
                  <li>Rudraksha</li>
                  <li>Crystal Trees</li>
                  <li>Rakhi Products</li>
                  <li>Gift Cards</li>
                </ul>
                <p className="mb-4">
                  Due to the intrinsic nature of these products and the likelihood of them being exchanged with fake/low-quality counter products, we cannot accept return requests for such items.
                </p>
              </section>

              {/* Refund Process */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Process</h2>
                <p className="mb-4">
                  If your return request is approved, your refund will be processed and credited to your original payment method within <strong>10-12 working days</strong>, subject to bank processes and public holidays.
                </p>
                <p className="mb-4">
                  Once your return is received and inspected by our team, we will send you an email notification acknowledging receipt and informing you of the approval or rejection of your refund.
                </p>
                <p className="mb-4">
                  Refunds will only be issued to the payment method and/or original account initially used for the transaction.
                </p>
              </section>

              {/* Exclusions */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Exclusions for Returns or Exchanges</h2>
                <p className="mb-4">
                  The Company shall not accept returns or exchanges for the following reasons:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Change of Mind</li>
                  <li>Minor Flaws or Packaging Issues</li>
                  <li>Slight Color or Size Variations</li>
                </ul>
              </section>

              {/* Cancellation Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cancellation Policy</h2>
                <p className="mb-4">
                  Once an order is placed, cancellations are not permitted under any circumstances. Please review your order carefully before confirming.
                </p>
              </section>

              {/* International Orders */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. International Orders (Outside India)</h2>
                <p className="mb-4">
                  In the event of an issue with the delivery of an international order, we will process a refund to the original payment method within <strong>40 to 45 days</strong>.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
                <p className="mb-4">
                  For any further queries or assistance with returns and refunds, please don't hesitate to contact our customer support team at <a href="mailto:support@sobhagya.com" className="text-[#F7971D] hover:text-orange-600 underline">support@sobhagya.com</a>.
                </p>
              </section>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}