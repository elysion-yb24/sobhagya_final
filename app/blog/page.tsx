import Image from 'next/image';
import Link from 'next/link';

const WP_API = 'https://blog.sobhagya.in/wp-json/wp/v2/posts';

interface WordPressPost {
    id: number;
    title: { rendered: string };
    excerpt: { rendered: string };
    link: string;
    date: string;
    slug: string;
    _embedded?: {
        author?: Array<{ name: string }>;
        'wp:featuredmedia'?: Array<{ source_url: string; alt_text: string }>;
    };
}

export default async function BlogPage() {
    const res = await fetch(`${WP_API}?per_page=12&_embed`, {
        next: { revalidate: 300 },
    });

    if (!res.ok) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-4xl font-bold mb-4">Blog</h1>
                <p className="text-gray-600">Unable to load blog posts.</p>
            </div>
        );
    }

    const posts: WordPressPost[] = await res.json();

    return (
        <div className="container mx-auto px-4 py-12 overflow-y-auto h-full">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-bold mb-4">Blog</h1>
                <p className="text-xl text-gray-600">Insights on astrology, horoscopes, and spiritual guidance</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => {
                    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                    const author = post._embedded?.author?.[0]?.name || 'Sobhagya';
                    const date = new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });

                    return (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 block"
                        >
                            {featuredImage && (
                                <div className="relative h-56 w-full">
                                    <Image
                                        src={featuredImage}
                                        alt={post._embedded?.['wp:featuredmedia']?.[0]?.alt_text || post.title.rendered}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <div className="p-6">
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                    <span>{author}</span>
                                    <span>•</span>
                                    <span>{date}</span>
                                </div>

                                <h2
                                    className="text-2xl font-bold text-gray-900 mb-3 line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                />

                                <div
                                    className="text-gray-600 mb-4 line-clamp-3"
                                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                />

                                <span className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-semibold">
                                    Read more →
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
