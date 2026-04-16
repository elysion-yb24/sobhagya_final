import { NextRequest, NextResponse } from 'next/server';

const WP_API_BASE = 'https://blog.sobhagya.in/wp-json/wp/v2';

/**
 * GET /api/blog/wp?per_page=10&page=1&categories=3&slug=some-slug
 * Proxy to WordPress REST API for blog posts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const slug = searchParams.get('slug');
    const perPage = searchParams.get('per_page') || '10';
    const page = searchParams.get('page') || '1';
    const categories = searchParams.get('categories');

    let wpUrl: string;

    if (slug) {
      // Fetch single post by slug
      wpUrl = `${WP_API_BASE}/posts?slug=${encodeURIComponent(slug)}&_embed`;
    } else {
      // Fetch posts list
      const params = new URLSearchParams({
        per_page: perPage,
        page: page,
        _embed: '',
      });
      if (categories) params.set('categories', categories);
      wpUrl = `${WP_API_BASE}/posts?${params.toString()}`;
    }

    const wpRes = await fetch(wpUrl, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!wpRes.ok) {
      return NextResponse.json(
        { success: false, message: `WordPress API error: ${wpRes.status}` },
        { status: wpRes.status }
      );
    }

    const posts = await wpRes.json();
    const totalPosts = wpRes.headers.get('X-WP-Total') || '0';
    const totalPages = wpRes.headers.get('X-WP-TotalPages') || '1';

    // Transform WordPress posts to our BlogPost format
    const transformed = (Array.isArray(posts) ? posts : [posts]).map((post: any) => {
      const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
      const authorData = post._embedded?.author?.[0];
      const categories = post._embedded?.['wp:term']?.[0] || [];

      return {
        id: post.id,
        slug: post.slug,
        title: post.title?.rendered || '',
        content: post.content?.rendered || '',
        excerpt: (post.excerpt?.rendered || '').replace(/<[^>]*>/g, '').trim(),
        image: featuredImage,
        author: authorData?.name || 'Sobhagya',
        authorImage: authorData?.avatar_urls?.['96'] || '',
        authorBio: authorData?.description || '',
        date: new Date(post.date).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        dateISO: post.date,
        readTime: `${Math.max(1, Math.ceil((post.content?.rendered || '').replace(/<[^>]*>/g, '').split(/\s+/).length / 200))} min read`,
        tags: categories.map((cat: any) => cat.name),
        link: post.link,
      };
    });

    return NextResponse.json({
      success: true,
      data: slug ? transformed[0] || null : transformed,
      meta: { total: parseInt(totalPosts), totalPages: parseInt(totalPages), page: parseInt(page) },
    });
  } catch (error: any) {
    console.error('WordPress API proxy error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch from WordPress' },
      { status: 500 }
    );
  }
}
