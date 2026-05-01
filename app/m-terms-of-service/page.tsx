import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service - Sobhagya',
  description: 'Terms and Conditions for Sobhagya astrology services.',
};

export default function MTermsOfService() {
  return (
    <div className="min-h-screen bg-white" style={{ userSelect: 'text' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200" style={{ userSelect: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-[#556B2F]"></span>
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
        <div className="bg-white" style={{ userSelect: 'text' }}>
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Terms &amp; Conditions
            </h1>
            <p className="text-gray-600">
              Last updated: 20th September, 2023
            </p>
          </div>

          {/* Terms Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-gray-700 leading-relaxed select-text">

              <div className="select-text">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 select-text">1. TERMS AND CONDITIONS OF USAGE</h2>
                <p className="select-text">
                  These terms and conditions of Use (hereinafter referred as &quot;Terms of Usage&quot;) describe and govern the User&apos;s use of the content and services offered by Elysion Softwares Private Limited through www.sobhagya.in (hereinafter referred as &quot;We&quot; &quot;Sobhagya&quot; &quot;us&quot; &quot;our&quot; &quot;sobhagya application&quot; &quot;Website&quot;).
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. UPDATION</h2>
                <p>
                  The Website may update/amend/modify these Terms of Usage from time to time. The User is responsible to check the Terms of Usage periodically to remain in compliance with these terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. USER CONSENT</h2>
                <p>
                  By accessing the Website and using it, you (&quot;Member&quot;, &quot;You&quot;, &quot;Your&quot;) indicate that you understand the terms and unconditionally &amp; expressly consent to the Terms of Usage of this Website.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. GENERAL DESCRIPTION</h2>
                <p>
                  The Website is an internet-based portal providing astrological content, reports, data, telephone, video and email consultations (hereinafter referred as &quot;Content&quot;). The Website is offering &quot;Free Services&quot; and &quot;Paid Services&quot; (Collectively referred as &quot;Services&quot;).
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. REGISTRATION AND ELIGIBILITY</h2>
                <p>
                  By using this website, you agree that you are over the age of 18 years and are allowed to enter into a legally binding and enforceable contract under Indian Contract Act, 1872.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. FEATURE &quot;CALL WITH ASTROLOGER&quot;</h2>
                <p>
                  The Website is providing certain service which is available through the medium of telecommunication with the Astrologer listed and enrolled with the Website. By agreeing to the present Terms of Usage, you are also giving your unconditional consent to the Website to arrange a call with you on your mobile number.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. DELIVERY, CANCELLATION AND REFUND</h2>
                <p>
                  No refund shall be processed on the order of any reports under any circumstances if the order has reached the &quot;processing&quot; (Assigned to an Astrologer) stage.
                </p>
                <p>
                  <strong>Note:</strong> All refunds will be credited to user&apos;s Sobhagya wallet.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">14. DISCLAIMER / LIMITATION OF LIABILITY</h2>
                <p>
                  <strong>Important:</strong> The website is not a suicide helpline platform. If you are considering or contemplating suicide or feel that you are a danger to yourself or to others, please notify appropriate police or emergency medical personnel.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <p>
                  If you have any questions about these Terms and Conditions, please contact us at: <strong>info@sobhagya.in</strong>
                </p>
              </div>

            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              If you have any questions about these Terms and Conditions, please contact us at{' '}
              <a href="mailto:info@sobhagya.in" className="text-[#F7971E] hover:text-[#E68A19]">
                info@sobhagya.in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
