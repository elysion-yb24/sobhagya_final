import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms and Conditions - Sobhagya',
  description: 'Read our terms and conditions for using Sobhagya astrology services.',
};

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
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
        <div className="bg-white">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              TERMS AND CONDITIONS OF USAGE
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: 20th September, 2023
            </p>
          </div>

          {/* Terms Content - Formatted Content */}
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-gray-700 leading-relaxed">

              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. TERMS AND CONDITIONS OF USAGE</h2>
                <p className="mb-4">
                  These terms and conditions of Use (hereinafter referred as "Terms of Usage") describe and govern the User's use of the content and services offered by Elysion Softwares Private Limited through www.sobhagya.in (hereinafter referred as "We" "Sobhagya" "us" "our" "sobhagya application" "Website").
                </p>
              </section>

              {/* Updation */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. UPDATION</h2>
                <p>
                  The Website may update/amend/modify these Terms of Usage from time to time. The User is responsible to check the Terms of Usage periodically to remain in compliance with these terms.
                </p>
              </section>

              {/* User Consent */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. USER CONSENT</h2>
                <p className="mb-4">
                  By accessing the Website and using it, you ("Member", "You", "Your") indicate that you understand the terms and unconditionally & expressly consent to the Terms of Usage of this Website. If you do not agree with the Terms of Usage, please do not click on the "I AGREE" button.
                </p>
                <p className="mb-4">
                  The User is advised to read the Terms of Usage carefully before using or registering on the Application or accessing any material, information or services through the Application. Your use and continued usage of the Application (irrespective of the amendments made from time to time) shall signify your acceptance of the terms of usage and your agreement to be legally bound by the same.
                </p>
              </section>

              {/* General Description */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. GENERAL DESCRIPTION</h2>
                <p className="mb-4">
                  The Website is an internet-based portal having its existence on World Wide Web, Application and other electronic medium and provides astrological content, reports, data, telephone, video and email consultations (hereinafter referred as "Content"). The Website is offering "Free Services" and "Paid Services" (Collectively referred as "Services").
                </p>
                <p className="mb-4">
                  Free Services are easily accessible without becoming a member however for accessing the personalised astrological services and/or receive additional Content and get access to Paid Services, You are required to register as a member on the portal. By registering for Paid Services, a Member agrees to:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>To provide current, complete, and accurate information about himself as prompted to do so by the Website.</li>
                  <li>To maintain and update the above information as required and submitted by you with the view to maintain the accuracy of the information being current and complete.</li>
                </ul>
              </section>

              {/* Registration and Eligibility */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. REGISTRATION AND ELIGIBILITY</h2>
                <p className="mb-4">
                  By using this website, you agree that you are over the age of 18 years and are allowed to enter into a legally binding and enforceable contract under Indian Contract Act, 1872. The Website would not be held responsible for any misuse that may occur by virtue of any person including a minor using the services provided through the Website.
                </p>
                <p className="mb-4">
                  For the User to avail the services, the User will be directed to Register as a Member on the Website whereby You (User) agree to provide update, current and accurate information while filling up the sign-in form. All information that you fill and provide to the Website and all updates thereto are referred to in these Terms of Usage as "Registration Data".
                </p>
                <p className="mb-4">
                  An account could be created by you through the Application ID (Your Phone Number) and password (OTP) or other log - in ID and password which can include a facebook, gmail or any other valid email ID.
                </p>
                <p className="mb-4">
                  The Website does not permit the use of the Services by any User under the following conditions:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>If the User is a resident of any jurisdiction that may prohibit the use of the Services rendered by the Website.</li>
                  <li>If the User is a resident of any State/Country that prohibits by way of law, regulation, treaty or administrative act for entering into trade relations.</li>
                  <li>Due to any religious practices.</li>
                  <li>If the User has created multiple accounts using various mobile numbers. The User may not have more than one active account with the Website.</li>
                </ul>
              </section>

              {/* Call with Astrologer */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. FEATURE "CALL WITH ASTROLOGER"</h2>
                <p>
                  The Website is providing certain service which is available through the medium of telecommunication with the Astrologer listed and enrolled with the Website. By agreeing to the present Terms of Usage, you are also giving your unconditional consent to the Website to arrange a call with you on your mobile number even though your number is on DND service provided by your mobile service provider.
                </p>
              </section>

              {/* Website Content */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. WEBSITE CONTENT</h2>
                <p className="mb-4">
                  The Website and any individual Websites which may be available through external hyperlinks with the Website are private property.
                </p>
                <p className="mb-4">
                  All interaction on this Website inclusive of the guidance and advice received directly from the Licensed Provider must comply with these Terms of Usage.
                </p>
                <p className="mb-4">
                  The User shall not post or transmit through this Website any material which violates or infringes in any way upon the rights of others, or any material which is unlawful, abusive, defamatory, invasive of privacy, vulgar, obscene, profane or otherwise objectionable, which encourages conduct that would constitute a criminal offence, give rise to civil liability or otherwise violate any law.
                </p>
              </section>

              {/* User Account Access */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. USER ACCOUNT ACCESS</h2>
                <p>
                  The Website shall have access to the account and the information created by the User for ensuring and maintaining the high-quality services provided by the Website and for addressing the need of the customer in the most effective manner.
                </p>
              </section>

              {/* Privacy Policy */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. PRIVACY POLICY</h2>
                <p>
                  The User hereby consents, expresses and agrees that the User has read and fully understand the Privacy Policy of the Website. The User further consents that the terms and contents of such Privacy policy is acceptable to the User inclusive of any update/alteration/change made and duly displayed on the Website.
                </p>
              </section>

              {/* Breach and Termination */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. BREACH AND TERMINATION</h2>
                <p className="mb-4">
                  The Website may, in whole or in part, without informing the User, modify, discontinue, change or alter the services ordered or the Account of the User registered with the Website.
                </p>
                <p className="mb-4">
                  Violation of any conditions mentioned in this Terms of Usage shall lead to immediate cancellation of the Registration of the User, if registered with the Website.
                </p>
              </section>

              {/* Delivery, Cancellation and Refund */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. DELIVERY, CANCELLATION AND REFUND</h2>
                <p className="mb-4">
                  No refund shall be processed on the order of any reports under any circumstances if the order has reached the "processing" (Assigned to an Astrologer) stage.
                </p>
                <p className="mb-4">
                  No refund shall be processed once the Order has been placed and executed. However, if the User intends to cancel a successfully placed order before execution, the User is required to contact the customer care team within 1 (one) hour of making the payment.
                </p>
                <p className="mb-4">
                  <strong>Note:</strong> All refunds will be credited to user's Sobhagya wallet.
                </p>
                <p className="mb-4">
                  Refunds will only be considered in the following cases:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Network issue due to which chat/call was affected in between or there was a weak signal, background noise, inaudible consultant etc during the video/normal call sessions</li>
                  <li>Consultant is unable to respond fluently in the language mentioned in their profile</li>
                  <li>Consultant is taking inordinately long enough to respond back to the user</li>
                  <li>Consultant has responded back in irrelevant or inappropriate response to the query asked by the user</li>
                </ul>
                <p className="mb-4">
                  <strong>Please Note:</strong> No refund will be given in case of lack of accuracy of any consultation. Sobhagya takes no responsibility for factual accuracy on any consultations.
                </p>
              </section>

              {/* User Obligation */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. USER OBLIGATION</h2>
                <p className="mb-4">
                  The User (inclusive of the astrologer and the Member Customer) under an obligation not to violate the privacy policy, terms and conditions and any other terms as defined on the Website.
                </p>
                <p className="mb-4">
                  The User shall while using the Website and engaged in any form of communication on any of the forums inclusive of the products listed on the Website shall not violate the terms and conditions which are inclusive of:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>The User shall not Post, publish or transmit any messages that is false, misleading, defamatory, harmful, threatening, abusive, harassing, defamatory, invades another's privacy, offensive, promotes racism, hatred or harm against any individual or group or religion or caste, infringes another's rights including any intellectual property rights or copyright or trademark, violates or encourages any conduct that would violate any applicable law or regulation or would give rise to civil liability.</li>
                  <li>The User shall not upload or post or otherwise make available any content that User do not have a right to make available, under any law or under contractual or fiduciary relationships.</li>
                  <li>The User shall not upload or post or otherwise make available any content that infringes any patent, trademark, trade secret, copyright or other proprietary rights of any party.</li>
                  <li>The User shall not collect screen names and email addresses of members who are registered on the Website for purposes of advertisement, solicitation or spam.</li>
                  <li>The User shall not send unsolicited email, junk mail, spam, or chain letters, or promotions or advertisements for products or services.</li>
                  <li>The User shall not upload or distribute files that contain viruses, corrupted files, or any other similar software or programs that may damage the operation of the Website or another's computer.</li>
                  <li>The User shall not engage in any activity that interferes with or disrupts access to the Website</li>
                  <li>The User shall not attempt to gain unauthorized access to any portion or feature of the Website, any other systems or networks connected to the Website, to any of the services offered on or through the Website, by hacking, password mining or any other illegitimate means.</li>
                  <li>The User shall not violate any applicable laws or regulations for the time being in force within or outside India.</li>
                  <li>The User shall not resell or make any commercial use of the Services without the express written consent from the Website.</li>
                  <li>The User shall not violate these Terms of Usage including but not limited to any applicable Additional terms of the Website contained herein or elsewhere.</li>
                  <li>The User shall not Reverse engineer, modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information or software obtained from the Website.</li>
                </ul>
              </section>

              {/* Bank Account Information */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. BANK ACCOUNT INFORMATION</h2>
                <p className="mb-4">
                  The User is under an obligation to provide his banking information as and when required. For that purpose, the obligation of the User are:
                </p>
                <p className="mb-4">
                  The User agrees that the debit/credit card details provided by him/ her for use of the aforesaid Service(s) must be correct and accurate and that the User shall not use a debit/ credit card, that is not lawfully owned by him/ her or the use of which is not authorized by the lawful owner thereof.
                </p>
              </section>

              {/* Disclaimer */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. DISCLAIMER / LIMITATION OF LIABILITY / WARRANTY</h2>
                <p className="mb-4">
                  The User expressly understands and agree that, to the maximum extent permitted by applicable law, the Website does not provide warranties for the service. Astrological counselling provided through the Website is based on cumulative or individual knowledge, experience and interpretations of astrologers and as such, it may vary from one astrologer to another.
                </p>
                <p className="mb-4">
                  The Website, services and other materials are provided by the Website on an "as is" basis without warranty of any kind, express, implied, statutory or otherwise, including the implied warranties of title, non-infringement, merchantability or fitness for a particular purpose.
                </p>
                <p className="mb-4">
                  The Services provided by the Website are for entertainment purposes only and the Website on behalf of itself and its suppliers, disclaims all warranties of any kind, express or implied.
                </p>
                <p className="mb-4">
                  <strong>Important:</strong> The website is not a suicide helpline platform. If you are considering or contemplating suicide or feel that you are a danger to yourself or to others, you may discontinue use of the services immediately at your discretion and please notify appropriate police or emergency medical personnel. If you are thinking about suicide, immediately call a suicide prevention helpline such as AASRA (91-22-27546669).
                </p>
              </section>

              {/* Indemnification */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. INDEMNIFICATION</h2>
                <p>
                  The User shall indemnify, defend and hold harmless the Website and its parent, subsidiaries, affiliates, officers, directors, employees, suppliers, consultants and agents from any and all third party claims, liability, damages and/or costs (including, but not limited to, attorney's fees) arising from Your use of the Services, Your violation of the Privacy Policy or these Terms of Service, or Your violation of any third party's rights, including without limitation, infringement by You or any other user of Your account of any intellectual property or other right of any person or entity.
                </p>
              </section>

              {/* Proprietary Rights */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">16. PROPRIETARY RIGHTS TO CONTENT</h2>
                <p className="mb-4">
                  The User acknowledges that the Content, including but not limited to text, software, music, sound, photographs, video, graphics or other material contained in sponsor advertisements or distributed via email, commercially produced information presented to Member by the Website, its suppliers, and/or advertisers, is protected by copyrights, trademarks, service marks, patents and/or other proprietary rights and laws.
                </p>
                <p>
                  The User is not permitted to copy, use, reproduce, distribute, perform, display, or create derivative works from the Content unless expressly authorized by the Website, its suppliers, or advertisers.
                </p>
              </section>

              {/* Notices */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">17. NOTICES</h2>
                <p className="mb-4">
                  Except as otherwise stated in these Terms of Service, all notices to a party shall be in writing and shall be made either via email or snail mail. Notice shall be deemed given 24 hours after an email is sent, or 3 days after deposit in the snail mail, to Member at the address provided by Member in the Registration Data and to the Website at the address set forth below:
                </p>
                <p className="font-medium">
                  "F-10/9, Mandir Marg, Block-F, Opp.- Lovely Public School, Krishna Nagar Delhi East Delhi DL 110051 IN."
                </p>
              </section>

              {/* Restricted Content */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">18. RESTRICTED CONTENT</h2>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Child Endangerment</h3>
                <p className="mb-4">
                  Our App prohibits users from creating, uploading, or distributing content that facilitates the exploitation or abuse of children will be subject to immediate deletion of the account. This includes all child sexual abuse materials.
                </p>
                <p className="mb-4">
                  We prohibit the use of Sobhagya app to endanger children. This includes but is not limited to use of apps to promote predatory behaviour towards children, such as:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li>Inappropriate interaction targeted at a child (for example, groping or caressing).</li>
                  <li>Child grooming (for example, befriending a child online to facilitate, either online or offline, sexual contact and/or exchanging sexual imagery with that child).</li>
                  <li>Sexualization of a minor (for example, imagery that depicts, encourages or promotes the sexual abuse of children or the portrayal of children in a manner that could result in the sexual exploitation of children).</li>
                  <li>Sextortion (for example, threatening or blackmailing a child by using real or alleged access to a child's intimate images).</li>
                  <li>Trafficking of a child (for example, advertising or solicitation of a child for commercial sexual exploitation).</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Inappropriate Content</h3>
                <p className="mb-4">
                  To ensure that Our App remains a safe and respectful platform, we've created standards defining and prohibiting content that is harmful or inappropriate for our users.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Sexual Content and Profanity</h3>
                <p className="mb-4">
                  We don't allow accounts that contain or promote sexual content or profanity, including pornography, or any content or services intended to be sexually gratifying.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Hate Speech</h3>
                <p className="mb-4">
                  We don't allow users that promote violence, or incite hatred against individuals or groups based on race or ethnic origin, religion, disability, age, nationality, veteran status, sexual orientation, gender, gender identity, caste, immigration status, or any other characteristic that is associated with systemic discrimination or marginalization.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Violence</h3>
                <p className="mb-4">
                  We don't allow apps that depict or facilitate gratuitous violence or other dangerous activities.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Terrorist Content</h3>
                <p className="mb-4">
                  We do not permit terrorist organizations to publish content for any purpose, including recruitment.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Dangerous Organizations and Movements</h3>
                <p className="mb-4">
                  We do not permit movements or organizations that have engaged in, prepared for, or claimed responsibility for acts of violence against civilians to publish content for any purpose, including recruitment.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Sensitive Events</h3>
                <p className="mb-4">
                  We don't allow contents that capitalize on or are insensitive toward a sensitive event with significant social, cultural, or political impact, such as civil emergencies, natural disasters, public health emergencies, conflicts, deaths, or other tragic events.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Bullying and Harassment</h3>
                <p className="mb-4">
                  We don't allow content that contain or facilitate threats, harassment, or bullying.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Dangerous Products</h3>
                <p className="mb-4">
                  We don't allow users that facilitate the sale of explosives, firearms, ammunition, or certain firearms accessories.
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mb-3">Black Magic, Witchcraft, Voodoo and Tantrism</h3>
                <p className="mb-4">
                  We as an Organisation, strictly prohibit our users to get into any form of black magic, witchcraft, voodoo and tantrism. In case it comes to our information, that a user is indulged intentionally/unintentionally in any such activity, we hereby reserve the right to delete the account.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">19. GOVERNING LAW AND JURISDICTION</h2>
                <p className="mb-4">
                  Any dispute, claim or controversy arising out of or relating to this Terms of Usage including the determination of the scope or applicability of this Terms of Usage to arbitrate, or your use of the Application or information to which it gives access, shall be determined by arbitration in India, before a sole arbitrator mutually appointed by Members and Website.
                </p>
                <p className="mb-4">
                  Arbitration shall be conducted in accordance with the Arbitration and Conciliation Act, 1996. The seat of such arbitration shall be New Delhi. All proceedings of such arbitration, including, without limitation, any awards, shall be in the English language. The award shall be final and binding on the parties to the dispute.
                </p>
                <p className="mb-4">
                  These Terms of Usage shall be governed by and construed in accordance with the laws of India without giving effect to any choice of law and principles that would require the application of the laws of a different state.
                </p>
                <p>
                  These Terms of Usage constitute the entire agreement between the parties with respect to the subject matter hereof and supersedes and replaces all prior or contemporaneous understandings or agreements, written or oral, regarding such subject matter.
                </p>
              </section>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
