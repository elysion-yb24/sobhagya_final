interface BlogPostProps {
    params: Promise<{
        slug?: string[];
    }>;
}

export default async function BlogPostPage({ params }: BlogPostProps) {
    const resolvedParams = await params;
    const slugPath = resolvedParams.slug?.join('/') || '';

    // If no slug, this shouldn't happen (handled by /blog/page.tsx)
    // But redirect to listing page just in case
    if (!slugPath) {
        return null;
    }

    const wordpressUrl = `https://blog.sobhagya.in/${slugPath}`;

    return (
        <div className="w-full h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
            <iframe
                src={wordpressUrl}
                className="w-full h-full border-none"
                title="Blog Post"
            />
        </div>
    );
}
