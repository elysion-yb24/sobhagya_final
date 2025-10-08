import Image from "next/image";
import lock from "@/public/Group 13357.png";

const StatsBar: React.FC = () => {
  return (
    <section className="relative text-white py-10">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/stats-bar-2.gif"
          alt="Stats Background"
          fill
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-16 text-center">
          {/* Secure & Privacy */}
          <div className="flex flex-col items-center">
            <Image src={lock} alt="lock" className="w-auto max-w-[50px] md:max-w-[70px]" />
            <span className="text-sm md:text-lg lg:text-xl font-medium mt-2">
              100% Secure & Privacy
            </span>
          </div>

          {/* Play Store Rating */}
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1 sm:space-x-2 mb-2">
              <Image src="/Star 13.png" alt="small star" width={25} height={25} className="w-auto max-w-[30px] md:max-w-[40px]" />
              <Image src="/Star 11.png" alt="big star" width={40} height={40} className="w-auto max-w-[50px] md:max-w-[60px]" />
              <Image src="/Star 12.png" alt="small star" width={25} height={25} className="w-auto max-w-[30px] md:max-w-[40px]" />
            </div>
            <span className="text-sm md:text-lg lg:text-xl font-medium">
              4.5 Stars on Play Store
            </span>
          </div>

          {/* Total Calls */}
          <div className="flex flex-col items-center">
            <span className="text-xl md:text-2xl lg:text-3xl font-bold">10,000+</span>
            <span className="text-sm md:text-lg lg:text-xl font-medium">Total Calls</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
