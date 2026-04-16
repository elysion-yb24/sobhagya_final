import { Metadata } from "next";
import BlogDetailClient from "./BlogDetailClient";

const WP_API_BASE = "https://blog.sobhagya.in/wp-json/wp/v2";

/**
 * Fetch a single WordPress post by slug (used for SSR metadata)
 */
async function fetchWPPost(slug: string) {
  try {
    const res = await fetch(`${WP_API_BASE}/posts?slug=${encodeURIComponent(slug)}&_embed`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const posts = await res.json();
    return Array.isArray(posts) && posts.length > 0 ? posts[0] : null;
  } catch {
    return null;
  }
}

/**
 * Generate SEO metadata from WordPress post data
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await fetchWPPost(id);

  if (!post) {
    return {
      title: "Blog Not Found | Sobhagya",
      description: "The blog article you are looking for could not be found.",
    };
  }

  const title = post.title?.rendered?.replace(/<[^>]*>/g, "") || "Blog";
  const excerpt = (post.excerpt?.rendered || "").replace(/<[^>]*>/g, "").trim();
  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url || "";

  return {
    title: `${title} | Sobhagya Blog`,
    description: excerpt.slice(0, 160) || `Read "${title}" on the Sobhagya astrology blog.`,
    openGraph: {
      title: title,
      description: excerpt.slice(0, 200),
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: featuredImage ? [{ url: featuredImage, width: 1200, height: 630 }] : [],
      siteName: "Sobhagya",
      url: `https://sobhagya.in/blog/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: excerpt.slice(0, 200),
      images: featuredImage ? [featuredImage] : [],
    },
    alternates: {
      canonical: `https://sobhagya.in/blog/${id}`,
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogDetailClient slug={id} />;
}