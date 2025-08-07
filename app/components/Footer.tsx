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
      className={`bg-[#373737] text-white py-8 sm:py-10 lg:py-12 relative overflow-hidden ${poppins.className}`}
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
        <h2 className="text-orange-400 text-center text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-12 underline decoration-orange-400 underline-offset-8 px-2 sm:px-4">
          Your Trusted Astrology App for Accurate Predictions & Expert Guidance!
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {/* GET IN TOUCH */}
          <div className="text-left lg:text-center space-y-4 sm:space-y-5">
            <h3 className="text-orange-400 font-semibold text-lg sm:text-xl mb-4 sm:mb-5">GET IN TOUCH</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-start lg:justify-center gap-3">
                <span className="text-orange-400 text-lg">◆</span>
                <a
                  href="mailto:support@sobhagya.in"
                  className="text-white hover:text-orange-400 text-sm sm:text-base transition-colors"
                >
                  support@sobhagya.in
                </a>
              </div>
              <p className="text-white text-xs sm:text-sm opacity-80 lg:text-center">
                (we will respond within 24 hours)
              </p>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="text-left lg:text-center space-y-4 sm:space-y-5">
            <h3 className="text-orange-400 font-semibold text-lg sm:text-xl mb-4 sm:mb-5">QUICK LINKS</h3>
            <div className="space-y-3 sm:space-y-4">
              <Link
                href="/privacy-policy"
                className="flex items-center justify-start lg:justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors"
              >
                <span className="text-orange-400 mr-3 text-base">◆</span> Privacy Policy
              </Link>
              <Link
                href="/refund-policy"
                className="flex items-center justify-start lg:justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors"
              >
                <span className="text-orange-400 mr-3 text-base">◆</span> Refund Policy
              </Link>
              <Link
                href="/terms"
                className="flex items-center justify-start lg:justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors"
              >
                <span className="text-orange-400 mr-3 text-base">◆</span> Terms of Service
              </Link>
              <Link
                href="/shipping-policy"
                className="flex items-center justify-start lg:justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors"
              >
                <span className="text-orange-400 mr-3 text-base">◆</span> Shipping Policy
              </Link>
            </div>
            
            {/* Social Media Icons */}
            <div className="flex items-center justify-start lg:justify-center space-x-4 sm:space-x-5 mt-6 sm:mt-8">
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

          {/* SERVICES */}
          <div className="text-left lg:text-center space-y-4 sm:space-y-5 md:col-span-2 lg:col-span-1">
            <h3 className="text-orange-400 font-semibold text-lg sm:text-xl mb-4 sm:mb-5">SERVICES</h3>
            <div className="space-y-3 sm:space-y-4">
              <Link
                href="/call-with-astrologer"
                className="flex items-center justify-start lg:justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors"
              >
                <span className="text-orange-400 mr-3 text-base">◆</span> Call with Astrologer
              </Link>
              <Link
                href="/pooja-session"
                className="flex items-center justify-start lg:justify-center text-white hover:text-orange-400 text-sm sm:text-base transition-colors ml-4 lg:ml-0"
              >
                <span className="text-orange-400 mr-3 text-base">◆</span> Pooja Session
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom with Logo */}
        <div className="border-t border-gray-700 mt-8 sm:mt-10 pt-6 sm:pt-8 text-center">
          <div className="flex flex-col items-center justify-center gap-3 sm:gap-4">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14">
              <Image
                src="/sobhagya_logo.avif"
                alt="Sobhagya"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-white text-xl sm:text-2xl font-semibold">SOBHAGYA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
