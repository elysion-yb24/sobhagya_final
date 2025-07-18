"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import React from "react";


const blogs = [
  {
    id: 1,
    image: "/b1.png",
    title: "The Power of Vedic Astrology in Everyday Life",
    content: `Many believe that astrology is just about daily horoscopes, but it's much more than that. Astrology is an ancient practice that studies the movements and relative positions of celestial bodies and their influence on human affairs and natural phenomena.

    At its core, astrology connects cosmic patterns to our everyday experiences. The position of the planets at the time of your birth creates a unique blueprint—your birth chart—that can offer insights into your personality, strengths, challenges, and life path.

    Beyond personality traits, astrology can help us understand life cycles and timing. Transits (when planets move across important points in your birth chart) can indicate periods of growth, challenge, or transformation. This cosmic timing can help you navigate life with more awareness and intention.

    Many people find that astrology provides a language and framework for self-reflection. By understanding your astrological makeup, you gain perspective on your natural tendencies and patterns. This awareness can lead to more conscious choices and personal growth.

    In relationships, astrology can illuminate compatibility, communication styles, and growth areas. While it shouldn't be the only factor in choosing partners, it can provide valuable insights into dynamics between people.

    Whether you're a skeptic or a believer, astrology offers a rich symbolic language that has resonated with humanity for thousands of years. At its best, it serves as a tool for self-knowledge and cosmic connection, reminding us that we're part of something greater than ourselves.`,
    author: "Pandit Sadvik Tiwari",
    date: "31, January, 2025",
    readTime: "8 min read",
    authorImage: "/placeholder-author.jpg", 
    authorBio: "Pandit Sadvik is an experienced Jyotish with over 10 years of practice in Vedic astrology. He specializes in planetary transits and their effects on daily life.",
    tags: ["Jyotish Shastra", "Atma-Gyan", "Cosmic Connection"]
  },
  {
    id: 2,
    image: "/b4.jpg",
    title: "Graha Shanti: Balancing Planetary Energies",
    content: `If you're experiencing struggles in life, astrology provides solutions through various remedies that can help balance challenging planetary influences.

    Astrological remedies are practices, rituals, or lifestyle adjustments designed to mitigate challenging planetary influences in your birth chart. These remedies work on the principle that while planets create certain patterns of energy in our lives, we have the ability to consciously work with these energies.

    Gemstones are one of the most popular remedies in Vedic astrology. Each planet resonates with specific gemstones—ruby for the Sun, pearl for the Moon, red coral for Mars, and so on. Wearing the appropriate gemstone can strengthen beneficial planetary energies or buffer challenging ones.

    Colors also carry planetary vibrations. Wearing specific colors on certain days of the week can help balance planetary energies. For example, white on Monday (Moon), red on Tuesday (Mars), and yellow on Thursday (Jupiter).

    Mantras and prayers directed toward specific planetary deities have been used for thousands of years to harmonize planetary energies. The vibration of these sacred sounds is believed to adjust subtle energetic patterns.

    Charitable acts directed toward elements associated with challenging planets can also serve as powerful remedies. For instance, donating iron items for Mars-related issues or silver items for Moon-related challenges.

    Simple lifestyle adjustments like fasting on specific days, practicing certain yoga postures, or meditating at particular times can also serve as effective remedies.

    The effectiveness of these remedies often depends on proper timing, intention, and consistency. Working with a knowledgeable astrologer can help determine which remedies might be most beneficial for your specific birth chart and current life circumstances.`,
    author: "Acharya Sadhin M.",
    date: "10, February, 2025",
    readTime: "7 min read",
    authorImage: "/placeholder-author.jpg",
    authorBio: "Acharya Sadhin has studied astrological remedies extensively and helps clients implement practical solutions for planetary challenges.",
    tags: ["Graha Shanti", "Ratna Shastra", "Mantra Sadhana", "Upaya"]
  },
  {
    id: 3,
    image: "/b3.png",
    title: "Jyotish vs. Western Astrology: The Ancient Wisdom",
    content: `Astrology comes in different forms, with Vedic and Western being the two most prominent systems. Each has its own strengths and applications, and understanding their differences can help you decide which approach resonates with you.

    Vedic astrology (Jyotish) originated in ancient India and is based on the sidereal zodiac, which accounts for the precession of equinoxes. Western astrology, more common in Europe and America, uses the tropical zodiac based on the seasons. This fundamental difference means your Sun sign (and potentially other planetary placements) will likely differ between the two systems.

    Vedic astrology places greater emphasis on the Moon sign rather than the Sun sign, as it's considered more relevant to one's emotional nature and mind. It also incorporates the lunar nodes (Rahu and Ketu) and a system of planetary periods called Dashas that indicate when different planetary influences will be most prominent in your life.

    Western astrology has evolved to include more psychological interpretation and tends to focus more on personal growth and character development. It incorporates more recently discovered outer planets (Uranus, Neptune, and Pluto) that aren't traditionally used in Vedic astrology.

    Vedic astrology is often praised for its predictive accuracy and timing techniques, while Western astrology is valued for its psychological insights and accessibility for self-reflection.

    So which should you follow? There's no right answer. Many astrologers use both systems complementarily—Vedic for prediction and timing, and Western for psychological insight and personal growth. You might explore both and see which provides insights that resonate with your experiences.

    Ultimately, the best approach to astrology is one that empowers you with useful insights while respecting your free will and capacity for growth. Whether Vedic, Western, or a blend of both, astrology at its best serves as a tool for greater self-awareness and conscious living.`,
    author: "Guru OmShri S.",
    date: "01, February, 2025",
    readTime: "9 min read",
    authorImage: "/placeholder-author.jpg", 
    authorBio: "Guru OmShri is well-versed in both Vedic and Western astrological traditions and helps clients understand the benefits of each approach.",
    tags: ["Jyotish Vidya", "Pashchatya Jyotish", "Tulnatmak Adhyayan"]
  }
];

type BlogPost = {
  id: number;
  image: string;
  title: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  authorImage: string;
  authorBio: string;
  tags: string[];
};

// SVG Components for decorative elements
const OmSymbol = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm3.34,13.37a3.5,3.5,0,0,1-1.56,1.47,4.94,4.94,0,0,1-2.23.51,5.32,5.32,0,0,1-2.45-.54A4.21,4.21,0,0,1,7.28,15.1a4.84,4.84,0,0,1-.57-2.43,5.34,5.34,0,0,1,.7-2.87A3.92,3.92,0,0,1,10,8a3.83,3.83,0,0,1,1.65.29,2.37,2.37,0,0,1,.94.7V8.21a2.11,2.11,0,0,0,.17-.83,1,1,0,0,0-.35-.8,1.79,1.79,0,0,0-1.16-.29,5.68,5.68,0,0,0-1.14.12,9,9,0,0,0-1.1.31L8.74,5.54a11.82,11.82,0,0,1,1.32-.37,6.51,6.51,0,0,1,1.46-.16A4.87,4.87,0,0,1,14.1,5.4a2.78,2.78,0,0,1,1.26,1.2,4,4,0,0,1,.42,1.93V9.82h1.1v1.47H15.78v1.75a3.9,3.9,0,0,1-.44,1.82M12,14.7a2.15,2.15,0,0,0,1.36-.49A3,3,0,0,0,14,13.33,3.51,3.51,0,0,0,14.33,12V10.43A1.46,1.46,0,0,0,14,9.77a1.86,1.86,0,0,0-.65-.41,2.65,2.65,0,0,0-2.86.35,3.43,3.43,0,0,0-.63.82,4,4,0,0,0-.35,1.08,7.46,7.46,0,0,0-.08,1.06,3.11,3.11,0,0,0,.63,2.07A2,2,0,0,0,12,14.7Z"/>
  </svg>
);

const Lotus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12,2c-0.5,0-1,0.2-1.4,0.6C10.2,3,10,3.5,10,4c0,1.1,0.9,2,2,2s2-0.9,2-2c0-0.5-0.2-1-0.6-1.4C13,2.2,12.5,2,12,2z M7.2,5.5c-0.3-0.4-0.8-0.6-1.3-0.5C5.4,5,5,5.4,4.8,5.9c-0.1,0.5,0,1,0.3,1.4c0.6,0.9,1.8,1.1,2.7,0.5C8.7,7.2,8.9,6,8.3,5.1C8,5,7.6,4.9,7.2,5.5z M16.8,5.5C16.2,4.6,15,4.4,14.1,5C13.2,5.6,13,6.8,13.6,7.7c0.6,0.9,1.8,1.1,2.7,0.5c0.4-0.3,0.7-0.8,0.7-1.3C17.1,6.4,17,5.9,16.8,5.5z M4.4,9.7c-0.4-0.3-1-0.2-1.4,0.1c-0.4,0.3-0.6,0.8-0.6,1.3c0,0.5,0.3,0.9,0.7,1.2c1,0.5,2.2,0.1,2.7-0.9c0.5-1-0.1-2.2-1.1-2.7C4.7,8.7,4.5,8.9,4.4,9.7z M19.6,9.7c-1-0.5-2.2-0.1-2.7,0.9c-0.5,1,0.1,2.2,1.1,2.7c1,0.5,2.2,0.1,2.7-0.9c0.2-0.4,0.2-0.9,0-1.3C20.6,10.5,20.1,10.1,19.6,9.7z M3,14.3c-0.4,0-0.9,0.2-1.2,0.5C1.3,15.2,1.1,15.6,1,16c-0.1,0.5,0.1,0.9,0.3,1.3c0.7,0.8,2,0.9,2.8,0.2c0.8-0.7,0.9-2,0.2-2.8C4,14.3,3.6,14.1,3,14.3z M21,14.3c-0.5-0.2-1.1-0.1-1.5,0.3c-0.8,0.7-0.9,2-0.2,2.8c0.7,0.8,2,0.9,2.8,0.2c0.4-0.3,0.6-0.8,0.6-1.3c0-0.5-0.2-1-0.6-1.3C21.7,14.6,21.4,14.5,21,14.3z M6.9,18c-0.9-0.4-2,0.1-2.4,1.1c-0.4,0.9,0.1,2,1.1,2.4c0.9,0.4,2-0.1,2.4-1.1c0.2-0.4,0.2-0.9,0-1.4C7.8,18.6,7.4,18.3,6.9,18z M17.1,18c-0.4,0-0.9,0.2-1.2,0.5c-0.6,0.8-0.5,2,0.3,2.7c0.8,0.6,2,0.5,2.7-0.3c0.6-0.8,0.5-2-0.3-2.7C18.1,18.3,17.7,18.1,17.1,18z M12,19c-0.5,0-1,0.2-1.4,0.6C10.2,20,10,20.5,10,21c0,1.1,0.9,2,2,2s2-0.9,2-2c0-0.5-0.2-1-0.6-1.4C13,19.2,12.5,19,12,19z"/>
  </svg>
);

export default function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const unwrappedParams = await params; // Await the params promise directly
        if (unwrappedParams?.id) {
          const blogId = parseInt(unwrappedParams.id);
          const blogPost = blogs.find(blog => blog.id === blogId);
          
          if (blogPost) {
            setBlog(blogPost);
          } else {
            router.push('/blog');
          }
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-amber-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-700 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-orange-600 text-lg">॥</div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
        <div className="text-center bg-white bg-opacity-80 backdrop-blur-md p-8 rounded-lg shadow-lg border border-orange-200">
          <div className="mx-auto text-orange-700 mb-4 text-4xl">॥ ॐ ॥</div>
          <h2 className="text-2xl font-semibold text-orange-900 mb-4">Cosmic Journey Interrupted</h2>
          <p className="text-orange-800 mb-6">The astral page you seek has moved to another realm.</p>
          <button 
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full hover:from-orange-700 hover:to-red-700 transition-all shadow-md mx-auto"
          >
            <ArrowLeft size={16} />
            Return to the Divine Hub
          </button>
        </div>
      </div>
    );
  }

  const paragraphs = blog.content.split('\n\n').map(p => p.trim()).filter(p => p);

  return (
    <div className="bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 min-h-screen">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-10">
        <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-yellow-500 blur-xl"></div>
        <div className="absolute top-1/4 right-1/3 w-24 h-24 rounded-full bg-orange-400 blur-xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-20 h-20 rounded-full bg-red-300 blur-xl"></div>
        <div className="absolute top-2/3 right-10 w-16 h-16 rounded-full bg-yellow-300 blur-xl"></div>
      </div>

      <div className="relative h-[60vh] md:h-[70vh] lg:h-[80vh] w-full">
        <Image 
          src={blog.image || "/default-image.png"} 
          alt={blog.title} 
          fill 
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/60 to-red-900/70 flex flex-col justify-end p-6 md:p-12">
          <button 
            onClick={() => router.push('/')} 
            className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-orange-900/30 backdrop-blur-md text-white rounded-full hover:bg-orange-800/40 transition-all border border-orange-300/30 shadow-lg"
          >
            <ArrowLeft size={16} />
            पीछे जाएँ
          </button>
          
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {blog.title}
            </h1>
            <div className="flex flex-wrap gap-6 justify-center text-white">
              <div className="flex items-center gap-2 bg-orange-800/30 backdrop-blur-sm px-4 py-2 rounded-full">
                <User size={16} className="text-orange-200" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-800/30 backdrop-blur-sm px-4 py-2 rounded-full">
                <Calendar size={16} className="text-orange-200" />
                <span>{blog.date}</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-800/30 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock size={16} className="text-orange-200" />
                <span>{blog.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-8 md:p-12 -mt-20 border border-orange-100">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-full shadow-lg">
            <div className="text-white text-xl">ॐ</div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {blog.tags?.map((tag, index) => (
              <span 
                key={index} 
                className="px-4 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 text-xs font-medium rounded-full border border-orange-200 shadow-sm"
              >
                ॐ {tag}
              </span>
            ))}
          </div>

          <div className="prose prose-lg max-w-none">
            {paragraphs.map((paragraph, index) => {
              if (index === 0) {
                const firstLetter = paragraph.charAt(0);
                const restOfParagraph = paragraph.slice(1);
                return (
                  <p key={index} className="mb-6 leading-relaxed text-gray-700">
                    <span className="float-left text-7xl font-serif text-orange-800 mr-2 mt-2">{firstLetter}</span>
                    {restOfParagraph}
                  </p>
                );
              } else {
                return (
                  <p key={index} className="mb-6 leading-relaxed text-gray-700">
                    {paragraph}
                  </p>
                );
              }
            })}
          </div>

          <div className="my-10 flex items-center justify-center">
            <div className="h-px w-16 bg-orange-200"></div>
            <div className="mx-4 text-orange-400">☸</div>
            <div className="mx-4 text-red-400">ॐ</div>
            <div className="mx-4 text-orange-400">☸</div>
            <div className="h-px w-16 bg-orange-200"></div>
          </div>

          <div className="mt-12 pt-8 border-t border-orange-100">
            <div className="flex items-start gap-6 bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl">
              <div className="relative h-20 w-20 rounded-full overflow-hidden border-4 border-orange-200 shadow-inner">
                <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-orange-600 to-red-600 text-white text-xl font-bold">
                  {blog.author.split(' ')[0].charAt(0)}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-xl text-orange-900 mb-2">
                  आचार्य {blog.author}
                </h3>
                <p className="text-orange-800 mb-3">
                  {blog.authorBio || "An experienced Jyotish sharing insights about cosmic connections and their influence on our daily lives."}
                </p>
                <button className="text-sm text-red-600 font-medium hover:text-red-800 transition-colors">
                  संपूर्ण परिचय देखें →
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-orange-900 mb-2">अन्य ज्योतिष लेख</h2>
            <div className="h-1 w-20 bg-gradient-to-r from-orange-400 to-red-400 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs
              .filter(relatedBlog => relatedBlog.id !== blog.id)
              .map(relatedBlog => (
                <div 
                  key={relatedBlog.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl hover:translate-y-[-5px] border border-orange-100"
                  onClick={() => {
                    router.push(`/blog/${relatedBlog.id}`);
                    window.scrollTo(0, 0);
                  }}
                >
                  <div className="relative h-[180px]">
                    <Image 
                      src={relatedBlog.image || "/default-image.png"} 
                      alt={relatedBlog.title} 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 to-transparent flex items-end">
                      <h3 className="p-4 text-lg font-semibold text-white">
                        {relatedBlog.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center text-xs text-orange-800">
                      <span className="flex items-center gap-1">
                        <User size={12} />
                        {relatedBlog.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {relatedBlog.date}
                      </span>
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs font-medium px-2 py-1 bg-orange-100 text-orange-700 rounded-full">{relatedBlog.readTime}</span>
                      <span className="text-red-600 text-sm">और पढ़ें →</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        
        <div className="mt-20 text-center text-orange-800 opacity-80">
          <div className="flex justify-center mb-2">
            <div className="mx-1 text-sm">☸</div>
            <div className="mx-1 text-sm">☸</div>
            <div className="mx-1 text-sm">☸</div>
          </div>
          <p className="italic text-sm">"यथा पिण्डे तथा ब्रह्माण्डे" - As is the microcosm, so is the macrocosm</p>
        </div>
      </div>
    </div>
  );
}