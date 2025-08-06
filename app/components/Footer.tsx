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
      className={`bg-[#373737] text-white py-12 relative overflow-hidden ${poppins.className}`}
    >
      {/* Top Left Zodiac Background Image */}
      <div className="absolute top-[-50px] left-[-150px] w-[400px] h-[300px] opacity-10">
        <Image
          src="/zodiac-right.png"
          alt="Zodiac Signs"
          fill
          className="rotate-[-15deg] object-contain"
        />
      </div>

      {/* Bottom Right Zodiac Background Image */}
      <div className="absolute bottom-[-100px] right-[20px] w-[400px] h-[300px] opacity-10">
        <Image
          src="/zodiac-right.png"
          alt="Zodiac Signs"
          fill
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title text */}
        <h2 className="text-orange-400 text-center text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 underline decoration-orange-400 underline-offset-8 px-4">
          Your Trusted Astrology App for Accurate Predictions & Expert Guidance!
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-x-16">


          {/* Logo and Social Media */}
          <div className="flex flex-col items-center justify-center gap-4 mb-12 sm:mb-16 md:mb-24">
            <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px]">
              <Image
                src="/sobhagya_logo.avif"
                alt="Sobhagya"
                fill
                className="object-contain"
              />
            </div>
            <p
              className={`${eagleLake.className} text-orange-400 text-2xl sm:text-3xl md:text-4xl font-semibold`}
            >
              Sobhagya
            </p>
            {/* <div className="flex space-x-3">
              <Link
                href="#"
                className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center"
              >
                <Image
                  src="/Group 13405.png"
                  alt="Facebook"
                  width={20}
                  height={20}
                />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center"
              >
                <Image
                  src="/Group 13406.png"
                  alt="Email"
                  width={20}
                  height={20}
                />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center"
              >
                <Image
                  src="/Group 13407.png"
                  alt="YouTube"
                  width={20}
                  height={20}
                />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center"
              >
                <Image
                  src="/Group 13408.png"
                  alt="Twitter"
                  width={20}
                  height={20}
                />
              </Link>
            </div> */}
          </div>

          {/* Navigation Links - Two columns */}
          <div className="ml-0 sm:ml-10 md:ml-20">
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center text-white hover:text-orange-400 text-sm sm:text-base"
              >
                <span className="text-orange-400 mr-2 text-base sm:text-lg">›</span> Home
              </Link>
              <Link
                href="/about"
                className="flex items-center text-white hover:text-orange-400 text-sm sm:text-base"
              >
                <span className="text-orange-400 mr-2 text-base sm:text-lg">›</span> About us
              </Link>

              <div className="space-y-2 flex flex-col">
                <Link
                  href="/services"
                  className="flex items-center text-white hover:text-orange-400 text-sm sm:text-base"
                >
                  <span className="text-orange-400 mr-2 text-base sm:text-lg">›</span> Services
                </Link>
                <Link
                  href="/call-with-astrologer"
                  className="flex items-center text-white hover:text-orange-400 text-sm sm:text-base"
                >
                  <span className="text-orange-400 mr-2 text-base sm:text-lg">›</span> Call With Astrologer
                </Link>
                <Link
                  href="/live-session"
                  className="flex items-center text-white hover:text-orange-400 whitespace-nowrap text-sm sm:text-base"
                >
                  <span className="text-orange-400 mr-2 text-base sm:text-lg whitespace-normal">›</span> Live Session
                </Link>

                <Link
                  href="https://store.sobhagya.in"
                  className="flex items-center text-white hover:text-orange-400 text-sm sm:text-base"
                  target="_blank"
                >
                  <span className="text-orange-400 mr-2 text-base sm:text-lg">›</span> Shop
                </Link>
                <Link
                  href="/blog"
                  className="flex items-center text-white hover:text-orange-400 text-sm sm:text-base"
                  target="_blank"
                >
                  <span className="text-orange-400 mr-2 text-base sm:text-lg">›</span> Blog
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center text-white hover:text-orange-400 text-sm sm:text-base"
                  target="_blank"
                >
                  <span className="text-orange-400 mr-2 text-base sm:text-lg">›</span> Contact Us

                </Link>
                <Link
                  href="/contact"
                  className="flex items-center text-white hover:text-orange-400 text-sm sm:text-base"
                  target="_blank"
                >
                  <span className="text-orange-400 mr-2 text-base sm:text-lg">›</span> Sign In

                </Link>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 sm:space-y-5 mt-8 sm:mt-10 -ml-0 sm:-ml-10">
            <div className="flex items-center gap-x-4 sm:gap-x-8">
              <img src="/Vector (1).png" alt="Website" className="w-4 h-4 sm:w-5 sm:h-5" />
              <a
                href="https://www.sobhagya.in"
                className="text-white hover:text-orange-400 text-sm sm:text-base"
              >
               www.sobhagya.in
              </a>
            </div>
            <div className="flex items-center gap-x-4 sm:gap-x-8">
              <img src="/Vector (2).png" alt="Email" className="w-4 h-4 sm:w-5 sm:h-5" />
              <a
                href="mailto:support@sobhagya.in"
                className="text-white hover:text-orange-400 text-sm sm:text-base"
              >
                support@sobhagya.in
              </a>
            </div>
            {/* <div className="flex items-center gap-x-4 sm:gap-x-8">
              <img src="/Vector (3).png" alt="Phone" className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">
                <a
                  href="tel:+918077781807"
                  className="text-white hover:text-orange-400"
                >
                  +91 8077781807
                </a>
                ,{" "}
                <a
                  href="tel:+918383962622"
                  className="text-white hover:text-orange-400"
                >
                  +91 8383962622
                </a>
              </span>
            </div> */}
            {/* <div className="flex items-start gap-x-2">
              <img
                src="/Vector (4).png"
                alt="Location"
                className="w-5 h-5 mt-1"
              />
              <p className="text-sm">
              F-Block 10/9 Krishna Nagar Temple, Delhi, India, 110051
              </p>
            </div> */}
            {/* <div className="flex items-center gap-x-2">
              <img src="/Vector (5).png" alt="Company" className="w-5 h-5" />
              <p>ELYSION SOFTWARES PRIVATE LIMITED</p>
            </div> */}

            <div className="flex items-center justify-start gap-x-4 sm:gap-x-8 ml-0 sm:ml-4 mt-6 cursor-pointer">
              <Link
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/appstore.png"
                  alt="App Store"
                  width={100}
                  height={30}
                  className="w-20 sm:w-24 md:w-32 h-auto"
                />
              </Link>

              <Link
                href="https://play.google.com/store/apps/details?id=com.sobhagya.sobhagya"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/playstore.png"
                  alt="Google Play"
                  width={100}
                  height={30}
                  className="w-20 sm:w-24 md:w-32 h-auto"
                />
              </Link>
            </div>

            <p className="mr-0 sm:mr-20 text-center text-xs sm:text-sm italic mt-2">
              Stay Connected with Astrology!
            </p>
          </div>
        </div>

        {/* Footer Bottom */}
        {/* <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>(© ELYSION SOFTWARES PRIVATE LIMITED. All Rights Reserved)</p>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
