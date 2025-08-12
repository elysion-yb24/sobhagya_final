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
      className={`bg-[#373737] text-white py-6 sm:py-8 lg:py-12 relative overflow-hidden ${poppins.className}`}
    >
      {/* Top Left Zodiac Background Image */}
      <div className="absolute top-[-50px] left-[-150px] w-[300px] h-[200px] sm:w-[400px] sm:h-[300px] opacity-10">
        <Image
          src="/zodiac-right.png"
          alt="Zodiac Signs"
          fill
          className="rotate-[-15deg] object-contain"
        />
      </div>

      {/* Bottom Right Zodiac Background Image */}
      <div className="absolute bottom-[-100px] right-[20px] w-[300px] h-[200px] sm:w-[400px] sm:h-[300px] opacity-10">
        <Image
          src="/zodiac-right.png"
          alt="Zodiac Signs"
          fill
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title text */}
        <h2 className="text-orange-400 text-center text-base sm:text-lg md:text-xl lg:text-2xl mb-4 sm:mb-6 lg:mb-12 underline decoration-orange-400 underline-offset-8 px-2 sm:px-4">
          Your Trusted Astrology App for Accurate Predictions & Expert Guidance!
        </h2>

        {/* Main Footer Content - Mobile Optimized Layout */}
        <div className="space-y-8 sm:space-y-0">
          {/* Mobile: Logo and Brand Section */}
          <div className="flex flex-col items-center space-y-4 sm:hidden">
            <div className="relative w-20 h-20">
              <Image
                src="/sobhagya_logo.avif"
                alt="Sobhagya"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-white text-xl font-bold">SOBHAGYA</span>
          </div>

          {/* Desktop: Logo and GET IN TOUCH */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            <div className="sm:col-span-2 lg:col-span-1 space-y-6">
              <div className="flex flex-col items-center lg:items-start space-y-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32">
                  <Image
                    src="/sobhagya_logo.avif"
                    alt="Sobhagya"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-white text-2xl sm:text-3xl lg:text-4xl font-bold">SOBHAGYA</span>
              </div>

              <div className="space-y-4">
                <h3 className="text-orange-400 font-semibold text-lg sm:text-xl text-center lg:text-left mb-4">GET IN TOUCH</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-center lg:justify-start gap-3">
                    <span className="text-orange-400 text-lg">◆</span>
                    <a
                      href="mailto:support@sobhagya.in"
                      className="text-white hover:text-orange-400 text-sm sm:text-base transition-colors break-all"
                    >
                      support@sobhagya.in
                    </a>
                  </div>
                  <p className="text-white text-xs sm:text-sm opacity-80 text-center lg:text-left px-2">
                    (we will respond within 24 hours)
                  </p>
                  <div className="flex items-center justify-center lg:justify-start space-x-4 pt-2">
                    <Link
                      href="https://www.instagram.com/sobhagya.bhakti?igsh=MTJveTdrdnk2NXR1eA=="
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-orange-400 transition-colors duration-300 p-2 bg-white/10 rounded-full hover:bg-white/20"
                      aria-label="Follow us on Instagram"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </Link>
                    <Link
                      href="https://linkedin.com/company/sobhagya"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-orange-400 transition-colors duration-300 p-2 bg-white/10 rounded-full hover:bg-white/20"
                      aria-label="Follow us on LinkedIn"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-orange-400 font-semibold text-lg sm:text-xl mb-4">QUICK LINKS</h3>
              <div className="space-y-3">
                <Link href="/privacy-policy" className="flex items-center justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-orange-400 mr-3 leading-none">◆</span> Privacy Policy
                </Link>
                <Link href="/refund-policy" className="flex items-center justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-orange-400 mr-3 leading-none">◆</span> Refund Policy
                </Link>
                <Link href="/shipping-policy" className="flex items-center justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-orange-400 mr-3 leading-none">◆</span> Shipping Policy
                </Link>
                <Link href="/terms" className="flex items-center justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-orange-400 mr-3 leading-none">◆</span> Terms of Service
                </Link>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-orange-400 font-semibold text-lg sm:text-xl mb-4">SERVICES</h3>
              <div className="space-y-3">
                <Link href="/pooja-session" className="flex items-center justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-orange-400 mr-3 leading-none">◆</span> Pooja Session
                </Link>
                <Link href="/call-with-astrologer" className="flex items-center justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-orange-400 mr-3 leading-none">◆</span> Call with Astrologer
                </Link>
              </div>
            </div>

            <div className="text-center space-y-4">
              <h3 className="text-orange-400 font-semibold text-lg sm:text-xl mb-4">ACCOUNT</h3>
              <div className="space-y-3">
                <Link href="/login" className="flex items-center justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-orange-400 mr-3 leading-none">◆</span> Login
                </Link>
                <Link href="/signup" className="flex items-center justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-orange-400 mr-3 leading-none">◆</span> Sign Up
                </Link>
                <Link href="/profile" className="flex items-center justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors">
                  <span className="inline-flex items-center justify-center w-4 h-4 text-orange-400 mr-3 leading-none">◆</span> My Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Horizontal Links Sections */}
        <div className="sm:hidden space-y-6">
          {/* Mobile: Contact Info */}
          <div className="text-center space-y-3">
            <h3 className="text-orange-400 font-semibold text-base">GET IN TOUCH</h3>
                         <div className="space-y-2">
               <div className="flex items-center justify-center">
                 <span className="inline-flex items-center justify-center w-3 h-3 text-orange-400 mr-2 leading-none">◆</span>
                 <a href="mailto:support@sobhagya.in" className="text-white hover:text-orange-400 text-sm transition-colors">
                   support@sobhagya.in
                 </a>
               </div>
              <p className="text-white text-xs opacity-80">(we will respond within 24 hours)</p>
                             <div className="flex items-center justify-center gap-3 pt-2">
                 <Link href="https://www.instagram.com/sobhagya.bhakti?igsh=MTJveTdrdnk2NXR1eA==" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 transition-colors duration-300 p-1.5 bg-white/10 rounded-full flex items-center justify-center">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                   </svg>
                 </Link>
                 <Link href="https://linkedin.com/company/sobhagya" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-400 transition-colors duration-300 p-1.5 bg-white/10 rounded-full flex items-center justify-center">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                   </svg>
                 </Link>
               </div>
            </div>
          </div>

                     {/* Mobile: Horizontal Links Grid */}
           <div className="grid grid-cols-2 gap-4">
             <div className="text-center space-y-3">
               <h3 className="text-orange-400 font-semibold text-sm">QUICK LINKS</h3>
               <div className="space-y-2">
                 <Link href="/privacy-policy" className="flex items-center justify-center text-white hover:text-orange-400 text-xs transition-colors">
                   <span className="inline-flex items-center justify-center w-3 h-3 text-orange-400 mr-2 leading-none">◆</span> Privacy Policy
                 </Link>
                 <Link href="/refund-policy" className="flex items-center justify-center text-white hover:text-orange-400 text-xs transition-colors">
                   <span className="inline-flex items-center justify-center w-3 h-3 text-orange-400 mr-2 leading-none">◆</span> Refund Policy
                 </Link>
                 <Link href="/shipping-policy" className="flex items-center justify-center text-white hover:text-orange-400 text-xs transition-colors">
                   <span className="inline-flex items-center justify-center w-3 h-3 text-orange-400 mr-2 leading-none">◆</span> Shipping Policy
                 </Link>
                 <Link href="/terms" className="flex items-center justify-center text-white hover:text-orange-400 text-xs transition-colors">
                   <span className="inline-flex items-center justify-center w-3 h-3 text-orange-400 mr-2 leading-none">◆</span> Terms of Service
                 </Link>
               </div>
             </div>

             <div className="text-center space-y-3">
               <h3 className="text-orange-400 font-semibold text-sm">SERVICES</h3>
               <div className="space-y-2">
                 <Link href="/pooja-session" className="flex items-center justify-center text-white hover:text-orange-400 text-xs transition-colors">
                   <span className="inline-flex items-center justify-center w-3 h-3 text-orange-400 mr-2 leading-none">◆</span> Pooja Session
                 </Link>
                 <Link href="/call-with-astrologer" className="flex items-center justify-center text-white hover:text-orange-400 text-xs transition-colors">
                   <span className="inline-flex items-center justify-center w-3 h-3 text-orange-400 mr-2 leading-none">◆</span> Call with Astrologer
                 </Link>
               </div>
             </div>
           </div>

           <div className="text-center space-y-3">
             <h3 className="text-orange-400 font-semibold text-sm">ACCOUNT</h3>
             <div className="space-y-2">
               <Link href="/login" className="flex items-center justify-center text-white hover:text-orange-400 text-xs transition-colors">
                 <span className="inline-flex items-center justify-center w-3 h-3 text-orange-400 mr-2 leading-none">◆</span> Login
               </Link>
               <Link href="/signup" className="flex items-center justify-center text-white hover:text-orange-400 text-xs transition-colors">
                 <span className="inline-flex items-center justify-center w-3 h-3 text-orange-400 mr-2 leading-none">◆</span> Sign Up
               </Link>
               <Link href="/profile" className="flex items-center justify-center text-white hover:text-orange-400 text-xs transition-colors">
                 <span className="inline-flex items-center justify-center w-3 h-3 text-orange-400 mr-2 leading-none">◆</span> My Profile
               </Link>
             </div>
           </div>
        </div>

        {/* Footer Bottom - Simple divider */}
        <div className="border-t border-gray-700 mt-8 sm:mt-10 pt-6 sm:pt-8">
          <div className="text-center">
            <p className="text-white text-sm opacity-80">
              © 2025 Sobhagya. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
