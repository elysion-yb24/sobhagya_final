import Image from "next/image";
import Link from "next/link";
import { Eagle_Lake, Poppins } from "next/font/google";

const eagleLake = Eagle_Lake({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const Footer: React.FC = () => {
  return (
    <footer
      className={`bg-[#373737] text-white py-8 sm:py-10 md:py-12 lg:py-14 relative overflow-hidden ${poppins.className}`}
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

      <div className="section-container">
        {/* Title text */}
        <h2 className="text-orange-400 text-center text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-4 sm:mb-6 lg:mb-10 underline decoration-orange-400 underline-offset-8 px-2 sm:px-4">
          Your Trusted Astrology App for Accurate Predictions & Expert Guidance!
        </h2>

        {/* Main Footer Content - Mobile Optimized Layout */}
        <div className="space-y-8 sm:space-y-0">
          {/* Desktop: Grid Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10 lg:gap-16">
            {/* QUICK LINKS Section */}
            <div className="space-y-4">
              <h3 className="text-[#F7971E] font-semibold text-lg sm:text-xl mb-6">QUICK LINKS</h3>
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
              <h3 className="text-[#F7971E] font-semibold text-lg sm:text-xl mb-6">SERVICES</h3>
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
              <h3 className="text-[#F7971E] font-semibold text-lg sm:text-xl mb-6">GET IN TOUCH</h3>
              <div className="space-y-3">
                {/* Email */}
                <a
                  href="mailto:info@sobhagya.in"
                  className="flex items-start gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors group"
                >
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 mt-1">◆</span>
                  <span className="flex flex-col leading-tight">
                    <span>info@sobhagya.in</span>
                    <span className="text-white/60 text-[10px] sm:text-xs mt-0.5">(we will respond within 24 hours)</span>
                  </span>
                </a>

                {/* Phone */}
                <a
                  href="tel:+919876543210"
                  className="flex items-start gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors group"
                >
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 mt-1">◆</span>
                  <span className="flex flex-col leading-tight">
                    <span>+91 98765 43210</span>
                    <span className="text-white/60 text-[10px] sm:text-xs mt-0.5">(24/7 customer support)</span>
                  </span>
                </a>

                {/* Address */}
                <div className="flex items-start gap-x-3 text-xs sm:text-sm lg:text-base">
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0 mt-1">◆</span>
                  <span className="flex flex-col leading-tight text-white/90">
                    <span>Elysion Softwares Services</span>
                    <span>Private Limited, Delhi, India</span>
                  </span>
                </div>

                {/* Contact Link */}
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-x-3 text-white hover:text-[#F7971E] text-xs sm:text-sm lg:text-base transition-colors leading-none group"
                >
                  <span className="inline-flex w-[14px] h-[14px] lg:w-[16px] lg:h-[16px] text-[#F7971E] text-[14px] lg:text-[16px] leading-none items-center justify-center flex-shrink-0">◆</span>
                  <span>Contact Us</span>
                </Link>

                {/* Social Icons */}
                <div className="flex items-center justify-start space-x-4 pt-1">
                  <Link
                    href="https://www.instagram.com/sobhagya.bhaakti"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#F7971E] transition-colors duration-300 hover:scale-110"
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
                    className="text-white hover:text-[#F7971E] transition-colors duration-300 hover:scale-110"
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
                      href="https://apps.apple.com/in/app/sobhagya/id6755958411"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300"
                    >
                      <Image
                        src="/app-store.svg"
                        alt="Download on App Store"
                        width={150}
                        height={50}
                        className="w-[130px] sm:w-[150px] h-auto"
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
                        className="w-[130px] sm:w-[150px] h-auto"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Horizontal Links Sections */}
        <div className="sm:hidden space-y-6">
          {/* Mobile: Contact Info */}
          <div className="text-center space-y-3">
            <h3 className="text-[#F7971E] font-semibold text-sm">GET IN TOUCH</h3>
                         <div className="space-y-2">
              {/* Email */}
               <div className="flex items-center justify-center">
                 <span className="inline-flex items-center justify-center w-3 h-3 text-[#F7971E] mr-2 leading-none">◆</span>
                 <a href="mailto:info@sobhagya.in" className="text-white hover:text-[#F7971E] text-sm transition-colors">
                   info@sobhagya.in
                 </a>
               </div>
              <p className="text-white text-xs opacity-80">(we will respond within 24 hours)</p>
              
              {/* Phone */}
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center justify-center w-3 h-3 text-[#F7971E] mr-2 leading-none">◆</span>
                <a href="tel:+919876543210" className="text-white hover:text-[#F7971E] text-sm transition-colors">
                  +91 98765 43210
                </a>
              </div>
              <p className="text-white text-xs opacity-80">(24/7 customer support)</p>
              
              {/* Address */}
              <div className="text-center">
                <p className="text-white text-xs">Elysion Softwares Services</p>
                <p className="text-white text-xs">Private Limited, Delhi, India</p>
              </div>
                             <div className="flex items-center justify-center gap-3 pt-2">
                <Link href="https://www.instagram.com/sobhagya.bhaakti" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#F7971E] transition-colors duration-300">
                  <img 
                    src="/instagram.svg" 
                    alt="Instagram" 
                    className="w-6 h-6"
                  />
                </Link>
                                  <Link href="https://linkedin.com/company/sobhagya" target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#F7971E] transition-colors duration-300">
                    <img 
                      src="/linkedin.svg" 
                      alt="LinkedIn" 
                      className="w-6 h-6"
                    />
                  </Link>
              </div>
              
              {/* Download Our App Section - Mobile */}
              <div className="pt-3 border-t border-white/20 mt-3">
                <p className="text-white text-xs opacity-90 mb-2 text-center">
                  Download our app for instant astrology guidance on the go!
                </p>
                <div className="flex flex-row space-x-3 justify-center">
                  <Link
                    href="https://apps.apple.com/in/app/sobhagya/id6755958411"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300"
                  >
                    <Image
                      src="/app-store.svg"
                      alt="Download on App Store"
                      width={40}
                      height={40}
                      className="w-10 h-10"
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
                      width={40}
                      height={40}
                      className="w-10 h-10"
                    />
                 </Link>
                </div>
               </div>
            </div>
          </div>

            {/* Mobile: Horizontal Links Grid */}
            <div className="grid grid-cols-2 gap-4 xs:gap-6">
              <div className="space-y-4">
              <h3 className="text-[#F7971E] font-semibold text-sm tracking-wider text-left border-b border-[#F7971E]/20 pb-1">QUICK LINKS</h3>
                <div className="space-y-3 pt-1">
                  <Link href="/privacy-policy" className="flex items-center gap-2 text-white hover:text-[#F7971E] text-xs transition-all active:scale-95">
                    <span className="text-[#F7971E] text-[10px]">◆</span>
                    <span className="leading-tight">Privacy Policy</span>
                  </Link>
                  <Link href="/refund-policy" className="flex items-center gap-2 text-white hover:text-[#F7971E] text-xs transition-all active:scale-95">
                    <span className="text-[#F7971E] text-[10px]">◆</span>
                    <span className="leading-tight">Refund Policy</span>
                  </Link>
                  <Link href="/shipping-policy" className="flex items-center gap-2 text-white hover:text-[#F7971E] text-xs transition-all active:scale-95">
                    <span className="text-[#F7971E] text-[10px]">◆</span>
                    <span className="leading-tight">Shipping Policy</span>
                  </Link>
                  <Link href="/terms-and-conditions" className="flex items-center gap-2 text-white hover:text-[#F7971E] text-xs transition-all active:scale-95">
                    <span className="text-[#F7971E] text-[10px]">◆</span>
                    <span className="leading-tight">T&C</span>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
              <h3 className="text-[#F7971E] font-semibold text-sm tracking-wider text-left border-b border-[#F7971E]/20 pb-1">SERVICES</h3>
              <div className="space-y-3 pt-1">
                <Link href="/services/gun-milan" className="flex items-center gap-2 text-white hover:text-[#F7971E] text-xs transition-all active:scale-95">
                  <span className="text-[#F7971E] text-[10px]">◆</span>
                  <span className="leading-tight">Gun Milan</span>
                </Link>
                <Link href="/call-with-astrologer" className="flex items-center gap-2 text-white hover:text-[#F7971E] text-xs transition-all active:scale-95">
                  <span className="text-[#F7971E] text-[10px]">◆</span>
                  <span className="leading-tight">Consult Now</span>
                </Link>
                <Link href="/blog" className="flex items-center gap-2 text-white hover:text-[#F7971E] text-xs transition-all active:scale-95">
                  <span className="text-[#F7971E] text-[10px]">◆</span>
                  <span className="leading-tight">Blog</span>
                </Link>
              </div>
            </div>
          </div>


        </div>

        {/* Footer Bottom - Logo and Copyright */}
        <div className="mt-6 sm:mt-8 md:mt-10 pt-5 sm:pt-6 md:pt-8 border-t border-white/10">
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
