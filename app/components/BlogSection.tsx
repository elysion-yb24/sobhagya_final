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
    <section className="py-20 bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden">
      {/* Faded astrology icon background (optional) */}
      <div className="absolute inset-0 flex justify-center items-center opacity-5 pointer-events-none select-none z-0">
        <Image src="/sobhagya_logo.avif" alt="Astrology Icon" width={600} height={600} className="object-contain" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="mb-2 text-6xl font-extrabold text-[#745802] tracking-tight" style={{ fontFamily:'EB Garamond' }}>
            Our Blogs
            <span className="block w-24 h-1 bg-orange-400 mx-auto mt-4 rounded-full"></span>
          </h2>
          <p className="text-[#745802] text-base font-medium">Your daily source for astrology insights & guidance</p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {blogs.map((blog, idx) => (
            <div
              key={blog.id}
              className="bg-white rounded-3xl shadow-2xl border-t-8 border-orange-200 overflow-hidden cursor-pointer transition-transform duration-300 hover:-translate-y-3 hover:shadow-2xl group relative animate-fade-in-up"
              style={{ boxShadow: '0 8px 32px 0 rgba(247,151,30,0.10)' }}
              onClick={() => router.push(`/blog/${blog.id}`)}
            >
              {/* Gradient border top */}
              <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-400" />
              <div className="relative h-[220px] group-hover:scale-105 transition-transform duration-300">
                <Image src={blog.image || "/default-image.png"} alt={blog.title} fill className="object-cover" />
                {/* Blog index badge */}
                <div className="absolute top-3 left-3 bg-white/80 text-orange-500 font-bold rounded-full px-3 py-1 text-xs shadow">
                  #{idx + 1}
                </div>
              </div>
              <div className="p-7 flex flex-col gap-3">
                <h3 className="text-2xl font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors duration-200" style={{ fontFamily: 'EB Garamond' }}>{blog.title}</h3>
                <p className="text-gray-600 text-base leading-relaxed mb-2 font-medium">
                  {blog.content.substring(0, 100)}...
                  <span className="text-[#F7971E] cursor-pointer ml-1 font-semibold">see more</span>
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-500 text-base border-2 border-orange-200 shadow">
                      {blog.author.split(' ').map(w => w[0]).join('').toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-500 font-semibold">{blog.author}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">{blog.date}</span>
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
