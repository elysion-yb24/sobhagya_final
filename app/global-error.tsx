'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/global-error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            color: '#111827',
          }}
        >
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#4B5563', maxWidth: 420, marginBottom: '1.5rem' }}>
            A critical error prevented the page from loading. Please reload and try again.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 6,
              background: '#F7941D',
              color: 'white',
              border: 'none',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
          {error.digest && (
            <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: '1.5rem' }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
