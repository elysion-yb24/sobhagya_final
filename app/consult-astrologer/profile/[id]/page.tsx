"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ConsultAstrologerProfilePage() {
    const params = useParams();
    const router = useRouter();
    const astrologerId = params?.id as string;

    useEffect(() => {
        // Redirect to the new design profile page
        if (astrologerId) {
            router.replace(`/call-with-astrologer/profile/${astrologerId}`);
        }
    }, [astrologerId, router]);

    // Show loading or nothing while redirecting
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Redirecting...</p>
            </div>
        </div>
    );
}
