"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, User, Clock, ArrowRight } from "lucide-react";
import { BlogPost } from "@/types";
import { getAuthToken } from "@/app/utils/auth-utils";
import { buildApiUrl, API_CONFIG } from "@/app/config/api";

const BlogPage = () => {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchBlogs = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const token = getAuthToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(
        buildApiUrl(API_CONFIG.ENDPOINTS.BLOG.GET_BLOGS) + `?skip=${skip}&limit=6`,
        { headers }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch blogs: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data?.list && Array.isArray(data.data.list)) {
        if (isLoadMore) {
          setBlogs(prev => [...prev, ...data.data.list]);
        } else {
          setBlogs(data.data.list);
        }
        setHasMore(data.data.list.length === 6);
      } else if (data.success && Array.isArray(data.data)) {
        if (isLoadMore) {
          setBlogs(prev => [...prev, ...data.data]);
        } else {
          setBlogs(data.data);
        }
        setHasMore(data.data.length === 6);
      } else if (Array.isArray(data.blogs)) {
        if (isLoadMore) {
          setBlogs(prev => [...prev, ...data.blogs]);
        } else {
          setBlogs(data.blogs);
        }
        setHasMore(data.blogs.length === 6);
      } else if (Array.isArray(data)) {
        if (isLoadMore) {
          setBlogs(prev => [...prev, ...data]);
        } else {
          setBlogs(data);
        }
        setHasMore(data.length === 6);
      } else {
        console.warn("Unexpected blog data structure:", data);
        if (!isLoadMore) {
          setBlogs([]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      if (!isLoadMore) {
        setError("Failed to fetch blogs. Please try again later.");
        setBlogs([]);
      }
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const loadMore = () => {
    const newSkip = skip + 6;
    setSkip(newSkip);
    fetchBlogs(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white/80">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-700 mx-auto mb-4"></div>
            <h2 className="text-3xl font-bold text-[#745802] mb-2" style={{ fontFamily: "EB Garamond" }}>
              Loading Blogs...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white/80 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Blogs</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-white/80">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#745802] mb-4" style={{ fontFamily: "EB Garamond" }}>
              Our Blogs
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your daily source for astrology insights, cosmic wisdom, and spiritual guidance
            </p>
          </motion.div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <motion.div
              key={blog.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group"
              onClick={() => router.push(`/blog/${blog.id}`)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={blog.image || "/default-image.png"}
                  alt={blog.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/default-image.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {/* Reading time badge */}
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{blog.readTime}</span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-200 mb-3 line-clamp-2" style={{ fontFamily: "Poppins" }}>
                  {blog.title}
                </h3>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3" style={{ fontFamily: "Poppins" }}>
                  {blog.excerpt || blog.content}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{blog.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{blog.date}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-orange-600">
                    <span className="text-sm font-medium">Click to read</span>
                  </div>
                  <div className="flex items-center gap-1 text-orange-600 group-hover:gap-2 transition-all duration-200">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Loading...
                </div>
              ) : (
                "Load More Blogs"
              )}
            </button>
          </motion.div>
        )}

        {/* No More Blogs Message */}
        {!hasMore && blogs.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-gray-500 text-lg">You've reached the end of our blog collection!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogPage; 