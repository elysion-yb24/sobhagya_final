"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import React from "react";
import { BlogPost } from "@/types";
import { getAuthToken } from "@/app/utils/auth-utils";

// SVG Components for decorative elements
const OmSymbol = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm3.34,13.37a3.5,3.5,0,0,1-1.56,1.47,4.94,4.94,0,0,1-2.23.51,5.32,5.32,0,0,1-2.45-.54A4.21,4.21,0,0,1,7.28,15.1a4.84,4.84,0,0,1-.57-2.43,5.34,5.34,0,0,1,.7-2.87A3.92,3.92,0,0,1,10,8a3.83,3.83,0,0,1,1.65.29,2.37,2.37,0,0,1,.94.7V8.21a2.11,2.11,0,0,0,.17-.83,1,1,0,0,0-.35-.8,1.79,1.79,0,0,0-1.16-.29,5.68,5.68,0,0,0-1.14.12,9,9,0,0,0-1.1.31L8.74,5.54a11.82,11.82,0,0,1,1.32-.37,6.51,6.51,0,0,1,1.46-.16A4.87,4.87,0,0,1,14.1,5.4a2.78,2.78,0,0,1,1.26,1.2,4,4,0,0,1,.42,1.93V9.82h1.1v1.47H15.78v1.75a3.9,3.9,0,0,1-.44,1.82M12,14.7a2.15,2.15,0,0,0,1.36-.49A3,3,0,0,0,14,13.33,3.51,3.51,0,0,0,14.33,12V10.43A1.46,1.46,0,0,0,14,9.77a1.86,1.86,0,0,0-.65-.41,2.65,2.65,0,0,0-2.86.35,3.43,3.43,0,0,0-.63.82,4,4,0,0,0-.35,1.08,7.46,7.46,0,0,0-.08,1.06,3.11,3.11,0,0,0,.63,2.07A2,2,0,0,0,12,14.7Z"/>
  </svg>
);

const Lotus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
    <path d="M12,2C13.1,2,14,2.9,14,4C14,5.1,13.1,6,12,6C10.9,6,10,5.1,10,4C10,2.9,10.9,2,12,2M12,18C13.1,18,14,18.9,14,20C14,21.1,13.1,22,12,22C10.9,22,10,21.1,10,20C10,18.9,10.9,18,12,18M12,8C13.1,8,14,8.9,14,10C14,11.1,13.1,12,12,12C10.9,12,10,11.1,10,10C10,8.9,10.9,8,12,8M12,14C13.1,14,14,14.9,14,16C14,17.1,13.1,18,12,18C10.9,18,10,17.1,10,16C10,14.9,10.9,14,12,14Z"/>
  </svg>
);

export default function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const unwrappedParams = await params;
        if (!unwrappedParams?.id) {
          setError('Blog ID not found');
          return;
        }
        
        const blogId = unwrappedParams.id;
        console.log('Fetching blog with ID:', blogId);
        
        const token = getAuthToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/blog/admin/get-blog?id=${blogId}`, {
          headers,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch blog: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setBlog(data.data);
        } else if (data.blog) {
          setBlog(data.blog);
        } else if (data) {
          setBlog(data);
        } else {
          throw new Error('Blog not found');
        }
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [params]);

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

  if (error || !blog) {
    console.log('Error or no blog:', { error, blog });
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-6">
            <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h1 className="text-2xl font-bold mb-2">Blog Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The blog you are looking for does not exist.'}</p>
          </div>
          <button
            onClick={() => router.push('/blog')}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-orange-100">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/blog')}
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Blogs</span>
          </button>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Blog Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <OmSymbol />
            <span className="text-orange-600 text-sm font-medium">Astrology Insights</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight" style={{ fontFamily: 'EB Garamond' }}>
            {blog.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-orange-500" />
              <span className="font-medium">{blog.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-500" />
              <span>{blog.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <span>{blog.readTime || '5 min read'}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="relative h-96 md:h-[500px] mb-8 rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={blog.image && blog.image.startsWith('http') ? blog.image : "/default-image.png"}
            alt={blog.title}
            fill
            className="object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/default-image.png";
            }}
          />
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-line text-gray-700 leading-relaxed text-lg">
              {blog.content || 'No content available'}
            </div>
            {/* Debug info - remove this later */}
            <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
              <strong>Debug Info:</strong><br/>
              Blog ID: {blog.id}<br/>
              Content Length: {blog.content?.length || 0}<br/>
              Content Preview: {blog.content?.substring(0, 100)}...
            </div>
          </div>
        </div>

        {/* Author Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center">
              {blog.authorImage && blog.authorImage.startsWith('http') ? (
                <Image
                  src={blog.authorImage}
                  alt={blog.author}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-orange-500" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{blog.author}</h3>
              <p className="text-gray-600 leading-relaxed">{blog.authorBio || 'Experienced astrologer with deep knowledge of Vedic astrology and cosmic wisdom.'}</p>
            </div>
          </div>
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lotus />
              Related Topics
            </h3>
            <div className="flex flex-wrap gap-3">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium hover:bg-orange-200 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-center text-white shadow-lg">
          <h3 className="text-2xl font-bold mb-4">Ready to Explore Your Cosmic Path?</h3>
          <p className="text-orange-100 mb-6 text-lg">
            Connect with our expert astrologers for personalized guidance and insights.
          </p>
          <button
            onClick={() => router.push('/call-astrologer')}
            className="px-8 py-3 bg-white text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
          >
            Consult an Astrologer
          </button>
        </div>
      </div>
    </div>
  );
}