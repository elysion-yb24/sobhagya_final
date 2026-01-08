export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)] overflow-hidden">
            {children}
        </div>
    );
}
