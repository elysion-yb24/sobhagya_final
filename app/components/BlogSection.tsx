"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const blogs = [
  {
    id: 1,
    image: "/b1.png",
    title: "The Power of Astrology in Everyday Life",
    content: "Many believe that astrology is just about daily horoscopes, but it's much more than that...",
    author: "Sadvik Tiwari",
    date: "31, January, 2025"
  },
  {
    id: 2,
    image: "/b4.jpg",
    title: "Astrological Remedies: Balancing Cosmic Energies",
    content: "If you're experiencing struggles in life, astrology provides solutions...",
    author: "Sadhin M.",
    date: "10, February, 2025"
  },
  {
    id: 3,
    image: "/b3.png",
    title: "Vedic vs. Western Astrology: Which One to Follow?",
    content: "Astrology comes in different forms...",
    author: "OmShri S.",
    date: "01, February, 2025"
  }
];

const BlogSection = () => {
  const router = useRouter();

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden">
      {/* Faded astrology icon background (optional) */}
      {/* <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none select-none z-0">
        <Image src="/sobhagya_logo.avif" alt="Astrology Icon" width={600} height={600} className="object-contain" />
      </div> */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="mb-2 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#745802] tracking-tight" style={{ fontFamily:'EB Garamond' }}>
            Our Blogs
            <span className="block w-16 sm:w-20 md:w-24 h-1 bg-orange-400 mx-auto mt-2 sm:mt-4"></span>
          </h2>
          <p className="text-[#745802] text-sm sm:text-base font-medium mt-4">Your daily source for astrology insights & guidance</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {blogs.map((blog, idx) => (
            <div
              key={blog.id}
              className="bg-white shadow-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl group relative animate-fade-in-up"
              onClick={() => router.push(`/blog/${blog.id}`)}
            >
              <div className="relative h-[180px] sm:h-[200px] group-hover:scale-105 transition-transform duration-300">
                <Image src={blog.image || "/default-image.png"} alt={blog.title} fill className="object-cover" />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 mb-3">{blog.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 h-10 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {blog.content}
                  <span className="text-[#F7971E] cursor-pointer ml-1 font-semibold">see more</span>
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">{blog.author}</span>
                  <span className="text-xs sm:text-sm text-gray-400 font-medium">{blog.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Fade-in animation keyframes */}
      <style jsx>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1);
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default BlogSection;
