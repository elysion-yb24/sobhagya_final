import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Refund Policy - Sobhagya",
  description: "Refund Policy for Sobhagya astrology services.",
};

export default function MRefundPolicy() {
  return (
    <div className="min-h-screen bg-white" style={{ userSelect: "text" }}>
      {/* Header */}
      <div
        className="bg-white border-b border-gray-200"
        style={{ userSelect: "none" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#745802]">
                SOBHAGYA
              </span>
            </Link>

            <Link
              href="/"
              className="text-[#F7971E] hover:text-[#E68A19] transition-colors duration-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white" style={{ userSelect: "text" }}>
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Refund Policy
            </h1>
            <p className="text-gray-600 text-lg">
              Last Updated: July 7, 2026
            </p>
          </div>

          {/* Refund Policy Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-gray-700 leading-relaxed select-text">

              {/* Overview */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Overview
                </h2>

                <p className="mb-4">
                  Sobhagya, operated by Elysion Softwares Private Limited,
                  provides digital astrological consultation services through
                  its website and mobile application.
                </p>

                <p>
                  As our services are delivered digitally and consultations
                  begin immediately after booking or initiating a session,
                  refunds are governed by the terms below.
                </p>
              </section>

              {/* Consultation Fees */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Consultation Fees
                </h2>

                <p className="mb-4">
                  Payments made for astrology consultations, chat sessions,
                  voice consultations, or any other digital services are
                  generally non-refundable once the consultation has commenced
                  or the service has been delivered.
                </p>

                <p>
                  By purchasing a consultation, you acknowledge that you are
                  paying for the astrologer's time, expertise, and personalized
                  guidance.
                </p>
              </section>

              {/* Eligible Refund Cases */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Eligible Refund Cases
                </h2>

                <p className="mb-4">
                  A refund may be considered in the following situations:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    You were charged multiple times for the same transaction.
                  </li>
                  <li>
                    Payment was successful, but no consultation or service was
                    delivered due to a technical issue on our platform.
                  </li>
                  <li>
                    The consultation could not be initiated due to a verified
                    technical failure attributable to Sobhagya.
                  </li>
                  <li>
                    Any other situation where Sobhagya determines, at its sole
                    discretion, that a refund is appropriate.
                  </li>
                </ul>

                <p className="mt-4">
                  Approved refunds will be processed to the original payment
                  method.
                </p>
              </section>

              {/* Non Refundable Cases */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Non-Refundable Cases
                </h2>

                <p className="mb-4">
                  Refunds will not be provided in the following situations:
                </p>

                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>
                    You are dissatisfied with an astrological prediction,
                    opinion, or guidance.
                  </li>
                  <li>
                    You change your mind after purchasing a consultation.
                  </li>
                  <li>
                    You discontinue or leave a consultation before it is
                    completed.
                  </li>
                  <li>
                    You fail to attend or respond at the scheduled consultation
                    time.
                  </li>
                  <li>
                    Incorrect birth details or other information were provided
                    by you.
                  </li>
                  <li>
                    Delays caused by internet connectivity or issues with your
                    device.
                  </li>
                  <li>
                    Services that have already been fully delivered.
                  </li>
                </ul>

                <p>
                  Astrological consultations are based on the professional
                  interpretation and experience of individual astrologers.
                  Results and outcomes may vary from person to person.
                </p>
              </section>

              {/* Cancellation Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Cancellation Policy
                </h2>

                <p className="mb-4">
                  You may cancel a consultation only if the consultation has not
                  yet started.
                </p>

                <p className="mb-4">
                  If a cancellation is eligible under our cancellation rules,
                  any applicable refund will be processed to the original
                  payment method.
                </p>

                <p>
                  Once a consultation has begun, it cannot be cancelled or
                  refunded.
                </p>
              </section>

              {/* Refund Processing */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Refund Processing
                </h2>

                <p className="mb-4">
                  If your refund request is approved:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Refunds will be credited to the original payment method used
                    for the transaction.
                  </li>
                  <li>
                    Processing typically takes 7–10 business days, depending on
                    your bank or payment provider.
                  </li>
                  <li>
                    Any applicable payment gateway charges or bank processing
                    delays are outside Sobhagya&apos;s control.
                  </li>
                </ul>
              </section>

              {/* Failed or Duplicate Transactions */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  7. Failed or Duplicate Transactions
                </h2>

                <p className="mb-4">
                  If your payment is deducted but the consultation is not booked
                  or the transaction fails:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    The amount may be automatically reversed by your bank or
                    payment provider.
                  </li>
                  <li>
                    If the refund is not received within the expected time,
                    please contact our support team with your transaction
                    details.
                  </li>
                </ul>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  8. Contact Us
                </h2>

                <p>
                  For any questions regarding cancellations or refunds, please
                  contact us at{" "}
                  <a
                    href="mailto:support@sobhagya.com"
                    className="text-[#F7971D] hover:text-orange-600 underline"
                  >
                    support@sobhagya.com
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">
              If you have any questions about this Refund Policy, please contact
              us at{" "}
              <a
                href="mailto:support@sobhagya.com"
                className="text-[#F7971D] hover:text-orange-600 underline font-medium"
              >
                support@sobhagya.com
              </a>
            </p>

            <p className="text-sm text-gray-500">
              We&apos;re here to assist you! - The Sobhagya Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
