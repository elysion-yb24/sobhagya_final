import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Sobhagya",
  description: "Privacy Policy for Sobhagya astrology services.",
};

export default function MPrivacyPolicy() {
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
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-lg">
              Last Updated: July 7, 2026
            </p>
          </div>

          {/* Privacy Policy Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-gray-700 leading-relaxed select-text">

              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Introduction
                </h2>

                <p className="mb-4">
                  Sobhagya ("we", "our", "us"), operated by Elysion Softwares
                  Private Limited, is committed to protecting the privacy of
                  everyone who uses our website and mobile applications
                  ("Services"). This Privacy Policy explains how we collect,
                  use, store, and protect your information when you use our
                  astrological consultation services.
                </p>

                <p className="mb-4">
                  By accessing or using our Services, you agree to the
                  collection and use of information in accordance with this
                  Privacy Policy.
                </p>

                <p>
                  This Privacy Policy is published in accordance with applicable
                  Indian laws, including the Information Technology Act, 2000
                  and related rules governing the collection, storage, and
                  processing of personal information.
                </p>
              </section>

              {/* User Consent */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  User Consent
                </h2>

                <p className="mb-4">
                  By using our Services, you acknowledge that you have read,
                  understood, and agreed to this Privacy Policy.
                </p>

                <p className="mb-4">
                  Your continued use of the Services constitutes your consent to
                  the collection, use, storage, processing, and disclosure of
                  your information as described in this Privacy Policy.
                </p>

                <p>
                  This Privacy Policy should be read together with our Terms of
                  Use and any other policies published on our website or mobile
                  application.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Information We Collect
                </h2>

                <p className="mb-4">
                  To provide our astrological consultation services, we may
                  collect the following information:
                </p>

                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>
                    Mobile phone number (required for OTP verification and
                    account security)
                  </li>
                  <li>First name and last name (optional)</li>
                  <li>Date of birth (optional)</li>
                  <li>
                    Birth details such as date, time, and place of birth
                    (optional, provided only when you request astrology
                    services)
                  </li>
                  <li>Chat messages and consultation history</li>
                  <li>
                    Voice messages that you choose to send during consultations
                  </li>
                  <li>
                    Device information, app usage information, and diagnostic
                    data to improve the Services
                  </li>
                </ul>

                <p>
                  Providing birth details is completely optional. However,
                  these details may be necessary for generating personalized
                  astrological consultations or horoscope analyses.
                </p>
              </section>

              {/* How We Use Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  How We Use Your Information
                </h2>

                <p className="mb-4">
                  We use your information to:
                </p>

                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Create and manage your account</li>
                  <li>Verify your identity using OTP</li>
                  <li>
                    Provide astrological consultations and horoscope-related
                    services
                  </li>
                  <li>
                    Enable communication between users and astrologers
                  </li>
                  <li>Respond to customer support requests</li>
                  <li>Improve our Services and user experience</li>
                  <li>Detect fraud, abuse, and security issues</li>
                  <li>Comply with applicable legal obligations</li>
                </ul>

                <p>
                  We do not sell or rent your personal information to third
                  parties.
                </p>
              </section>

              {/* Voice Recording */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Voice Recording and Microphone Permission
                </h2>

                <p className="mb-4">
                  Our application allows you to communicate with astrologers by
                  sending voice messages during chat.
                </p>

                <p className="mb-4">
                  To use this feature, the app requests access to your device's
                  microphone. Microphone access is used solely to record audio
                  messages that you intentionally choose to send.
                </p>

                <p className="mb-4">
                  Voice recordings are processed only for delivering the
                  requested consultation services and are not recorded or
                  accessed without your action.
                </p>

                <p>
                  You may deny microphone permission at any time through your
                  device settings. In that case, you can continue using text
                  chat features where available.
                </p>
              </section>

              {/* Data Sharing */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Data Sharing
                </h2>

                <p className="mb-4">
                  We may share your information only in the following
                  circumstances:
                </p>

                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>
                    With astrologers for the purpose of providing consultation
                    services requested by you.
                  </li>
                  <li>
                    With trusted service providers who help us operate our
                    platform, subject to confidentiality obligations.
                  </li>
                  <li>
                    When required by applicable law, legal process, or
                    government authorities.
                  </li>
                  <li>
                    To protect the safety, rights, or property of our users,
                    company, or the public.
                  </li>
                </ul>

                <p>
                  We do not sell your personal information to advertisers or
                  third parties.
                </p>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Data Retention
                </h2>

                <p className="mb-4">
                  We retain your information only for as long as necessary to:
                </p>

                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide our Services</li>
                  <li>Maintain consultation history</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes</li>
                  <li>Enforce our agreements</li>
                </ul>

                <p className="mt-4">
                  When information is no longer required, we securely delete or
                  anonymize it.
                </p>
              </section>

              {/* Account Deletion */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Account Deletion
                </h2>

                <p className="mb-4">
                  You may delete your account at any time.
                </p>

                <p className="mb-4">
                  To delete your account:
                </p>

                <ol className="list-decimal pl-6 space-y-2 mb-4">
                  <li>Open the Sobhagya app.</li>
                  <li>Navigate to Settings or the Side Menu.</li>
                  <li>Select <strong>Delete Account</strong>.</li>
                  <li>
                    Follow the on-screen instructions to permanently delete your
                    account.
                  </li>
                </ol>

                <p>
                  Upon successful deletion, your personal information will be
                  removed or anonymized unless retention is required by
                  applicable law.
                </p>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Data Security
                </h2>

                <p className="mb-4">
                  We implement appropriate technical and organizational
                  security measures to protect your information from
                  unauthorized access, alteration, disclosure, or destruction.
                </p>

                <p>
                  Although we strive to protect your personal information using
                  industry-standard security practices, no method of electronic
                  transmission or storage is completely secure.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Children's Privacy
                </h2>

                <p className="mb-4">
                  Our Services are not intended for children under the age of
                  18. We do not knowingly collect personal information from
                  children.
                </p>

                <p>
                  If we become aware that a child has provided personal
                  information without appropriate consent, we will promptly
                  delete such information.
                </p>
              </section>

              {/* Disclaimer */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Disclaimer
                </h2>

                <p className="mb-4">
                  Sobhagya provides astrological consultation services for
                  personal guidance and informational purposes only.
                </p>

                <p className="mb-4">
                  Astrological consultations represent the personal opinions and
                  interpretations of individual astrologers. We do not
                  guarantee the accuracy, completeness, or outcome of any
                  prediction, recommendation, or consultation.
                </p>

                <p className="mb-4">
                  Our Services should not be considered a substitute for
                  professional medical, legal, financial, or psychological
                  advice.
                </p>

                <p>
                  If you are experiencing a medical or mental health emergency,
                  including thoughts of self-harm or suicide, please immediately
                  contact qualified healthcare professionals or emergency
                  services in your area instead of relying on our Services.
                </p>
              </section>

              {/* Changes */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Changes to This Privacy Policy
                </h2>

                <p className="mb-4">
                  We may update this Privacy Policy from time to time.
                </p>

                <p>
                  Any changes will become effective upon posting the updated
                  Privacy Policy within the application or on our website.
                  Continued use of the Services after such updates constitutes
                  acceptance of the revised Privacy Policy.
                </p>
              </section>

              {/* Contact */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Contact Us
                </h2>

                <p>
                  If you have any questions, concerns, or requests regarding
                  this Privacy Policy, please contact us at{" "}
                  <a
                    href="mailto:info@sobhagya.in"
                    className="text-[#F7971D] hover:text-orange-600 underline"
                  >
                    info@sobhagya.in
                  </a>
                  .
                </p>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">
              If you have any questions about this Privacy Policy, please
              contact us at{" "}
              <a
                href="mailto:info@sobhagya.in"
                className="text-[#F7971D] hover:text-orange-600 underline font-medium"
              >
                info@sobhagya.in
              </a>
            </p>

            <p className="text-sm text-gray-500">
              We're here to assist you! - The Sobhagya Team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
