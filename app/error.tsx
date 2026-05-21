'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/error]', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
        Something went wrong
      </h1>
      <p className="text-gray-600 max-w-md mb-6">
        An unexpected error occurred while loading this page. You can try again,
        or head back to the homepage.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2 rounded-md bg-[#F7941D] text-white font-medium hover:bg-[#e0851a] transition"
        >
          Try again
        </button>
        <a
          href="/"
          className="px-5 py-2 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
        >
          Go home
        </a>
      </div>
      {error.digest && (
        <p className="text-xs text-gray-400 mt-6">Error ID: {error.digest}</p>
      )}
    </div>
  );
}
