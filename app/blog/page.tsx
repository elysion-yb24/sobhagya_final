"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BlogPost } from "@/types";

import BlogHero3D from "./_components/BlogHero3D";
import CategoryFilter from "./_components/CategoryFilter";
import FeaturedBlog from "./_components/FeaturedBlog";
import BlogCard3D from "./_components/BlogCard3D";
import BlogPagination from "./_components/BlogPagination";
import BlogSkeleton from "./_components/BlogSkeleton";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchBlogs = async (pageNum: number, categoryId: number | null) => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/blog/wp?per_page=9&page=${pageNum}`;
      if (categoryId) url += `&categories=${categoryId}`;

      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setBlogs(data.data);
        setTotalPages(data.meta?.totalPages || 1);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to load blogs. Please try again.");
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page, activeCategory);
  }, [page, activeCategory]);

  const handleCategoryChange = (catId: number | null) => {
    setActiveCategory(catId);
    setPage(1);
  };

  // Featured blog only appears on page 1 with no category filter
  const showFeatured = page === 1 && activeCategory === null && blogs.length > 0;
  const featuredBlog = showFeatured ? blogs[0] : null;
  const gridBlogs = showFeatured ? blogs.slice(1) : blogs;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-[#FFFCF6] via-white to-[#FFF8EF]">
      {/* Ambient background ornaments */}
      <div
        aria-hidden
        className="absolute top-[20%] -left-40 w-[500px] h-[500px] rounded-full pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(247,148,29,0.18) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        aria-hidden
        className="absolute top-[55%] -right-40 w-[600px] h-[600px] rounded-full pointer-events-none opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(255,213,138,0.22) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-[5%] left-[30%] w-[480px] h-[480px] rounded-full pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(circle, rgba(184,106,11,0.15) 0%, transparent 70%)",
          filter: "blur(85px)",
        }}
      />

      {/* HERO */}
      <BlogHero3D />

      {/* FILTER */}
      <CategoryFilter
        activeId={activeCategory}
        onChange={handleCategoryChange}
      />

      {/* CONTENT */}
      <div className="section-container relative z-10 pt-10 sm:pt-14 pb-16 sm:pb-20">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BlogSkeleton />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <p className="text-gray-500 mb-5 text-base">{error}</p>
              <button
                onClick={() => fetchBlogs(page, activeCategory)}
                className="px-6 py-3 rounded-xl font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #F7941D 0%, #FFB347 50%, #F7941D 100%)",
                  boxShadow: "0 10px 22px -8px rgba(247,148,29,0.55)",
                  fontFamily: "Poppins",
                }}
              >
                Try Again
              </button>
            </motion.div>
          ) : blogs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
                style={{
                  background:
                    "radial-gradient(circle at 30% 25%, #FFFCF1 0%, #FFEED0 50%, #F7B23A 100%)",
                  boxShadow:
                    "inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -3px 8px rgba(170,100,20,0.25), 0 6px 16px -4px rgba(247,148,29,0.4)",
                }}
              >
                <span className="text-3xl">✦</span>
              </div>
              <p
                className="text-lg sm:text-xl font-semibold mb-2"
                style={{ fontFamily: "'EB Garamond', serif", color: "#745802" }}
              >
                No articles in this category yet
              </p>
              <p className="text-sm text-gray-500" style={{ fontFamily: "Poppins" }}>
                The cosmos is still aligning its wisdom — check back soon.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key={`grid-${page}-${activeCategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Featured blog */}
              {featuredBlog && <FeaturedBlog blog={featuredBlog} />}

              {/* Section label for grid */}
              {gridBlogs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex items-center gap-3 mb-6 sm:mb-8"
                >
                  <span
                    className="inline-flex items-center text-xs sm:text-sm font-bold tracking-[0.28em] uppercase"
                    style={{
                      background:
                        "linear-gradient(90deg, #C7831A, #F7941D, #FFD700)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {showFeatured ? "Latest Articles" : "Articles"}
                  </span>
                  <span
                    className="h-px flex-1"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(247,148,29,0.5), transparent)",
                    }}
                  />
                </motion.div>
              )}

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                {gridBlogs.map((blog, idx) => (
                  <BlogCard3D
                    key={`${blog.id}-${page}`}
                    blog={blog}
                    index={idx}
                  />
                ))}
              </div>

              {/* Pagination */}
              <BlogPagination
                page={page}
                totalPages={totalPages}
                onChange={(next) => {
                  setPage(next);
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        @keyframes blog-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
