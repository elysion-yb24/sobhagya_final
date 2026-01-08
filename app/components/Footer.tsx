import Image from "next/image";
import Link from "next/link";
import { Eagle_Lake, Poppins, EB_Garamond } from "next/font/google";

const eagleLake = Eagle_Lake({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const ebGaramond = EB_Garamond({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });

const Footer: React.FC = () => {
  return (
    <footer
      className={`bg-[#373737] text-white py-6 sm:py-8 lg:py-12 relative overflow-hidden ${poppins.className}`}
    >
      {/* Top Left Zodiac Background Image */}
      <div className="absolute top-[-50px] left-[-150px] w-[300px] h-[200px] sm:w-[400px] sm:h-[300px] opacity-10 pointer-events-none">
        <Image
          src="/zodiac-right.png"
          alt="Zodiac Signs"
          fill
          className="rotate-[-15deg] object-contain"
        />
      </div>

      {/* Bottom Right Zodiac Background Image */}
      <div className="absolute bottom-[-200px] right-[20px] w-[340px] h-[240px] sm:w-[460px] sm:h-[360px] lg:w-[560px] lg:h-[420px] opacity-10 pointer-events-none">
        <Image
          src="/zodiac-right.png"
          alt="Zodiac Signs"
          fill
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-10">
        {/* Title text */}
        <h2 className="text-orange-400 text-center text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 lg:mb-12 underline decoration-orange-400 underline-offset-8 px-2 sm:px-4 leading-loose sm:leading-normal">
          Your Trusted Astrology App for Accurate Predictions & Expert Guidance!
        </h2>

        {/* Main Footer Content - Mobile Optimized Layout */}
        <div className="space-y-8 sm:space-y-0">
          {/* Desktop: Grid Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-16">
            {/* QUICK LINKS Section */}
            <div className="space-y-4">
              <h3 className={`text-[#F7971E] font-bold text-lg sm:text-xl mb-6 ${ebGaramond.className}`}>QUICK LINKS</h3>
              <div className="space-y-3">
                <Link href="/privacy-policy" className="flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 group-hover:text-[#F7971E]">◆</span>
                  <span>Privacy Policy</span>
                </Link>
                <Link href="/refund-policy" className="flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 group-hover:text-[#F7971E]">◆</span>
                  <span>Refund Policy</span>
                </Link>
                <Link href="/shipping-policy" className="flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 group-hover:text-[#F7971E]">◆</span>
                  <span>Shipping Policy</span>
                </Link>
                <Link href="/terms-and-conditions" className="flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 group-hover:text-[#F7971E]">◆</span>
                  <span>Terms and Conditions</span>
                </Link>
                <Link href="/pricing-policy" className="flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 group-hover:text-[#F7971E]">◆</span>
                  <span>Pricing Policy</span>
                </Link>
              </div>
            </div>

            {/* SERVICES Section */}
            <div className="space-y-4">
              <h3 className={`text-[#F7971E] font-bold text-lg sm:text-xl mb-6 ${ebGaramond.className}`}>SERVICES</h3>
              <div className="space-y-3">
                <Link href="/free-kundli" className="flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 group-hover:text-[#F7971E]">◆</span>
                  <span>Free Kundli Generator</span>
                </Link>
                <Link href="/services/gun-milan" className="flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 group-hover:text-[#F7971E]">◆</span>
                  <span>Gun Milan</span>
                </Link>
                <Link href="/services/horoscope" className="flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 group-hover:text-[#F7971E]">◆</span>
                  <span>Daily Horoscope</span>
                </Link>
                <Link href="/blog" className="flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 group-hover:text-[#F7971E]">◆</span>
                  <span>Blog Posts</span>
                </Link>
                <Link href="/call-with-astrologer" className="flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 group-hover:text-[#F7971E]">◆</span>
                  <span>Call with Astrologer</span>
                </Link>
              </div>
            </div>

            {/* GET IN TOUCH Section - Rightmost */}
            <div className="space-y-4">
              <h3 className={`text-[#F7971E] font-bold text-lg sm:text-xl mb-6 ${ebGaramond.className}`}>GET IN TOUCH</h3>
              <div className="space-y-3">
                {/* Contact Link */}
                <div className="flex items-center justify-start gap-3">
                  <span className="text-[#F7971E] text-lg">◆</span>
                  <Link
                    href="/contact"
                    className="text-white hover:text-orange-400 text-sm sm:text-base transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
                <div className="flex items-center justify-start space-x-4 pt-2">
                  <Link
                    href="https://www.instagram.com/sobhagya.bhakti?igsh=MTJveTdrdnk2NXR1eA=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#F7971E] transition-colors duration-300"
                    aria-label="Follow us on Instagram"
                  >
                    <img
                      src="/instagram.svg"
                      alt="Instagram"
                      className="w-7 h-7 sm:w-8 sm:h-8"
                    />
                  </Link>
                  <Link
                    href="https://linkedin.com/company/sobhagya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#F7971E] transition-colors duration-300"
                    aria-label="Follow us on LinkedIn"
                  >
                    <img
                      src="/linkedin.svg"
                      alt="LinkedIn"
                      className="w-7 h-7 sm:w-8 sm:h-8"
                    />
                  </Link>
                </div>

                {/* Download Our App Section */}
                <div className="pt-4 border-t border-white/20">
                  <p className="text-white text-sm sm:text-base opacity-90 mb-3">
                    Download our app for instant astrology guidance on the go!
                  </p>
                  <div className="flex flex-row space-x-4">
                    <Link
                      href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en_IN"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300"
                    >
                      <Image
                        src="/app-store.svg"
                        alt="Download on App Store"
                        width={150}
                        height={50}
                        className="w-160 h-160"
                      />
                    </Link>
                    <Link
                      href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en_IN"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300"
                    >
                      <Image
                        src="/play-store.svg"
                        alt="Download on Google Play"
                        width={150}
                        height={50}
                        className="w-160 h-160"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Mobile: Same Content as Desktop Footer */}
        <div className="sm:hidden space-y-6">
          {/* Mobile: Quick Links (Left) and Services (Right) */}
          <div className="grid grid-cols-2 gap-6">
            {/* Quick Links - Left */}
            <div className="space-y-2">
              <h3 className={`text-[#F7971E] font-bold text-sm ${ebGaramond.className}`}>QUICK LINKS</h3>
              <div className="space-y-[-17px]">
                <Link href="/privacy-policy" className="flex items-center gap-x-0.5 text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  <span className="text-[#F7971E] text-xs">◆</span>
                  <span>Privacy Policy</span>
                </Link>
                <Link href="/refund-policy" className="flex items-center gap-x-0.5 text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  <span className="text-[#F7971E] text-xs">◆</span>
                  <span>Refund Policy</span>
                </Link>
                <Link href="/shipping-policy" className="flex items-center gap-x-0.5 text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  <span className="text-[#F7971E] text-xs">◆</span>
                  <span>Shipping Policy</span>
                </Link>
                <Link href="/terms-and-conditions" className="flex items-center gap-x-0.5 text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  <span className="text-[#F7971E] text-xs">◆</span>
                  <span>Terms and Conditions</span>
                </Link>
                <Link href="/pricing-policy" className="flex items-center gap-x-0.5 text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  <span className="text-[#F7971E] text-xs">◆</span>
                  <span>Pricing Policy</span>
                </Link>
              </div>
            </div>

            {/* Services - Right */}
            <div className="space-y-2">
              <h3 className={`text-[#F7971E] font-bold text-sm ${ebGaramond.className}`}>SERVICES</h3>
              <div className="space-y-[-17px]">
                <Link href="/free-kundli" className="flex items-center gap-x-0.5 text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  <span className="text-[#F7971E] text-xs">◆</span>
                  <span>Free Kundli Generator</span>
                </Link>
                <Link href="/services/gun-milan" className="flex items-center gap-x-0.5 text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  <span className="text-[#F7971E] text-xs">◆</span>
                  <span>Gun Milan</span>
                </Link>
                <Link href="/services/horoscope" className="flex items-center gap-x-0.5 text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  <span className="text-[#F7971E] text-xs">◆</span>
                  <span>Daily Horoscope</span>
                </Link>
                <Link href="/blog" className="flex items-center gap-x-0.5 text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  <span className="text-[#F7971E] text-xs">◆</span>
                  <span>Blog Posts</span>
                </Link>
                <Link href="/call-with-astrologer" className="flex items-center gap-x-0.5 text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  <span className="text-[#F7971E] text-xs">◆</span>
                  <span>Call with Astrologer</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile: Contact Us Area */}
          <div className="space-y-2">
            <h3 className={`text-[#F7971E] font-bold text-sm ${ebGaramond.className}`}>GET IN TOUCH</h3>
            <div className="space-y-0.5">
              <div className="flex items-baseline gap-x-0.5">
                <span className="text-[#F7971E] text-xs leading-none">◆</span>
                <Link href="/contact" className="text-white hover:text-[#F7971E] text-xs transition-colors leading-none">
                  Contact Us
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <Link href="https://www.instagram.com/sobhagya.bhakti?igsh=MTJveTdrdnk2NXR1eA==" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#F7971E] transition-colors duration-300">
                  <img src="/instagram.svg" alt="Instagram" className="w-10 h-10" />
                </Link>
                <Link href="https://linkedin.com/company/sobhagya" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#F7971E] transition-colors duration-300">
                  <img src="/linkedin.svg" alt="LinkedIn" className="w-10 h-10" />
                </Link>
              </div>
            </div>

            {/* Download Our App Section */}
            <div className="pt-3 border-t border-white/20 text-center">
              <p className="text-white text-xs opacity-90 mb-2">
                Download our app for instant astrology guidance on the go!
              </p>
              <div className="flex justify-center space-x-2">
                <Link href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en_IN" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity duration-300">
                  <Image src="/app-store.svg" alt="Download on App Store" width={120} height={36} className="h-10" />
                </Link>
                <Link href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya&hl=en_IN" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity duration-300">
                  <Image src="/play-store.svg" alt="Download on Google Play" width={120} height={36} className="h-10" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom - Logo and Copyright */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8">
          <div className="text-center space-y-4">
            {/* Logo at the bottom */}
            <div className="flex items-center justify-center space-x-3">
              <div className="relative w-12 h-12">
                <Image
                  src="/sobhagya-logo.svg"
                  alt="Sobhagya"
                  fill
                  className="object-contain"
                />
              </div>
              <span className={`text-white text-lg font-bold ${eagleLake.className}`}>SOBHAGYA</span>
            </div>

            <p className="text-white text-sm opacity-80 tracking-tighter">
              © OWNED BY ELYSION SOFTWARES PRIVATE LIMITED
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

