"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { BlogPost } from "@/types";
import { getAuthToken } from "@/app/utils/auth-utils";
import { buildApiUrl, API_CONFIG } from "@/app/config/api";

const BlogSection = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = getAuthToken();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          "/api/blog/admin/get-blogs?skip=0&limit=10",
          { headers }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch blogs: ${response.status}`);
        }

        const data = await response.json();

        // Normalize _id to id for MongoDB compatibility
        const normalizeBlog = (b: any) => ({ ...b, id: b.id || b._id });

        if (data.success && Array.isArray(data.data)) {
          setBlogs(data.data.map(normalizeBlog));
        } else if (Array.isArray(data.blogs)) {
          setBlogs(data.blogs.map(normalizeBlog));
        } else if (Array.isArray(data)) {
          setBlogs(data.map(normalizeBlog));
        } else {
          console.warn("Unexpected blog data structure:", data);
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

  // ❌ agar error hai to pura section hi hide kar do
  if (error) {
    return null;
  }

  if (loading) {
    return (
      <section className="section-spacing bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden">
        <div className="section-container relative z-10">
          <div className="text-center mb-8 sm:mb-12 md:mb-14">
            <h2 className="section-heading text-[#745802] mb-3 sm:mb-4">
              Our Blogs
            </h2>
            <div className="sacred-divider mx-auto max-w-[100px] sm:max-w-[120px] mb-3 sm:mb-4" />
            <p className="text-[#745802] text-sm sm:text-base font-medium">
              Your daily source for astrology insights & guidance
            </p>
          </div>
          {/* Skeleton Loader */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white shadow-lg overflow-hidden animate-pulse"
              >
                <div className="h-[180px] sm:h-[200px] bg-gray-200"></div>
                <div className="p-4 sm:p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // agar blogs empty hain but error nahi tha to bhi hide kar do
  if (blogs.length === 0) {
    return null;
  }

  return (
    <section className="section-spacing bg-gradient-to-br from-orange-50 via-white to-white/80 relative overflow-hidden sacred-pattern">
      <div className="section-container relative z-10">
        <div className="text-center mb-8 sm:mb-12 md:mb-14">
          <h2 className="section-heading text-[#745802] mb-3 sm:mb-4">
            Our Blogs
          </h2>
          <div className="sacred-divider mx-auto max-w-[100px] sm:max-w-[120px] mb-3 sm:mb-4" />
          <p className="text-[#745802] text-sm sm:text-base font-medium">
            Your daily source for astrology insights & guidance
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group relative animate-fade-in-up astro-card border border-gray-100"
              onClick={() => router.push(`/blog/${blog.id}`)}
            >
              <div className="relative h-[180px] sm:h-[200px] group-hover:scale-105 transition-transform duration-300">
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
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 mb-3 line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 h-10 overflow-hidden line-clamp-2">
                  {blog.excerpt || blog.content}
                  <span className="text-[#F7971E] cursor-pointer ml-1 font-semibold">
                    see more
                  </span>
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    {blog.author}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-400 font-medium">
                    {blog.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
