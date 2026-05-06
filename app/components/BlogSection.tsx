"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BlogPost } from "@/types";
import SectionHeader from "./ui/SectionHeader";

interface BlogCardProps {
  blog: BlogPost;
  index: number;
  onOpen: () => void;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, index, onOpen }) => {
  const reduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLSpanElement>(null);

  // Magnetic arrow — spring toward cursor when within 80px of card
  const arrowX = useSpring(0, { stiffness: 220, damping: 18 });
  const arrowY = useSpring(0, { stiffness: 220, damping: 18 });

  const onMouseMove = (e: React.MouseEvent) => {
    if (reduced || !arrowRef.current) return;
    const rect = arrowRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < 80) {
      const pull = (1 - dist / 80) * 12;
      arrowX.set((dx / dist) * pull);
      arrowY.set((dy / dist) * pull);
    } else {
      arrowX.set(0);
      arrowY.set(0);
    }
  };
  const onMouseLeave = () => {
    arrowX.set(0);
    arrowY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onOpen}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer group relative astro-card border border-gray-100"
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        type: "spring",
        stiffness: 110,
        damping: 20,
        delay: index * 0.12,
      }}
      whileHover={reduced ? undefined : { y: -8 }}
    >
      {/* Image with Ken-Burns + gold reveal overlay */}
      <div className="relative h-[180px] sm:h-[200px] overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={
            reduced
              ? {}
              : { scale: [1, 1.08, 1] }
          }
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src={blog.image || "/default-image.png"}
            alt={blog.title}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/default-image.png";
            }}
          />
        </motion.div>
        {/* Hover gold overlay sliding up */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/2 translate-y-full group-hover:translate-y-0 transition-transform duration-500 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(247,148,29,0.55), rgba(247,148,29,0.15) 70%, transparent)",
          }}
        />
      </div>

      <div className="p-4 sm:p-6">
        <motion.div
          className="inline-block mb-2"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.12 }}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F7971E] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
            {blog.date}
          </span>
        </motion.div>

        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 mb-3 line-clamp-2">
          {blog.title}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 h-10 overflow-hidden line-clamp-2">
          {blog.excerpt || blog.content}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm text-gray-500 font-medium">
            {blog.author}
          </span>
          <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#F7971E]">
            See more
            <motion.span
              ref={arrowRef}
              style={{ x: arrowX, y: arrowY, display: "inline-flex" }}
            >
              <ArrowRight size={14} />
            </motion.span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const BlogSection = () => {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/blog/wp?per_page=3");
        if (!response.ok) throw new Error(`Failed to fetch blogs: ${response.status}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setBlogs(data.data);
        } else {
          setBlogs([]);
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Failed to fetch blogs");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (error) return null;

  if (loading) {
    return (
      <section className="section-spacing bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden">
        <div className="section-container relative z-10">
          <SectionHeader
            tag="Blog"
            title="Astrology Insights"
            subtitle="Your daily source for astrology insights & guidance"
            center
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white shadow-lg overflow-hidden animate-pulse rounded-xl">
                <div className="h-[180px] sm:h-[200px] bg-gray-200" />
                <div className="p-4 sm:p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4" />
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (blogs.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      className="section-spacing bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden sacred-pattern"
    >
      <div className="section-container relative z-10">
        <SectionHeader
          tag="Blog"
          title="Astrology Insights"
          subtitle="Your daily source for astrology insights & guidance"
          center
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {blogs.map((blog, index) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              index={index}
              onOpen={() => router.push(`/blog/${blog.slug || blog.id}`)}
            />
          ))}
        </div>

        {inView && null /* keep ref tracked */}
      </div>
    </section>
  );
};

export default BlogSection;
